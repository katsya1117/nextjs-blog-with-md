import Head from "next/head";
import Image from "next/image";
import Layout, { siteTitle } from "../components/layout";
import { Pagination } from "../components/pagination";
import Link from "next/link";
import Date from "../components/date";
import { PER_PAGE } from "../lib/constants";
import { client } from "../lib/client";
import { Blog } from "../types/blog";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

type NextPageWithLayout<P = unknown> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export async function getStaticProps() {
  const data = await client.get({
    endpoint: "blogs",
    queries: {
      limit: PER_PAGE,
      offset: 0,
    },
  });

  return {
    props: {
      posts: data.contents,
      totalPages: Math.ceil(data.totalCount / PER_PAGE),
      currentPage: 1,
      totalCount: data.totalCount,
    },
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
        <h2 className="text-3xl font-bold my-4 text-center">Blog</h2>
        <section className="text-lg text-gray-700 text-center">
          <p>備忘録</p>
        </section>

        <div className="container mx-auto px-5 py-10">
          <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {posts.map(({ id, publishedAt, title, thumbnail }) => (
              <article key={id} className="flex flex-col overflow-hidden rounded-lg border bg-white">
                <Link href={`/posts/${id}`}>
                  <div className="group relative block h-48 overflow-hidden bg-gray-100 md:h-64">
                    {thumbnail?.url && (
                      <Image
                        src={thumbnail.url}
                        alt={title}
                        width={thumbnail.width}
                        height={thumbnail.height}
                        priority
                        className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                      />
                    )}
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
                      <Date dateString={publishedAt} />
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

Home.getLayout = (page) => <Layout home>{page}</Layout>;

export default Home;
