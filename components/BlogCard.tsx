import Link from "next/link";
import Image from "next/image";
import Date from "./date";
import type { Blog } from "../types/blog";

type BlogCardProps = {
  post: Blog;
};

export default function BlogCard({ post }: BlogCardProps) {
  const { id, title, publishedAt, thumbnail } = post;
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border bg-white">
      <Link href={`/posts/${id}`}>
        <div className="group relative block h-48 overflow-hidden bg-gray-100 md:h-64">
          {thumbnail?.url && (
            <Image
              src={thumbnail.url}
              alt={title}
              width={thumbnail.width}
              height={thumbnail.height}
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
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
  );
}

