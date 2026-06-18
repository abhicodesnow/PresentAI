'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { aiService } from '../lib/api-client';
import { useAuth, useClerk } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { getToken, isSignedIn } = useAuth();
  const clerk = useClerk();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    const isGuestMode = localStorage.getItem('presentai_guest') === 'true';

    if (!isSignedIn && !isGuestMode) {
      clerk.redirectToSignIn();
      return; 
    }

    setIsGenerating(true);
    
    try {
      const token = await getToken();
      const response = await aiService.generateDeck(topic, 5, 'professional', token);
      
      if (isGuestMode) {
        const newDeck = { 
          id: response.deckId, 
          jobId: response.jobId,
          title: topic, 
          createdAt: new Date().toISOString() 
        };
        const currentHistory = JSON.parse(localStorage.getItem('presentai_guest_history') || '[]');
        localStorage.setItem('presentai_guest_history', JSON.stringify([newDeck, ...currentHistory]));
      }

      router.push(`/generate/${response.jobId}?deck=${response.deckId}`);
    } catch (error) {
      console.error('Generation Failed:', error);
      setIsGenerating(false);
      alert('Failed to connect to the AI.');
    }
  };

  return (
    // min-h-full ensures it perfectly fills the space left by the global header
    <div className="flex flex-col items-center justify-center min-h-full p-6 sm:p-12 md:p-24">
      <div className="w-full max-w-3xl space-y-12 pb-20">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tighter leading-[0.9] text-balance">
          Ideas that <br />
          <span className="text-foreground/40">speak for themselves.</span>
        </h1>

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
            {isGenerating ? <Sparkles className="w-5 h-5 animate-pulse" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}