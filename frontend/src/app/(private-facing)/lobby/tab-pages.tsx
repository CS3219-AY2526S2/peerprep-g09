import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TileModal } from "./topic-modal";
import { CreateModal } from "./create-modal";

export function TabPages() {
  return (
    <Tabs defaultValue="account" className="gap-y-4">
      <TabsList className="mx-auto">
        <TabsTrigger value="account">Quick Pairing</TabsTrigger>
        <TabsTrigger value="password">Lobby</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="flex justify-center gap-x-4">
          <div className="grid grid-cols-3 gap-3">
            <TileModal topic="test1" />
            <TileModal topic="test1" />
            <TileModal topic="test1" />
            <TileModal topic="test1" />
            <TileModal topic="test1" />
            <TileModal topic="test1" />
            <TileModal topic="test1" />
            <TileModal topic="test1" />
            <TileModal topic="test1" />
          </div>
          <div className="flex flex-col items-center justify-center gap-y-3">
            <CreateModal title="Create Prep" />
            <CreateModal title="Challenge a friend" />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  );
}
