export const config = {
  runtime: "nodejs",
};

import type { NextApiRequest, NextApiResponse } from "next";
import {S3Client, PutObjectCommand, HeadObjectCommand} from "@aws-sdk/client-s3";
import { toMarkdown } from "../../utils/toMarkdown";
import {client} from "../../lib/client";

console.log("R2_BUCKET =", JSON.stringify(process.env.R2_BUCKET));
console.log("R2_ENDPOINT =", process.env.R2_ENDPOINT);

const s3 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

function sanitizeTitle(title: string){
return (title || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function datePart(input?: string | null){
    if (!input) return "unknown-date";
    const d = new Date(input);
    if (isNaN(d.getTime())) return "unknown-date";
    return d.toISOString().split("T")[0];
}


// GitHub に upsert（作成 or 更新）する
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

    // 1) 既存ファイルの sha を取得（なければ 404）
    let sha: string | undefined;
    const getRes = await fetch(
        `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`,
        {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
        }
    );

    if (getRes.ok) {
        const json = await getRes.json();
        sha = json.sha as string | undefined;
    } else if (getRes.status !== 404) {
        const txt = await getRes.text();
        throw new Error(`GitHub GET content failed: ${getRes.status} ${txt}`);
    }

    // 2) 作成 or 更新（upsert）
    const putBody: Record<string, unknown> = {
        message: commitMessage,
        content: Buffer.from(content, "utf8").toString("base64"),
        branch,
    };
    if (sha) putBody.sha = sha; // 既存があれば更新、なければ作成

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    // 受け取り：id（contentId）か blog オブジェクト
    const id =
      (req.body && (req.body.id || req.body.contentId)) ||
      (typeof req.query.id === "string" ? req.query.id : undefined);
    const blogFromBody = req.body?.blog;

    if (!id && !blogFromBody) {
      return res.status(400).json({ error: "Missing id or blog" });
    }

    const blog =
      blogFromBody ??
      (await client.get({
        endpoint: "blogs",
        contentId: id,
      }));

    // ファイル名・パス
    const fileName = `${datePart(blog.date)}-${sanitizeTitle(blog.title)}.md`;
    const r2Key = `backups/${fileName}`;
    const repoDir = process.env.GITHUB_BACKUP_DIR || "backups";
    const repoPath = `${repoDir}/${fileName}`;

    // 差分スキップ：R2 オブジェクトの Metadata.updated-at と比較
    try {
      const head = await s3.send(new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: r2Key,
      }));
      const prevUpdatedAt = head.Metadata?.["updated-at"];
      if (prevUpdatedAt && blog.updatedAt && prevUpdatedAt === blog.updatedAt) {
        // R2 側が同一なら GitHub 側もスキップして OK とする
        return res.status(200).json({ ok: true, action: "skipped", file: fileName });
      }
    } catch (err: unknown) {
      // 404 相当は無視してアップロードへ進む。それ以外は再スロー
      const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
      if (typeof status === "number" && status !== 404) {
          throw err;
      }
      // status が不明な場合はスキップして続行
    }

    // Markdown 生成
    const md = toMarkdown(blog);

    // 1) R2 へアップロード（Metadata に updated-at を付加して次回差分判定用に）
    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: r2Key,
      Body: md,
      ContentType: "text/markdown",
      Metadata: {
        "updated-at": blog.updatedAt || "",
        "content-id": blog.id || "",
      },
    }));

    // 2) GitHub リポジトリへ upsert
    await upsertToGithub({
      filePath: repoPath,
      content: md,
      commitMessage: `backup: ${fileName} (contentId: ${blog.id})`,
    });

    return res.status(200).json({ ok: true, action: "uploaded", file: fileName });
  } catch (err: unknown) {
    console.error("Backup error:", err);
    return res.status(500).json({ error: "Backup failed" });
  }
}
