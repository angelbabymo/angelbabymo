# Brand Profile — Soft Luxury Feminine (template for brand #1)

> **Multi-brand note:** This is the brand bible for the *Soft Luxury Feminine* brand only. Each additional brand has its own markdown file at `brands/<slug>/BRAND-PROFILE.md`. The Content Agent loads whichever brand's markdown matches the active `brand_id`. Same engine, different voice per brand.

# Source of Truth for the Content Agent

**Status:** Draft v1 — built from `feminine_fashion_pdf.pdf`. Waiting on `Soft_Luxury_Feminine_Brand_Pillars.pdf` to complete the "north star" section.

**Niche:** Soft feminine lifestyle.

**Purpose:** This is the canonical document the Content Agent reads on every script generation. It defines voice, depth standard, psychology triggers, and worked examples. If we change anything here, the Content Agent's output changes immediately.

---

## 1. The 3 Psychology Triggers

These are the only levers we pull. No others. Every hook and every VO must be anchored in at least one of them; the strongest copy combines two or all three.

| # | Trigger | Core human truth |
|---|---|---|
| 1 | **Appealing to the Opposite Sex** | She wants to be noticed without having to ask for it. Magnetism, not performance. |
| 2 | **Protecting a Loved One / Herself** | She is the protector of her own peace, her own energy, her own self-respect. The product helps her guard it. |
| 3 | **Freedom, Fear & Relief** | She has carried a specific kind of dread for too long. The product is the exit door from it. |

**Combinations (where the deepest conversion happens):**

- **1 + 2** — She stops shrinking, becomes irresistible without trying
- **1 + 3** — Freed from the fear of how she looks, she becomes magnetic
- **2 + 3** — Free enough to finally protect her peace
- **1 + 2 + 3** — *The cinematic angle.* "She walked in without rehearsing her entrance" — the version of her that has integrated all three.

---

