import { z } from 'zod';

export const SlotDataSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())])
);

export const SlideSchema = z.object({
  id: z.uuid().optional(),
  deckId: z.uuid(),
  layoutId: z.string(), 
  position: z.number().int().nonnegative(),
  slotData: SlotDataSchema.default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Slide = z.infer<typeof SlideSchema>;
export type SlotData = z.infer<typeof SlotDataSchema>;