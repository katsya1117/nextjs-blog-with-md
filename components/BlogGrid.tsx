import BlogCard from "./BlogCard";
import type { Blog } from "../types/blog";

type BlogGridProps = {
  posts: Blog[];
};

export default function BlogGrid({ posts }: BlogGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}

