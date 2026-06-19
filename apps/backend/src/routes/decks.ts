import { Router } from 'express';
import { eq, asc, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { decks, slides } from '../db/schema';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';


export const decksRouter = Router();

// --- NEW ROUTE: Fetch user's deck history ---
decksRouter.get('/', ClerkExpressWithAuth(), async (req: any, res: any) => {
  
  // 1. THE PROBE: Print exactly what the backend sees when a request arrives
  console.log("================ AUTH DEBUG ================");
  console.log("1. Secret Key Loaded?  :", !!process.env.CLERK_SECRET_KEY);
  console.log("2. Publishable Key?    :", !!process.env.CLERK_PUBLISHABLE_KEY);
  console.log("3. Auth Header Sent?   :", !!req.headers.authorization);
  console.log("4. Parsed Clerk Object :", req.auth);
  console.log("============================================");

  const userId = req.auth?.userId; 

  if (!userId) {
    // If it fails, check the terminal!
    return res.status(401).json({ error: 'Unauthorized - Check backend terminal for the debug log' });
  }

  try {
    const userDecks = await db
      .select({
        id: decks.id,
        title: decks.title,
        status: decks.status,
        createdAt: decks.createdAt,
      })
      .from(decks)
      .where(eq((decks as any).userId, userId)) 
      .orderBy(desc(decks.createdAt)); 

    res.json({ decks: userDecks });
  } catch (error) {
    console.error("Failed to fetch history:", error);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

// --- EXISTING ROUTE: Get single deck ---
decksRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
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
  } catch (error) {
    console.error('Error fetching single deck:', error);
    res.status(500).json({ error: 'Internal server error while fetching deck' });
  }
});

decksRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  
  const body = z
    .object({ title: z.string().optional(), theme: z.string().optional() })
    .safeParse(req.body);

  if (!body.success) {
   
    res.status(400).json({ error: body.error.flatten() });
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

decksRouter.delete('/:id', ClerkExpressWithAuth(), async (req: any, res: any) => {
  const userId = req.auth?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [deck] = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
    
    if (!deck || deck.userId !== userId) {
      return res.status(404).json({ error: 'Deck not found or unauthorized' });
    }

    await db.delete(slides).where(eq(slides.deckId, id));

    await db.delete(decks).where(eq(decks.id, id));

    res.json({ success: true, message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    res.status(500).json({ error: 'Internal server error while deleting deck' });
  }
});