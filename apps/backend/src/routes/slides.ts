import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { slides } from '../db/schema';


export const slidesRouter = Router();

slidesRouter.patch('/:slideId', async (req, res) => {
  const { slideId } = req.params;

  const body = z
    .object({
      layoutId: z.string().optional(),
      slotData: z.record(z.string(), z.union([z.string(), z.array(z.string())])).optional(),
      position: z.number().int().optional(),
    })
    .safeParse(req.body);

  if (!body.success) {
    res.status(400).json({ error: z.treeifyError(body.error) });
    return;
  }

  const [slide] = await db.select().from(slides).where(eq(slides.id, slideId)).limit(1);

  if (!slide) {
    res.status(404).json({ error: 'Slide not found' });
    return;
  }

  const updates: Partial<typeof slides.$inferInsert> = { updatedAt: new Date() };
  if (body.data.layoutId) updates.layoutId = body.data.layoutId;
  if (body.data.slotData) updates.slotData = body.data.slotData;
  if (body.data.position !== undefined) updates.position = body.data.position;

  const [updated] = await db
    .update(slides)
    .set(updates)
    .where(eq(slides.id, slideId))
    .returning();

  res.json(updated);
});