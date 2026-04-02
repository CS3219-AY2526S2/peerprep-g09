import axios from "axios";
import redis from "../services/redisService.js";
import { Server, Socket } from "socket.io";
import {
  PREDEFINED_TOPICS,
  PREDEFINED_DIFFICULTIES,
} from "./rest-controller.js";

const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL || "http://localhost:8081";
const userSockets = new Map<string, string>();

interface MatchRequestData {
  userId: string;
  category: string;
  difficulty: string;
}

export const handleJoinQueue = async (
  io: Server,
  socket: Socket,
  data: MatchRequestData,
) => {
  const { userId, category, difficulty } = data;

  if (!userId) {
    console.log(`Invalid join_queue request: Missing userId.`);
    socket.emit("error", { message: "userId is required." });
    return;
  }
  if (userSockets.has(userId)) {
    socket.emit("error", { message: "Already in matchmaking queue." });
    return;
  }
  if (!category || !difficulty) {
    console.log(
      `Invalid join_queue request from ${userId}: Missing category or difficulty.`,
    );
    socket.emit("error", { message: "Category and difficulty are required." });
    return;
  }
  if (
    !PREDEFINED_TOPICS.has(category) ||
    !PREDEFINED_DIFFICULTIES.has(difficulty)
  ) {
    socket.emit("error", { message: "Invalid category or difficulty." });
    return;
  }

  socket.emit("queue_joined", {
    message: `${userId} joined matchmaking queue.`,
  });

  // store the user's socket mapping
  userSockets.set(userId, socket.id);

  const queueKey = `queue:${category}:${difficulty}`;
  const partnerId = await redis.lpop(queueKey);

  if (partnerId && partnerId !== userId) {
    // change the id so that it is easier to test if 2 people are even allowed to enter the same room
    const sortedIds = [userId, partnerId].sort();
    const roomId = `room-${Date.now()}-${sortedIds[0]}-${sortedIds[1]}`;

    const partnerSocketId = userSockets.get(partnerId);

    if (!partnerSocketId) {
      // If partner's socket is not found, put them back in the queue
      await redis.rpush(queueKey, partnerId);
      socket.emit("match_timeout", { message: "Matchmaking timed out." });
      return;
    }

    const question = await fetchQuestion(category, difficulty);

    // Notify both users
    io.to(socket.id).emit("match_found", {
      roomId,
      partner: partnerId,
      question,
    });
    io.to(partnerSocketId).emit("match_found", {
      roomId,
      partner: userId,
      question,
    });

    // remove both users from map
    userSockets.delete(userId);
    userSockets.delete(partnerId);

    console.log(
      `Matched ${userId} with ${partnerId}. Question: ${question.title}`,
    );
  } else {
    await redis.rpush(queueKey, userId);
    console.log(`${userId} added to ${queueKey}`);

    setTimeout(async () => {
      const wasRemoved = await redis.lrem(queueKey, 0, userId);
      if (wasRemoved) {
        socket.emit("match_timeout", { message: "Matchmaking timed out." });
        userSockets.delete(userId);
      }
    }, 30000);
  }
};

export const handleLeaveQueue = async (socket: Socket, userId: string) => {
  if (!userSockets.has(userId)) {
    socket.emit("error", { message: "Not currently in matchmaking queue." });
    return;
  }
  const keys = await redis.keys(`queue:*`);
  for (const key of keys) {
    await redis.lrem(key, 0, userId);
  }
  userSockets.delete(userId);
  socket.emit("queue_left", { message: `${userId} left matchmaking queue.` });
};

export const handleDisconnect = async (socket: Socket) => {
  for (const [userId, socketId] of userSockets.entries()) {
    if (socketId === socket.id) {
      userSockets.delete(userId);
      const keys = await redis.keys(`queue:*`);
      for (const key of keys) {
        await redis.lrem(key, 0, userId);
      }
      break;
    }
  }
};

const fetchQuestion = async (category: string, difficulty: string) => {
  try {
    const res = await axios.get(`${QUESTION_SERVICE_URL}/`, {
      params: { category, difficulty },
    });
    return res.data;
  } catch {
    return { title: "Generic Coding Question", id: "default" };
  }
};
