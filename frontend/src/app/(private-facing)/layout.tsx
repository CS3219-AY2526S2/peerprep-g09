import { PublicHeader } from "@/components/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <PublicHeader />
      <main className="flex w-full flex-1 p-2">{children}</main>
    </div>
  );
}
