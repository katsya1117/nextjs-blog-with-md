// /pages/posts/[id].tsxページを作成
// 必要なもの(reactコンポーネント、getStaticPaths、getStaticProps)

import Layout from "../../components/layout";
import Head from "next/head";
import Link from "next/link";
import Date from "../../components/date";
import Image from "next/image";
import { client } from "../../lib/client";
import { buildMicroCmsImageUrl } from "../../lib/microcmsImage";
import { remark } from "remark";
import html from "remark-html";
import { Blog } from "../../types/blog";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { GetRequest } from "microcms-js-sdk";
import { remarkFigureCaption } from "../../lib/remarkFigureCaption";
import { categoryToSlug, formatCategory } from "../../lib/categories";

type NextPageWithLayout<P = unknown> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const PAGE_LIMIT = 100;

export async function getStaticPaths() {
  let offset = 0;
  const paths: { params: { id: string } }[] = [];

  while (true) {
    const data = await client.get({
      endpoint: "blogs",
      queries: { limit: PAGE_LIMIT, offset },
    });

    paths.push(
      ...data.contents.map((post: Blog) => ({
        params: { id: post.id },
      }))
    );

    offset += PAGE_LIMIT;

    if (offset >= data.totalCount) {
      break;
    }
  }
  return {
    paths,
    fallback: false,
  };
}

type Params = {
  params: {
    id: string;
  };
};

// 記事ごとのデータ取得
export async function getStaticProps({ params }: Params) {
  interface ExtendedGetRequest extends GetRequest {
    fields?: string[]; // 追加のフィールドをオプションで指定可能にする
  }
  // params.idはgetStaticPathsで取得したid
  const post = await client.get({
    endpoint: "blogs",
    contentId: params.id,
    fields: ["id", "title", "publishedAt", "body", "thumbnail", "category"],
  } as ExtendedGetRequest);

  const heroImage = post.thumbnail;
  const heroOptimizedUrl = heroImage
    ? buildMicroCmsImageUrl(heroImage.url, { width: 1920, quality: 85 })
    : undefined;

  // Markdown to HTML
  const processedContent = await remark()
    .use(remarkFigureCaption, {
      figureClass: "wp-block-image size-large",
      captionClass: "wp-element-caption",
    })
    .use(html, { sanitize: false })
    .process(post.body ?? "");
  const contentHtml = processedContent.toString();
  return {
    props: {
      postData: {
        ...post,
        heroOptimizedUrl,
        contentHtml,
      },
    },
  };
}

const contentClassName = [
  "mx-auto mt-10 px-4 sm:px-6 lg:px-8 max-w-[848px] space-y-6 leading-relaxed text-gray-700",
  "[&>h2]:mt-10 [&>h2]:text-3xl [&>h2]:font-semibold",
  "[&>h3]:mt-8 [&>h3]:text-2xl [&>h3]:font-semibold",
  "[&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5",
  "[&>a]:text-blue-600 [&>a]:underline [&>a]:hover:underline",
  "[&>img]:rounded-xl",
  "[&>p]:mx-auto [&>p]:my-[40px] [&>p]:[line-height:calc(1em+14px)]",
  "[&_.wp-block-image]:mx-auto [&_.wp-block-image]:my-10 [&_.wp-block-image]:grid",
  "[&_.wp-block-image]:w-full [&_.wp-block-image]:justify-items-center [&_.wp-block-image]:gap-2",
  "[&_.wp-block-image]:overflow-hidden",
  "[&_.wp-block-image>img]:w-full [&_.wp-block-image>img]:h-auto [&_.wp-block-image>img]:rounded-[20px] [&_.wp-block-image>img]:border [&_.wp-block-image>img]:border-black",
  "[&_.wp-element-caption]:justify-self-start [&_.wp-element-caption]:mt-2",
  "[&_.wp-element-caption]:text-left [&_.wp-element-caption]:text-xs [&_.wp-element-caption]:font-normal [&_.wp-element-caption]:text-gray-500",
  "md:[&_.wp-element-caption]:text-sm"
].join(" ");

const Post: NextPageWithLayout<{
  postData: Blog & { contentHtml: string };
}> = ({ postData }) => {
  // カテゴリ文字列を表示用（#付き）とスラッグに変換。
  // どちらも空であればカテゴリリンクを描画しない。
  const displayCategory = formatCategory(postData.category);
  const categorySlug = categoryToSlug(postData.category);
  const heroSrc = postData.heroOptimizedUrl ?? postData.thumbnail?.url;
  return (
    <>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article className="py-12 space-y-8">
        {/* ヘッダー情報（タイトル・日付・カテゴリ） */}
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            {postData.title}
          </h1>
          <div className="mt-4 text-sm text-gray-500">
            <Date dateString={postData.publishedAt} />
          </div>

          {/* カテゴリ表示 */}
          {displayCategory && categorySlug && (
            <Link
              href={`/categories/${categorySlug}`}
              className="tag-pill mt-2 inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-black transition-colors duration-300 ease-out hover:bg-slate-100 hover:text-black"
            >
              {/* カテゴリ別一覧ページへ遷移できるリンク */}
              {displayCategory}
            </Link>
          )}
        </div>
        {/* サムネイル表示 */}
        {heroSrc && (
          // サムネイルはフルブリードで表示し、Next.js Image に最適化を任せる
          <figure className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden rounded-tl-[32px] md:rounded-tl-[64px]">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={heroSrc}
                alt={postData.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority={false}
              />
            </div>
          </figure>
        )}

        {/* マークダウン本文を Tailwind で整形して描画 */}
        <div
          className={contentClassName}
          dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
        />
      </article>
    </>
  );
};

Post.getLayout = (page) => <Layout>{page}</Layout>;

export default Post;
