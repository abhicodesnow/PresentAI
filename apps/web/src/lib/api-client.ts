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
  },
  getHistory: async (token: string | null) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await api.get('/decks', { headers });
      return data.decks || [];
    } catch (error) {
      console.error('Error fetching history:', error);
      return [];
    }
  },
  getDeck: async (id: string) => {
    try {
      const { data } = await api.get(`/decks/${id}`);
      return data;
    } catch (error) {
      console.error('Error fetching deck:', error);
      throw error;
    }
  },
  deleteDeck: async (id: string, token: string | null) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await api.delete(`/decks/${id}`, { headers });
      return true;
    } catch (error) {
      console.error('Error deleting deck:', error);
      throw error;
    }
  },
};

export const deckService = {
  getDeck: async (deckId: string) => {
    const { data } = await api.get(`/decks/${deckId}`);
    return data;
  }
};