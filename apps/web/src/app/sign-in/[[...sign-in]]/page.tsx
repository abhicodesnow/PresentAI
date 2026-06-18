'use client';

import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();

  const handleGuestLogin = () => {
    // Save a flag in the browser to remember they are a guest
    localStorage.setItem('presentai_guest', 'true');
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* LEFT COLUMN: The Interactive Login Area */}
      <div className="flex w-full flex-col items-center justify-center lg:w-1/2 px-4 sm:px-12">
        <div className="w-full max-w-[400px] mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back.</h2>
          <p className="text-sm text-foreground/60">Sign in to PresentAI to access your decks.</p>
        </div>

        <div className="w-full max-w-[400px]">
          <SignIn 
            appearance={{
              elements: {
                card: "shadow-none border border-foreground/10 bg-transparent w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                formButtonPrimary: "bg-foreground text-background hover:opacity-90 transition-opacity",
                socialButtonsBlockButton: "border-foreground/10 hover:bg-foreground/5 transition-colors",
                footerActionLink: "text-foreground font-semibold hover:text-foreground/80"
              }
            }}
          />
          
          {/* Seamless Guest Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-foreground/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-foreground/40">Or</span>
            </div>
          </div>

          {/* Continue as Guest Button */}
          <button 
            onClick={handleGuestLogin}
            className="w-full rounded-md border border-foreground/10 py-2.5 text-sm font-semibold text-foreground/80 hover:bg-foreground/5 hover:text-foreground transition-all active:scale-[0.98]"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: The Immersive Branding Area */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-foreground/[0.02] border-l border-foreground/10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-foreground/10 rounded-full blur-[100px] opacity-50" />
        
        <div className="relative z-10 text-center max-w-md px-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-tight">
            Presentations at the speed of thought.
          </h1>
          <p className="text-lg text-foreground/50 font-medium">
            Join thousands of professionals generating high-quality slide decks in seconds with PresentAI.
          </p>
        </div>
      </div>

    </div>
  );
}