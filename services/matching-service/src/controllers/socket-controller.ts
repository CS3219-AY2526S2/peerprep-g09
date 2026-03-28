import axios from "axios";
import redis from "../services/redisService.js";
import { Server, Socket } from "socket.io";
import {
  PREDEFINED_TOPICS,
  PREDEFINED_DIFFICULTIES,
} from "./rest-controller.js";

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
  console.log("Predefined topics:", Array.from(PREDEFINED_TOPICS));
  console.log("Predefined difficulties:", Array.from(PREDEFINED_DIFFICULTIES));
  if (
    !PREDEFINED_TOPICS.has(category) ||
    !PREDEFINED_DIFFICULTIES.has(difficulty)
  ) {
    socket.emit("error", { message: "Invalid category or difficulty." });
    return;
  }

  // store the user's socket mapping
  userSockets.set(userId, socket.id);

  const queueKey = `queue:${category}:${difficulty}`;
  const partnerId = await redis.lpop(queueKey);

  if (partnerId && partnerId !== userId) {
    const roomId = `room-${Date.now()}`; // Unique session ID
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

export const handleLeaveQueue = async (userId: string) => {
  const keys = await redis.keys(`queue:*`);
  for (const key of keys) {
    await redis.lrem(key, 0, userId);
  }
  userSockets.delete(userId);
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
    const res = await axios.get(
      `http://question-service:8080/questions/random`,
      {
        params: { category, difficulty },
      },
    );
    return res.data;
  } catch {
    return { title: "Generic Coding Question", id: "default" };
  }
};
