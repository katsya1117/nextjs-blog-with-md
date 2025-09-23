import Head from "next/head";
import Layout, { siteTitle } from "../../components/layout";
import { Pagination } from "../../components/pagination";
import type { GetStaticProps, GetStaticPaths, NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { PER_PAGE } from "../../lib/constants";
import { client } from "../../lib/client";
import { getBlogList } from "../../lib/blogService";
import BlogGrid from "../../components/BlogGrid";
import type { Blog } from "../../types/blog";

interface PageProps {
  posts: Blog[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

type NextPageWithLayout<P = unknown> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

// getStaticPaths - 2ページ目以降のパスを生成
export const getStaticPaths: GetStaticPaths = async () => {
  const data = await client.get({ endpoint: "blogs" });
  const totalPages = Math.ceil(data.totalCount / PER_PAGE);

  const paths = totalPages > 1 ? Array.from({ length: totalPages - 1 }, (_, i) => ({ 
    params: { page: String(i + 2) }, // 2ページ目以降のパス生成
  })) : [];

  return {
    paths,
    fallback: false,
  }
}

// getStaticProps - 各ページのデータを取得
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const page = Number(params?.page) || 1;
  const { posts, totalPages, currentPage, totalCount } = await getBlogList(page);
  return {
    props: { posts, totalPages, currentPage, totalCount },
    revalidate: 60,
  };
}

const PagedPosts: NextPageWithLayout<PageProps> = ({ posts, totalPages, currentPage }) => {
  return (
    <>
      <Head>
        <title>{`${siteTitle} - Page ${currentPage}`}</title>
      </Head>
      <section>
        <h2 className="text-3xl font-bold my-4 text-center">Blog</h2>

        <div className="container mx-auto px-5 py-10 space-y-8">
          <BlogGrid posts={posts as Blog[]} />
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </section>
    </>
  );
};

PagedPosts.getLayout = (page) => <Layout home>{page}</Layout>;

export default PagedPosts;
