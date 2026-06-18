'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Clock, FileText, User } from 'lucide-react';
import { useAuth, useClerk, UserButton } from '@clerk/nextjs';
import { aiService } from '../lib/api-client';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();

  // Re-fetch history automatically whenever the URL changes (like after generating a new deck)
  useEffect(() => {
    const loadHistory = async () => {
      const isGuestMode = localStorage.getItem('presentai_guest') === 'true';
      setIsGuest(isGuestMode);

      if (isSignedIn) {
        const token = await getToken();
        const dbHistory = await aiService.getHistory(token);
        setHistory(dbHistory);
      } else if (isGuestMode) {
        const guestHistory = JSON.parse(localStorage.getItem('presentai_guest_history') || '[]');
        setHistory(guestHistory);
      }
    };
    
    if (isLoaded) loadHistory();
  }, [isSignedIn, getToken, isLoaded, pathname]);

  const handleExitGuestMode = () => {
    localStorage.removeItem('presentai_guest');
    localStorage.removeItem('presentai_guest_history');
    setIsGuest(false);
    setHistory([]);
    clerk.redirectToSignIn();
  };

  // Do not show the sidebar on the sign-in or sign-up pages
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-foreground selection:text-background">
      
      {/* --- SIDEBAR --- */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-background border-r border-foreground/10 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-foreground/5 h-20">
          <span className="font-medium tracking-tight text-sm text-foreground/50">History</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-foreground/40 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-foreground/30 text-sm gap-2">
              <Clock className="w-6 h-6" />
              <p>No presentations yet</p>
            </div>
          ) : (
            history.map((item) => (
              <Link 
                key={item.id} 
                href={`/deck/${item.id}`}
                className="group flex items-center gap-3 p-3 rounded-lg hover:bg-foreground/5 text-sm transition-colors block"
              >
                <FileText className="w-4 h-4 text-foreground/40 group-hover:text-foreground/80 flex-shrink-0" />
                <div className="truncate text-foreground/80 font-medium">
                  {item.title}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT AREA (Pushes when sidebar opens) --- */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
        
        {/* Global Navigation Bar */}
        <header className="flex-shrink-0 h-20 px-6 sm:px-8 flex items-center justify-between z-30 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground/80" />
              </button>
            )}
            <Link href="/" className="font-medium tracking-tight text-sm text-foreground/50 hidden sm:block hover:text-foreground transition-colors">
              PresentAI
            </Link>
          </div>
          
          {/* Dynamic Auth Status & Direct Sign In Button */}
          <div className="pointer-events-auto">
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
                  Log in to save
                </button>
              </div>
            ) : (
              <Link 
                href="/sign-in"
                className="text-sm font-semibold text-foreground/80 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 px-5 py-2 rounded-full transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Dynamic Page Content Loads Here */}
        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-30 transition-opacity md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}