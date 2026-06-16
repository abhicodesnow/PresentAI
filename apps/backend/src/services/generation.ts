import { db } from '../db';
import { decks, generationJobs } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function runGenerationPipeline(
  jobId: string,
  deckId: string,
  topic: string,
  options: any
) {
  console.log(`🚀 Starting generation pipeline for topic: "${topic}"`);
  

  await db.update(generationJobs).set({ status: 'completed', completedAt: new Date() }).where(eq(generationJobs.id, jobId));
  await db.update(decks).set({ status: 'ready', updatedAt: new Date() }).where(eq(decks.id, deckId));
}