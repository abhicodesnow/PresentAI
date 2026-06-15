import { AIProvider, FullDeckGeneration } from './types';

export class MockAIProvider implements AIProvider {
  async generateFullDeck(
    topic: string,
    slideCount: number,
    tone: string
  ): Promise<FullDeckGeneration> {
    
    // Simulate the time it takes an LLM to think
    await new Promise((resolve) => setTimeout(resolve, 800));

    const slides = [];
    
    for (let i = 0; i < slideCount; i++) {
      slides.push({
        layoutId: 'title-hero', 
        brief: `Slide ${i + 1} about ${topic}`,
        title: i === 0 ? topic : `${topic} Part ${i + 1}`,
        slots: {
          title: i === 0 ? topic : `Key Point ${i + 1}`,
          subtitle: `A ${tone} perspective`,
          body: "This is a simulated AI response used for local testing to save API credits.",
        },
      });
    }

    return { title: topic, slides };
  }
}