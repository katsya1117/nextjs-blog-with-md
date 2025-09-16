import { client } from "./client";
import { PER_PAGE } from "./constants";
import type { Blog } from "../types/blog";

export type BlogListResult = {
  posts: Blog[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};

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

