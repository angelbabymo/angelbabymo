-- Brand isolation: add brand_id to all per-user data tables
-- Run this in Supabase SQL Editor

-- clips
ALTER TABLE clips ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clips_brand_id ON clips(brand_id);

-- folders
ALTER TABLE folders ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_folders_brand_id ON folders(brand_id);

-- checklists
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_checklists_brand_id ON checklists(brand_id);

-- scheduled_posts
ALTER TABLE scheduled_posts ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_brand_id ON scheduled_posts(brand_id);

-- vault_items
ALTER TABLE vault_items ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_vault_items_brand_id ON vault_items(brand_id);
