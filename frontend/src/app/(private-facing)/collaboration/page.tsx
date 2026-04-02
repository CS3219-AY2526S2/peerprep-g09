import { QuestionPanel } from "./question-panel";
import { IDEArea } from "./ide-area";
import { TerminalArea } from "./terminal-area";

export default function CollaborationPage() {
  return (
    <div className="flex h-full w-full gap-4 p-4">
      {/* Left Side: Question Panel */}
      <div className="w-1/3 overflow-y-auto">
        <QuestionPanel />
      </div>

      {/* Right Side: IDE and Terminal */}
      <div className="flex w-2/3 flex-col gap-4">
        {/* Top: IDE Area */}
        <div className="flex-1">
          <IDEArea />
        </div>

        {/* Bottom: Terminal */}
        <div className="h-40 flex-shrink-0">
          <TerminalArea />
        </div>
      </div>
    </div>
  );
}
