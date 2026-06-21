'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { deckService } from '@/lib/api-client';
import { Loader2, ArrowLeft, Eye, Play } from 'lucide-react';

const safeRender = (data: any, fallback: string): string => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  
  try {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null) {
           return Object.values(item).filter(v => typeof v === 'string').join(' ');
        }
        return String(item);
      }).filter(Boolean).join('\n\n') || fallback;
    }
    
    if (typeof data === 'object') {
      const vals = Object.values(data).filter(v => typeof v === 'string').join(' ');
      return vals.trim() ? vals : JSON.stringify(data); 
    }
  } catch (e) {
    return fallback;
  }
  
  return String(data);
};

export default function PresentationView() {
  const params = useParams();
  const deckId = params.deckId as string;
  
  const [deck, setDeck] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deckId) return;

    deckService.getDeck(deckId)
      .then((data) => {
        const extractedDeck = data?.deck || data;
        setDeck(extractedDeck);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load deck:', err);
        setError('Could not find this presentation.');
        setLoading(false);
      });
  }, [deckId]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center text-foreground/40 py-32">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-full flex flex-col gap-4 items-center justify-center text-red-500 py-32">
        <p>{error || 'Presentation not found'}</p>
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 mt-4 text-sm font-medium text-foreground bg-foreground/10 rounded-full hover:bg-foreground/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <main className="relative min-h-full bg-background text-foreground p-8 md:p-16">
      
      {/* FLOATING BACK BUTTON */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/60 bg-foreground/5 rounded-full hover:text-foreground hover:bg-foreground/10 transition-colors z-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="max-w-4xl mx-auto space-y-12 mt-12 md:mt-8">
        
        {/* RESPONSIVE HEADER WITH QUICK ACTIONS */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b-2 border-foreground/10 mb-12">
          
          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-4 text-balance break-words leading-tight">
              {safeRender(deck?.title, 'Untitled Presentation')}
            </h1>
            <p className="text-foreground/40 font-medium">
              Generated AI Deck • {deck?.slides?.length || 0} Slides
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 sm:pt-2">
            <Link
              href={`/preview/${deckId}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground/80 hover:text-foreground transition-colors font-medium text-sm border border-foreground/5"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Link>
            
            <Link
              href={`/preview/${deckId}?fullscreen=true`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background hover:scale-105 active:scale-95 transition-all font-medium text-sm shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              Present
            </Link>
          </div>
          
        </header>

        {/* SLIDES CONTENT */}
        <div className="space-y-16">
          {deck?.slides?.map((slide: any, index: number) => {
            const slideContent = slide?.slots || slide?.slotData;

            return (
              <section 
                key={slide?.id || index} 
                className="p-8 md:p-12 border border-foreground/10 rounded-3xl hover:border-foreground/30 transition-colors shadow-sm"
              >
                <div className="text-sm font-bold tracking-widest text-foreground/30 uppercase mb-8">
                  Slide {index + 1}
                </div>
                
                <h2 className="text-3xl font-medium tracking-tight mb-6">
                  {safeRender(slideContent?.title, 'No Title Generated')}
                </h2>
                
                {slideContent?.subtitle && (
                  <h3 className="text-xl text-foreground/60 mb-6 font-medium">
                    {safeRender(slideContent?.subtitle, '')}
                  </h3>
                )}
                
                <p className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {safeRender(slideContent?.body, 'No content available for this slide.')}
                </p>
              </section>
            );
          })}
        </div>

      </div>
    </main>
  );
}
