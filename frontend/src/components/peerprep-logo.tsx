import Image from "next/image";
import Link from "next/link";

export function PeerprepLogo() {
  return (
    <Link href="/" className="w-fit">
      <div className="flex justify-center gap-x-3">
        <Image src="/gears.png" width={50} height={50} alt="Peerprep logo" />
        <div className="flex items-center">
          <p className="text-4xl">Peerprep</p>
        </div>
      </div>
    </Link>
  );
}
