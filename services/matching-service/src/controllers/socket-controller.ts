import axios from "axios";
import redis from "../services/redisService.js";

const userSockets = new Map<string, string>();

export const handleJoinQueue = async (io: any, socket: any, data: any) => {
  const { userId, category, difficulty } = data;
  const queueKey = `queue:${category}:${difficulty}`;

  // store the user's socket mapping
  userSockets.set(userId, socket.id);

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

export const handleDisconnect = async (socket: any) => {
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
  } catch (err) {
    return { title: "Generic Coding Question", id: "default" };
  }
};
