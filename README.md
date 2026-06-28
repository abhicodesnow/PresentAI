# PresentAI 

PresentAI is a premium full-stack AI-powered presentation platform built using a modern monorepo architecture. It allows users to dynamically generate gorgeous presentation decks using localized, high-performance open-source models through Ollama, complete with secure authentication and a seamless premium payment tier.

---

##  Tech Stack

PresentAI is organized as a high-performance monorepo managed with **pnpm workspaces**:

### Frontend (`apps/web`)
* **Framework:** Next.js (App Router, React 19)
* **Styling:** Tailwind CSS (featuring a sleek dark mode with ambient gradient aura animations)
* **Authentication:** Clerk Client SDK (handles Google OAuth & standard user flows with secure session tokens)
* **Icons & UI Utilities:** Lucide React, React Share (for X/Twitter, LinkedIn, WhatsApp, and Email integrations)

### Backend (`@presentai/backend`)
* **Runtime Environment:** Node.js with Express and TypeScript
* **AI Orchestration:** Ollama SDK interfacing with the state-of-the-art **Llama 3.1 (8B)** model
* **Payment Architecture:** Razorpay Node SDK with automated SHA-256 signature verification
* **User Provisioning:** Clerk Node SDK (`@clerk/clerk-sdk-node`) to securely mutate public user metadata

---

##  Features

* **AI Deck Generation:** Generate customized interactive presentations instantly via structured prompts.
* **Local, Private AI Execution:** Zero dependencies on third-party premium AI APIs—powered fully by a local deployment of Llama 3.1.
* **Persistent User History:** Save and catalog generated decks into a structured user profile sidebar.
* **Guest Mode:** Try the platform completely locally using client-side `localStorage` states before committing to an account.
* **Instant Social Sharing:** Share presentations seamlessly with dynamically generated public access URLs.
* **Premium Pro Pass:** A beautiful, animated UI gateway to unlock life-time platform capabilities via a secure Razorpay portal.

---

##  Local Machine Prerequisites

Before diving into setup, make sure you have the following installed locally:
1. [Node.js (v18+) & pnpm](https://pnpm.io/installation)
2. [Ollama App](https://ollama.com/) 

---

##  Step-by-Step Local Setup Guide

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/PresentAI.git](https://github.com/your-username/PresentAI.git)
cd PresentAI

```
### 2. Install Project Dependencies
Run this command from the root workspace directory to install all cross-package dependencies across your frontend and backend seamlessly:
```bash
pnpm install
```

### 3. Initialize & Configure Local AI (Ollama 3.1)
PresentAI uses the highly performant **Llama 3.1** model. Make sure your local engine is running:

1. Launch the Ollama desktop client application.
2. Open your system terminal and pull down the model manually by executing:
   ```bash
   ollama run llama3.1
   ```
3. Verify that the server is listening locally on its default network port: `http://localhost:11434`

---

##  Environment Configuration

You will need to configure environment variables across both workspace packages to enable functional authentication and payment structures.

### Backend Setup (`apps/backend/.env`)
Create an `.env` file inside the `apps/backend` or corresponding sub-package folder:
```env
PORT=4000
RAZORPAY_KEY_ID=rzp_test_your_public_key_here
RAZORPAY_KEY_SECRET=your_secret_razorpay_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
```

### Frontend Setup (`apps/web/.env.local`)
Create an `.env.local` file inside your Next.js application directory:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_public_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_public_key_here
```

---

## 🏃‍♂️ Running the Application

To run both the Next.js client interface and your backend API route ecosystem side-by-side simultaneously, use the following workspace run command directly from your project's root folder:

```bash
pnpm dev
```

* **Frontend Client Instance:** Accessible at `http://localhost:3000`
* **Secure Backend API Engine:** Running on `http://localhost:4000`

---

##  Razorpay E-Commerce Architecture 

PresentAI uses an optimized one-time transaction system to completely bypass India's stringent subscription KYC requirements during initial development and deployment cycles:

1. **Frontend Request:** Click the premium **Upgrade Pro** button component (`UpgradeButton.tsx`). The app verifies your Clerk authorization state.
2. **Backend Order Creation:** The client communicates safely to `POST /create-order` on Port 4000. Your backend queries the Razorpay Node SDK to securely generate a legal transaction wrapper (`order_id`) valued in Indian Paisa (`49900 paise = ₹499`).
3. **Secure Checkout Rendering:** The client parses the JSON output and triggers the native, browser-injected Razorpay script window safely displaying an interactive test portal interface.
4. **Cryptographic Signature Verification:** Upon success, transaction markers (`razorpay_signature`) travel back to `POST /verify-payment`. Your backend calculates a matching HMAC SHA-256 string using your private API secret. If verified, the system seamlessly triggers the Clerk management endpoint to write `{ isPro: true }` permanently into the active client profile metadata map.
