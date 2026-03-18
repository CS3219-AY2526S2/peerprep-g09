export async function getQueueStatus(req: any, res: any) {
  console.log(`Getting queue status.`);
  res.json({ message: `Queue status retrieved.` });
}

export async function getCategories(req: any, res: any) {
  console.log(`Getting categories.`);
  res.json({ message: `Categories retrieved.` });
}
