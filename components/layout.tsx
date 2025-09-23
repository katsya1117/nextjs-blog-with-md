import Header from "./header";
import Footer from "./footer";
import BackToHomeLink from "./BackToHomeLink";

export const siteTitle = "Next.js Blog";

// propsの型定義
type LayoutProps = {
  children: React.ReactNode;
  home?: boolean;
};

function Layout({ children, home }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header home={home} />
      <div className="mx-auto flex w-full flex-1 flex-col">
        <main className="flex-1">{children}</main>
        {!home && (
          <div className="mt-12 flex justify-center pb-12">
            <BackToHomeLink />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
