import { TileStat } from "@/app/(private-facing)/lobby/tile-stat";
import { TabPages } from "./tab-pages";

export default function Lobby() {
  return (
    <div className="flex flex-1 flex-col gap-y-10">
      <div className="flex justify-between">
        <div className="flex justify-between gap-x-2">
          <div className="bg-tile flex h-20 w-40 items-center justify-center rounded-lg border p-3">
            <p>Questions completed</p>
          </div>
          <TileStat stat={23} category="Easy" />
          <TileStat stat={23} category="Medium" />
          <TileStat stat={23} category="Hard" />
        </div>
        <div className="bg-tile flex h-20 w-40 items-center justify-center rounded-lg border p-3">
          <p>100 days streak</p>
        </div>
      </div>
      <TabPages />
      <div className="flex-1 flex-col gap-y-2 border">
        <p>recent interviews</p>
        <hr className="min-w-screen border"></hr>
      </div>
    </div>
  );
}
