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

interface CreateModalProps {
  title: string;
  categories: string[];
  difficulties: string[];
}

export function CreateModal({ title, categories, difficulties }: CreateModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  let socket: ReturnType<typeof io> | null = null;

  const handleContinue = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      setError("Please select both topic and difficulty level");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const uid = localStorage.getItem("uid");
      socket = io("http://localhost:5001", {
        path: "/socket.io",
        transports: ["websocket"],  // WebSocket only - polling doesn't work through gateway proxy
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        socket!.emit("join_queue", {
          userId: uid,
          category: selectedTopic,
          difficulty: selectedDifficulty,
        });
      });

      socket.on("queue_joined", (data) => {
        setSuccess(`Joined queue for ${selectedTopic} - ${selectedDifficulty}`);
        console.log(data);
      });

      socket.on("match_found", (data) => {
        setSuccess("Match found! Redirecting...");
        console.log("Match found:", data);
        setTimeout(() => {
          window.location.href = `/collaboration?room=${data.roomId}`;
        }, 1500);
      });

      socket.on("match_timeout", () => {
        setError("Matchmaking timed out. Please try again.");
        socket!.disconnect();
        setLoading(false);
      });

      socket.on("error", (data) => {
        setError(data.message || "An error occurred");
        socket!.disconnect();
        setLoading(false);
      });

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
        <div className="shadow-lg hover:shadow-2xl flex h-20 w-96 items-center justify-center rounded-xl border bg-[#A88585] transition duration-200 ease-out hover:scale-105 hover:cursor-pointer">
          <p>{title}</p>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            Select a topic and difficulty level to start a custom prep session
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
              Select Topic
            </label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Difficulty
            </label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
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
