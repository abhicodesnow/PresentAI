import { MockAIProvider } from './mock';
import { AIProvider } from './types';

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'mock';
  
  if (provider === 'mock') {
    console.log('🤖 Using Mock AI Provider');
    return new MockAIProvider();
  }
  
  console.warn(`Unknown AI_PROVIDER: ${provider} - falling back to mock`);
  return new MockAIProvider();
}