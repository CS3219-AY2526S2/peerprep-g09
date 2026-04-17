"use client";

import { useState } from "react";
import { io } from "socket.io-client";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface TileModalProps {
  topic: string;
  difficulties: string[];
}

export function TileModal({ topic, difficulties }: TileModalProps) {
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  let socket: ReturnType<typeof io> | null = null;

  const handleContinue = async () => {
    if (!difficulty) {
      setError("Please select a difficulty level");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uid = localStorage.getItem("uid");
      console.log(`[${topic}/${difficulty}] Creating socket connection for user ${uid}`);
      socket = io("http://localhost:5001", {
        path: "/socket.io",
        transports: ["websocket"],  // WebSocket only - polling doesn't work through gateway proxy
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log(`[${topic}/${difficulty}] Socket connected, emitting join_queue`);
        socket!.emit("join_queue", {
          userId: uid,
          category: topic,
          difficulty,
        });
      });

      socket.on("queue_joined", (data) => {
        console.log(`[${topic}/${difficulty}] Queue joined:`, data);
        setSuccess(`Joined queue for ${topic} - ${difficulty}`);
        console.log(data);
      });

      socket.on("match_found", (data) => {
        console.log(`[${topic}/${difficulty}] MATCH FOUND:`, data);
        setSuccess("Match found! Redirecting...");
        console.log("Match found:", data);
        // Redirect to collaboration page
        setTimeout(() => {
          window.location.href = `/collaboration?room=${data.roomId}`;
        }, 1500);
      });

      socket.on("match_timeout", () => {
        console.log(`[${topic}/${difficulty}] Timeout`);
        setError("Matchmaking timed out. Please try again.");
        socket!.disconnect();
        setLoading(false);
      });

      socket.on("error", (data) => {
        console.log(`[${topic}/${difficulty}] Socket error:`, data);
        setError(data.message || "An error occurred");
        socket!.disconnect();
        setLoading(false);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (socket && socket.connected) {
          socket!.disconnect();
        }
      }, 30000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to join queue"
      );
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading && socket && socket.connected) {
      socket!.disconnect();
      setLoading(false);
    }
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="shadow-lg hover:shadow-2xl hover:bg-tile-dark bg-tile flex h-20 w-40 items-center justify-center rounded-xl border p-3 transition duration-200 ease-out hover:scale-105 hover:cursor-pointer">
          <p className="text-center">{topic}</p>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            Select Difficulty for <span className="text-main-beige">{topic}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Find a peer to practice this topic with at your chosen difficulty level.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Difficulty
            </label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Choose difficulty level" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="bg-main-beige hover:bg-main-beige-dark"
          >
            {loading ? "Matching..." : "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
