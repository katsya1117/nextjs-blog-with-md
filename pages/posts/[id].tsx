// /pages/posts/[id].tsxページを作成
// 必要なもの(reactコンポーネント、getStaticPaths、getStaticProps)

import Layout from "../../components/layout";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import { client } from "../../lib/client";
import { remark } from "remark";
import html from "remark-html";
import { Blog } from "../../types/blog";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

type NextPageWithLayout<P = unknown> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

// 動的ルーティングのために必要な関数。pathがルーティング設定になっている
//idがとりうる値のリストを返す
export async function getStaticPaths() {
    // ブログ投稿データのファイル名(id)を取得。
    const data = await client.get({ endpoint: "blogs" });
    const paths = data.contents.map((post: Blog) => ({
    params: { id: post.id},
  }));
    return {
        paths, // どのパスが事前にレンダリングされるのか決める。
        fallback: false, // falseにすると、指定されたパス以外は404エラーになる
    };
}

type Params = {
  params: {
    id: string;
  };
};

// 記事ごとのデータ取得
export async function getStaticProps({ params }: Params) {
    // params.idはgetStaticPathsで取得したid
    const post = await client.get({
        endpoint: "blogs",
        contentId: params.id,
    });

    // Markdown to HTML
    const processedContent = await remark()
        .use(html)
        .process(post.body || "");
    const contentHtml = processedContent.toString();
    return {
        props: {
            postData: {
                ...post,
                contentHtml,
            },
        },
    };
}

const Post: NextPageWithLayout<{ postData: Blog & { contentHtml: string } }> = ({ postData }) => {
  return (
    <>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.publishedAt} />
        </div>
        {/* マークダウンの内容をHTMLに変換して表示 */}
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </>
  );
};

Post.getLayout = (page) => <Layout>{page}</Layout>;

export default Post;
