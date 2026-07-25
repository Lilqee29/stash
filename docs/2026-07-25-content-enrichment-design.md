# Content Enrichment Pipeline — Design Spec

**Date:** 2026-07-25
**Status:** Approved
**Phase:** 1 (Video + Generic), Phase 2 (Recipe, Motion Design, Comparison)

---

## Overview

When a user saves a link/video to Stash, automatically analyze it using Gemini and generate a type-specific enrichment card instead of a generic bookmark. Enrichment runs in the background so saves are instant.

---

## Architecture

### Flow

```
User saves URL (PasteUrlModal / Share Extension)
  → addSave() runs instantly (optimistic UI)
  → Save appears in home grid immediately (generic card)
  → Client fires POST to /enrich-with-gemini edge function (fire-and-forget)
  → Edge function:
      1. Fetches page HTML (og:tags + text snippet)
      2. Sends URL + metadata to Gemini with structured JSON schema
      3. Gets back classified + enriched JSON
      4. Stores in saves.enrichment column via Supabase client
  → Client re-fetches save on detail screen open → renders rich card
```

### Why Background

- iOS share extension gets killed after ~30s
- Gemini API call + page fetch takes 3-8s
- Background means instant save, silent enrichment
- No polling needed — re-fetch when detail screen opens
- Optional: Supabase Realtime for live home card updates (Phase 2)

---

## Schema Changes

### New Column

```sql
ALTER TABLE saves ADD COLUMN enrichment JSONB DEFAULT NULL;
```

**Why JSONB**: Type-specific data (recipe ingredients vs video key_points) varies per type. Single JSONB column means:
- No schema changes when adding new types
- Gemini output maps directly to storage
- Query-friendly: `enrichment->>'type'` for filtering

### Existing Columns (unchanged)

`title`, `creator`, `thumbnail_url`, `description` stay as "fast read" fields for the home grid. The `enrichment` JSONB is deep data for the detail screen.

---

## TypeScript Types

```typescript
type EnrichmentType = 'video' | 'recipe' | 'motion_design' | 'comparison' | 'generic';

interface EnrichmentData {
  type: EnrichmentType;
  summary: string;
  key_points: string[];
  suggested_related: string[];

  // Video
  creator_username?: string;
  creator_profile_url?: string;

  // Recipe
  recipe_name?: string;
  ingredients?: { name: string; amount: string; image_url?: string }[];
  steps?: string[];
  prep_time?: string;
  cook_time?: string;
  related_recipes?: string[];
  substitutes?: { ingredient: string; substitute: string; source_url?: string }[];
  pairs_well_with?: string[];

  // Motion Design
  brands_or_subjects_featured?: string[];

  // Comparison
  items_compared?: string[];
  verdict?: string;
}
```

---

## Gemini Integration

### Edge Function: `enrich-with-gemini`

**Location:** `supabase/functions/enrich-with-gemini/index.ts`

**Input:**
```json
{ "save_id": "save-123", "url": "https://instagram.com/reel/..." }
```

**Process:**
1. Fetch the URL's HTML, extract og:title, og:description, og:image, and a text snippet (first 2000 chars of body)
2. Send to Gemini with structured JSON schema
3. Store result in `saves.enrichment` where `id = save_id`
4. Return the enrichment data

**Output:**
```json
{
  "type": "video",
  "summary": "A motion design breakdown of Uber's new brand identity...",
  "key_points": ["Uses kinetic typography", "Color palette analysis", ...],
  "suggested_related": ["https://...", ...],
  "creator_username": "designbyjose",
  "creator_profile_url": "https://instagram.com/designbyjose"
}
```

### Gemini Prompt

```
System: You are a content classifier and enricher. Given a URL and its page
metadata, classify the content into exactly ONE of these types:
- video: a reel/post where a creator talks about or reviews something
- recipe: a recipe video/post with ingredients and steps
- motion_design: a design/animation showcase, possibly featuring a brand
- comparison: "this or that" content comparing two or more things
- generic: fallback when it doesn't fit above

Then extract structured data specific to that type.

Rules:
- Return ONLY valid JSON matching the schema for the detected type
- summary: 2-3 sentences on what the content covers
- key_points: 3-5 short bullet takeaways
- suggested_related: 2-3 URLs of similar content (use your knowledge)
- If creator info is available, include creator_username and creator_profile_url
- For recipes: extract ingredients, steps, timing. If timing not stated, estimate and note "estimated"
- For comparisons: list items compared, criteria, and verdict if given
- If uncertain about type, use "generic"
```

### JSON Response Schema (Gemini responseMimeType: "application/json")

