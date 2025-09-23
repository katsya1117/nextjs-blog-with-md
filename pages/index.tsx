  import Head from "next/head";
  import Layout, { siteTitle } from "../components/layout";
  import { Pagination } from "../components/pagination";
import { getBlogList } from "../lib/blogService";
  import BlogGrid from "../components/BlogGrid";
  import { Blog } from "../types/blog";
  import type { NextPage } from "next";
  import type { ReactElement, ReactNode } from "react";

  type NextPageWithLayout<P = unknown> = NextPage<P> & {
    getLayout?: (page: ReactElement) => ReactNode;
  };

  export async function getStaticProps() {
    const { posts, totalPages, currentPage, totalCount } = await getBlogList(1);
    return {
      props: { posts, totalPages, currentPage, totalCount },
      revalidate: 60,
    };
  }

  const Home: NextPageWithLayout<{
    posts: Blog[];
    totalPages: number;
    currentPage: number;
  }> = ({ posts, totalPages, currentPage }) => {
    return (
      <>
        <Head>
          <title>{siteTitle}</title>
        </Head>
        <section>
          <h2 className="text-3xl font-bold mt-10 text-center">Blog</h2>
            <p  className="text-lg text-gray-700 mt-4 text-center">備忘録</p>
          <div className="container mx-auto px-10 py-10 space-y-8">
            <BlogGrid posts={posts} />
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </div>
        </section>
      </>
    );
  };

  Home.getLayout = (page) => <Layout home>{page}</Layout>;

  export default Home;
