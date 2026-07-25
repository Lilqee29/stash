# Home Screen Redesign — Design Spec

## Aesthetic Direction: "Curated Darkness"

**Concept:** A premium, editorial dark-mode experience inspired by Are.na's minimalism meets Pinterest's visual density. Think of a curated gallery — generous negative space, layered depth through subtle surface elevation, and the green accent used sparingly as a punctuation mark, not a flood.

**Tone:** Refined, quiet confidence. Not loud. Not cluttered. Every element earns its place.

---

## Current Problems

1. **Too many sections competing for attention** — Hero, Quick Actions, Recently Saved, Folders, Weekly Stats, Empty State = 6 sections before content
2. **Hero card is wasted space** — "Welcome back / Your saves are organized" tells the user nothing useful
3. **Quick Actions are redundant** — Search, Folders, Discover are already in the bottom tab bar
4. **Lottie animations everywhere** — Feels like a demo, not a product. Each Lottie is a network request + bundle bloat
5. **No loading state** — Screen goes blank → content pops in with no transition
6. **Save cards are too small** — 130×170px horizontal scroll is hard to browse
7. **Stats section is vanity metrics** — Users don't care about "This week / Total saves / Folders" counts

---

## New Layout (Top to Bottom)

### 1. Header (Sticky-ish, Minimal)
```
┌─────────────────────────────────────┐
│  [Avatar]  Stash          [🔔] [⚙️] │
│            Your bookmark brain       │
└─────────────────────────────────────┘
```
- **Left:** App icon (42×42, rounded-xl, border accent) + app name + tagline
- **Right:** Notification bell + Settings gear
- Remove search icon from header (it's redundant with bottom nav)
- Tagline fades out after first launch (show only for new users)

### 2. Quick Access Pill (NEW — replaces Hero + Quick Actions)
```
┌─────────────────────────────────────┐
│  [🔍 Search your stash...        ]  │
└─────────────────────────────────────┘
```
- Full-width search bar, always visible
- Tapping opens the search modal/screen
- No "Quick Actions" section — they're all in the bottom nav now
- **Height:** 44px, `bg-background-secondary`, `rounded-2xl`, subtle border

### 3. Platform Filters (NEW — replaces nothing, adds utility)
```
┌──────┬──────────┬───────────┬─────────┬───────┐
│ All  │ ♪ TikTok │ ◎ Insta   │ 🎬 Film │ 📁 ...│
└──────┴──────────┴───────────┴─────────┴───────┘
```
- Horizontal pill chips for filtering by platform
- "All" is default (accent border)
- Each chip: icon + label, 36px height, `rounded-full`
- Sticky below header on scroll (optional, nice-to-have)

### 4. Recent Saves — Masonry Grid (replaces horizontal scroll)
```
┌──────────┬──────────┐
│  [Card]  │  [Card]  │
│  (tall)  │  (short) │
├──────────┤  [Card]  │
│  [Card]  │  (tall)  │
│  (short) │          │
└──────────┴──────────┘
```
- **2-column masonry layout** (not equal height — let thumbnails breathe)
- Card width: `~48%` of screen
- Card height: varies by content (160–240px)
- **Card anatomy:**
  - Thumbnail (expo-image, blurhash placeholder, rounded-2xl)
  - Platform dot (bottom-left, 6px circle)
  - Title (2 lines max, `text-xs font-semibold`)
  - Time ago (bottom, `text-[10px] text-tertiary`)
- No horizontal scroll — full vertical browsing
- **Spacing:** 10px gap between cards

### 5. Folders — Compact Grid (replaces list rows)
```
┌──────────┬──────────┬──────────┐
│ 📁       │ 📁       │ 📁       │
│ Recipes  │ Design   │ Films    │
│ 12 items │ 8 items  │ 5 items  │
└──────────┴──────────┴──────────┘
```
- 3-column grid (not list rows)
- Each folder: icon + name + count
- `rounded-xl`, `bg-background-secondary`, subtle border
- Tap to open folder detail
- Max 6 visible, "See all" link if more

### 6. Empty State (when no saves)
- Keep existing empty state but simplify
- Remove Lottie (use a simple Ionicons illustration)
- CTA button: "Import your first save"

---

## Loading State: Skeleton Screen

**Pattern:** Shimmer skeleton matching the exact final layout.

### Skeleton Layout
```
┌─────────────────────────────────────┐
│  [□□]  □□□□□□        [□] [□]       │  ← Header skeleton
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□   │  ← Search bar skeleton
└─────────────────────────────────────┘
┌──────┬──────────┬───────────┬───────┐
│  □□  │   □□□    │   □□□□    │  □□   │  ← Filter chips skeleton
└──────┴──────────┴───────────┴───────┘
┌──────────┬──────────┐
│  □□□□□□  │  □□□□    │  ← Card skeletons (2-column)
│  □□□□□□  │  □□□□□□  │     with shimmer animation
│  □□      │  □□□□□□  │
├──────────┤          │
│  □□□□    │  □□      │
│  □□□□□□  │          │
└──────────┴──────────┘
```

### Skeleton Implementation
- **Component:** `SkeletonPlaceholder` wrapper using Reanimated
- **Shimmer:** Linear gradient moving left→right, 1.2s duration, infinite loop
- **Colors:** `#1A1A1A` (base) → `#252525` (shimmer highlight)
- **Delay:** Show skeleton after 300ms (skip if data loads fast)
- **Transition:** Fade out skeleton (200ms) → fade in real content (300ms)

### Skeleton Component API
```tsx
<SkeletonPlaceholder>
  {/* Header */}
  <SkeletonPlaceholder.Header />
  {/* Search bar */}
  <SkeletonPlaceholder.SearchBar />
  {/* Filter chips */}
  <SkeletonPlaceholder.Chips count={5} />
  {/* Masonry grid */}
  <SkeletonPlaceholder.Masonry columns={2} count={6} />
</SkeletonPlaceholder>
```

---

## Animation Spec

### Entry Animations
- **Header:** Fade in + slide down 10px, 300ms
- **Search bar:** Fade in + slide up 8px, 200ms, delay 100ms
- **Filter chips:** Stagger fade in, 50ms between each, delay 150ms
- **Cards:** Stagger fade in + slide up 12px, 60ms between each, delay 200ms
- **Folders:** Stagger fade in + slide up 8px, 40ms between each, delay 400ms

### Interaction Animations
- **Card press:** Scale 0.97, spring (300/20), 150ms
- **Filter chip press:** Scale 0.95, spring (300/25), 100ms
- **Folder press:** Scale 0.98, spring (300/22), 120ms

### Shimmer Animation
- Linear gradient: `translateX` from -width to +width
- Duration: 1.2s
- Easing: `Easing.bezier(0.4, 0, 0.6, 1)` (smooth)
- Loop: infinite

---

## Color Tokens (Referenced)

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#0A0A0A` | Screen background |
| `bg-secondary` | `#111111` | Cards, search bar |
| `bg-tertiary` | `#1A1A1A` | Card thumbnails, skeleton base |
| `accent-base` | `#8EC934` | Active states, CTAs |
| `accent-surface` | `rgba(142,201,52,0.12)` | Icon backgrounds |
| `text-primary` | `#FFFFFF` | Headings, titles |
| `text-secondary` | `#888888` | Body text, descriptions |
| `text-tertiary` | `#555555` | Timestamps, counts |
| `border-subtle` | `rgba(255,255,255,0.06)` | Card borders |
| `skeleton-base` | `#1A1A1A` | Skeleton placeholder |
| `skeleton-shimmer` | `#252525` | Skeleton shimmer highlight |

---

## Typography

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| App name | Syne | 18px | 800 | `text-primary` |
| Tagline | DM Sans | 11px | 500 | `accent-base` |
| Section title | Syne | 17px | 700 | `text-primary` |
| Card title | DM Sans | 12px | 600 | `text-primary` |
| Card meta | DM Sans | 10px | 400 | `text-tertiary` |
| Filter chip | DM Sans | 12px | 600 | `text-secondary` |
| Search placeholder | DM Sans | 14px | 400 | `text-tertiary` |
| Folder name | DM Sans | 13px | 600 | `text-primary` |
| Folder count | DM Sans | 11px | 400 | `text-tertiary` |

---

## Spacing System

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 12px |
| `lg` | 16px |
| `xl` | 20px |
| `2xl` | 24px |
| `3xl` | 32px |

---

## Implementation Priority

1. **Skeleton loading state** (most impactful, ~2 hours)
2. **Remove Hero + Quick Actions** (simplify, ~30 min)
3. **Add search bar** (full-width, ~30 min)
4. **Platform filter chips** (new component, ~1 hour)
5. **Masonry grid for saves** (replace horizontal scroll, ~2 hours)
6. **Compact folder grid** (replace list rows, ~1 hour)
7. **Entry animations** (stagger reveals, ~1 hour)
8. **Interaction animations** (press feedback, ~1 hour)

**Total estimated:** ~8–9 hours

---

## Files to Modify

- `app/(tabs)/home.tsx` — Main screen rewrite
- `components/ui/SkeletonPlaceholder.tsx` — NEW: Skeleton component
- `components/ui/PlatformFilter.tsx` — NEW: Filter chips
- `components/ui/MasonryGrid.tsx` — NEW: 2-column masonry
- `components/ui/SaveCard.tsx` — NEW: Redesigned card (extracted from home)
- `components/ui/FolderGrid.tsx` — NEW: Compact folder grid
- `hooks/useStore.ts` — Add `activePlatformFilter` state

---

## What We're Removing

| Current Element | Why Remove |
|----------------|------------|
| Hero card ("Welcome back") | Filler content, no utility |
| Quick Actions (Search, Folders, Discover) | Redundant with bottom nav |
| Weekly Stats section | Vanity metrics, not actionable |
| Lottie animations on cards | Bundle bloat, distracting |
| Horizontal scroll for recent saves | Hard to browse, not scannable |
| List-style folder rows | Wastes horizontal space |
