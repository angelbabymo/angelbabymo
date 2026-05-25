'use client';
import { useState, KeyboardEvent } from 'react';
import { ChevronRight, ChevronLeft, X, Plus, Check } from 'lucide-react';

export interface BrandProfile {
  audience: {
    description: string;
    age_range: string;
    interests: string[];
    identity: string;
  };
  voice: {
    tone: string;
    pet_names: string[];
    signature_phrases: string[];
    avoid_phrases: string[];
  };
  aesthetic: {
    vibe_words: string[];
    pillars: string[];
    inspiration: string;
  };
  brand_fit: {
    on_brand: string[];
    off_brand: string[];
  };
  commercial: {
    min_commission_usd: number;
    min_price_usd: number;
    max_price_usd: number;
    min_units_sold: number;
    max_creator_count: number;
  };
}

export const defaultProfile = (): BrandProfile => ({
  audience:   { description: '', age_range: '18-35', interests: [], identity: '' },
  voice:      { tone: '', pet_names: [], signature_phrases: [], avoid_phrases: [] },
  aesthetic:  { vibe_words: [], pillars: [], inspiration: '' },
  brand_fit:  { on_brand: [], off_brand: [] },
  commercial: { min_commission_usd: 2, min_price_usd: 5, max_price_usd: 500, min_units_sold: 500, max_creator_count: 450 },
});

