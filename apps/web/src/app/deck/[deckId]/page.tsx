'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { deckService } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';


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
      <div className="min-h-screen flex items-center justify-center text-foreground/40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || 'Presentation not found'}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-8 md:p-16">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <header className="border-b-2 border-foreground/10 pb-8 mb-12">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-4">
            {safeRender(deck?.title, 'Untitled Presentation')}
          </h1>
          <p className="text-foreground/40 font-medium">
            Generated AI Deck • {deck?.slides?.length || 0} Slides
          </p>
        </header>

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
                
                {/* Wrapped every text injection in our safeRender function */}
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