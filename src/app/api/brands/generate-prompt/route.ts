import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { jsonCall, MODELS } from '@/lib/agents/anthropic';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { profile, name } = await req.json();

  const SYSTEM = `You are a brand strategist who writes AI system prompts for TikTok content creators.
Given a brand profile, you write a detailed, high-performance system prompt that will be injected into Claude to guide product scoring and content generation.

The prompt must:
- Define the brand voice precisely (tone, phrases to use, phrases to avoid)
- Describe the target audience with psychological depth
- List which product types are on-brand vs off-brand
- State the commercial minimums that must be met
- Include the 3 most powerful psychological triggers for this audience
- Give concrete examples of good hooks vs bad hooks for this brand

Write in second person addressed to an AI assistant ("You are writing for...").
Be specific and actionable. No fluff. This prompt directly determines how well the AI performs.

Return JSON: { "ai_prompt": string }`;

  const USER = `Brand name: ${name}

Brand profile:
${JSON.stringify(profile, null, 2)}

Write the optimized AI system prompt for this brand.`;

  try {
    const result = await jsonCall(MODELS.content, SYSTEM, USER);
    return NextResponse.json({ ai_prompt: result.ai_prompt });
  } catch {
    return NextResponse.json({ ai_prompt: null });
  }
}
