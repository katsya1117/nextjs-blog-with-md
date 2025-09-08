// archived: moved from lib/posts.ts
import path from "path";
import fs from "fs";
import matter from "gray-matter";

import { remark } from "remark";
import html from "remark-html";

import { PostData } from "../types/postData";

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData(): PostData[] {
    // posts配下のファイル名を取得
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData: PostData[] = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map((fileName) => {
        // idを取得するためにファイル名の拡張子を除去
        const id = fileName.replace(/\.md$/, "");

        // マークダウンファイルを文字列として読み取る
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");

        // 投稿のメタデータ部分を解析
        const matterResult = matter(fileContents);

        // idとデータを返す
        return {
            id,
            ...(matterResult.data as Omit<PostData, "id"| "contentHtml">),
            contentHtml: "", // contentHtmlはgetPostDataで設定する
        };
    });

    // 投稿を日付でソート
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

// 動的ルーティング時に設定
//postsディレクトリの中の全てのファイル名をリストで返す
export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);
    // 以下のような配列を返します:
    // [
    // {
    // params: {
    // id: 'ssg-ssr'
    // }
    // },
    // {
    // params: {
    // id: 'pre-rendering'
    // }
    // }
    // ]
    return fileNames.map((fileName) => ({
            // あとでこれらidがルーティングのパスになる
            params: {
                id: fileName.replace(/\.md$/, ""),
            },
        }));
}

// idに対応するマークダウンファイルの内容を取得
export async function getPostData(id: string): Promise<PostData> {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    // マークダウンのメタデータ部分を解析
    const matterResult = matter(fileContents);
    // マークダウンをHTMLに変換
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);

    const contentHtml = processedContent.toString();

    // idとデータを返す
    return {
    id,
    ...(matterResult.data as Omit<PostData, "id" | "contentHtml">),
    contentHtml,
  };
}
