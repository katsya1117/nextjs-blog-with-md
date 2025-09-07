import Link from "next/link";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
};

// 数値範囲を生成するヘルパー関数
const range = (start: number, end: number): number[] => {
  if (start > end) {
    return [];
  }
  return [...Array(end - start + 1)].map((_, i) => start + i);
};

export const Pagination = ({ totalPages, currentPage }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <ul>
      {range(1, totalPages).map((number: number, index: number) => (
        <li key={index} className="inline-block mx-1">
          <Link
            // 1ページ目のリンクをルートパス('/')に、それ以外をページネーションパス('/page/2'など)に設定します
            href={number === 1 ? "/" : `/page/${number}`}
            className={`px-3 py-1 rounded-md ${
              number === currentPage
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {number}
          </Link>
        </li>
      ))}
    </ul>
  );
};