const INTEREST_OPTIONS = [
  // Lifestyle & Fashion
  'Fashion','Accessories','Beauty','Skincare','Wellness','Lifestyle','Cozy Living',
  // Home
  'Home Decor','Home Organization','DIY & Crafts','Gardening',
  // Food & Health
  'Food & Cooking','Health & Nutrition','Mental Health','Self-Development',
  // Fitness & Sports
  'Fitness','Sports & Athletics','Yoga & Mindfulness',
  // Tech & Gaming
  'Electronics & Tech','Gaming','Photography & Film',
  // Outdoors
  'Outdoor & Adventure','Survival & Prepping','Hunting & Fishing','Camping',
  // Life stages
  'Parenting & Baby','Pets & Animals',
  // Other
  'Travel','Vehicles & Cars','Finance & Money','Music','Art & Design',
  'Books & Education','Spirituality','Comedy & Entertainment',
];
const TONE_OPTIONS = [
  'Elevated & aspirational','Warm & conversational','Bold & direct',
  'Soft & encouraging','Playful & fun','Educational & informative',
  'Rugged & authentic','Energetic & hype',
];
const VIBE_OPTIONS = [
  // Soft & Feminine
  'Soft','Feminine','Coquette','Clean girl','Romantic','Delicate','Girly','Whimsical','Dreamy',
  // Luxury & Elevated
  'Luxury','Old money','Quiet luxury','Elevated','Elegant','Sophisticated','Editorial','Polished','Timeless',
  // Aesthetic / Trendy
  'Aesthetic','Minimal','Y2K','Preppy','Dark academia','Cottagecore','Fairycore','Mob wife','Cherry cola',
  // Coastal / Nature
  'Coastal','Boho','Earthy/Natural','Tropical','Organic','Farmhouse','Cottagecore',
  // Modern / Urban
  'Modern','Streetwear','Athleisure','Sporty','Bold','Graphic','Vibrant','Maximalist','Eclectic',
  // Tech / Edge
  'Techwear','Cyberpunk','Industrial','Dark','Moody','Grunge','Edgy',
  // Outdoor / Rugged
  'Rugged','Tactical','Gorpcore','Western/Cowgirl','Adventurous','Raw & Authentic','Workwear',
  // Retro / Cultural
  'Vintage/Retro','Nostalgic','Cinematic','Mid-century','Scandi','Japandi','Mediterranean',
  // Neutral / Clean
  'Neutral','Clean & Simple','Classic','Understated','Cozy',
];
const PILLAR_OPTIONS = [
  // Fashion & Beauty
  'Fashion','Accessories','Beauty','Skincare','Hair care','Nail & grooming','Men\'s Fashion','Streetwear','Luxury fashion',
  // Home & Lifestyle
  'Home Decor','Home Organization','Interior Design','Cozy Living','Farmhouse / Rustic','Home Lifestyle',
  // Food & Drink
  'Cooking & Recipes','Meal Prep','Baking','Coffee & Drinks','Health & Nutrition','Supplements & Wellness',
  // Fitness & Sports
  'Fitness & Gym','Sports & Athletics','Yoga & Mindfulness','Outdoor Workouts','Weight Loss Journey','Running',
  // Tech & Gaming
  'Electronics & Tech','Gaming','Smart Home','Photography & Film','Drones & Aerial','AI & Software',
  // Outdoors & Survival
  'Outdoor & Adventure','Survival & Prepping','Hunting & Fishing','Camping & Hiking','Off-Road & Overlanding','Bushcraft',
  // Family & Pets
  'Pets & Animals','Baby & Kids','Parenting Tips','Family Lifestyle','Pregnancy & Postpartum',
  // Home Projects
  'DIY & Crafts','Gardening & Plants','Home Improvement','Woodworking','Sewing & Textiles',
  // Vehicle & Hobby
  'Vehicles & Cars','Motorcycles','Detailing & Mods','Music & Audio','Art & Design','Collecting',
  // Personal Development
  'Finance & Investing','Business & Entrepreneurship','Career & Productivity','Mental Health & Mindset',
  'Self-Development','Study & Education','Spirituality',
  // Content formats
  'Unboxing & Reviews','How-to & Tutorials','Day in the Life','GRWM','OOTD','Hauls','Tips & Hacks',
  'Transformation','Behind the Scenes','Storytelling','Comedy & Entertainment',
  // Travel & Seasonal
  'Travel','Seasonal & Holiday','Local & Community',
];
const ON_BRAND_OPTIONS = [
  // Women's Fashion & Accessories
  "Women's fashion","Dresses & skirts","Tops & blouses","Loungewear & pajamas","Swimwear","Lingerie & intimates",
  "Shoes & footwear","Bags & purses","Jewelry & earrings","Fine jewelry","Watches","Sunglasses & eyewear",
  "Hair accessories","Scarves & wraps","Luxury basics","Cozy lifestyle",
  // Men's Fashion
  "Men's fashion","Men's streetwear","Men's workwear","Men's accessories",
  // Beauty & Personal Care
  "Beauty & skincare","Makeup & cosmetics","Skincare tools & devices","Hair care products",
  "Hair styling tools","Nail products & gel kits","Perfume & fragrance","Teeth whitening & dental",
  "Bath & body products","Feminine hygiene & wellness","Grooming & personal care",
  // Home & Living
  "Soft home goods","Home decor & accents","Candles & home fragrance","Bedding & linens",
  "Rugs & carpets","Wall art & prints","Lighting & lamps","Furniture & accent pieces",
  "Home organization & storage","Cleaning products","Laundry products","Air purifiers & humidifiers",
  // Kitchen & Food
  "Kitchen tools & appliances","Cookware & bakeware","Coffee makers & accessories",
  "Air fryers & instant pots","Meal prep containers","Specialty & gourmet food",
  "Snacks & healthy foods","Drinks & beverages","Spices & condiments",
  // Health & Fitness
  "Fitness equipment","Resistance bands & weights","Yoga mats & blocks","Gym bags & accessories",
  "Sports gear & apparel","Running shoes & gear","Cycling gear","Swimming gear",
  "Health & wellness supplements","Protein & pre-workout","Vitamins & minerals","Weight loss products",
  "Massage & recovery tools","Martial arts equipment",
  // Tech & Electronics
  "Electronics & gadgets","Smartphones & accessories","Phone cases","Chargers & cables",
  "Headphones & earbuds","Speakers & audio","Smart home devices","Wearables & smartwatches",
  "Keyboards & peripherals","Monitors & displays","Gaming gear & peripherals",
  // Photography & Content Creation
  "Photography & camera gear","Lenses & filters","Tripods & stabilizers","Lighting for content",
  "Podcasting & streaming gear","Drones","Action cameras",
  // Outdoors & Adventure
  "Outdoor & survival gear","Camping & hiking gear","Hunting & fishing gear","Archery equipment",
  "Knives & multi-tools","Tactical equipment","Emergency preparedness kits",
  "Water filtration & hydration","Backpacks & daypacks","Off-road & overlanding gear",
  "Solar & off-grid power","Bushcraft & woodsman tools",
  // Garden & DIY
  "Gardening tools & supplies","Plant pots & decor","Seeds & grow kits",
  "Power tools","Hand tools & hardware","DIY tools & supplies","Home improvement supplies",
  // Pets & Animals
  "Pet products & supplies","Pet food & treats","Pet grooming tools",
  "Leashes, collars & harnesses","Pet clothing & accessories","Aquarium & reptile supplies",
  // Baby & Family
  "Baby & kids products","Baby clothing & gear","Kids toys & educational toys",
  "Parenting essentials","Pregnancy & maternity products","Family organization",
  // Vehicles & Transportation
  "Car accessories & organizers","Car cleaning & detailing","Truck & SUV accessories",
  "Motorcycle gear & accessories","Electric bikes & scooters",
  // Hobbies & Crafts
  "Art & craft supplies","Candle & soap making","Embroidery & knitting","Sewing & textiles",
  "Scrapbooking & journaling","Board games & puzzles","Collectibles & figures","Sports memorabilia",
  // Music & Entertainment
  "Musical instruments","DJ & studio equipment","Vinyl & audio collectibles",
  // Travel & Luggage
  "Travel accessories","Luggage & bags","Packing & organization","Travel tech & gadgets",
  // Books & Learning
  "Books & educational materials","Journals & planners","Office supplies & stationery",
  // Eco & Sustainable
  "Eco-friendly & sustainable products","Reusable & zero-waste","Organic & natural products",
];
const OFF_BRAND_OPTIONS = [
  // Aesthetic / Quality mismatches
  "Gothic / dark aesthetic","Loud / neon colors","Maximalist clutter","Ultra-cheap / fast fashion",
  "Counterfeit & knock-off products","Low-quality dropshipped generics","No-brand mystery items",
  // Health & Safety concerns
  "Unverified health claim products","Unapproved cosmetics & ingestibles","Expired or recalled products",
  "Pharmaceutical drugs","Prescription-only medical devices","Weight loss drugs & stimulants",
  // Legal / Platform restrictions
  "Adult / NSFW content","Tobacco & vaping products","Alcohol (direct sale)","Gambling products",
  "Regulated firearms & weapons","Ammunition & explosives","Hazardous chemicals & materials",
  "Stolen or gray-market goods","Counterfeit branded goods",
  // Audience mismatch
  "B2B / enterprise software","Highly technical industrial tools","Heavy machinery & construction equipment",
  "Items requiring professional installation","Products needing age verification",
  "Live animals","Perishable food without proper handling",
  // Business model mismatch
  "MLM / pyramid scheme products","Digital subscriptions & services","Real estate & financial instruments",
  "Local services (non-shippable)","Handmade with no fulfillment scale",
  // Category mismatch
  "Controversial political products","Religious products (if off-brand)","Single-use plastics (if eco brand)",
  "Men's products (if women-only brand)","Women's products (if men-only brand)",
  "Children's products (if adult brand)","Adult products (if family brand)",
];

