import { z } from 'zod';

export const DeckSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required"),
  theme: z.string().default("default"),
  status: z.enum(["pending", "generating", "ready", "failed"]).default("ready"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


export type Deck = z.infer<typeof DeckSchema>;