'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Clock, FileText, User, MoreVertical, Share2, Trash, ExternalLink, Check, Copy, Maximize, Sparkles} from 'lucide-react';
import { useAuth, useClerk, UserButton } from '@clerk/nextjs';
import { aiService } from '../lib/api-client';

import { 
  XShareButton, XIcon,
  LinkedinShareButton, LinkedinIcon,
  WhatsappShareButton, WhatsappIcon,
  EmailShareButton, EmailIcon
} from 'react-share';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const sidebarListRef = useRef<HTMLDivElement>(null);
  
  const [shareModalDeck, setShareModalDeck] = useState<{id: string, title: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const { getToken, isSignedIn, isLoaded } = useAuth();
  const clerk = useClerk();

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarListRef.current && !sidebarListRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExitGuestMode = () => {
    localStorage.removeItem('presentai_guest');
    localStorage.removeItem('presentai_guest_history');
    setIsGuest(false);
    setHistory([]);
    clerk.redirectToSignIn();
  };

  const handleShare = (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    setShareModalDeck({ id, title });
    setOpenMenuId(null);
  };

  const copyToClipboard = async () => {
    if (!shareModalDeck) return;
    const url = `${window.location.origin}/deck/${shareModalDeck.id}`;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this presentation?')) {
      setOpenMenuId(null);
      return;
    }

    try {
      if (isGuest) {
        const currentHistory = JSON.parse(localStorage.getItem('presentai_guest_history') || '[]');
        const updated = currentHistory.filter((item: any) => item.id !== id);
        localStorage.setItem('presentai_guest_history', JSON.stringify(updated));
        setHistory(updated);
      } else {
        const token = await getToken();
        await aiService.deleteDeck(id, token);
        setHistory(prev => prev.filter(item => item.id !== id));
      }
      
      if (pathname.includes(id)) {
        router.push('/');
      }
    } catch (error) {
      console.error("Delete failed", error);
      alert('Failed to delete presentation.');
    }
    setOpenMenuId(null);
  };

  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/preview')) {
    return <>{children}</>;
  }

  const shareUrl = shareModalDeck ? `${typeof window !== 'undefined' ? window.location.origin : ''}/deck/${shareModalDeck.id}` : '';

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-foreground selection:text-background">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-foreground/10 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-foreground/5 h-20">
          <span className="font-medium tracking-tight text-sm text-foreground/50">History</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-foreground/40 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div ref={sidebarListRef} className="flex-1 overflow-y-auto p-4 space-y-1">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-foreground/30 text-sm gap-2">
              <Clock className="w-6 h-6" />
              <p>No presentations yet</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="group relative flex items-center p-2 rounded-lg hover:bg-foreground/5 transition-colors">
                <Link href={`/deck/${item.id}`} className="flex-1 flex items-center gap-3 overflow-hidden">
                  <FileText className="w-4 h-4 text-foreground/40 group-hover:text-foreground/80 flex-shrink-0" />
                  <div className="truncate text-foreground/80 font-medium text-sm">
                    {item.title}
                  </div>
                </Link>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenMenuId(prev => prev === item.id ? null : item.id);
                  }}
                  className={`p-1.5 rounded-md transition-all ${openMenuId === item.id ? 'opacity-100 bg-foreground/10 text-foreground' : 'opacity-0 group-hover:opacity-100 text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {openMenuId === item.id && (
                  <div className="absolute right-8 top-8 w-52 bg-background border border-foreground/10 rounded-xl shadow-2xl z-[60] py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link 
                      href={`/preview/${item.id}`}
                      onClick={() => setOpenMenuId(null)}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground flex items-center gap-3 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" /> Open Preview
                    </Link>

                    <Link 
                      href={`/preview/${item.id}?fullscreen=true`}
                      onClick={() => setOpenMenuId(null)}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground flex items-center gap-3 transition-colors"
                    >
                      <Maximize className="w-4 h-4" /> Present Full Screen
                    </Link>
                    
                    <button 
                      onClick={(e) => handleShare(item.id, item.title, e)} 
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-foreground/5 hover:text-foreground flex items-center gap-3 transition-colors"
                    >
                      <Share2 className="w-4 h-4" /> Share Deck
                    </button>
                    
                    <div className="h-px bg-foreground/10 my-1 mx-2" />
                    
                    <button 
                      onClick={(e) => handleDelete(item.id, e)} 
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500/80 hover:bg-red-500/10 hover:text-red-500 flex items-center gap-3 transition-colors"
                    >
                      <Trash className="w-4 h-4" /> Delete Deck
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={`flex-1 flex flex-col h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'ml-0'}`}>
        
        <header className="relative flex-shrink-0 h-20 px-6 sm:px-8 flex items-center justify-between z-30 pointer-events-none bg-background">
          <div className="flex items-center gap-4 pointer-events-auto">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-foreground/5 transition-colors">
                <Menu className="w-5 h-5 text-foreground/80" />
              </button>
            )}
            <Link href="/" className="flex items-center gap-2 group hidden sm:flex">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background group-hover:scale-105 transition-transform shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-semibold tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
                PresentAI
              </span>
            </Link>
          </div>
          
          <div className="pointer-events-auto">
            {isSignedIn ? (
              <UserButton />
            ) : isGuest ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/50">
                  <User className="w-4 h-4" />
                </div>
                <button onClick={handleExitGuestMode} className="text-xs font-medium text-foreground/40 hover:text-foreground transition-colors">
                  Log in to save
                </button>
              </div>
            ) : (
              <Link href="/sign-in" className="text-sm font-semibold text-foreground/80 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 px-5 py-2 rounded-full transition-all">
                Sign In
              </Link>
            )}
          </div>

          {/* --- THE SWEEPING SCANNER BORDER --- */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] z-50 bg-white/10 overflow-hidden">
            {/* Injecting the keyframe directly into the document */}
            <style>{`
              @keyframes scan {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
              }
              .animate-scan {
                animation: scan 25s ease-in-out infinite;
              }
            `}</style>
            
            {/* The sweeping container */}
            <div className="absolute top-0 left-1/2 w-1/2 h-full -ml-[25%] flex items-center justify-center animate-scan">
              {/* Soft outer aura */}
              <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-[2px]" />
              {/* Sharp bright core */}
              <div className="absolute w-2/3 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </div>
          </div>

        </header>

        <main className="flex-1 overflow-y-auto relative">
          {children}
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 transition-opacity md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SHARE MODAL */}
      {shareModalDeck && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background border border-foreground/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-foreground/5">
              <div>
                <h3 className="font-semibold text-lg tracking-tight">Share Presentation</h3>
                <p className="text-sm text-foreground/50 truncate max-w-[250px]">{shareModalDeck.title}</p>
              </div>
              <button onClick={() => setShareModalDeck(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-foreground/5 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex justify-center gap-6">
                <XShareButton url={shareUrl} title={shareModalDeck.title} className="hover:scale-110 transition-transform">
                  <XIcon size={48} round />
                </XShareButton>
                <LinkedinShareButton url={shareUrl} title={shareModalDeck.title} className="hover:scale-110 transition-transform">
                  <LinkedinIcon size={48} round />
                </LinkedinShareButton>
                <WhatsappShareButton url={shareUrl} title={shareModalDeck.title} className="hover:scale-110 transition-transform">
                  <WhatsappIcon size={48} round />
                </WhatsappShareButton>
                <EmailShareButton url={shareUrl} subject="Check out this presentation" body={`I created this presentation using PresentAI. Check it out here: `} className="hover:scale-110 transition-transform">
                  <EmailIcon size={48} round />
                </EmailShareButton>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Or copy link</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground/70 truncate">
                    {shareUrl}
                  </div>
                  <button onClick={copyToClipboard} className="flex items-center justify-center w-12 h-12 bg-foreground text-background rounded-xl hover:scale-105 active:scale-95 transition-all">
                    {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}