import { db } from '../db';
import { decks, generationJobs, slides } from '../db/schema';
import { eq } from 'drizzle-orm';
import { getAIProvider } from './ai/registry';

export async function runGenerationPipeline(
  jobId: string,
  deckId: string,
  topic: string,
  options: any
) {
  console.log(`🚀 Starting AI pipeline for topic: "${topic}"`);

  try {

    const ai = getAIProvider();

    const deckData = await ai.generateFullDeck(
      topic,
      options.slideCount || 5,
      options.tone || 'professional'
    );

    console.log(`🧠 AI generated ${deckData.slides.length} slides. Saving to database...`);

    for (let i = 0; i < deckData.slides.length; i++) {
      const slide = deckData.slides[i];
      await db.insert(slides).values({
        deckId: deckId,
        layoutId: slide.layoutId,
        position: i,
        slotData: slide.slots,
      });
    }


    await db.update(generationJobs)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(generationJobs.id, jobId));

    await db.update(decks)
      .set({ status: 'ready', title: deckData.title, updatedAt: new Date() })
      .where(eq(decks.id, deckId));

    console.log(`✅ Generation fully complete for deck: ${deckId}`);

  } catch (error: any) {
    console.error(`❌ Generation pipeline failed:`, error);
    

    await db.update(generationJobs)
      .set({ status: 'failed', error: error.message, completedAt: new Date() })
      .where(eq(generationJobs.id, jobId));

    await db.update(decks)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(decks.id, deckId));
  }
}