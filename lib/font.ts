import { Inter } from "next/font/google";
// import { Inter, Noto_Sans_JP } from "next/font/google";

// Inter（Google Fonts）
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Noto Sans JP（ローカル）
// export const notoSansJP = Noto_Sans_JP({
//   subsets: ["japanese"] as string[], // 型エラー回避のために as string[] を追加
//   weight: ["400", "700"], // Regular + Bold
//   variable: "--font-noto-sans-jp",
//   display: "swap",
// });
