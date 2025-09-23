import Link from "next/link";

type BackToHomeLinkProps = {
  className?: string;
};

export default function BackToHomeLink({ className = "" }: BackToHomeLinkProps) {
  return (
    <Link
      href="/"
      className={`back-home-link inline-flex items-center gap-2 rounded-full bg-slate-200 px-5 py-2 text-sm font-semibold text-gray-900 transition duration-200 ease-out hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${className}`}
    >
      <span aria-hidden className="text-lg">←</span>
      <span>Blog Top</span>
    </Link>
  );
}
