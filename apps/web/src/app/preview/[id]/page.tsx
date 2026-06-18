'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { aiService } from '../../../lib/api-client'; 

export default function PreviewPage() {
  const params = useParams();
  const deckId = params.id as string;
  
  const [deck, setDeck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const data = await aiService.getDeck(deckId);
        setDeck(data);
      } catch (err) {
        setError('Could not find this presentation. It may have been deleted or the link is invalid.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (deckId) {
      fetchDeck();
    }
  }, [deckId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground/50">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium tracking-tight">Loading presentation...</p>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center gap-6">
        <div className="text-red-500 font-medium">{error}</div>
        <Link 
          href="/" 
          className="px-6 py-2 bg-foreground text-background rounded-full text-sm font-medium hover:scale-105 transition-transform"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-4 sm:p-8">
      
      {/* The Floating Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/60 bg-background/80 backdrop-blur-md rounded-full border border-foreground/10 hover:text-foreground hover:bg-foreground/5 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* The Presentation Canvas */}
      <div className="w-full max-w-5xl aspect-video bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-8 sm:p-16 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
        
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-foreground/5 rounded-full blur-[100px] opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
            {deck.title}
          </h1>
          <p className="text-lg text-foreground/50 font-medium capitalize">
            Theme: {deck.theme}
          </p>
        </div>

        {/* Slide Counter Footer */}
        <div className="absolute bottom-6 right-8 text-sm font-medium text-foreground/40 flex items-center gap-2">
          <span>{deck.slides?.length || 0} Slides Generated</span>
        </div>
      </div>

    </div>
  );
}