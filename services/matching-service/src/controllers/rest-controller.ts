import { type Request, type Response } from "express";
import axios from "axios";
import redis from "../services/redisService.js";

const QUESTION_SERVICE_URL =
  process.env.QUESTION_SERVICE_URL || "http://localhost:8081";
export const PREDEFINED_TOPICS = new Set<string>();
export const PREDEFINED_DIFFICULTIES = new Set<string>();
const METADATA_REQUEST_TIMEOUT_MS = Number(
  process.env.METADATA_REQUEST_TIMEOUT_MS || 5000,
);

export const initializeMetadata = async () => {
  console.log("Fetching topics and difficulties from Question Service...");

  const difficultyResponse = await axios.get(
    `${QUESTION_SERVICE_URL}/api/questions/metadata/difficulties`,
    { timeout: METADATA_REQUEST_TIMEOUT_MS },
  );
  const { difficulties } = difficultyResponse.data;

  const topicResponse = await axios.get(
    `${QUESTION_SERVICE_URL}/api/questions/metadata/topics`,
    { timeout: METADATA_REQUEST_TIMEOUT_MS },
  );
  const { topics } = topicResponse.data;

  if (!Array.isArray(difficulties) || !Array.isArray(topics)) {
    throw new Error("Question Service metadata response is invalid.");
  }

  PREDEFINED_DIFFICULTIES.clear();
  difficulties.forEach((d: string) => PREDEFINED_DIFFICULTIES.add(d));

  PREDEFINED_TOPICS.clear();
  topics.forEach((t: string) => PREDEFINED_TOPICS.add(t));

  console.log(
    `Initialized ${PREDEFINED_TOPICS.size} topics and ${PREDEFINED_DIFFICULTIES.size} difficulties.`,
  );
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
  res.json({
    message: `Categories retrieved.`,
    categories: Array.from(PREDEFINED_TOPICS),
  });
}

export async function getDifficulties(req: Request, res: Response) {
  console.log(`Getting difficulties.`);
  res.json({
    message: `Difficulties retrieved.`,
    difficulties: Array.from(PREDEFINED_DIFFICULTIES),
  });
}
