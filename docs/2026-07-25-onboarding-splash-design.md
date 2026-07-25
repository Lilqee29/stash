# Design: Onboarding & Splash Screen Redesign

**Date:** 2026-07-25
**Status:** Approved
**Goal:** Clean, minimal onboarding flow that shows on first deploy, with smooth Reanimated animations and proper routing gating.

---

## Flow Summary

```
Native splash (Expo) → Auto-advancing splash (2s) → 3 Onboarding slides → How Found survey → Sign Up / Sign In → How To Use tutorial → Main App
```

Returning users skip directly to Main App.

---

## 1. Splash Screen

**File:** `app/(auth)/splash.tsx`

### Behavior
- On fresh install: Expo native splash (black background) shows while fonts load, then hides
- Auto-advancing splash fades in: icon (88x88, borderRadius 24) + "Stash" text (Syne 800, 32px) + tagline "Personal bookmark brain for TikTok and Instagram saves." (DM Sans 400, 14px, #888888)
- Reanimated `FadeInDown` animation (duration 800ms) on the content
- Holds for 2 seconds after fade-in completes
- Auto-navigates to `/(auth)/onboarding/`
- No buttons, no floating cards, no user interaction required

### Visual
```
┌─────────────────────┐
│                     │
│                     │
│      [icon]         │
│      Stash          │
│   tagline text      │
│                     │
│                     │
└─────────────────────┘
```

### Implementation
- Replace all `react-native` `Animated` usage with Reanimated
- Use `useAnimatedStyle` + `useSharedValue` for opacity and translateY
- Remove floating bookmark cards entirely
- Remove pagination dots (not a landing page anymore)
- Remove `Button` component usage

---

## 2. Onboarding Slides

**File:** `app/(auth)/onboarding/index.tsx`

### Behavior
- 3 horizontal swipeable slides (reduce from 4, drop "You are All Set")
- Each slide: Lottie animation (280x280) centered, title below (Syne 800, 32px, white), subtitle (DM Sans 400, 16px, #888888)
- Slide 1: `brain-bookmark.json` — "A unified brain for your saved content"
- Slide 2: `folder-sort.json` — "Auto-Organized into Smart Folders"
- Slide 3: `tap-save.json` — "Save with One Tap"
- Skip button (top-right, #888888, DM Sans 500, 15px) fades in after 500ms
- Next button at bottom, last slide says "Get Started" → navigates to `/sign-up`
- Progress: 3 dots (active = #C4FB46 scale 1.0, inactive = #333 scale 0.7)

### Animations (Reanimated)
- Slide transition: `FadeInRight` entering, `FadeOutLeft` exiting (duration 350ms, easing `Easing.bezier(0.25, 0.1, 0.25, 1)`)
- Content on each slide: staggered `FadeInDown` (title at +100ms, subtitle at +200ms)
- Next button: `FadeInUp` with spring (delay 300ms)
- Progress dots: layout animation using `Layout.springify()` when active index changes
- Lottie: `autoPlay` on active slide, `pause()` on inactive (keep existing Lottie logic)

### Removed
- `OnboardingProgress` bar component usage (replaced by dots)
- `import.tsx` — deferred to post-auth
- `processing.tsx` — deferred to post-auth

### Kept (with Reanimated polish)
- `how-found.tsx` — "Where did you hear about Stash?" survey (move after onboarding slides)
- `how-to-use.tsx` — 3-step tutorial (move after sign-up)

---

## 3. Routing & Gating

**File:** `app/_layout.tsx`

### Logic
```typescript
const hasCompletedOnboarding = useStore((s) => s.hasCompletedOnboarding);

// In Stack:
{!hasCompletedOnboarding ? (
  <>
    <Stack.Screen name="(auth)" />
  </>
) : (
  <>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="(auth)" />
  </>
)}
```

### Behavior
- Fresh install → `hasCompletedOnboarding = false` → renders `/(auth)` group only
- After onboarding completes → `hasCompletedOnboarding = true` → renders `/(tabs)` group + `/(auth)` group (for sign-in on logout)
- `app/index.tsx`: uses Zustand selector `useStore((s) => s.hasCompletedOnboarding)` → redirects to `/splash` if false, `/home` if true

### Persistence
- `hasCompletedOnboarding` persisted via Zustand `persist` middleware to AsyncStorage
- Key: `stash-onboarding`

---

## 4. Zustand Store Changes

**File:** `hooks/useStore.ts`

### New State
```typescript
hasCompletedOnboarding: boolean;
completeOnboarding: () => void;
```

### Implementation
- Add to existing Zustand store
- Wrap with `persist` middleware (AsyncStorage)
- `completeOnboarding` sets `hasCompletedOnboarding = true`

---

## 5. Files Modified

| File | Action |
|------|--------|
| `app/_layout.tsx` | Add onboarding gate logic |
| `app/index.tsx` | Conditional redirect based on onboarding state |
| `app/(auth)/splash.tsx` | Full rewrite: auto-advancing, Reanimated only |
| `app/(auth)/onboarding/index.tsx` | Rewrite: 3 slides, Reanimated transitions, dot indicators |
| `app/(auth)/onboarding/_layout.tsx` | Keep as-is |
| `app/(auth)/onboarding/how-found.tsx` | Polish: Reanimated transitions, keep survey logic |
| `app/(auth)/onboarding/how-to-use.tsx` | Polish: Reanimated transitions, keep tutorial logic |
| `hooks/useStore.ts` | Add `hasCompletedOnboarding` + `completeOnboarding` + persist middleware |
| `app/(auth)/onboarding/import.tsx` | Delete (deferred to post-auth) |
| `app/(auth)/onboarding/processing.tsx` | Delete (deferred to post-auth) |

---

## 6. Dependencies

- `react-native-reanimated` — already installed (4.5.0), used for all new animations
- `lottie-react-native` — already installed, used for onboarding slides
- No new packages needed

---

## 7. Testing

- Fresh install: app shows splash → auto-advances → 3 onboarding slides → how-found survey → sign-up → how-to-use → main tabs
- Returning user: app goes directly to main tabs
- Swipe between onboarding slides works with smooth transitions
- Skip button on onboarding navigates to how-found survey
- "Get Started" on last slide navigates to how-found survey
- How-found survey: select option → Next → sign-up screen
- Sign-up completes → how-to-use tutorial → main tabs
- Zustand persist: kill app and reopen → onboarding not shown again