> **Two hard constraints govern every output:** the **Depth Principle** below (how to write) and the **5-Question Brand Filter** in §7 (what's even worth writing about). Both must pass.

## 2. The Depth Principle (HARD CONSTRAINT)

> Never describe a feature. Always evoke a memory.

Every line of copy must pass this test: *Does this describe what the product does, or does it put the reader inside a moment she has already lived?*

If it's the first, **rewrite**. The Content Agent runs a depth-critic pass that auto-rejects surface copy and regenerates.

### Worked example

| Layer | Copy |
|---|---|
| Surface (rejected) | *"This dress fits beautifully and makes you look great."* |
| Mid-depth (still rejected) | *"You'll feel more confident in this dress at any event."* |
| **Depth (accepted)** | *"You know that moment you catch yourself in a reflection mid-event and your whole energy drops because nothing feels right on your body — this is what stops that moment from ever happening again."* |

The accepted version doesn't describe a dress. It describes a memory she has had a hundred times, and positions the product as the moment that ends.

### The depth checklist (used by the agent's critic pass)

The copy must:

1. **Name a specific moment, not a general feeling.** Not "you feel uncomfortable" — but "you catch yourself in a reflection mid-event."
2. **Include sensory anchors.** *Fluorescent lights, dressing room mirror, checking reflections, tugging, half-present.*
3. **Acknowledge an interior monologue she's actually had.** *"talking to yourself in a way you would never talk to anyone else"*
4. **End with the product as the exit door.** Not "buy this," but "we built this so that conversation stops."

If any of these are missing → fail → regenerate.

---

## 3. Voice Patterns

Extracted from the copy guide. The Content Agent matches the cadence — does not copy phrases.

### Pet names & framing
- Tender pet names used sparingly: **babe**, **darling**
- "She / her" framing — she sees herself from the outside
- "He" appears only as observer, never possessive — "He noticed before you said a word"

### Sentence structures

- **Long emotional run-ons with em-dash payoff:**
  *"You've stood in a dressing room under fluorescent lights talking to yourself in a way you would never talk to anyone else — we built this so that conversation stops."*

- **Punchy 4–7 word one-liners** for quick hooks and captions:
  *"He noticed before you said a word."*
  *"Free in your body, free in life."*

- **Never the in-between length.** Either tight one-liner or full cinematic immersion. No medium-length filler copy.

### VO cadence (for spoken scripts)

- Present tense
- Short fragments
- Period breaks for breath
- Almost meditative pacing
- Example: *"You know that feeling. Somewhere to be. Nothing feels right. You're already defeated before you walk out the door. That used to be every morning. This changed that. Completely."*

### Banned phrases (off-brand)

- Hype words: "amazing," "incredible," "game-changer," "must-have"
- Hard-sell CTAs: "limited time," "act now," "while supplies last"
- Generic luxury language: "elevate your wardrobe," "premium quality," "timeless elegance"
- Influencer-y exclamations: "obsessed," "iconic," "literally," "stop scrolling"
- Direct address that breaks the spell: "Hey girlies," "POV: when you"
  - (POV is fine in titles/captions, banned in the body of depth copy)

---

## 4. Voice Anchors — Use these as cadence references, don't copy

### Trigger 1 — Appealing to the Opposite Sex
- He noticed before you said a word
- The dress that made him look twice
- Walked in, room shifted, you knew
- He can't explain it, but he feels it
- He brought it up days later, that's the dress
- Soft, feminine, magnetic without even trying babe
- You stopped explaining yourself the moment you walked in

### Trigger 2 — Protecting Herself & Her Energy
- You stop settling in clothes when you stop settling everywhere
- The way you carry yourself protects your own heart first
- When you look right you stop letting people treat you wrong
- Your confidence is armor, this just helps you put it on
- You protect your peace when you stop wearing things that make you feel small
- Soft outside, completely untouchable within

### Trigger 3 — Freedom, Fear & Relief
- Dressed and free before 8am, finally
- No more outfit anxiety stealing your morning
- Liberation looks like a perfect fitting dress
- Stop managing your clothes, start living babe
- Dressed without dread, that is freedom darling

### Depth Anchors (the gold standard)
- "You know that moment you catch yourself in a reflection mid-event and your whole energy drops because nothing feels right on your body — this is what stops that moment from ever happening again."
- "That specific dread of having somewhere important to be and standing in your closet feeling like nothing you own deserves to be there — we built this for that exact morning."
- "You've stood in a dressing room under fluorescent lights talking to yourself in a way you would never talk to anyone else — we built this so that conversation stops."
- "You've talked yourself out of rooms, out of photos, out of moments because of how you felt in what you were wearing — this puts you back in the room."

### VO Anchors (cadence references)

- *Fear to Freedom:* "You know that feeling. Somewhere to be. Nothing feels right. You're already defeated before you walk out the door. That used to be every morning. This changed that. Completely."
- *All Three Combined:* "There is a version of you that walks into a room and just... lands. No anxiety. No adjusting. No disappearing into the corner. She is present. She is soft and she is powerful. He feels it. She feels it. You have always been her. You just needed to feel it on your body first."

---

## 5. Hook Structure (what the Content Agent generates per product)

For every product scoring ≥ 8, the Content Agent emits **5 hooks across a structured trigger map** — not 5 generic angles.

| Slot | Mapping | Purpose |
|---|---|---|
| 1 | Pure Trigger 1 | Opposite-sex magnetism angle |
| 2 | Pure Trigger 2 | Protecting-her-energy angle |
| 3 | Pure Trigger 3 | Freedom/Fear/Relief with depth |
| 4 | Combo 1 + 3 | High-performing combo from the sheet |
| 5 | All three combined | Cinematic, deepest-level |

Plus:
- 1 **caption** (any trigger, max 1 line, hook-led)
- 1 **30-second VO script** in your cadence
- 1 **Spark Ads yes/no + one-line reason**

---

## 6. Niche Definition

**Soft Feminine Lifestyle.**

What's in:
- Dresses (midi, slip, summer, date night, going-out)
- Heels and feminine footwear
- Nightwear and intimates
- Soft luxury bags + jewelry that fit the aesthetic
- Beauty + hair products that support the "look-good" routine (heatless curls fits)
- Bedroom + bath items in the aesthetic (silk pillowcases, robes)

What's out:
- Athleisure, streetwear, edgy/gothic, men's, kids', "boss babe" energy, office wear unless feminine-coded

Apify search keywords (hybrid strategy — broad category coverage + aesthetic bias):

```
# Category-level (wide net — Brand-Fit Gate catches off-brand)
womens fashion
outfit inspo
fashion accessories
home decor
home aesthetic
apartment aesthetic

# Aesthetic bias (keeps the soft luxury feel even at the scrape stage)
soft luxury
clean girl
rich soft girl
cafe aesthetic
```

**Strategy:** cast a wide net at scrape time, let the Brand-Fit Gate (§11) keep us in our lane. The Gate's job is to ensure that even when "womens fashion" pulls in streetwear or "home decor" pulls in industrial aesthetic, none of it reaches scoring. Rejects log to `brand_fit_log` for visibility.

---

## 7. Brand Pillars

**Brand positioning:** *Soft luxury feminine lifestyle.* Fashion is the anchor; everything builds the world around it.

**The mental model the system optimizes for** — never "soft girl lifestyle" (too broad, pulls tangential content). Instead:

> *"Find products a feminine 18–34-year-old woman would realistically save, repost, impulse-buy, decorate with, wear, or romanticize in a soft luxury aesthetic."*

### The 4 monetizable pillars + content ratio

| Pillar | % of content | What belongs here |
|---|---|---|
| **Women's Fashion** (anchor) | **45%** | dresses, slip dresses, midi, knits, soft layering, date-night, cozy cute fits, elevated basics, "rich soft girl" outfits |
| **Women's Fashion Accessories** | **25%** | bags, jewelry, hair, shoes, sunglasses, scarves, hats — anything that completes a feminine look |
| **Feminine Home Decor** | **15%** | candles, vases, art, throw blankets, mirrors, decorative objects, vanity items, gold accents |
| **Feminine Home / Lifestyle Products** | **15%** | bedding, towels, linen, organization, kitchen aesthetics, skincare counter, cafe-aesthetic items, cozy routines |

These are the only categories the Scoring Agent should surface products in. Everything outside this is rejected upstream by the **Brand-Fit Gate** (see §11).

### Supporting themes (woven through the 4 pillars — never standalone)

These aren't pillars, they're *flavors* that color a product or script inside one of the 4 pillars:

- **Self-Upgrade / "Becoming Her"** — when tied to a fashion/accessory/home item that helps her become that girl
- **Travel** — when tied to a fashion/accessory worn while traveling, or home items that romanticize travel
- **Romanticizing life** — the meta-theme that wraps everything
- **Glow-up / discipline but feminine** — the energy behind self-upgrade

What these themes create: community, retention, repostability, emotional loyalty. The pillars sell — these themes *bond*.

### Customer persona — "that girl"

She's *becoming her*. Disciplined but feminine. Wants her life to feel prettier. Romanticizes her routines. Cares about how she carries herself. Soft motivation, not hustle culture. Confidence without aggression. Aesthetic but emotionally honest. Soft luxury *but attainable* — she's not trying to be unreachable, she's trying to be the version of herself that finally feels right.

### The 5-Question Brand Filter — voice + presentation guardrail (HARD CONSTRAINT)

**This is not a product filter.** Products get surfaced by the scoring rubric — what trends, what's selling, what creators are repeating. This filter governs **how we present those products** so the voice stays on brand. Every piece of copy the Content Agent generates (hooks, captions, CTAs, VO scripts) must answer YES to at least 3 of these:

1. **Does this make life prettier?** — does the framing add aesthetic pleasure
2. **Does this make her feel more confident?** — does the framing affirm her, not diminish her
3. **Does this help her become "that girl"?** — does it connect to self-becoming, not just product features
4. **Does this feel emotionally aesthetic?** — does it feel soft, beautiful, emotionally honest
5. **Does this feel soft luxury but attainable?** — does it avoid both hype AND unreachable luxury

The Content Agent's critic pass checks every generated hook against these questions. Anything scoring under 3 gets rewritten. The Scoring Agent does NOT use these questions to filter or downrank products — that would shrink the product feed unnecessarily. The job here is ensuring on-brand *delivery* of whatever we surface.

**Example:** a heatless curling set isn't rejected for not being "soft luxury." Instead, we make sure the copy frames it as soft luxury, confidence-building, life-prettier — "the morning where your hair finally looked like you wanted it to" rather than "this $20 tool replaces your curling iron."

### Brand DON'Ts

- Hustle / boss-babe energy
- Aggressive masculine language
- Unattainable luxury (private jet, $10K bags) — we are soft luxury *attainable*
- Trend-chasing without aesthetic fit (no streetwear, no edgy/gothic, no "girlboss")
- Body-negative framing, even by implication
- Hard-sell urgency ("act now", "limited", "running out")
- Anything that breaks the soft, pretty, emotional register

---

## 8. Trigger Weights

For initial scoring bias and hook ordering. These tell the system how heavily to lean on each trigger when there's a choice.

| Trigger | Weight | Why |
|---|---|---|
| Freedom / Fear / Relief | 40% | The depth lever. Where conversion lives. |
| Opposite Sex | 30% | Strong visceral pull, second-strongest in the sheet |
| Protecting Herself | 30% | Foundational, but lands harder when combined |

*Adjust after first week of real data.*

---

## 9. Content Agent System Prompt (v2 — uses this profile)

When this profile is wired into the Content Agent, the system prompt becomes:

```
You write copy for [BRAND_NAME], a soft feminine lifestyle brand.

You write in the brand's exact voice (see voice patterns and anchors below).
You apply the 3 psychology triggers and their combinations.
You obey the depth principle as a hard constraint: never describe a feature, always evoke a memory.

VOICE: [injected from §3]
TRIGGERS: [injected from §1]
DEPTH PRINCIPLE: [injected from §2]
ANCHORS: [injected from §4]

For the given product, emit JSON:
{
  "hooks": [
    { "slot": 1, "trigger_map": "1",       "copy": "..." },
    { "slot": 2, "trigger_map": "2",       "copy": "..." },
    { "slot": 3, "trigger_map": "3",       "copy": "..." },
    { "slot": 4, "trigger_map": "1+3",     "copy": "..." },
    { "slot": 5, "trigger_map": "1+2+3",   "copy": "..." }
  ],
  "caption": "...",
  "vo_script": "...",
  "spark_recommendation": "YES|NO: ..."
}

After generating, run your own depth check on each hook (slot 3 and 5 especially):
- Does it name a specific moment, not a general feeling?
- Sensory anchors present?
- Acknowledges an interior monologue she has had?
- Ends with the product as the exit door, not as a sale?

If any fail, rewrite that hook only. Return only the final JSON.
```

---

## 10. Schema for `brand_profile` table (Supabase)

```sql
create table brand_profile (
  user_id uuid primary key references auth.users,
  brand_name text,
  niche text not null,                  -- 'soft feminine lifestyle'
  triggers jsonb not null,              -- the 3 triggers with weights
  voice_patterns jsonb not null,        -- sentence structures, banned phrases
  pet_names text[],
  banned_phrases text[],
  depth_principle text not null,
  voice_anchors jsonb not null,         -- one-liners + depth + VO grouped by trigger
  hook_structure jsonb not null,        -- the 5-slot trigger map
  customer_persona text,
  pillars text[],                       -- filled when pillars PDF is parsed
  updated_at timestamptz default now()
);

alter table brand_profile enable row level security;
create policy "brand_profile own" on brand_profile for all using (auth.uid() = user_id);
```

Seeded from this markdown file via a `scripts/seed-brand-profile.ts` script (Phase 2 build step).

---

---

## 11. The Brand-Fit Gate (HARD CONSTRAINT — runs before scoring)

**Purpose:** stop tangential, off-brand products from ever reaching the Scoring Agent. The Gate is a classifier that runs AFTER extraction and BEFORE virality scoring, on every scraped product.

### Where it sits in the pipeline

```
1. Apify scrape
2. Extraction Agent  (normalize)
3. Brand-Fit Gate    ← NEW — classify + reject
4. Scoring Agent     (only Strong Fit + Possible Fit reach here)
5. Content Agent     (only winners get scripts)
6. Audience pairing + push
```

### The core question the Gate answers

> *"Would this product appear naturally on a soft luxury feminine TikTok page that targets a feminine 18–34-year-old woman who saves, reposts, impulse-buys, decorates with, wears, or romanticizes products in a soft luxury aesthetic?"*

If the answer isn't a confident yes — reject.

### Positive keyword cluster (boosts fit)

```
soft luxury · feminine aesthetic · cozy aesthetic · neutral decor · apartment aesthetic
clean girl · soft girl · romanticize your life · elevated basics · classy feminine
elegant lifestyle · cozy home · vanity aesthetic · gold accents · self-care aesthetic
pretty essentials · rich soft girl · pinterest aesthetic · minimalist feminine
cafe aesthetic · linen · glow-up · everyday luxury
```

### Negative keyword cluster (lightweight pre-reject before AI call)

```
gothic · grunge · tactical · masculine · streetwear · anime · gamer
industrial · cyberpunk · meme · novelty · prank · rave · emo
dark aesthetic · horror · oversized men · sports memorabilia
LED gamer room · aggressive gym culture
```

If a product's name or description matches ANY of these, the Gate hard-rejects it without spending a Claude call. (Token-cost optimization.)

### Visual aesthetic indicators (boosts fit)

- Neutral palettes (cream, beige, taupe, soft blush, sage, ivory, gold, soft white)
- Natural materials (linen, silk, wool, ceramic, wood, marble)
- Soft lighting / warm tones
- Minimalist composition
- Looks photographed in soft, romantic light
- "Pinterest-pinnable" visual quality

### Product category ALLOWLIST

- **Fashion:** dresses, midi/slip/maxi/mini, knits, blouses, soft layering pieces, sleepwear/nightwear, swimwear (modest/feminine), date-night outfits
- **Accessories:** bags (crossbody, shoulder, tote), jewelry (gold, dainty, pearl), hair (claw clips, ribbons, scrunchies, headbands), shoes (heels, ballet flats, sandals, mules), sunglasses, scarves, hats
- **Home Decor:** candles, vases, mirrors, art prints, throw blankets, decorative objects, vanity items, wall hooks, picture frames
- **Home/Lifestyle:** bedding, linen sheets, towels, bath items, kitchen aesthetics (mugs, cups, plates, cutting boards), organization items, skincare counter items, cafe-style items, journals, planners

### Product category BLOCKLIST (hard reject)

- Men's clothing or men's-targeted products
- Children's products
- Gaming gear, anime merch, LED setups
- Tactical, military, industrial aesthetic
- Gothic, dark, edgy, streetwear
- Generic Amazon-style products (no aesthetic distinctiveness)
- Meme / novelty / prank products
- Sports memorabilia, gym equipment, aggressive fitness gear
- Tech gadgets that aren't aesthetic
- Anything with poor visual presentation (bad photos, low-quality renders)
- Products over ~$500 (unattainable luxury)
- Products under ~$5 (dropshipping junk)

### The Gate's scoring dimensions (each 0.0 – 1.0)

- `aesthetic_alignment` — matches soft luxury feminine aesthetic visually
- `femininity_alignment` — clearly feminine-coded, not unisex, not masculine
- `emotional_resonance` — creates "I need this" reaction in target audience
- `visual_tiktok_potential` — photographs/films beautifully in short-form
- `creator_brand_compatibility` — a soft luxury feminine creator would naturally feature it
- `repost_save_potential` — viewers would save or repost it
- `naturalness_on_feed` — answers the core question above
- `looks_expensive` — feels elevated/premium even if affordable

### Classification rules

| Class | Criteria |
|---|---|
| **strong_fit** | average score ≥ 0.75 AND `femininity_alignment` ≥ 0.7 AND zero rejection flags |
| **possible_fit** | average score 0.5–0.75, OR `aesthetic_alignment` ≥ 0.7 with one weaker dimension |
| **reject** | average score < 0.5, OR any rejection flag triggered, OR pre-filter caught a negative keyword |

**Only `strong_fit` and `possible_fit` move forward to the Scoring Agent.** Rejects are logged but never scored.

### JSON output shape

```json
{
  "fit_classification": "strong_fit" | "possible_fit" | "reject",
  "fit_confidence": 0.0,
  "pillar": "fashion" | "accessories" | "home_decor" | "home_lifestyle" | null,
  "scores": {
    "aesthetic_alignment": 0.0,
    "femininity_alignment": 0.0,
    "emotional_resonance": 0.0,
    "visual_tiktok_potential": 0.0,
    "creator_brand_compatibility": 0.0,
    "repost_save_potential": 0.0,
    "naturalness_on_feed": 0.0,
    "looks_expensive": 0.0
  },
  "rejection_flags": ["..."],
  "reason": "one-sentence explanation"
}
```

### Bias toward products that...

- Look expensive (even if affordable)
- Feel emotionally comforting
- Create aspiration
- Trigger "I need this" reactions
- Work well in short-form TikTok content
- Fit a feminine soft luxury creator brand

### Token-cost optimization rules

1. **Commercial filters first (cheapest gate).** Per-brand thresholds for commission, price, units sold, creator count — runs in pure JS on the extracted product data, no AI, no DB query. Reject products that fall outside the brand's commercial criteria. (See "Commercial filters" below.)
2. **Lightweight negative-keyword pre-filter second.** Text scan for negative keywords on the product name + description + tags. Match → reject immediately, no Claude call.
3. **AI Brand-Fit Gate third.** Only on products that survive the first two gates. Use Haiku (cheap, fast — this is classification, not creative generation).
4. **Cache results by `normalized_name`.** If the same product appears in multiple scrape sources within 7 days, reuse the prior classification.

Combined funnel: ~300 raw → ~150 after commercial filters → ~80 after pre-filter → ~30 reach Haiku Gate → ~15 pass → top 20 scored.

### Commercial filters (per-brand, configurable in Brand Settings UI)

Editable per brand without code changes. Stored in `brand_fit_config.product_filters`. Leave any field blank to disable that constraint.

| Filter | What it does |
|---|---|
| `commission_percent_min` | Minimum commission rate as a percent (e.g., 5 = 5%) |
| `commission_dollars_min` | Minimum commission in absolute dollars (e.g., 3.50). Calculated as `price × commission_rate%`. |
| `price_min_usd` | Minimum product price (e.g., 5) — keeps out dropshipping junk |
| `price_max_usd` | Maximum product price (e.g., 500) — keeps out unattainable luxury |
| `units_sold_min` | Minimum lifetime units sold (e.g., 1000) — proves the product actually sells |
| `units_sold_max` | Maximum units sold (e.g., 10000) — filters out saturated/dying products |
| `creator_count_30d_min` | Minimum distinct creators using it in the last 30 days |
| `creator_count_30d_max` | Maximum creators (e.g., 450) — caps saturation so we don't promote products everyone is already on |

**Recommended starting values for Soft Luxury Feminine:**

```
commission_dollars_min: 3.50
price_min_usd: 5
price_max_usd: 500
units_sold_min: 1000
units_sold_max: 10000
creator_count_30d_max: 450
```

These are seeded as the brand's defaults. Adjust in the Brand Settings UI as you learn what's converting for you.

---

*Living document — update as you refine voice, add anchors, or evolve the niche.*
