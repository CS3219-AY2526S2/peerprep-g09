import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { DropdownMenu } from "@/components/dropdown-menu";

export function CreateModal({ title }: { title: string }) {
  const difficultyLevels: string[] = ["Easy", "Normal", "Hard"];
  const topics: string[] = [
    "Array",
    "String",
    "DP",
    "Binary Search",
    "Hashing",
    "Sort",
    "Range Query",
    "Database",
    "Other",
  ];

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="shadow-lg hover:shadow-2xl flex h-10 w-80 items-center justify-center rounded-xl border bg-[#A88585] transition duration-200 ease-out hover:scale-105 hover:cursor-pointer">
          <p>{title}</p>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            Choose a difficulty level
            <DropdownMenu options={difficultyLevels} />
          </AlertDialogDescription>
          <AlertDialogDescription>
            Choose a topic
            <DropdownMenu options={topics} />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="hover:bg-main-beige-dark! bg-main-beige! font-bold! hover:cursor-pointer">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
