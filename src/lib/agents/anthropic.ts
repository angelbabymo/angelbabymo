import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODELS = {
  extraction: process.env.CLAUDE_EXTRACTION_MODEL || 'claude-haiku-4-5-20251001',
  scoring:    process.env.CLAUDE_SCORING_MODEL    || 'claude-sonnet-4-6',
  content:    process.env.CLAUDE_CONTENT_MODEL    || 'claude-sonnet-4-6',
};

export async function jsonCall(model: string, system: string, user: string) {
  const res = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: user }],
  });
  const block = res.content.find(b => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('No text in response');
  const text = block.text.trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]);
}
