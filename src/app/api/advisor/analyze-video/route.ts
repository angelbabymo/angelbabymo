import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { processVideoUrl } from '@/lib/advisor/video-pipeline';
import { buildAdvisorSystemPrompt } from '@/lib/advisor/system-prompt';
import { CLAUDE_ADVISOR_MODEL } from '@/lib/constants';

export const maxDuration = 60;
export const runtime = 'nodejs';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { conversationId, videoUrl, brandId } = await req.json();

  await supabase.from('advisor_messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: `Analyze this video: ${videoUrl}`,
    message_type: 'video_analysis',
    video_url: videoUrl,
  });

  // Try full pipeline (yt-dlp + ffmpeg). Falls back to URL-only if unavailable on serverless.
  const pipeline = await processVideoUrl(videoUrl);

  const { data: brand } = await supabase
    .from('brands')
    .select('name, description, profile')
    .eq('id', brandId)
    .single();

  const brandContext = brand
    ? `Brand: ${brand.name}\n${brand.description ?? ''}\n${(brand.profile as any)?.ai_prompt ?? ''}`
    : '';

  const systemPrompt = buildAdvisorSystemPrompt(brandContext);

  const frameContent: Anthropic.ImageBlockParam[] = (pipeline.frames ?? []).map(frame => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/jpeg',
      data: frame,
    },
  }));

  const analysisNote = pipeline.error
    ? `Note: Video download unavailable in this environment — analyzing from URL and metadata only.`
    : `Duration: ${Math.round(pipeline.duration)}s\nTranscript: ${pipeline.transcript}`;

  const userContent: Anthropic.ContentBlockParam[] = [
    ...frameContent,
    {
      type: 'text',
      text: `Video URL: ${videoUrl}
Platform: ${pipeline.platform}
${analysisNote}

Analyze this video using your full framework. Follow the exact output structure (Hook, Retention Mechanics, Audience, Emotional Arc, CTA, On-Screen Text, Verdict, Steal This). If you cannot see frames or transcript, do your best analysis based on the URL, platform context, and any patterns you can infer.`,
    },
  ];

  const claudeResponse = await anthropic.messages.create({
    model: CLAUDE_ADVISOR_MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  const analysisText =
    claudeResponse.content[0].type === 'text' ? claudeResponse.content[0].text : '';

  const { data: savedMessage } = await supabase.from('advisor_messages').insert({
    conversation_id: conversationId,
    role: 'assistant',
    content: analysisText,
    message_type: 'video_analysis',
    video_url: videoUrl,
    analysis_json: {
      platform: pipeline.platform,
      duration: pipeline.duration,
      transcript: pipeline.transcript,
      raw_analysis: analysisText,
    },
  }).select().single();

  return NextResponse.json({ message: savedMessage, analysis: analysisText });
}
