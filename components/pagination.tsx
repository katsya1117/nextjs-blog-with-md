import Link from "next/link";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  hrefBuilder?: (page: number) => string;
}

// 数値範囲を生成するヘルパー関数
const range = (start: number, end: number): number[] => {
  if (start > end) {
    return [];
  }
  return [...Array(end - start + 1)].map((_, i) => start + i);
};

export const Pagination = ({ totalPages, currentPage, hrefBuilder }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const buildHref = hrefBuilder ?? ((page: number) => (page === 1 ? "/" : `/page/${page}`));

  return (
    <ul className="flex justify-center items-center gap-x-2">
      {range(1, totalPages).map((number: number) => (
        <li key={number}>
          <Link
            href={buildHref(number)}
            aria-current={number === currentPage ? "page" : undefined}
            className={`w-10 h-10 p-2 inline-flex items-center justify-center rounded-full transition-all duration-200 !no-underline hover:!no-underline focus:!no-underline visited:!no-underline ${
              number === currentPage
                ? "bg-brand-600 text-white hover:opacity-90"
                : "text-brand-600 border border-brand-200 bg-brand-50 hover:opacity-80"
            }`}
          >
            {number}
          </Link>
        </li>
      ))}
    </ul>
  );
};
