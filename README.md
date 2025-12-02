# Smart Task Evaluator

Production-ready Gen-AI SaaS web app for coding task review, refactoring, and feedback.



## 🚀 Features

- **User Auth:** Sign up, log in, and session management with Supabase
- **Task Submission:** Submit coding assignments for AI review
- **AI Evaluation:** Automated code analysis (score, strengths, improvements)
- **Detailed Feedback:** Structured, actionable reports with sectioned code examples
- **Stripe Payments:** Secure checkout to unlock full detailed reports
- **Past Reports:** Dashboard for reviewing past submissions and evaluations
- **Code-Fix Playground:** Demonstrates AI-powered bug fixing and code improvement on example files
- **Screen Recording:** End-to-end build and debugging workflow captured for the assignment


## 🏗️ Tech Stack

- **Frontend:** Next.js 16 (App Router), Tailwind CSS, ShadCN UI
- **Backend:** Supabase (Postgres, Auth, RLS)
- **AI Integration:** Groq Llama 3 (server-side)
- **Payments:** Stripe
- **Deployment:** Vercel


## 📝 Quickstart

```
git clone https://github.com/YOUR_USERNAME/smart-task-evaluator.git
cd smart-task-evaluator
cp .env.example .env.local   # Fill out your environment secrets
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.


## 🔐 Environment Variables

Create a `.env.local` file and set:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

GROQ_API_KEY=...

STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
STRIPE_WEBHOOK_SECRET=...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```


## 🛣️ User Flow

1. **Sign Up / Log In** with email (Supabase Auth).
2. **Submit Task** from `/dashboard/submit`.
3. **Run AI Evaluation** on a task detail page.
4. **View Summary Feedback**: score, strengths, improvements.
5. **Pay to Unlock Full Report** via Stripe Checkout.
6. **View Full Detailed Report**: code quality, best practices, performance, readability, security, plus code examples in formatted blocks.
7. **Revisit Past Reports** from the dashboard.


## 🧠 AI Evaluation

- The `/api/evaluate` endpoint sends:
  - Task title, description, language, and code
- Model returns JSON with:
  - `score`
  - `strengths`
  - `improvements`
  - `full_report` (structured JSON with sections and code snippets)
- Full report is stored in Supabase and rendered by a custom `ReportFormatter` component.


## 💳 Payments

- Stripe Checkout used to handle payments.
- Successful payment:
  - Confirms via Stripe webhook (`/api/webhooks/stripe`)
  - Marks evaluation as `is_paid = true`
  - Unlocks access to the full detailed report UI.


## 🧪 Code-Fix Playground

The app includes example files to demonstrate the “code editing” requirement:

- `src/examples/broken-component.tsx`
- `src/examples/broken-api.ts`
- `src/examples/broken-function.ts`

The dashboard exposes an “AI Code Fix Playground” where these examples are analyzed and improved using the same AI pipeline (bug fixes, refactors, performance/readability improvements).


## 📦 Project Structure (simplified)

```
src/
  app/
    api/
      evaluate/route.ts
      create-checkout/route.ts
      webhooks/stripe/route.ts
    auth/
      login/page.tsx
      signup/page.tsx
    dashboard/
      page.tsx
      submit/page.tsx
      task/[id]/page.tsx
    payment/
      success/page.tsx
  components/
    report-formatter.tsx
    ui/...
  lib/
    supabase/
      client.ts
      server.ts
    env.ts
```

Middleware protects authenticated routes under `/dashboard`.


## 🧑‍💻 Development

```
# Lint
npm run lint

# Type-check
npm run typecheck

# Production build
npm run build

# Start production server
npm start
```


## 🧪 Testing the Stripe Flow (Test Mode)

1. Set Stripe keys to test keys.
2. Use card number `4242 4242 4242 4242` with any future expiry and any CVC.
3. Complete checkout and confirm the evaluation becomes unlocked.


## 📺 Demo & Assignment Links

- **Live App:** https://smart-task-evaluator-sable.vercel.app/
- **GitHub Repo:** https://github.com/YOUR_USERNAME/smart-task-evaluator
- **Screen Recording (Drive):** https://drive.google.com/...
- **Supabase Schema Screenshot:** `docs/supabase-schema.png`
- **Payment Proof:** `docs/payment-proof.png`


## 🧰 AI & Tools Used

- In-editor assistants: (e.g. Cursor / Copilot / ChatGPT)
- Backend LLM: Groq Llama 3
- Manual work:
  - Routing and middleware
  - Stripe checkout + webhook
  - Supabase schema and RLS
  - Report formatter and UI polish


## 🤝 Contributing

Pull requests and suggestions are welcome.  
For major changes, please open an issue first to discuss what you would like to change.

