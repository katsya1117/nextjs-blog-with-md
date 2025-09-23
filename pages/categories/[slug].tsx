import Head from "next/head";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

import Layout, { siteTitle } from "../../components/layout";
import BlogGrid from "../../components/BlogGrid";
import { Pagination } from "../../components/pagination";
import type { Blog } from "../../types/blog";
import { categoryToSlug, formatCategory, slugToCategory } from "../../lib/categories";
import { getAllCategories, getBlogListByCategory } from "../../lib/blogService";

type NextPageWithLayout<P = Record<string, unknown>> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type CategoryPageProps = {
  category: string;
  displayCategory: string;
  posts: Blog[];
  totalPages: number;
  currentPage: number;
  slug: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await getAllCategories();
  const paths = categories
    .map((category) => {
      const slug = categoryToSlug(category);
      if (!slug) return null;
      return { params: { slug } };
    })
    .filter(Boolean) as { params: { slug: string } }[];

  return {
    paths,
    // 新しいカテゴリが追加された場合でも初回アクセスで生成できるよう blocking を使用
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params }) => {
  const slugParam = params?.slug;
  if (!slugParam || Array.isArray(slugParam)) {
    return { notFound: true };
  }

  // スラッグを元のカテゴリ名へ復元
  const category = slugToCategory(slugParam);
  if (!category) {
    return { notFound: true };
  }

  // 指定カテゴリの記事をページング取得
  const { posts, totalPages, currentPage } = await getBlogListByCategory(category, 1);
  const displayCategory = formatCategory(category);

  return {
    props: {
      category,
      displayCategory,
      posts,
      totalPages,
      currentPage,
      slug: slugParam,
    },
    revalidate: 60,
  };
};

const CategoryPage: NextPageWithLayout<CategoryPageProps> = ({ displayCategory, posts, totalPages, currentPage, slug }) => {
  const pageTitle = displayCategory
    ? `${displayCategory} | ${siteTitle}`
    : `Category | ${siteTitle}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      {/* カテゴリ見出しと記事一覧 */}
      <section className="py-12 space-y-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            {displayCategory || "Category"}
          </h1>
        </div>

        <div className="container mx-auto px-10 space-y-8">
          {posts.length > 0 ? (
            <>
              <BlogGrid posts={posts} showCategory={false} />
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                hrefBuilder={(page) =>
                  page === 1 ? `/categories/${slug}` : `/categories/${slug}/page/${page}`
                }
              />
            </>
          ) : (
            <p className="text-gray-600 text-center">
              {displayCategory || "This category"} に該当する記事はまだありません。
            </p>
          )}
        </div>
      </section>
    </>
  );
};

CategoryPage.getLayout = (page) => <Layout>{page}</Layout>;

export default CategoryPage;
