import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DeckSchema } from '@presentai/types'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PresentAI Backend API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`Internal packages linked. Deck schema initialized: ${!!DeckSchema}`);
});