// /pages/posts/[id].tsxページを作成
// 必要なもの(reactコンポーネント、getStaticPaths、getStaticProps)

import Layout from "../../components/layout";
import { getAllPostIds, getPostData } from "../../lib/posts";
import Head from "next/head";
import Date from "../../components/date";
import utilStyles from "../../styles/utils.module.css";
import { PostData } from "@/types/postData";

// 動的ルーティングのために必要な関数。pathがルーティング設定になっている
//idがとりうる値のリストを返す
export async function getStaticPaths() {
    // ブログ投稿データのファイル名(id)を取得。
    const paths = getAllPostIds();

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

// SSG(id(ファイル名)に基づいて必要なデータを取得)
export async function getStaticProps({ params }: Params) {
    // params.idはgetStaticPathsで取得したid
    const postData = await getPostData(params.id);
    return {
        props: {
            postData,
        },
    };
}

export default function Post({ postData }: {postData: PostData}) {
    return (
        <Layout>
            <Head>
                <title>{postData.title}</title>
            </Head>
            <article>
                <h1 className={utilStyles.headingXl}>{postData.title}</h1>
                <div className={utilStyles.lightText}>
                    <Date dateString={postData.date} />
                </div>
                {/* マークダウンの内容をHTMLに変換して表示 */}
                <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            </article>
        </Layout>
    );
}

