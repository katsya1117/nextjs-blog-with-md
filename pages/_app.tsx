import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import { inter, notoSansJP } from "../lib/font";
import { inter } from "@/lib/font";


export default function App({ Component, pageProps }: AppProps) {
  return (
  // <div className={`${inter.variable} ${notoSansJP.variable}`}>
  <div className={inter.variable}>
    <Component {...pageProps} />
  </div>
  );
}
