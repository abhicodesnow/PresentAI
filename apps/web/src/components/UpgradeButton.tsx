'use client';

import { useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';
import { Sparkles, Loader2 } from 'lucide-react';
import { paymentService } from '../lib/api-client'; 

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function UpgradeButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { isSignedIn, getToken } = useAuth(); 
  const clerk = useClerk();

  const handleUpgrade = async () => {
    if (!isSignedIn) {
      alert('Please sign in to upgrade your account.');
      clerk.redirectToSignIn();
      return;
    }

    setIsProcessing(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Payment system failed to load. Please check your connection.');
        setIsProcessing(false);
        return;
      }

      const token = await getToken();

      const order = await paymentService.createOrder(49900, token);

      if (!order || !order.id) {
        throw new Error('Failed to create order');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount, 
        currency: order.currency,
        name: "PresentAI",
        description: "Lifetime Pro Pass",
        order_id: order.id, 
        handler: async function (paymentResponse: any) {
          console.log("Payment Success!", paymentResponse);
          alert("Payment Successful! Welcome to Pro.");
        },
        theme: {
          color: "#050505", 
        },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment Failed", response.error.description);
        alert("Payment failed or was cancelled.");
      });

      rzp.open();
    } catch (error) {
      console.error("Checkout Error:", error);
      alert("Something went wrong initializing the checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleUpgrade}
      disabled={isProcessing}
      className="relative group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-neutral-900 border border-neutral-800 transition-all duration-300 hover:border-neutral-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-md"
    >
      {/* Premium Ambient Background Glow Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out" />
      
      {/* Animated Subtle Pulsing Border Glow */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-500 -z-10 animate-pulse" />

      {isProcessing ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Upgrade Pro
          </span>
        </>
      )}
    </button>
  );
} 