import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { buildAdvisorSystemPrompt } from '@/lib/advisor/system-prompt';
import { CLAUDE_ADVISOR_MODEL } from '@/lib/constants';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { conversationId, message, brandId } = body as {
    conversationId: string;
    message: string;
    brandId: string;
  };

  const { data: history } = await supabase
    .from('advisor_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(20);

  const { data: brand } = await supabase
    .from('brands')
    .select('name, description, profile')
    .eq('id', brandId)
    .single();

  const brandContext = brand
    ? `Brand: ${brand.name}\n${brand.description ?? ''}\n${(brand.profile as any)?.ai_prompt ?? ''}`
    : '';

  const systemPrompt = buildAdvisorSystemPrompt(brandContext);

  const messages: Anthropic.MessageParam[] = [
    ...(history ?? []).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ];

  await supabase.from('advisor_messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: message,
    message_type: 'text',
  });

  const stream = anthropic.messages.stream({
    model: CLAUDE_ADVISOR_MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullText = '';
      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          fullText += chunk.delta.text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`));
        }
      }

      await supabase.from('advisor_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: fullText,
        message_type: 'text',
      });

      await supabase
        .from('advisor_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
