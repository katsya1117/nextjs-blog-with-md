export const config = {
  runtime: "nodejs",
};

import type { NextApiRequest, NextApiResponse } from "next";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { toMarkdown } from "../../lib/markdown";
import { client } from "../../lib/client";

// 共通: Vercel再デプロイトリガー
async function triggerVercelDeploy() {
  if (!process.env.VERCEL_DEPLOY_HOOK_URL) return;
  try {
    await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" });
    console.log("Triggered Vercel redeploy via Deploy Hook");
  } catch (err) {
    console.error("Failed to trigger Vercel redeploy:", err);
  }
}

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function sanitizeForFilename(title: string) {
  // keep Japanese/English characters, but replace forbidden filesystem chars with '-'
  return (title || "untitled")
    .replace(/[\/\\\?%\*:|"<>]/g, "-") // replace forbidden chars
    .replace(/\s+/g, "-") // spaces -> hyphen
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

function datePart(input?: string | null) {
  if (!input) return "unknown-date";
  const d = new Date(input);
  if (isNaN(d.getTime())) return "unknown-date";
  return d.toISOString().split("T")[0];
}

function makeFileName(blog: any, idFallback?: string) {
  // prefer blog.date (公開日), fallback to publishedAt or createdAt, then id
  const dateSource = blog?.date || blog?.publishedAt || blog?.createdAt;
  const date = datePart(dateSource);
  const title = blog?.title ? sanitizeForFilename(blog.title) : (idFallback || "untitled");
  if (!title) return `${idFallback || "unknown"}.md`;
  return `${date}-${title}.md`;
}

// GitHub 更新/作成
async function upsertToGithub(params: {
  filePath: string;
  content: string;
  commitMessage: string;
}) {
  const { filePath, content, commitMessage } = params;

  const [owner, repo] = (process.env.GITHUB_REPO || "").split("/");
  if (!owner || !repo) {
    throw new Error("GITHUB_REPO is invalid. Expected 'owner/repo'.");
  }
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_TOKEN!;
  const apiBase = "https://api.github.com";

  // 既存ファイルの sha を取得
  let sha: string | undefined;
  const getRes = await fetch(
    `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(
      filePath
    )}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (getRes.ok) {
    const json = await getRes.json();
    sha = json.sha as string | undefined;
  } else if (getRes.status !== 404) {
    const txt = await getRes.text();
    throw new Error(`GitHub GET content failed: ${getRes.status} ${txt}`);
  }

  // 作成 or 更新
  const putBody: Record<string, unknown> = {
    message: commitMessage,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch,
  };
  if (sha) putBody.sha = sha;

  const putRes = await fetch(
    `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(putBody),
    }
  );

  if (!putRes.ok) {
    const txt = await putRes.text();
    throw new Error(`GitHub PUT content failed: ${putRes.status} ${txt}`);
  }
}

// GitHub 削除
async function deleteFromGithub(params: {
  filePath: string;
  commitMessage: string;
}) {
  const { filePath, commitMessage } = params;

  const [owner, repo] = (process.env.GITHUB_REPO || "").split("/");
  const branch = process.env.GITHUB_BRANCH || "main";
  const token = process.env.GITHUB_TOKEN!;
  const apiBase = "https://api.github.com";

  // sha を取得
  const getRes = await fetch(
    `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(
      filePath
    )}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!getRes.ok) {
    if (getRes.status === 404) return; // 存在しないなら無視
    throw new Error(`GitHub GET for delete failed: ${getRes.status}`);
  }
  const { sha } = await getRes.json();

  // DELETE
  const delRes = await fetch(
    `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage,
        sha,
        branch,
      }),
    }
  );

  if (!delRes.ok) {
    const txt = await delRes.text();
    throw new Error(`GitHub DELETE failed: ${delRes.status} ${txt}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { id, event, type } = req.body;
    const incomingEvent = (event || type || "").toString().toLowerCase();
    console.log("Webhook body:", req.body);
    const blogFromBody = req.body?.blog || req.body?.contents?.old?.publishValue || req.body?.contents?.old?.draftValue || null;

    // =========================
    // 削除イベント
    // =========================
    if (incomingEvent === "delete") {
      // Try to obtain blog metadata from webhook payload (publishValue/draftValue) first
      let blog: any = blogFromBody || null;
      if (!blog) {
        // If webhook did not include body data, we cannot fetch the content from microCMS after deletion.
        // As a fallback we'll try to query microCMS (may 404) and if that fails, fallback to id-based filename.
        try {
          blog = await client.get({ endpoint: "blogs", contentId: id });
        } catch (e) {
          blog = null;
        }
      }

      // Determine filename: prefer date-title.md if we have blog metadata, otherwise fallback to id.md
      const fileName = blog ? makeFileName(blog, id) : `${id}.md`;
      const r2Key = `blogs/${fileName}`;
      const repoPath = `blogs/${fileName}`;

      // 1) R2 から削除
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: r2Key,
          })
        );
        console.log(`Deleted ${r2Key} from R2`);
      } catch (err) {
        console.warn(`R2 delete warning (may not exist): ${err}`);
      }

      // 2) GitHub から削除
      await deleteFromGithub({
        filePath: repoPath,
        commitMessage: `delete: ${fileName} (contentId: ${id})`,
      });

      // 3) Vercel再デプロイ
      await triggerVercelDeploy();

      return res.status(200).json({ ok: true, action: "deleted", file: fileName });
    }

    // =========================
    // 作成・更新イベント
    // =========================
    const blog =
      blogFromBody ??
      (await client.get({
        endpoint: "blogs",
        contentId: id,
      }));

    const fileName = makeFileName(blog, blog.id);
    const r2Key = `blogs/${fileName}`;
    const repoPath = `blogs/${fileName}`;

    // 差分スキップ (R2 の Metadata と比較)
    try {
      const head = await s3.send(
        new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: r2Key,
        })
      );
      const prevUpdatedAt = head.Metadata?.["updated-at"];
      if (prevUpdatedAt && blog.updatedAt && prevUpdatedAt === blog.updatedAt) {
        return res
          .status(200)
          .json({ ok: true, action: "skipped", file: fileName });
      }
    } catch (err: unknown) {
      const status = (err as { $metadata?: { httpStatusCode?: number } })
        ?.$metadata?.httpStatusCode;
      if (typeof status === "number" && status !== 404) {
        throw err;
      }
    }

    // Markdown 生成
    const md = toMarkdown(blog);

    // 1) R2 アップロード
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: r2Key,
        Body: md,
        ContentType: "text/markdown",
        Metadata: {
          "updated-at": blog.updatedAt || "",
          "content-id": blog.id || "",
        },
      })
    );

    // 2) GitHub へ upsert
    await upsertToGithub({
      filePath: repoPath,
      content: md,
      commitMessage: `sync: ${fileName} (contentId: ${blog.id})`,
    });

    // 3) Vercel再デプロイ
    await triggerVercelDeploy();

    return res
      .status(200)
      .json({ ok: true, action: "uploaded", file: fileName });
  } catch (err: unknown) {
    console.error("Sync error:", err);
    return res.status(500).json({ error: "Sync failed" });
  }
}