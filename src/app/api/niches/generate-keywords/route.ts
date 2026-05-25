import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { anthropic } from '@/lib/claude';
import { logUsage } from '@/lib/logUsage';

export async function POST(req: NextRequest) {
  try {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { description } = await req.json();
    if (!description?.trim()) return NextResponse.json({ error: 'Description required' }, { status: 400 });

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: `You are a TikTok Shop keyword strategist. Given a description of a creator's niche, you generate the most effective search keywords for finding trending, high-converting products on TikTok Shop.

Your keywords should be:
- What buyers type when searching for these products on TikTok Shop
- Specific enough to find relevant products, broad enough to find options
- A mix of product-type terms, style terms, and audience terms
- 5 to 8 keywords total
- Short phrases (1-4 words each)

Return ONLY valid JSON, no markdown:
{
  "name": "2-4 word niche label",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"]
}`,
      messages: [{
        role: 'user',
        content: `My niche: ${description}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON in response');
    const result = JSON.parse(match[0]);

    logUsage({
      agent: 'niche_keywords',
      model: 'claude-haiku-4-5-20251001',
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    });

    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Niche keyword generation error:', e);
    return NextResponse.json({ error: e?.message ?? 'Failed' }, { status: 500 });
  }
}
