import { MockAIProvider } from './mock';
import { NvidiaNimProvider, OllamaProvider } from './nvidia';
import { AIProvider } from './types';

export function getAIProvider(): AIProvider {
  const name = process.env.AI_PROVIDER || 'mock';

  switch (name) {
    case 'nvidia':
      console.log('🤖 Loaded NVIDIA NIM Provider');
      return new NvidiaNimProvider();
    case 'ollama':
      console.log('🦙 Loaded Local Ollama Provider');
      return new OllamaProvider();
    case 'mock':
      console.log('🧪 Loaded Mock AI Provider');
      return new MockAIProvider();
    default:
      console.warn(`Unknown AI_PROVIDER: ${name} - falling back to mock`);
      return new MockAIProvider();
  }
}