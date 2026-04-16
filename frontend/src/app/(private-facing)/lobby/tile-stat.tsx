export function TileStat({
  stat,
  category,
}: {
  stat: number;
  category: string;
}) {
  const categoryColors: Record<string, string> = {
    Easy: "text-tile-stat-green",
    Medium: "text-tile-stat-yellow",
    Hard: "text-tile-stat-red",
  };

  return (
    <div className="shadow-lg hover:shadow-2xl hover:bg-tile-dark bg-tile flex h-20 w-40 flex-col items-center justify-center rounded-xl border transition duration-200 hover:cursor-default">
      <p>{stat}</p>
      <p className={categoryColors[category]}>{category}</p>
    </div>
  );
}
