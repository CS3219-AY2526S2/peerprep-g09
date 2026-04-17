import { TileModal } from "./topic-modal";
import { CreateModal } from "./create-modal";

interface TabPagesProps {
  categories: string[];
  difficulties: string[];
}

export function TabPages({ categories, difficulties }: TabPagesProps) {
  // Get first 9 categories
  const displayCategories = categories.slice(0, 9);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-6 w-full text-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Quick Pairing</h2>
      </div>
      <div className="flex items-start gap-12">
        <div className="grid grid-cols-3 gap-3">
          {displayCategories.map((topic) => (
            <TileModal 
              key={topic} 
              topic={topic} 
              difficulties={difficulties}
            />
          ))}
        </div>
        <div className="pt-2">
          <CreateModal 
            title="Create Prep" 
            categories={categories}
            difficulties={difficulties}
          />
        </div>
      </div>
    </div>
  );
}