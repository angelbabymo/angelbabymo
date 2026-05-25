import { createClient } from '@/lib/supabase/server';

const INPUT_CPT  = 3  / 1_000_000;   // $3.00 per 1M input tokens
const OUTPUT_CPT = 15 / 1_000_000;  // $15.00 per 1M output tokens

export interface UsageLog {
  agent:        string;
  model:        string;
  inputTokens:  number;
  outputTokens: number;
  brandId?:     string | null;
  status?:      'success' | 'error';
  metadata?:    Record<string, any>;
}

export async function logUsage({ agent, model, inputTokens, outputTokens, brandId, status = 'success', metadata = {} }: UsageLog) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const cost_usd = inputTokens * INPUT_CPT + outputTokens * OUTPUT_CPT;
    await supabase.from('ai_usage').insert({
      user_id:       user.id,
      brand_id:      brandId ?? null,
      agent,
      model,
      input_tokens:  inputTokens,
      output_tokens: outputTokens,
      cost_usd,
      status,
      metadata,
    });
  } catch { /* never let logging break the main flow */ }
}
