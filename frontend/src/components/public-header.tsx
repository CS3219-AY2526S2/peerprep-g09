import Link from 'next/link'

export function PublicHeader() {
    return (
        <div className="px-6 py-6 sticky top-0 bg-main-beige max-w h-20 flex justify-between">
            <div className="flex gap-4">
                <Link href="/">
                    Peerprep
                </Link>
                <Link href="/">
                    Features
                </Link>
                <Link href="/">
                    Learn more
                </Link>
                <Link href="/">
                    Dummy
                </Link>
            </div>
            <div className="flex gap-4">
                <Link href="/login">
                    Log in
                </Link>
                <Link href="/signup">
                    Signup
                </Link>
            </div>
        </div>
    )
}