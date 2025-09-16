import Link from "next/link";
import Image from "next/image"; 

const name = "Katsya";

type HeaderProps = {
  home?: boolean;
}

export default function Header({ home }: HeaderProps) {
  return (
    <header className="flex flex-row items-center justify-center py-8 shadow-sm bg-[url('/images/bg-noise.jpg')] bg-center bg-no-repeat bg-cover">
      {home ? (
        <>
          {/* <Image
            src="/images/profile.png"
            alt={name}
            className="rounded-full border-4 border-gray-300 shadow-lg mb-2"
            width={96}
            height={96}
          /> */}
          <Image
            src="/images/logo.png"
            alt="Logo"
            className="shadow-lg mt-2 mb-2 text-center inline"
            width={128}
            height={128}
            />
          {/* <h1 className={`text-4xl font-bold tracking-tight text-gray-900 mb-2 bg`}>
            {name}
          </h1> */}
        </>
      ) : (
        <>
          <Link href="/" className="group">
            {/* <Image
              src="/images/profile.png"
              alt={name}
              className="rounded-full border-2 border-gray-300 shadow mb-2"
              width={72}
              height={72}
            /> */}
            <Image
            src="/images/logo.png"
            alt="Logo"
            className="shadow-lg mt-2 mb-2 text-center inline"
            width={96}
            height={96}
            />
          </Link>
          {/* <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <Link
              href="/"
              className="text-gray-900 hover:text-indigo-600 transition-colors duration-200"
            >
              {name}
            </Link>
          </h2> */}
        </>
      )}

      {/* <nav className="grid grid-cols-1 w-full max-w-md">
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
      </nav> */}
    </header>
  )
}
