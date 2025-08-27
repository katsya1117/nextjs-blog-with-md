import Link from "next/link";
import Header from "./header";

export const siteTitle = "Next.js Blog";

// propsの型定義
type LayoutProps = {
  children: React.ReactNode;
  home?: boolean;
};

function Layout({ children, home }: LayoutProps) {
  return (
    <div>
      <Header home={home}/>
    <div className="max-w-[1244px] px-4 mx-auto">
      
      <main>{children}</main>
      {!home && (
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">← ホームに戻る</Link>
        </div>
      )}
    </div>
    </div>
  );
}

export default Layout;
