import { anthropic } from '@/lib/claude';
import { NextRequest, NextResponse } from 'next/server';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { logUsage } from '@/lib/logUsage';

export async function POST(req: NextRequest) {
  try {
    const { description, clips, month } = await req.json();

    const perfSummary = clips.length > 0
      ? clips.slice(0, 20).map((c: any) =>
          `${c.clip_name} (${c.category}) — ${c.saves} saves, ${c.shares} shares, ${c.watch_time_pct}% watch time`
        ).join('\n')
      : 'No clip data yet.';

    const prompt = `You are scheduling TikTok content for a creator. Analyze their performance data and the scheduling request, then return a posting schedule.

PERFORMANCE DATA (top clips):
${perfSummary}

SCHEDULING REQUEST:
"${description}"

TARGET MONTH: ${month}

Based on the request and performance data, generate a realistic posting schedule. Return ONLY a valid JSON array with no explanation:
[
  {
    "title": "Post title",
    "category": "Lifestyle|Fashion|Affiliate|Wellness|GRWM|Tutorial|Other",
    "scheduled_for": "2025-05-19T18:00:00",
    "status": "scheduled",
    "notes": "Why this post/time was chosen",
    "is_repost": false
  }
]

RULES:
- Use realistic dates in ${month}
- Best posting times: 7am, 12pm, 6pm, 9pm
- Balance categories based on what performs best
- Max 2 posts per day
- Default to 5-7 posts per week unless asked otherwise
- Use ISO 8601 datetime format`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text    = response.content[0].type === 'text' ? response.content[0].text : '[]';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const posts   = JSON.parse(cleaned);

    logUsage({ agent: 'scheduler', model: 'claude-sonnet-4-6', inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Schedule error:', error);
    return NextResponse.json({ error: 'Scheduling failed' }, { status: 500 });
  }
}
