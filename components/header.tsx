import Link from "next/link";
import Image from "next/image";

const name = "Katsya";

type HeaderProps = {
  home?: boolean;
};

export default function Header({ home }: HeaderProps) {
  return (
    <header className="flex flex-col items-center bg-gradient-to-b from-slate-50 to-white py-4 shadow-sm">
      {home ? (
        <>
          <Image
            src="/images/profile.png"
            alt={name}
            className="rounded-full border-4 border-gray-300 shadow-lg mb-2"
            width={96}
            height={96}
          />
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2">
            {name}
          </h1>
          <section className="text-lg text-gray-700 text-center">
        <p>
          備忘録
        </p>
      </section>
        </>
      ) : (
        <>
          <Link href="/" className="group">
            <Image
              src="/images/profile.png"
              alt={name}
              className="rounded-full border-2 border-gray-300 shadow mb-2"
              width={72}
              height={72}
            />
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <Link
              href="/"
              className="text-gray-900 hover:text-indigo-600 transition-colors duration-200"
            >
              {name}
            </Link>
          </h2>
        </>
      )}

      <nav className="grid grid-cols-3 w-full max-w-md">
        <Link
          href="/"
          className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors duration-200 px-3 py-2 hover:bg-indigo-50 text-center"
        >
          Home
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-indigo-50 text-center"
        >
          Diary
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-indigo-50 text-center"
        >
          Programming
        </Link>
      </nav>
    </header>
  );
}
