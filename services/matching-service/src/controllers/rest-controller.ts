import type { Request, Response } from "express";
import axios from "axios";
import redis from "../services/redisService.js";

const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL || "http://localhost:8081";
export const PREDEFINED_TOPICS = new Set<string>();
export const PREDEFINED_DIFFICULTIES = new Set<string>();

export const initializeMetadata = async () => {
  try {
    console.log("Fetching topics and difficulties from Question Service...");

    const response = await axios.get(
      `${QUESTION_SERVICE_URL}/api/questions/metadata`,
    );
    const { topics, difficulties } = response.data;

    PREDEFINED_TOPICS.clear();
    topics.forEach((t: string) => PREDEFINED_TOPICS.add(t));

    PREDEFINED_DIFFICULTIES.clear();
    difficulties.forEach((d: string) => PREDEFINED_DIFFICULTIES.add(d));

    console.log(
      `Initialized ${PREDEFINED_TOPICS.size} topics and ${PREDEFINED_DIFFICULTIES.size} difficulties.`,
    );
  } catch (error) {
    console.error("Failed to initialize matching metadata:", error);
    // Optional: Set some hardcoded defaults so the service doesn't break entirely
    ["Easy", "Medium", "Hard"].forEach((d) => PREDEFINED_DIFFICULTIES.add(d));
  }
};

export async function getQueueStatus(req: Request, res: Response) {
  console.log(`Getting queue status.`);
  const keys = await redis.keys(`queue:*`);
  const status: Record<string, number> = {};
  for (const key of keys) {
    const count = await redis.llen(key);
    status[key.replace("queue:", "")] = count;
  }
  res.json({ message: `Queue status retrieved.`, status });
}

export async function getCategories(req: Request, res: Response) {
  console.log(`Getting categories.`);
  res.json({ message: `Categories retrieved.` });
}
