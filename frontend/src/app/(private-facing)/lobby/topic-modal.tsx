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

export function TileModal({ topic }: { topic: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="hover:bg-tile-dark bg-tile flex h-20 w-40 items-center justify-center rounded-lg border p-3 transition duration-200 ease-out hover:scale-105 hover:cursor-pointer">
          <p>{topic}</p>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Chosen topic -{" "}
            <span className="text-main-beige text-2xl font-bold">{topic}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="font-semibold">
            You will be matched with other users who have picked the topic{" "}
            <span className="text-main-beige font-bold">{topic}</span>.
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
