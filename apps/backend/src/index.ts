import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { decksRouter } from './routes/decks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/decks', decksRouter); 

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PresentAI Backend API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});