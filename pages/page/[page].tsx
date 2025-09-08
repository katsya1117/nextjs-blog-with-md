import Head from "next/head";
import Image from "next/image";
import Layout, { siteTitle } from "../../components/layout";
import { Pagination } from "../../components/pagination";
import Link from "next/link";
import Date from "../../components/date";
import type { GetStaticProps, GetStaticPaths, NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { PER_PAGE } from "../../lib/constants";
import { client } from "../../lib/client";

interface Blog {
  id: string;
  title: string;
  date: string;
  body: string;
  thumbnail: { url: string; width: number; height: number } | null;
}

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
  const page = Number(params?.page) || 1    // ページ番号を取得
  const offset = (page - 1) * PER_PAGE;

  const data = await client.get({
    endpoint: "blogs",
    queries: { offset, limit: PER_PAGE },
  });
  const totalPages = Math.ceil(data.totalCount / PER_PAGE);

  return {
    props: {
      posts: data.contents,
      totalPages,
      currentPage: page,
      totalCount: data.totalCount,
    },
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

        <div className="container mx-auto px-5 py-10">
          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {posts.map(({ id, date, title, thumbnail }) => (
              <article key={id} className="flex flex-col overflow-hidden rounded-lg border bg-white">
                <Link href={`/posts/${id}`}>
                  <div className="group relative block h-48 overflow-hidden bg-gray-100 md:h-64">
                    <Image
                      src={thumbnail?.url || "/placeholder.svg"}
                      alt={title}
                      width={500}
                      height={500}
                      className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4 sm:p-6">
                  <Link href={`/posts/${id}`}>
                    <span className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-2 text-center">
                      {title}
                    </span>
                  </Link>
                  <br />
                  <div className="mt-auto flex items-end justify-between">
                    <small className="text-gray-400 text-sm">
                      <Date dateString={date} />
                    </small>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <Pagination totalPages={totalPages} currentPage={currentPage} />
        </div>
      </section>
    </>
  );
};

PagedPosts.getLayout = (page) => <Layout home>{page}</Layout>;

export default PagedPosts;
