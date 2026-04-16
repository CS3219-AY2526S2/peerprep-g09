import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-main-beige to-white px-4">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-7xl font-bold text-gray-900">Peerprep</h1>
          <p className="text-xl text-gray-600">Master coding interviews through peer collaboration</p>
        </div>

        <div className="space-y-4 pt-8">
          <Link
            href="/login"
            className="inline-block rounded-lg bg-gray-900 px-8 py-3 text-white font-semibold transition duration-200 hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