interface Props {
  initialName?: string;
  initialSlug?: string;
  initialProfile?: BrandProfile;
  onComplete: (data: { name: string; slug: string; description: string; profile: BrandProfile }) => Promise<void>;
  saving?: boolean;
}

export function BrandSetupWizard({ initialName = '', initialSlug = '', initialProfile, onComplete, saving }: Props) {
  const [step, setStep]     = useState(0);
  const [name, setName]     = useState(initialName);
  const [slug, setSlug]     = useState(initialSlug);
  const [profile, setProfile] = useState<BrandProfile>(initialProfile ?? defaultProfile());

  const autoSlug = (n: string) => n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const patch = (section: keyof BrandProfile, field: string, value: any) =>
    setProfile(p => ({ ...p, [section]: { ...(p[section] as any), [field]: value } }));

  const STEPS = [
    { title: 'The Basics',         emoji: '🏷️' },
    { title: 'Your Audience',      emoji: '👥' },
    { title: 'Brand Voice',        emoji: '🗣️' },
    { title: 'Aesthetic & Pillars',emoji: '✨' },
    { title: 'What Fits',          emoji: '🎯' },
    { title: 'Commercial Filters', emoji: '💰' },
    { title: 'Review & Create',    emoji: '🚀' },
  ];

  const canAdvance = () => {
    if (step === 0) return name.trim().length > 0 && slug.trim().length > 0;
    if (step === 1) return profile.audience.description.trim().length > 0;
    if (step === 2) return profile.voice.tone.length > 0;
    return true;
  };

  const handleFinish = async () => {
    const desc = [
      profile.audience.description,
      profile.aesthetic.vibe_words.length ? `Aesthetic: ${profile.aesthetic.vibe_words.join(', ')}.` : '',
      profile.aesthetic.pillars.length ? `Pillars: ${profile.aesthetic.pillars.join(', ')}.` : '',
    ].filter(Boolean).join(' ');
    await onComplete({ name, slug, description: desc, profile });
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease_both]">

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
            Step {step + 1} of {STEPS.length}
          </p>
          <p className="text-[12px] font-semibold" style={{ color: 'var(--text-2)' }}>
            {STEPS[step].emoji} {STEPS[step].title}
          </p>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: 'var(--red)' }} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex flex-col gap-5">
        {step === 0 && <StepBasics name={name} slug={slug} onName={v => { setName(v); setSlug(autoSlug(v)); }} onSlug={setSlug} />}
        {step === 1 && <StepAudience profile={profile} patch={patch} />}
        {step === 2 && <StepVoice profile={profile} patch={patch} />}
        {step === 3 && <StepAesthetic profile={profile} patch={patch} />}
        {step === 4 && <StepBrandFit profile={profile} patch={patch} />}
        {step === 5 && <StepCommercial profile={profile} patch={patch} />}
        {step === 6 && <StepReview name={name} slug={slug} profile={profile} />}
      </div>

      {/* Nav */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-medium"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            <ChevronLeft size={14} /> Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--red)' }}>
            Continue <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={handleFinish} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50"
            style={{ background: saving ? 'var(--surface-2)' : 'var(--red)' }}>
            {saving ? 'Creating…' : '🚀 Create Brand'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Step 0 — Basics ───────────────────────────────────────────────────── */
function StepBasics({ name, slug, onName, onSlug }: { name: string; slug: string; onName: (v: string) => void; onSlug: (v: string) => void }) {
  return (
    <>
      <Field label="Brand Name" value={name} onChange={onName} placeholder="e.g. Soft Luxury Feminine" />
      <Field label="URL Slug" value={slug} onChange={onSlug} placeholder="soft-luxury-feminine"
        hint="Letters, numbers, hyphens only. Used in URLs." />
    </>
  );
}

/* ─── Step 1 — Audience ─────────────────────────────────────────────────── */
function StepAudience({ profile, patch }: StepProps) {
  return (
    <>
      <Field
        label="Who is your audience? *"
        value={profile.audience.description}
        onChange={v => patch('audience', 'description', v)}
        placeholder="e.g. Women 22–35 who aspire to a soft luxury lifestyle — they're building their dream apartment, leveling up their wardrobe, and curating an aesthetic life on TikTok."
        multiline
      />
      <Field
        label="Age range"
        value={profile.audience.age_range}
        onChange={v => patch('audience', 'age_range', v)}
        placeholder="e.g. 22–35"
      />
      <ChipSelect
        label="Top interests (select all that apply)"
        options={INTEREST_OPTIONS}
        selected={profile.audience.interests}
        onToggle={v => patch('audience', 'interests', toggle(profile.audience.interests, v))}
      />
      <Field
        label="How does your audience see themselves?"
        value={profile.audience.identity}
        onChange={v => patch('audience', 'identity', v)}
        placeholder="e.g. The it-girl who has her life together, moves intentionally, and only buys things that earn their place in her space."
        multiline
      />
    </>
  );
}

/* ─── Step 2 — Voice ────────────────────────────────────────────────────── */
function StepVoice({ profile, patch }: StepProps) {
  return (
    <>
      <ChipSelect
        label="Brand tone *"
        options={TONE_OPTIONS}
        selected={[profile.voice.tone]}
        onToggle={v => patch('voice', 'tone', profile.voice.tone === v ? '' : v)}
        single
      />
      <TagInput
        label="Pet names for your audience"
        hint="e.g. babe, darling, girl, love"
        tags={profile.voice.pet_names}
        onChange={v => patch('voice', 'pet_names', v)}
        placeholder="Type and press Enter"
      />
      <TagInput
        label="Signature phrases you use"
        hint="e.g. 'this is the vibe', 'soft life', 'the aesthetic'"
        tags={profile.voice.signature_phrases}
        onChange={v => patch('voice', 'signature_phrases', v)}
        placeholder="Type and press Enter"
      />
      <TagInput
        label="Words/phrases to NEVER use"
        hint="e.g. 'affordable', 'cheap', 'guys', 'literally obsessed'"
        tags={profile.voice.avoid_phrases}
        onChange={v => patch('voice', 'avoid_phrases', v)}
        placeholder="Type and press Enter"
      />
    </>
  );
}

/* ─── Step 3 — Aesthetic ────────────────────────────────────────────────── */
function StepAesthetic({ profile, patch }: StepProps) {
  return (
    <>
      <ChipSelect
        label="Vibe words (select all that fit)"
        options={VIBE_OPTIONS}
        selected={profile.aesthetic.vibe_words}
        onToggle={v => patch('aesthetic', 'vibe_words', toggle(profile.aesthetic.vibe_words, v))}
      />
      <ChipSelect
        label="Content pillars"
        options={PILLAR_OPTIONS}
        selected={profile.aesthetic.pillars}
        onToggle={v => patch('aesthetic', 'pillars', toggle(profile.aesthetic.pillars, v))}
      />
      <Field
        label="Accounts or creators that inspire your aesthetic"
        value={profile.aesthetic.inspiration}
        onChange={v => patch('aesthetic', 'inspiration', v)}
        placeholder="e.g. Sofia Richie, Matilda Djerf, Paige Lorenze — clean, soft, elevated."
        multiline
      />
    </>
  );
}

/* ─── Step 4 — Brand Fit ────────────────────────────────────────────────── */
function StepBrandFit({ profile, patch }: StepProps) {
  return (
    <>
      <ChipSelect
        label="Product types that ARE on-brand"
        options={ON_BRAND_OPTIONS}
        selected={profile.brand_fit.on_brand}
        onToggle={v => patch('brand_fit', 'on_brand', toggle(profile.brand_fit.on_brand, v))}
      />
      <TagInput
        label="Add your own on-brand categories"
        tags={[]}
        onChange={v => patch('brand_fit', 'on_brand', [...profile.brand_fit.on_brand, ...v])}
        placeholder="Type and press Enter"
      />
      <ChipSelect
        label="Product types that are OFF-brand (to exclude)"
        options={OFF_BRAND_OPTIONS}
        selected={profile.brand_fit.off_brand}
        onToggle={v => patch('brand_fit', 'off_brand', toggle(profile.brand_fit.off_brand, v))}
      />
      <TagInput
        label="Add your own off-brand exclusions"
        tags={[]}
        onChange={v => patch('brand_fit', 'off_brand', [...profile.brand_fit.off_brand, ...v])}
        placeholder="Type and press Enter"
      />
    </>
  );
}

/* ─── Step 5 — Commercial ───────────────────────────────────────────────── */
function StepCommercial({ profile, patch }: StepProps) {
  const c = profile.commercial;
  return (
    <>
      <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
        These filters remove products before the AI even looks at them — keeping your feed clean and profitable.
      </p>
      <NumberField label="Minimum commission earned ($)" value={c.min_commission_usd} min={0} max={50} step={0.25} prefix="$"
        onChange={v => patch('commercial', 'min_commission_usd', v)} hint="Products that pay less than this per sale are skipped. Recommended: $2–$5" />
      <div className="grid grid-cols-2 gap-3">
        <NumberField label="Min price ($)" value={c.min_price_usd} min={0} max={1000} step={1}
          onChange={v => patch('commercial', 'min_price_usd', v)} />
        <NumberField label="Max price ($)" value={c.max_price_usd} min={0} max={2000} step={10}
          onChange={v => patch('commercial', 'max_price_usd', v)} />
      </div>
      <NumberField label="Min units sold (lifetime)" value={c.min_units_sold} min={0} max={50000} step={100}
        onChange={v => patch('commercial', 'min_units_sold', v)} hint="Filters out unproven products. Recommended: 500–1000" />
      <NumberField label="Max creator count (30 days)" value={c.max_creator_count} min={0} max={5000} step={50}
        onChange={v => patch('commercial', 'max_creator_count', v)} hint="Avoids oversaturated products. Recommended: 450" />
    </>
  );
}

/* ─── Step 6 — Review ───────────────────────────────────────────────────── */
function StepReview({ name, slug, profile: p }: { name: string; slug: string; profile: BrandProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <ReviewSection title="Brand" items={[{ label: 'Name', value: name }, { label: 'Slug', value: slug }]} />
      <ReviewSection title="Audience" items={[
        { label: 'Who', value: p.audience.description },
        { label: 'Age', value: p.audience.age_range },
        { label: 'Interests', value: p.audience.interests.join(', ') || '—' },
      ]} />
      <ReviewSection title="Voice" items={[
        { label: 'Tone', value: p.voice.tone || '—' },
        { label: 'Pet names', value: p.voice.pet_names.join(', ') || '—' },
        { label: 'Avoid', value: p.voice.avoid_phrases.join(', ') || '—' },
      ]} />
      <ReviewSection title="Aesthetic" items={[
        { label: 'Vibes', value: p.aesthetic.vibe_words.join(', ') || '—' },
        { label: 'Pillars', value: p.aesthetic.pillars.join(', ') || '—' },
      ]} />
      <ReviewSection title="Commercial Filters" items={[
        { label: 'Min commission', value: `$${p.commercial.min_commission_usd} per sale` },
        { label: 'Price range', value: `$${p.commercial.min_price_usd} – $${p.commercial.max_price_usd}` },
        { label: 'Min units sold', value: p.commercial.min_units_sold.toLocaleString() },
        { label: 'Max creators', value: p.commercial.max_creator_count.toLocaleString() },
      ]} />
    </div>
  );
}

/* ─── Shared UI primitives ──────────────────────────────────────────────── */

type StepProps = { profile: BrandProfile; patch: (s: keyof BrandProfile, f: string, v: any) => void };

function toggle(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function Field({ label, value, onChange, placeholder, hint, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; multiline?: boolean;
}) {
  const base = {
    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
  };
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>{label}</label>
      {multiline
        ? <textarea rows={3} className="w-full rounded-xl px-4 py-3 text-[13px] outline-none resize-none" style={base}
            value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input className="w-full rounded-xl px-4 py-3 text-[13px] outline-none" style={base}
            value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
      {hint && <p className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>{hint}</p>}
    </div>
  );
}

function ChipSelect({ label, options, selected, onToggle, single }: {
  label: string; options: string[]; selected: string[]; onToggle: (v: string) => void; single?: boolean;
}) {
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button key={opt} onClick={() => onToggle(opt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={{
                background: active ? 'var(--red)' : 'var(--surface-2)',
                border: `1px solid ${active ? 'var(--red)' : 'var(--border)'}`,
                color: active ? 'white' : 'var(--text-2)',
              }}>
              {active && <Check size={10} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TagInput({ label, tags, onChange, placeholder, hint }: {
  label: string; tags: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string;
}) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim().toLowerCase();
    if (!v || tags.includes(v)) { setInput(''); return; }
    onChange([...tags, v]);
    setInput('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>{label}</label>
      {hint && <p className="text-[11px] mb-2" style={{ color: 'var(--text-3)' }}>{hint}</p>}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))}><X size={9} style={{ color: 'var(--text-3)' }} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 rounded-xl px-3 py-2 text-[12px] outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} />
        <button onClick={add} className="px-3 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

function NumberField({ label, value, min, max, step, onChange, hint, prefix }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; hint?: string; prefix?: string;
}) {
  const display = prefix ? `${prefix}${value.toFixed(step < 1 ? 2 : 0)}` : value.toLocaleString();
  return (
    <div>
      <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>{label}</label>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-[var(--red)]" style={{ accentColor: 'var(--red)' }} />
        <span className="font-mono text-[13px] font-bold w-20 text-right" style={{ color: 'var(--text)' }}>{display}</span>
      </div>
      {hint && <p className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>{hint}</p>}
    </div>
  );
}

function ReviewSection({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="font-mono text-[9px] tracking-[2px] uppercase mb-1" style={{ color: 'var(--text-3)' }}>{title}</p>
      {items.map(({ label, value }) => (
        <div key={label} className="flex gap-2 text-[12px]">
          <span className="w-28 shrink-0" style={{ color: 'var(--text-3)' }}>{label}</span>
          <span style={{ color: 'var(--text-2)' }}>{value || '—'}</span>
        </div>
      ))}
    </div>
  );
}
