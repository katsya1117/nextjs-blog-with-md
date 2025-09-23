import Head from "next/head";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import type { ReactElement, ReactNode } from "react";

import Layout, { siteTitle } from "../../../../components/layout";
import BlogGrid from "../../../../components/BlogGrid";
import { Pagination } from "../../../../components/pagination";
import type { Blog } from "../../../../types/blog";
import { categoryToSlug, formatCategory, slugToCategory } from "../../../../lib/categories";
import { getAllCategories, getBlogListByCategory } from "../../../../lib/blogService";

type NextPageWithLayout<P = Record<string, unknown>> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type CategoryPagedProps = {
  category: string;
  displayCategory: string;
  posts: Blog[];
  totalPages: number;
  currentPage: number;
  slug: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = await getAllCategories();
  const paths: { params: { slug: string; page: string } }[] = [];

  for (const category of categories) {
    const slug = categoryToSlug(category);
    if (!slug) continue;

    const { totalPages } = await getBlogListByCategory(category, 1);
    if (totalPages <= 1) continue;

    for (let page = 2; page <= totalPages; page += 1) {
      paths.push({ params: { slug, page: String(page) } });
    }
  }

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<CategoryPagedProps> = async ({ params }) => {
  const slugParam = params?.slug;
  const pageParam = params?.page;

  if (!slugParam || Array.isArray(slugParam) || !pageParam || Array.isArray(pageParam)) {
    return { notFound: true };
  }

  const category = slugToCategory(slugParam);
  if (!category) {
    return { notFound: true };
  }

  const pageNumber = Math.max(1, Number(pageParam));
  const { posts, totalPages, currentPage } = await getBlogListByCategory(category, pageNumber);
  const displayCategory = formatCategory(category);

  if (pageNumber > totalPages) {
    return { notFound: true };
  }

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

const CategoryPagedPage: NextPageWithLayout<CategoryPagedProps> = ({ displayCategory, posts, totalPages, currentPage, slug }) => {
  const pageTitle = `${displayCategory} - Page ${currentPage} | ${siteTitle}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <section className="py-12 space-y-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            {displayCategory || "Category"}
          </h1>
        </div>
        <div className="container mx-auto px-10 space-y-8">
          <BlogGrid posts={posts} showCategory={false} />
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            hrefBuilder={(page) =>
              page === 1 ? `/categories/${slug}` : `/categories/${slug}/page/${page}`
            }
          />
        </div>
      </section>
    </>
  );
};

CategoryPagedPage.getLayout = (page) => <Layout>{page}</Layout>;

export default CategoryPagedPage;
