// archived: moved from pages/_index_local.tsx
import Head from "next/head";
import Image from "next/image";
import Layout, { siteTitle } from "../components/layout";
import { Pagination } from "../components/pagination"
import { getSortedPostsData } from "../lib/posts";
import Link from "next/link";
import Date from "../components/date";
import { HomeProps} from "../types/postData";
import { PER_PAGE } from "../lib/constants";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  console.log('Total number of posts:', allPostsData.length);
  const posts = allPostsData.slice(0, PER_PAGE) // Only first page
  const totalPages = Math.ceil(allPostsData.length / PER_PAGE)
  return {
    props: {
      posts,
      totalPages,
      currentPage: 1,
      totalCount: allPostsData.length,
    },
  };
}

export default function Home({ posts, totalPages, currentPage }: HomeProps) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section>
        <h2 className="text-3xl font-bold my-4 text-center">
          Blog
        </h2>

        {/* <div className={styles.grid}> */}
          <div className="container mx-auto px-5 py-10">
            <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {/* 一つ一つのブログをdivで生成してgrid適用させる */}
              {posts.map(({ id, date, title, thumbnail }) => (
                <article key={id} className="flex flex-col overflow-hidden rounded-lg border bg-white">
                    <Link href={`/posts/${id}`}>
                      <div className="group relative block h-48 overflow-hidden bg-gray-100 md:h-64">
                        <Image
                          src={thumbnail}
                          alt={title}
                          width={500}
                          height={500}
                          className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                          // object-cover
                        />
                      </div>
                    </Link>
                    {/* title */}
                    <div className="flex flex-1 flex-col p-4 sm:p-6">
                      <Link href={`/posts/${id}`}>
                        <span className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-2 text-center">
                          {title}
                        </span>
                      </Link>
                      <br />
                      {/* date */}
                      <div className="mt-auto flex items-end justify-between">
                      <small className="text-gray-400 text-sm">
                        <Date dateString={date} />
                      </small>
                      </div>
                    </div>
                </article>
              ))}
            </div>
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
            />
          </div>
      </section>
    </Layout>
  );
}
