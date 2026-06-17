import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const aiService = {
  generateDeck: async (topic: string, slideCount: number = 5, tone: string = 'professional', token?: string | null) => {
    
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const { data } = await api.post('/generate', { topic, slideCount, tone }, { headers });
    return data;
  },
  checkStatus: async (jobId: string) => {
    const { data } = await api.get(`/generate/${jobId}/status`);
    return data;
  }
};

export const deckService = {
  getDeck: async (deckId: string) => {
    const { data } = await api.get(`/decks/${deckId}`);
    return data;
  }
};