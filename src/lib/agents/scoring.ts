import { jsonCall, MODELS } from './anthropic';

const BASE_SYSTEM = `You score TikTok products on a 0–10 scale using EXACTLY this rubric. Do not invent categories. Do not reweight.

- Creator repetition (0–3): how many distinct creators are posting this product
- Engagement strength (0–2): likes+comments+shares per view, weighted
- Purchase intent (0–2): comment sentiment showing buying signal. Weight units_sold_total and units_sold_30d heavily here.
- Ad scaling (0–2): paid ad variations on Creative Center
- Longevity (0–1): continued presence over 7+ days

Sum the breakdown for score (one decimal). Stage:
- Rising: score >= 6 and longevity <= 0.4
- Hot: score >= 8
- Saturated: score < 6 OR longevity = 1.0 with declining engagement

action: "POST" if score >= 7.5 AND stage != Saturated, else "IGNORE".
hook: the highest-performing hook phrasing observed across creators.
reason: one short sentence citing the two strongest rubric dimensions.

Return JSON only:
{
  "score": number,
  "stage": "Rising"|"Hot"|"Saturated",
  "reason": string,
  "hook": string,
  "action": "POST"|"IGNORE",
  "rubric_breakdown": {
    "creator_repetition": number,
    "engagement_strength": number,
    "purchase_intent": number,
    "ad_scaling": number,
    "longevity": number
  }
}`;

export async function scoreProduct(productWithHistory: unknown, brandAiPrompt?: string | null) {
  const system = brandAiPrompt
    ? `${BASE_SYSTEM}\n\n---\nBRAND CONTEXT (use to assess fit — does not override rubric weights):\n${brandAiPrompt}`
    : BASE_SYSTEM;
  return jsonCall(MODELS.scoring, system, JSON.stringify(productWithHistory));
}
