import OpenAI from 'openai';
import { AIProvider, FullDeckGeneration, SlotContent } from './types';

const TEXT_MODEL = process.env.NVIDIA_TEXT_MODEL || 'meta/llama-3.1-70b-instruct';


export class OllamaProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
      apiKey: 'ollama', 
    });
  }

  async generateFullDeck(
    topic: string,
    slideCount: number,
    tone: string
  ): Promise<FullDeckGeneration> {
    const model = process.env.OLLAMA_TEXT_MODEL || 'llama3.1';
    return callFullDeck(this.client, model, topic, slideCount, tone);
  }
}

export class NvidiaNimProvider implements AIProvider {
  private client: OpenAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY || '';
    if (!this.apiKey) throw new Error('NVIDIA_API_KEY is required for nvidia provider');
    
    this.client = new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: this.apiKey,
      timeout: 120_000,
    });
  }

  async generateFullDeck(
    topic: string,
    slideCount: number,
    tone: string
  ): Promise<FullDeckGeneration> {
    return callFullDeck(this.client, TEXT_MODEL, topic, slideCount, tone);
  }
}

async function callFullDeck(
  client: OpenAI,
  model: string,
  topic: string,
  slideCount: number,
  tone: string
): Promise<FullDeckGeneration> {
  
  const response = await client.chat.completions.create({
    model,
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Generate a complete presentation as JSON:
        {"title":"string","slides":[{"layoutId":"id","brief":"purpose","slots":{"slotId":"content"}}]}
        Rules:
        - Exactly ${slideCount} slides, cohesive narrative
        - layoutId must be one of: "title-hero", "bullet-list", "two-column", "quote-full", "closing-cta"
        - Tone: ${tone}
        - Fill all required slots with highly relevant text.`
      },
      {
        role: 'user',
        content: `Topic: ${topic}`
      }
    ],
  });

  const raw = response.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(raw) as FullDeckGeneration;

  if (!parsed.title || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error('AI returned invalid deck structure');
  }

  return parsed;
}