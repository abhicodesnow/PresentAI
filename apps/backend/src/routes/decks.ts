import { Router } from 'express';
import { eq, asc, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { decks, slides } from '../db/schema';

export const decksRouter = Router();


decksRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const [deck] = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
  
  if (!deck) {
    res.status(404).json({ error: 'Deck not found' });
    return;
  }

  const deckSlides = await db
    .select()
    .from(slides)
    .where(eq(slides.deckId, id))
    .orderBy(asc(slides.position));

  res.json({
    id: deck.id,
    title: deck.title,
    theme: deck.theme,
    status: deck.status,
    slides: deckSlides,
  });
});


decksRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  
  const body = z
    .object({ title: z.string().optional(), theme: z.string().optional() })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: z.treeifyError(body.error) });
    return;
  }

  const updates: { updatedAt: Date; title?: string; theme?: string } = { updatedAt: new Date() };
  if (body.data.title !== undefined) updates.title = body.data.title;
  if (body.data.theme !== undefined) updates.theme = body.data.theme;

  const [updated] = await db
    .update(decks)
    .set(updates)
    .where(eq(decks.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: 'Deck not found' });
    return;
  }

  res.json(updated);
});