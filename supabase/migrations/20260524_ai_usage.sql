CREATE TABLE IF NOT EXISTS ai_usage (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid NOT NULL,
  brand_id      uuid REFERENCES brands(id) ON DELETE SET NULL,
  agent         text NOT NULL,
  model         text NOT NULL,
  input_tokens  int  DEFAULT 0,
  output_tokens int  DEFAULT 0,
  cost_usd      numeric(10,6) DEFAULT 0,
  status        text DEFAULT 'success',
  metadata      jsonb DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_user_created ON ai_usage(user_id, created_at DESC);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ai_usage" ON ai_usage
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
