export function TileStat({
  stat,
  category,
}: {
  stat: number;
  category: string;
}) {
  const categoryConfig: Record<string, { bg: string; text: string; border: string }> = {
    Easy: {
      bg: "from-green-50 to-green-100 dark:from-green-900 dark:to-green-800",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-200 dark:border-green-700",
    },
    Medium: {
      bg: "from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800",
      text: "text-yellow-700 dark:text-yellow-300",
      border: "border-yellow-200 dark:border-yellow-700",
    },
    Hard: {
      bg: "from-red-50 to-red-100 dark:from-red-900 dark:to-red-800",
      text: "text-red-700 dark:text-red-300",
      border: "border-red-200 dark:border-red-700",
    },
  };

  const config = categoryConfig[category];

  return (
    <div className={`bg-gradient-to-br ${config.bg} ${config.border} flex h-24 w-56 flex-col items-center justify-center rounded-lg border shadow-sm transition duration-200 hover:shadow-md hover:cursor-default`}>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stat}</p>
      <p className={`text-sm font-medium ${config.text}`}>{category} Problems</p>
    </div>
  );
}
