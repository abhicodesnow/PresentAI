import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { decksRouter } from './routes/decks';
import { slidesRouter } from './routes/slides';
import { generateRouter } from './routes/generate';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/decks', decksRouter); 
app.use('/api/generate', generateRouter);
app.use('/api/slides', slidesRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PresentAI Backend API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});