"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { io, type Socket } from "socket.io-client";

type MatchEvent = {
  roomId: string;
  partner: string;
  question?: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
};

type UserState = {
  userId: string;
  category: string;
  difficulty: string;
  log: string[];
};

const DEFAULT_TOPICS = ["Algorithms", "Data Structures"];
const DEFAULT_DIFFICULTIES = ["Easy", "Medium", "Hard"];

function addLog(setter: Dispatch<SetStateAction<UserState>>, msg: string) {
  setter((prev) => ({
    ...prev,
    log: [`${new Date().toLocaleTimeString()} - ${msg}`, ...prev.log].slice(
      0,
      10,
    ),
  }));
}

function clearLog(setter: Dispatch<SetStateAction<UserState>>) {
  setter((prev) => ({
    ...prev,
    log: [],
  }));
}

export default function MatchMaking() {
  const serviceUrl =
    process.env.NEXT_PUBLIC_MATCHING_SERVICE_URL?.trim() ||
    "http://localhost:8082";

  const [topics, setTopics] = useState<string[]>(DEFAULT_TOPICS);
  const [difficulties] = useState<string[]>(DEFAULT_DIFFICULTIES);
  const [status, setStatus] = useState<Record<string, number>>({});

  const [userA, setUserA] = useState<UserState>({
    userId: "user-a",
    category: DEFAULT_TOPICS[0],
    difficulty: DEFAULT_DIFFICULTIES[1],
    log: [],
  });
  const [userB, setUserB] = useState<UserState>({
    userId: "user-b",
    category: DEFAULT_TOPICS[0],
    difficulty: DEFAULT_DIFFICULTIES[1],
    log: [],
  });

  const socketARef = useRef<Socket | null>(null);
  const socketBRef = useRef<Socket | null>(null);

  const queueKeys = useMemo(() => Object.keys(status).sort(), [status]);

  useEffect(() => {
    async function loadTopics() {
      try {
        const res = await fetch(`${serviceUrl}/categories`);
        const data = (await res.json()) as { categories?: string[] };
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setTopics(data.categories);
          setUserA((prev) => ({ ...prev, category: data.categories![0] }));
          setUserB((prev) => ({ ...prev, category: data.categories![0] }));
        }
      } catch {
        // Keep fallback topics when service is unavailable.
      }
    }

    void loadTopics();
  }, [serviceUrl]);

  useEffect(() => {
    const socketA = io(serviceUrl, { transports: ["websocket"] });
    const socketB = io(serviceUrl, { transports: ["websocket"] });
    socketARef.current = socketA;
    socketBRef.current = socketB;

    socketA.on("connect", () =>
      addLog(setUserA, `User (${socketA.id ?? "n/a"}) Connected`),
    );
    socketB.on("connect", () =>
      addLog(setUserB, `User (${socketB.id ?? "n/a"}) Connected`),
    );

    socketA.on("queue_joined", () =>
      addLog(setUserA, `User (${socketA.id ?? "n/a"}) joined queue`),
    );
    socketB.on("queue_joined", () =>
      addLog(setUserB, `User (${socketB.id ?? "n/a"}) joined queue`),
    );

    socketA.on("queue_left", () =>
      addLog(setUserA, `User (${socketA.id ?? "n/a"}) left queue`),
    );
    socketB.on("queue_left", () =>
      addLog(setUserB, `User (${socketB.id ?? "n/a"}) left queue`),
    );

    socketA.on("match_found", (payload: MatchEvent) => {
      const title = payload.question?.title
        ? ` | ${payload.question.title}`
        : "";
      addLog(
        setUserA,
        `Matched with ${payload.partner} in ${payload.roomId}${title}`,
      );
    });
    socketB.on("match_found", (payload: MatchEvent) => {
      const title = payload.question?.title
        ? ` | ${payload.question.title}`
        : "";
      addLog(
        setUserB,
        `Matched with ${payload.partner} in ${payload.roomId}${title}`,
      );
    });

    socketA.on("match_timeout", (payload: { message?: string }) => {
      addLog(setUserA, payload.message ?? "Match timeout");
    });
    socketB.on("match_timeout", (payload: { message?: string }) => {
      addLog(setUserB, payload.message ?? "Match timeout");
    });

    socketA.on("error", (payload: { message?: string }) => {
      addLog(setUserA, `Error: ${payload.message ?? "Unknown error"}`);
    });
    socketB.on("error", (payload: { message?: string }) => {
      addLog(setUserB, `Error: ${payload.message ?? "Unknown error"}`);
    });

    return () => {
      socketA.disconnect();
      socketB.disconnect();
    };
  }, [serviceUrl]);

  async function refreshStatus() {
    try {
      const res = await fetch(`${serviceUrl}/status`);
      const data = (await res.json()) as { status?: Record<string, number> };
      setStatus(data.status ?? {});
    } catch {
      // Keep previous status if fetch fails.
    }
  }

  function joinQueue(user: UserState, socketRef: RefObject<Socket | null>) {
    if (!socketRef.current) return;
    socketRef.current.emit("join_queue", {
      userId: user.userId,
      category: user.category,
      difficulty: user.difficulty,
    });
    refreshStatus();
  }

  function leaveQueue(userId: string, socketRef: RefObject<Socket | null>) {
    if (!socketRef.current) return;
    socketRef.current.emit("leave_queue", { userId });
    refreshStatus();
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">Matching Service Simulation</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Two sockets are created in this page to simulate two users picking
            topic and difficulty.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Service URL: {serviceUrl}
          </p>
          {/* <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={refreshStatus}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white"
            >
              Refresh Queue Status
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => {
                joinQueue(userA, socketARef);
                joinQueue(userB, socketBRef);
              }}
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
            >
              Join Both
            </button>
            <button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={() => {
                leaveQueue(userA.userId, socketARef);
                leaveQueue(userB.userId, socketBRef);
              }}
              className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white"
            >
              Leave Both
            </button> 
          </div> */}
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Queue Status</h2>
          {queueKeys.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No queue data yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {queueKeys.map((key) => (
                <li
                  key={key}
                  className="flex justify-between border-b border-zinc-100 py-1"
                >
                  <span>{key}</span>
                  <span className="font-semibold">{status[key]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">User A</h2>
            <div className="mt-3 grid gap-3">
              <label className="text-sm font-medium">
                User ID
                <input
                  value={userA.userId}
                  onChange={(e) =>
                    setUserA((prev) => ({ ...prev, userId: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium">
                Topic
                <select
                  value={userA.category}
                  onChange={(e) =>
                    setUserA((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Difficulty
                <select
                  value={userA.difficulty}
                  onChange={(e) =>
                    setUserA((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  style={{ cursor: "pointer" }}
                  onClick={() => joinQueue(userA, socketARef)}
                  className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Join Queue
                </button>
                <button
                  type="button"
                  style={{ cursor: "pointer" }}
                  onClick={() => leaveQueue(userA.userId, socketARef)}
                  className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Leave Queue
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-zinc-100 p-3 text-xs">
              <p className="mb-2 font-semibold">Event Log</p>
              <button
                type="button"
                style={{ cursor: "pointer" }}
                onClick={() => clearLog(setUserA)}
                className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white"
              >
                Clear Log
              </button>
              {userA.log.length === 0 ? (
                <p className="text-zinc-500">No events yet.</p>
              ) : (
                <ul className="space-y-1">
                  {userA.log.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>

          <article className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">User B</h2>
            <div className="mt-3 grid gap-3">
              <label className="text-sm font-medium">
                User ID
                <input
                  value={userB.userId}
                  onChange={(e) =>
                    setUserB((prev) => ({ ...prev, userId: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium">
                Topic
                <select
                  value={userB.category}
                  onChange={(e) =>
                    setUserB((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Difficulty
                <select
                  value={userB.difficulty}
                  onChange={(e) =>
                    setUserB((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2"
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  style={{ cursor: "pointer" }}
                  onClick={() => joinQueue(userB, socketBRef)}
                  className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
                >
                  Join Queue
                </button>
                <button
                  type="button"
                  style={{ cursor: "pointer" }}
                  onClick={() => leaveQueue(userB.userId, socketBRef)}
                  className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white"
                >
                  Leave Queue
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-zinc-100 p-3 text-xs">
              <p className="mb-2 font-semibold">Event Log</p>
              <button
                type="button"
                style={{ cursor: "pointer" }}
                onClick={() => clearLog(setUserB)}
                className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white"
              >
                Clear Log
              </button>
              {userB.log.length === 0 ? (
                <p className="text-zinc-500">No events yet.</p>
              ) : (
                <ul className="space-y-1">
                  {userB.log.map((item, idx) => (
                    <li key={`${item}-${idx}`}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
