import { jsonCall, MODELS } from './anthropic';

const SYSTEM = `You extract structured product data from raw TikTok scrape payloads.
Return ONE JSON object matching this schema. Use null when a field is not present — never invent.

{
  "product_name": string,
  "normalized_name": string,
  "hook_style": string|null,
  "price_usd": number|null,
  "original_price_usd": number|null,
  "discount_percent": number|null,
  "commission_rate": number|null,
  "affiliate_eligible": boolean|null,
  "units_sold_total": number|null,
  "units_sold_30d": number|null,
  "product_rating": number|null,
  "review_count": number|null,
  "creator_count_30d": number|null,
  "engagement_signals": { "views": number|null, "likes": number|null, "comments": number|null, "shares": number|null },
  "comment_sentiment": "positive"|"mixed"|"negative"|null,
  "shop_name": string|null,
  "shop_rating": number|null,
  "shop_review_count": number|null,
  "product_image_url": string|null,
  "product_url": string|null
}

Return JSON only. No prose.`;

export async function extractProduct(rawPayload: unknown) {
  return jsonCall(MODELS.extraction, SYSTEM, JSON.stringify(rawPayload));
}
