'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { deckService } from '@/lib/api-client';
import { Loader2, ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Sparkles } from 'lucide-react';

const safeRender = (data: any, fallback: string): string => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  try {
    if (Array.isArray(data)) {
      return data.map(item => typeof item === 'string' ? item : Object.values(item).filter(v => typeof v === 'string').join(' ')).filter(Boolean).join('\n\n') || fallback;
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

export default function PresentationCarousel() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = params.deckId as string;
  
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLaunchOverlay, setShowLaunchOverlay] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    deckService.getDeck(deckId)
      .then((data) => {
        setDeck(data?.deck || data);
        setLoading(false);
        if (searchParams.get('fullscreen') === 'true') {
          setShowLaunchOverlay(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load deck:', err);
        setLoading(false);
      });
  }, [deckId, searchParams]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Failed to toggle full-screen mode:', err);
    }
  }, []);

  const startFullScreenPresentation = async () => {
    setShowLaunchOverlay(false);
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!deck?.slides) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      setCurrentSlide((prev) => Math.min(prev + 1, deck.slides.length - 1));
    } else if (e.key === 'ArrowLeft') {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      if (!document.fullscreenElement) {
        router.push(`/deck/${deckId}`);
      }
    }
  }, [deck, deckId, router]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setTouchStartX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (touchStartX === null || !deck?.slides) return;
    const touchEndX = e.clientX;
    const deltaX = touchStartX - touchEndX;
    const swipeThreshold = 50;

    if (deltaX > swipeThreshold) {
      setCurrentSlide((prev) => Math.min(prev + 1, deck.slides.length - 1));
    } else if (deltaX < -swipeThreshold) {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }
    setTouchStartX(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-white/40">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!deck || !deck.slides) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#050505] text-red-500 gap-4">
        <p>Could not load presentation for preview.</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-white/10 rounded-full text-white">Return Home</button>
      </div>
    );
  }

  const slides = deck.slides;

  return (
    <div className="h-screen w-screen bg-[#050505] text-white overflow-hidden flex flex-col relative selection:bg-white/20 font-sans">
      
      {/* --- NEW: SUTBLE BACKGROUND EFFECTS --- */}
      {/* 1. Subtle Grid Pattern that fades out at the edges */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)] pointer-events-none" />
      
      {/* 2. Top-Center Ambient Glow (Spotlight) */}
      <div className="absolute top-0 inset-x-0 flex justify-center z-0 pointer-events-none">
         <div className="w-[800px] h-[400px] bg-white/[0.04] blur-[100px] rounded-full translate-y-[-50%]" />
      </div>

      {/* Full Screen Launch Overlay */}
      {showLaunchOverlay && (
        <div 
          onClick={startFullScreenPresentation}
          className="fixed inset-0 z-[100] bg-[#050505]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 cursor-pointer group"
        >
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 bg-white/5 border border-white/10 text-white flex items-center justify-center rounded-2xl mx-auto group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Ready to Present?</h2>
              <p className="text-white/40 text-sm">Click anywhere on the screen to initiate absolute full screen presentation view mode.</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="text-white/50 font-medium tracking-tight truncate max-w-md pointer-events-auto drop-shadow-md">
          {safeRender(deck.title, 'Untitled Presentation')}
        </div>
        
        <div className="flex items-center gap-3 pointer-events-auto">
          <button 
            onClick={toggleFullscreen}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/5 backdrop-blur-md transition-all"
            title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              }
              router.push(`/deck/${deckId}`);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 border border-white/5 backdrop-blur-md transition-all"
            title="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Sliding Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 md:p-24 relative w-full h-full z-10">
        
        {/* --- NEW: FROSTED GLASS SLIDE CANVAS --- */}
        <div 
          className="relative w-full max-w-6xl aspect-video bg-gradient-to-br from-[#1a1a1c]/90 to-[#0e0e10]/90 border border-white/[0.08] backdrop-blur-2xl rounded-3xl shadow-[0_0_80px_-20px_rgba(255,255,255,0.05)] overflow-hidden flex select-none touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setTouchStartX(null)}
          onPointerLeave={() => setTouchStartX(null)}
        >
          <div 
            className="flex w-full h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide: any, index: number) => {
              const content = slide?.slots || slide?.slotData;
              return (
                <div key={slide.id || index} className="w-full h-full flex-shrink-0 flex flex-col justify-center p-12 md:p-24">
                  <div className="max-w-4xl relative z-10">
                    <div className="text-sm font-bold tracking-[0.2em] text-white/30 uppercase mb-6 flex items-center gap-4">
                      <span className="w-8 h-[1px] bg-white/20"></span>
                      Slide {index + 1}
                    </div>
                    <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 text-balance leading-[1.1] drop-shadow-sm">
                      {safeRender(content?.title, 'No Title Generated')}
                    </h2>
                    {content?.subtitle && (
                      <h3 className="text-2xl text-white/60 mb-8 font-medium">
                        {safeRender(content?.subtitle, '')}
                      </h3>
                    )}
                    <p className="text-xl md:text-2xl leading-relaxed text-white/70 whitespace-pre-wrap font-light">
                      {safeRender(content?.body, '')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Arrow Triggers */}
        <div className="absolute inset-y-0 left-4 md:left-12 flex items-center z-40 pointer-events-none">
          <button 
            onClick={() => setCurrentSlide(p => Math.max(p - 1, 0))}
            disabled={currentSlide === 0}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-white/15 disabled:opacity-0 transition-all backdrop-blur-md pointer-events-auto shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="absolute inset-y-0 right-4 md:right-12 flex items-center z-40 pointer-events-none">
          <button 
            onClick={() => setCurrentSlide(p => Math.min(p + 1, slides.length - 1))}
            disabled={currentSlide === slides.length - 1}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-white/15 disabled:opacity-0 transition-all backdrop-blur-md pointer-events-auto shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Footer Dots */}
      <div className="absolute bottom-8 w-full flex justify-center z-40 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
          {slides.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ease-out ${currentSlide === idx ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
