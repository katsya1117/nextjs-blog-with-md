export type Blog = {
  id: string;
  title: string;
  body: string;
  category?: string;
  date?: string;
  publishedAt: string;
  updatedAt?: string;
  thumbnail?: {
    url: string;
    height: number;
    width: number;
  };
};