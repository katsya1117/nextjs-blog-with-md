import Link from "next/link";
import Image from "next/image";
import Date from "./date";
import { categoryToSlug, formatCategory } from "../lib/categories";
import type { Blog } from "../types/blog";

type BlogCardProps = {
  post: Blog;
  showCategory?: boolean;
};

export default function BlogCard({ post, showCategory = true }: BlogCardProps) {
  const { id, title, publishedAt, thumbnail, category } = post;
  // 表示用（常に # 付き）とリンク用スラッグをここで算出
  const displayCategory = formatCategory(category);
  const categorySlug = categoryToSlug(category);
  const cardImage = thumbnail;
  const cardSrc = post.cardOptimizedUrl ?? thumbnail?.url;
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border bg-white">
      {/* アイキャッチ画像全体を投稿ページへリンクさせる */}
      <Link href={`/posts/${id}`}>
        <div className="group relative block h-48 overflow-hidden bg-gray-100 md:h-64">
          {cardSrc && cardImage?.width && cardImage?.height && (
            <Image
              src={cardSrc}
              alt={title}
              width={cardImage.width}
              height={cardImage.height}
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
            />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        {/* タイトルも投稿詳細へ遷移できるようリンク化 */}
        <Link
          href={`/posts/${id}`}
          className="card-title-link inline-block text-left text-xl font-semibold text-gray-700 transition-colors duration-300 ease-out hover:text-gray-500"
        >
          {title}
        </Link>
        {showCategory && displayCategory && categorySlug && (
          <Link
            href={`/categories/${categorySlug}`}
            className="tag-pill mt-4 inline-flex items-center self-start rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-black transition-colors duration-300 ease-out hover:bg-slate-100 hover:text-black"
          >
            {/* 一覧への導線としてカテゴリ名をクリック可能にする */}
            {displayCategory}
          </Link>
        )}
        {/* 投稿日とカード下部の余白調整 */}
        <div className="mt-auto flex items-end justify-between pt-4">
          <small className="text-gray-400 text-sm">
            <Date dateString={publishedAt} />
          </small>
        </div>
      </div>
    </article>
  );
}
