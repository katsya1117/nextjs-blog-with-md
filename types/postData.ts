// 投稿データの型を定義

export type PostData = {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  contentHtml: string;
};

// propsの型を定義
export type HomeProps = {
  posts: PostData[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
};