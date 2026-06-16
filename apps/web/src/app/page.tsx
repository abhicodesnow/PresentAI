'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { aiService } from '../lib/api-client';

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    
    try {
      // 1. Kick off the AI pipeline on your backend
      const response = await aiService.generateDeck(topic, 5, 'professional');
      
      // 2. Redirect the user to the live preview/loading screen
      router.push(`/generate/${response.jobId}?deck=${response.deckId}`);
    } catch (error) {
      console.error('Failed to start generation:', error);
      setIsGenerating(false);
      alert('Failed to connect to the AI. Please ensure your backend is running!');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 selection:bg-foreground selection:text-background">
      
      {/* Absolute minimal header */}
      <div className="absolute top-8 left-8 font-medium tracking-tight text-sm text-foreground/50">
        PresentAI
      </div>

      <div className="w-full max-w-3xl space-y-12">
        {/* Massive, opinionated typography */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tighter leading-[0.9] text-balance">
          Ideas that <br />
          <span className="text-foreground/40">speak for themselves.</span>
        </h1>

        {/* The single point of interaction */}
        <form onSubmit={handleGenerate} className="relative group">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isGenerating}
            placeholder="What are we presenting today?"
            className="w-full bg-transparent border-b-2 border-foreground/10 pb-4 text-xl sm:text-2xl outline-none placeholder:text-foreground/20 transition-all focus:border-foreground disabled:opacity-50"
            autoFocus
          />
          
          <button
            type="submit"
            disabled={!topic.trim() || isGenerating}
            className="absolute right-0 bottom-4 flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background opacity-0 translate-y-2 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all disabled:bg-foreground/20 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {isGenerating ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </form>

        <div className="flex gap-4 text-sm text-foreground/40 font-medium tracking-tight">
          <p>Press Enter to generate</p>
          <span className="text-foreground/20">•</span>
          <p>Powered by Llama 3.1</p>
        </div>
      </div>
    </main>
  );
}