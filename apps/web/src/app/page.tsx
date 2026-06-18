'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, User } from 'lucide-react';
import { aiService } from '../lib/api-client';
import { useAuth, useClerk, UserButton } from '@clerk/nextjs';

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  
  const { getToken, isSignedIn } = useAuth();
  const clerk = useClerk();

  // Check if they previously chose to continue as a guest
  useEffect(() => {
    if (localStorage.getItem('presentai_guest') === 'true') {
      setIsGuest(true);
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    // INTERCEPT GUESTS HERE: Block them only if they aren't signed in AND aren't a guest
    if (!isSignedIn && !isGuest) {
      clerk.redirectToSignIn();
      return; 
    }

    setIsGenerating(true);
    
    try {
      // If guest, getToken returns null. Our API client already handles null tokens safely!
      const token = await getToken();
      const response = await aiService.generateDeck(topic, 5, 'professional', token);
      
      router.push(`/generate/${response.jobId}?deck=${response.deckId}`);
    } catch (error: any) {
      console.error('Backend Error Response:', error.response?.data || error);
      setIsGenerating(false);
      alert('Failed to connect to the AI. Please ensure your backend is running!');
    }
  };

  const handleExitGuestMode = () => {
    localStorage.removeItem('presentai_guest');
    setIsGuest(false);
    clerk.redirectToSignIn();
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 selection:bg-foreground selection:text-background">
      
      {/* Absolute minimal header with Dynamic Profile */}
      <div className="absolute top-8 left-8 flex items-center gap-6">
        <div className="font-medium tracking-tight text-sm text-foreground/50">
          PresentAI
        </div>
        
        {/* Dynamic Auth Header */}
        {isSignedIn ? (
          <UserButton />
        ) : isGuest ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/50">
              <User className="w-4 h-4" />
            </div>
            <button 
              onClick={handleExitGuestMode}
              className="text-xs font-medium text-foreground/40 hover:text-foreground transition-colors"
            >
              Log in to save decks
            </button>
          </div>
        ) : null}
      </div>

      <div className="w-full max-w-3xl space-y-12">
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