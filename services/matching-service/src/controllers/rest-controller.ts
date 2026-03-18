import type { Request, Response } from "express";

export async function getQueueStatus(req: Request, res: Response) {
  console.log(`Getting queue status.`);
  res.json({ message: `Queue status retrieved.` });
}

export async function getCategories(req: Request, res: Response) {
  console.log(`Getting categories.`);
  res.json({ message: `Categories retrieved.` });
}
