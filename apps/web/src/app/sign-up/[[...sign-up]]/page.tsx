import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-background">
      
      {/* LEFT COLUMN: The Interactive Signup Area */}
      <div className="flex w-full flex-col items-center justify-center lg:w-1/2 px-4 sm:px-12">
        <div className="w-full max-w-[400px] mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Get started.</h2>
          <p className="text-sm text-foreground/60">Create your PresentAI account to start generating decks.</p>
        </div>

        <SignUp 
          appearance={{
            elements: {
              // Removes the default Clerk shadow and border
              card: "shadow-none border border-foreground/10 bg-transparent w-full",
              // Hides the redundant Clerk header
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              // Styles the buttons to match your PresentAI aesthetic
              formButtonPrimary: "bg-foreground text-background hover:opacity-90 transition-opacity",
              socialButtonsBlockButton: "border-foreground/10 hover:bg-foreground/5 transition-colors",
              footerActionLink: "text-foreground font-semibold hover:text-foreground/80"
            }
          }}
        />
      </div>

      {/* RIGHT COLUMN: The Immersive Branding Area (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden bg-foreground/[0.02] border-l border-foreground/10">
        {/* Subtle background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-foreground/10 rounded-full blur-[100px] opacity-50" />
        
        <div className="relative z-10 text-center max-w-md px-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 leading-tight">
            From prompt to presentation.
          </h1>
          <p className="text-lg text-foreground/50 font-medium">
            Join the community of creators building smarter, faster slide decks.
          </p>
        </div>
      </div>

    </div>
  );
}