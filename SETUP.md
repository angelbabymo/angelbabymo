# Creator OS Lite — Setup Guide

## 1. Supabase

1. Create a new project at supabase.com
2. Go to **SQL Editor** and run the entire contents of `supabase-schema.sql`
3. In **Authentication → Providers**, enable **Email** with "Magic Link" (disable password sign-in)
4. In **Authentication → URL Configuration**, add your Vercel URL to "Redirect URLs":
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)
5. Copy your **Project URL** and **anon/public API key** from **Settings → API**

## 2. Anthropic

1. Get your API key from console.anthropic.com
2. Make sure you have access to `claude-sonnet-4-20250514`

## 3. Environment Variables

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ANTHROPIC_API_KEY=sk-ant-...
```

## 4. Local Development

```bash
npm run dev
# Open http://localhost:3000
```

## 5. Deploy to Vercel

1. Push this repo to GitHub
2. Import in Vercel, select the `creator-os` repo
3. Add all 4 environment variables in Vercel project settings
4. Deploy

---

**The app will redirect unauthenticated users to `/login`. Enter your email, click the magic link, and you're in.**
