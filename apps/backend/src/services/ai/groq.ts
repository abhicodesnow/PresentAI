import Groq from "groq-sdk";
import { AIProvider, FullDeckGeneration } from "./types"; 

export class GroqProvider implements AIProvider {
  private groq: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not defined in your environment variables!");
    }
    this.groq = new Groq({ apiKey });
  }

  async generateFullDeck(
    topic: string, 
    slideCount: number, 
    tone: string, 
    availableLayouts?: any[]
  ): Promise<FullDeckGeneration> {
    try {
      const systemPrompt = `You are an expert presentation generator. You MUST output ONLY valid JSON. 
      
      You must strictly follow this exact schema structure:
      {
        "title": "Main Presentation Title",
        "slides": [
          {
            "layoutId": "title-hero",
            "brief": "Purpose of the slide",
            "slots": {
              "title": "Slide Headline",
              "body": "Detailed slide content goes here"
            }
          }
        ]
      }

      Strict Rules:
      1. Generate exactly ${slideCount} slides.
      2. "layoutId" MUST be exactly one of: "title-hero", "bullet-list", "two-column", "quote-full", "closing-cta".
      3. Tone: ${tone}.
      4. Fill all "slots" with highly relevant text based on the user's topic.
      5. CRITICAL: Never use double quotes (") inside the text values. Use single quotes (') instead.`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Topic: ${topic}` },
        ],
        // 🚀 UPGRADED MODEL: 70B is much smarter and writes flawless JSON
        model: "llama-3.3-70b-versatile", 
        temperature: 0.7,
        // 🛡️ JSON MODE ON: The 70B model won't fail the Groq bouncer check
        response_format: { type: "json_object" }, 
      });

      let rawContent = chatCompletion.choices[0]?.message?.content || "{}";

      // Failsafe extraction
      const firstBrace = rawContent.indexOf('{');
      const lastBrace = rawContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        rawContent = rawContent.substring(firstBrace, lastBrace + 1);
      }

      const parsedDeck = JSON.parse(rawContent) as FullDeckGeneration;
      
      if (!parsedDeck.title || !Array.isArray(parsedDeck.slides)) {
        throw new Error('Missing "title" or "slides" array in JSON response');
      }

      return parsedDeck;

    } catch (error: any) {
      throw new Error(`Pipeline Error: ${error.message || "Unknown Groq failure"}`);
    }
  }
}
