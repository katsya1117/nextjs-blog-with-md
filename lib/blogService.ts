import { client } from "./client";
import { PER_PAGE } from "./constants";
import { normalizeCategory } from "./categories";
import type { Blog } from "../types/blog";

export type BlogListResult = {
  posts: Blog[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

// microCMS から一括取得する際に使用する最大件数
const BATCH_LIMIT = 100;

export async function getBlogList(page = 1): Promise<BlogListResult> {
  const currentPage = Math.max(1, page);
  const offset = (currentPage - 1) * PER_PAGE;
  const data = await client.get({
    endpoint: "blogs",
    queries: { limit: PER_PAGE, offset },
  });

  return {
    posts: data.contents as Blog[],
    totalPages: Math.ceil(data.totalCount / PER_PAGE),
    currentPage,
    totalCount: data.totalCount,
  };
}

export async function getAllCategories(): Promise<string[]> {
  const categories = new Set<string>();
  let offset = 0;

  while (true) {
    const data = await client.get({
      endpoint: "blogs",
      queries: { limit: BATCH_LIMIT, offset },
    });

    for (const post of data.contents as Blog[]) {
      // 取得した記事一つひとつからカテゴリを正規化し、Set で重複を排除
      const normalized = normalizeCategory(post.category);
      if (normalized) {
        categories.add(normalized);
      }
    }

    offset += BATCH_LIMIT;
    if (offset >= data.totalCount) {
      break;
    }
  }

  return Array.from(categories);
}

export async function getBlogsByCategory(category: string): Promise<Blog[]> {
  const posts: Blog[] = [];
  let offset = 0;

  while (true) {
    const data = await client.get({
      endpoint: "blogs",
      queries: {
        limit: BATCH_LIMIT,
        offset,
        // microCMS の filters で完全一致検索を行う
        filters: `category[equals]${category}`,
      },
    });

    // ページング単位で取得した記事を配列へ蓄積
    posts.push(...(data.contents as Blog[]));

    offset += BATCH_LIMIT;
    if (offset >= data.totalCount) {
      break;
    }
  }

  return posts;
}

export async function getBlogListByCategory(
  category: string,
  page = 1
): Promise<BlogListResult> {
  const currentPage = Math.max(1, page);
  const offset = (currentPage - 1) * PER_PAGE;
  const data = await client.get({
    endpoint: "blogs",
    queries: {
      limit: PER_PAGE,
      offset,
      filters: `category[equals]${category}`,
    },
  });

  return {
    posts: data.contents as Blog[],
    totalPages: Math.ceil(data.totalCount / PER_PAGE),
    currentPage,
    totalCount: data.totalCount,
  };
}
