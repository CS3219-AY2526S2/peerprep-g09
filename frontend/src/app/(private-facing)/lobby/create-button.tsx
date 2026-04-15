export function CreateButton({ title }: { title: string }) {
  return (
    <div className="flex h-10 w-80 items-center justify-center rounded-lg border bg-[#997070] transition duration-200 ease-out hover:scale-105 hover:cursor-pointer">
      <p>{title}</p>
    </div>
  );
}
