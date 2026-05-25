import { jsonCall, MODELS } from './anthropic';

const BASE_SYSTEM = `You write short-form TikTok scripts for product creators.
Match the winning hook's tone. Script: filmable in under 30s, numbered shots with VO.
Caption: one line, present-tense, hook-led.
Hooks: exactly 5 variations across angles (curiosity, social proof, transformation, contrast, problem-solution).
Spark: "YES" or "NO" + one short reason.

Return JSON only:
{
  "script": string,
  "caption": string,
  "cta": string,
  "spark_recommendation": string,
  "hook_variations": string[]
}`;

export async function generateContent(productWithScore: unknown, brandAiPrompt?: string | null) {
  const system = brandAiPrompt
    ? `${brandAiPrompt}\n\n---\nCONTENT FORMAT RULES (always follow these):\n${BASE_SYSTEM.split('\n').slice(1).join('\n')}`
    : BASE_SYSTEM;
  return jsonCall(MODELS.content, system, JSON.stringify(productWithScore));
}
