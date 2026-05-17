import { anthropic, SYSTEM_PROMPT } from '@/lib/claude';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { description, category, clipName } = await req.json();

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const userPrompt = `Generate content for this TikTok clip:

CLIP NAME: ${clipName || 'Untitled'}
CATEGORY: ${category || 'Lifestyle'}
DESCRIPTION: ${description}

Return ONLY a valid JSON object with this exact shape (no markdown, no explanation):
{
  "hooks": ["hook 1","hook 2","hook 3","hook 4","hook 5","hook 6","hook 7","hook 8","hook 9","hook 10"],
  "captions": ["caption 1","caption 2","caption 3","caption 4","caption 5"],
  "ctas": ["cta 1","cta 2","cta 3"],
  "emotional_angles": ["angle 1","angle 2","angle 3"]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text    = response.content[0].type === 'text' ? response.content[0].text : '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const generated = JSON.parse(cleaned);

    return NextResponse.json(generated);
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
