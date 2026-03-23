import Link from "next/link";

export function PublicHeader() {
  return (
    <div className="text-header-font bg-main-beige max-w sticky top-0 flex h-20 justify-between px-6 py-6 text-shadow-md">
      <div className="flex gap-4">
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Peerprep
        </Link>
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Features
        </Link>
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Learn more
        </Link>
        <Link href="/" className="transition duration-200 hover:opacity-70">
          Dummy
        </Link>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="transition duration-200 hover:opacity-70"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="transition duration-200 hover:opacity-70"
        >
          Signup
        </Link>
      </div>
    </div>
  );
}
