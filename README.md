# Concept Checker

An AI-powered learning tool that tests whether you truly understand a systems-thinking concept—or are just reciting a memorized definition.

**Live app:** [https://100-x-hackathon.vercel.app](https://100-x-hackathon.vercel.app)

## How it works

1. **Sign up / log in** — email and password auth via Supabase.
2. **Pick a concept** — choose from curated prompts (e.g. “What is an interface, really?”, “Why do we need a backend at all?”).
3. **Explain in your own words** — Claude analyzes your answer and identifies the exact phrase where you switched from reasoning to a memorized label.
4. **Answer a follow-up** — a sharp question forces you to derive the idea from first principles.
5. **Get a verdict** — the AI judges whether your gap is closed and gives concise feedback.

Each session is saved to your account (sessions → gaps → results).

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Auth & database | Supabase (Postgres + Row Level Security) |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| Deployment | [Vercel](https://vercel.com) |

## Local development

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)

### Setup

1. Clone the repo and install dependencies:

   ```bash
   git clone https://github.com/adarshm0602/100X_Hackathon.git
   cd 100X_Hackathon
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ANTHROPIC_API_KEY=your-claude-api-key
   # Optional: defaults to claude-sonnet-4-6
   # ANTHROPIC_MODEL=claude-sonnet-4-6
   ```

3. Apply the database schema in the Supabase SQL Editor (or via `supabase db push`):

   ```
   supabase/migrations/001_initial_schema.sql
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run lint` | Run ESLint |

## Deployment

The app is deployed on Vercel. To deploy your own instance:

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Add the same environment variables from `.env.example` in the Vercel project settings.
3. In **Supabase → Authentication → URL Configuration**, set:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

For demo use, consider disabling **Confirm email** under Supabase → Authentication → Providers → Email so judges can sign up instantly.

## Project structure

```
src/
├── app/
│   ├── api/evaluate-initial/   # Claude: find memorized label + follow-up
│   ├── api/evaluate-second/    # Claude: judge second attempt
│   ├── auth/callback/          # Supabase OAuth callback
│   ├── dashboard/              # Main concept-checker UI
│   ├── login/ & signup/        # Auth pages
│   └── globals.css
├── components/                 # Shared UI (auth form)
└── lib/
    ├── anthropic.ts            # Claude client helpers
    ├── concepts.ts             # Curated concept prompts
    └── supabase/               # Supabase client + middleware
supabase/migrations/            # Postgres schema + RLS policies
```

## License

Private — built for the 100X Hackathon.
