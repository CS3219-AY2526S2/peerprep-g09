"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const COLLABORATION_SERVICE_URL =
  process.env.NEXT_PUBLIC_COLLABORATION_URL || "http://localhost:8084";

export default function CollaborationPage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("room");

  useEffect(() => {
    if (!roomId) {
      return;
    }

    window.location.replace(
      `${COLLABORATION_SERVICE_URL}/collab/${encodeURIComponent(roomId)}`,
    );
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold">Missing Collaboration Room</h1>
          <p className="text-sm text-muted-foreground">
            No room ID was provided. Start matchmaking again from the lobby.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[50vh] items-center justify-center p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Joining Collaboration Room</h1>
        <p className="text-sm text-muted-foreground">
          Redirecting you to the live collaborative workspace...
        </p>
      </div>
    </div>
  );
}
