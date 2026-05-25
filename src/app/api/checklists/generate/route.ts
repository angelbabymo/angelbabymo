import { anthropic } from '@/lib/claude';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { prompt } = await req.json();
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: `You are a content planning assistant inside Creator OS, a tool for a professional TikTok creator.
Your job is to turn a description of a content goal into a practical, actionable checklist.

Rules:
- Items should be specific and actionable (not vague like "make content")
- Think in terms of: specific videos to shoot, brands to reach out to, editing tasks, posting schedule, logistics
- 4-12 items is ideal
- Title should be short and punchy (3-5 words max)
- Pick one relevant emoji for the checklist
- Return ONLY valid JSON, no markdown, no explanation`,
    messages: [{
      role: 'user',
      content: `Create a checklist for this goal: ${prompt}

Return this exact JSON shape:
{
  "title": "Short Title",
  "emoji": "🎯",
  "description": "One sentence summary",
  "items": ["Item 1", "Item 2", "Item 3"]
}`,
    }],
  });

  try {
    const text    = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    return NextResponse.json(JSON.parse(cleaned));
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
  }
}