```json
{
  "type": "string",
  "summary": "string",
  "key_points": ["string"],
  "suggested_related": ["string"],
  "creator_username": "string",
  "creator_profile_url": "string",
  "recipe_name": "string",
  "ingredients": [{"name": "string", "amount": "string", "image_url": "string"}],
  "steps": ["string"],
  "prep_time": "string",
  "cook_time": "string",
  "related_recipes": ["string"],
  "substitutes": [{"ingredient": "string", "substitute": "string", "source_url": "string"}],
  "pairs_well_with": ["string"],
  "brands_or_subjects_featured": ["string"],
  "items_compared": ["string"],
  "verdict": "string"
}
```

### Gemini Model

`gemini-2.0-flash` — fast, free tier compatible, supports JSON mode. Not 1.5-pro (slower, more expensive).

---

## UI Components

### Phase 1: Video + Generic

#### Base Card Layout (shared)
```
┌─────────────────────────┐
│ [Thumbnail]             │
│ Title                   │
│ Summary (2-3 lines)     │
│ Key Points (bullets)    │
├─────────────────────────┤
│ [Type-specific section] │  ← Changes per type
├─────────────────────────┤
│ Suggested Related (row) │
└─────────────────────────┘
```

#### Components

1. **EnrichmentCard.tsx** — Router component that picks the right card based on `enrichment.type`
2. **VideoCard.tsx** — Creator button + key_points + suggested_related
3. **GenericCard.tsx** — Title + summary + key_points (fallback)
4. **EnrichmentShimmer.tsx** — Loading state while enrichment is pending
5. **SuggestedRelated.tsx** — Horizontal scroll row of related content cards

#### Detail Screen Updates (`app/save/[id].tsx`)

Add a new layout branch:
```typescript
if (enrichment) {
  return <EnrichmentCard enrichment={enrichment} save={save} />;
}
// existing movie/list/default layouts remain
```

#### Home Grid Updates

The masonry grid already shows thumbnails + titles. When enrichment arrives:
- Content type badge changes from generic to specific (e.g., "VIDEO")
- Creator name appears under title
- No other home grid changes needed (detail screen shows full enrichment)

### "Analyzing..." State

When a save is first created and enrichment is pending:
- Show a subtle animated shimmer on the card's content area
- Text: "Analyzing content..."
- Once enrichment completes, animate in the rich content (FadeInDown)

### Phase 2 (Later)

- RecipeCard: Ingredients grid + steps list + timing + substitutes
- MotionDesignCard: Brands featured + techniques
- ComparisonCard: Items compared + criteria + verdict

---

## Client Integration

### After addSave()

```typescript
// In addSave() or after it completes:
fireAndForgetEnrichment(saveId, url);

async function fireAndForgetEnrichment(saveId: string, url: string) {
  try {
    await supabase.functions.invoke('enrich-with-gemini', {
      body: { save_id: saveId, url },
    });
  } catch {
    // Silent fail — enrichment is optional, save still works
  }
}
```

### Loading Enrichment on Detail Screen

```typescript
// In save/[id].tsx
const { data: save } = await supabase
  .from('saves')
  .select('*')
  .eq('id', id)
  .single();

// save.enrichment contains the Gemini data (or null if pending/failed)
```

---

## Error Handling

| Failure | Behavior |
|---------|----------|
| Gemini API down | Save works, enrichment = null, no error shown |
| Invalid JSON from Gemini | Retry once, then set enrichment = null |
| Page fetch fails (404, timeout) | Send URL + title only to Gemini, reduce enrichment quality |
| Supabase write fails | Log error, save still works locally |
| Share extension killed | Save already persisted, enrichment can happen later on next app open |

---

## File Structure

```
supabase/
  functions/
    enrich-with-gemini/
      index.ts              ← NEW: Gemini enrichment edge function
    fetch-metadata/
      index.ts              ← EXISTING: OG tag fetching (keep as-is)

components/
  ui/
    EnrichmentCard.tsx      ← NEW: Router for type-specific cards
    VideoCard.tsx           ← NEW: Video enrichment display
    GenericCard.tsx         ← NEW: Generic fallback display
    EnrichmentShimmer.tsx   ← NEW: Loading shimmer
    SuggestedRelated.tsx    ← NEW: Horizontal related content row

hooks/
  useStore.ts               ← MODIFY: Add enrichment to SaveItem + addSave sync

app/
  save/[id].tsx             ← MODIFY: Add enrichment layout branch

supabase/
  schema.sql                ← MODIFY: Add enrichment JSONB column
```

---

## Implementation Order

1. **Schema migration** — Add `enrichment` JSONB column
2. **Edge function** — Build `enrich-with-gemini` with prompt + JSON schema
3. **Store update** — Add `enrichment` to SaveItem + sync
4. **Client trigger** — Fire enrichment after addSave()
5. **Base UI** — EnrichmentCard router + GenericCard + Shimmer
6. **Video type** — VideoCard with creator + key_points
7. **Detail screen** — Add enrichment layout branch
8. **Test end-to-end** — Save Instagram video → see enrichment appear
