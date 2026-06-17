import { Router, type IRouter } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { decks, generationJobs } from '../db/schema';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import { runGenerationPipeline } from '../services/generation'; 
interface GenerationOptions {
  slideCount?: number;
  tone?: string;
  theme?: string;
}


export const generateRouter: IRouter = Router();

const generateSchema = z.object({
  topic: z.string().min(3).max(500),
  slideCount: z.number().int().min(3).max(15).optional(),
  tone: z.enum(['professional', 'casual', 'bold']).optional(),
  theme: z.string().optional(),
});

// Notice we removed rateLimitGenerations from the middle here
generateRouter.post('/', ClerkExpressWithAuth(), async (req: any, res: any) => {
  const parsed = generateSchema.safeParse(req.body);
  
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { topic, slideCount, tone, theme } = parsed.data;
  const options: GenerationOptions = {};
  if (slideCount !== undefined) options.slideCount = slideCount;
  if (tone !== undefined) options.tone = tone;
  if (theme !== undefined) options.theme = theme;


  const userId = req.auth?.userId || null;

  try {
    const [deck] = await db
      .insert(decks)
      .values({
        userId, 
        title: topic,
        theme: theme ?? 'default',
        status: 'generating',
      })
      .returning();

    if (!deck) {
      return res.status(500).json({ error: 'Failed to create deck' });
    }

    const [job] = await db
      .insert(generationJobs)
      .values({
        deckId: deck.id,
        prompt: topic,
        options,
        status: 'pending',
      })
      .returning();

    if (!job) {
      return res.status(500).json({ error: 'Failed to create generation job' });
    }

    runGenerationPipeline(job.id, deck.id, topic, options).catch(console.error);

    res.status(202).json({
      deckId: deck.id,
      jobId: job.id,
      wsUrl: `/ws/generate/${job.id}`,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

generateRouter.get('/:jobId/status', async (req: any, res: any) => {
  const { jobId } = req.params;
  
  try {
    const [job] = await db
      .select()
      .from(generationJobs)
      .where(eq(generationJobs.id, jobId))
      .limit(1);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: job.id,
      deckId: job.deckId,
      status: job.status,
      error: job.error,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});