import Head from "next/head"
import Image from "next/image"
import Layout, { siteTitle } from "../../components/layout"
import { Pagination } from "../../components/pagination"
import { getSortedPostsData } from "../../lib/posts"
import Link from "next/link"
import Date from "../../components/date"
import type { GetStaticProps, GetStaticPaths } from "next"
import { PER_PAGE } from "../../lib/constants";
import { PostData } from "@/types/postData"

interface PageProps {
  posts: PostData[]
  totalPages: number
  currentPage: number
  totalCount: number
}


// getStaticPaths - 2ページ目以降のパスを生成
export const getStaticPaths: GetStaticPaths = async () => {
  const allPostsData = getSortedPostsData() // 全投稿データを取得
  const totalPages = Math.ceil(allPostsData.length / PER_PAGE) // 総ページ数計算

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
  const allPostsData = getSortedPostsData() // 全投稿データを取得
  console.log('Total number of posts:', allPostsData.length);
  const startIndex = (page - 1) * PER_PAGE  // 開始インデックス計算
  const posts = allPostsData.slice(startIndex, startIndex + PER_PAGE)   // 該当ページの投稿のみ取得
  const totalPages = Math.ceil(allPostsData.length / PER_PAGE)  // 総ページ数

  return {
    props: {
      posts,
      totalPages,
      currentPage: page,
      totalCount: allPostsData.length,
    },
  }
}

export default function PagedPosts({ posts, totalPages, currentPage}: PageProps) {
  return (
    <Layout home>
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
                      src={thumbnail || "/placeholder.svg"}
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
          <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
            />
        </div>
      </section>
    </Layout>
  )
}
