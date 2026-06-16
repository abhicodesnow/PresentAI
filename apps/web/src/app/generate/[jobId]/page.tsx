'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { aiService } from '@/lib/api-client';

export default function GenerationLoadingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const jobId = params.jobId as string;
  const deckId = searchParams.get('deck');

  const [statusText, setStatusText] = useState('Initializing AI...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !deckId) {
      setError('Missing job or deck information.');
      return;
    }

    // Poll the backend every 2 seconds to check the Redis queue status
    const interval = setInterval(async () => {
      try {
        const data = await aiService.checkStatus(jobId);
        
        if (data.status === 'completed') {
          clearInterval(interval);
          setStatusText('Slides ready. Redirecting...');
          // Redirect to the final presentation view!
          router.push(`/deck/${deckId}`);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setError(data.error || 'The AI pipeline encountered an error.');
        } else {
          // It's still pending/generating
          setStatusText('Crafting your narrative...');
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    }, 2000);

    // Cleanup the interval if the user leaves the page early
    return () => clearInterval(interval);
  }, [jobId, deckId, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-6">
        
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold tracking-tight">Generation Failed</h2>
            <p className="text-foreground/60">{error}</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-8 px-6 py-3 rounded-full bg-foreground text-background font-medium hover:scale-105 transition-transform"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <Loader2 className="w-12 h-12 animate-spin text-foreground/20 absolute" />
              <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight animate-pulse">
              {statusText}
            </h2>
            <p className="text-sm text-foreground/40 tracking-wide uppercase">
              Please don't close this window
            </p>
          </>
        )}

      </div>
    </main>
  );
}