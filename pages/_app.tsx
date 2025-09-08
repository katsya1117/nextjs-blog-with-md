import "@/styles/globals.css";
import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
// import { inter, notoSansJP } from "../lib/font";
import Layout from "@/components/layout";
import { inter } from "@/lib/font";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// export default function App({ Component, pageProps }: AppProps) {
//   return (
//   // <div className={`${inter.variable} ${notoSansJP.variable}`}>
//   <div className={inter.variable}>
//     <Component {...pageProps} />
//   </div>
//   );
// }

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <div className={inter.variable}>
      {getLayout(<Component {...pageProps} />)}
    </div>
  );
}
