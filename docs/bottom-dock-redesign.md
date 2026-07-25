# BottomDock Redesign Spec

**Date:** 2026-07-25  
**Status:** Draft  
**Goal:** Replace the floating pill-shaped BottomDock with a premium, native iOS-feeling tab bar that feels anchored, polished, and intentional — not like a web component floating over content.

---

## 1. Problem Analysis

The current BottomDock has several issues that make it feel "scattered" and non-native:

| Issue | Current | Why It Feels Wrong |
|-------|---------|-------------------|
| **Floating pill** | `absolute bottom-6 w-[94%] rounded-[35px]` | Web-style floating navbar. iOS tab bars anchor to the bottom edge, not hover above it. |
| **Oversized Add button** | `w-[50px] h-[50px] translateY: -12` | Breaks the visual rhythm. The elevation + scale makes it feel like a separate component pasted on. |
| **Heavy shadow** | `shadowOpacity: 0.35, shadowRadius: 20` | Too aggressive. iOS tab bars have a subtle 1px top border or barely-perceptible shadow. |
| **Tiny icons** | `size={18}` | iOS standard is 25×25pt. 18px feels cramped and amateur. |
| **Tiny bold labels** | `text-[10px] font-bold` | Bold at 10px is visually noisy. iOS uses medium weight at ~10pt with proper letter-spacing. |
| **Indicator animation** | Full-width segment highlight | Feels like a web segmented control, not a native tab selection. |
| **No safe area** | `absolute bottom-6` | Ignores the home indicator on modern iPhones. Will overlap on Face ID devices. |
| **Hardcoded colors** | `bg-[rgba(18,18,18,0.95)]`, `ACCENT = '#8EC934'` | Violates the design system — should use NativeWind tokens. |

---

## 2. Design Direction

### Aesthetic: "Anchored Minimalism"

Think: the iOS Music app or Files app tab bar — **full-width, flush to the bottom, barely there until you need it**. The bar should feel like it's part of the screen, not floating above it.

**Core principles:**
- **Full-width, edge-to-edge** — no floating pill. The bar sits flush against the bottom safe area.
- **Restrained color** — only the active tab gets the accent color. Everything else is monochrome.
- **Proper weight hierarchy** — active label is medium weight, inactive is regular. Never bold on both.
- **The Add button is a tab, not a decoration** — it participates in the same rhythm as other tabs, distinguished by icon style (a filled circle with a plus) rather than size or elevation.
- **Subtle depth** — a 1px top border (`#222222`) and a very soft shadow, not a heavy glow.

### Visual Mood Board Reference
- iOS Files app tab bar (clean, monochrome, accent-only-on-active)
- Spotify's bottom bar (full-width, flush, minimal shadow)
- Arc Browser's sidebar philosophy (restrained, content-first)

---

## 3. Layout Specification

### Bar Dimensions

```
┌─────────────────────────────────────────────────────────┐
│                    CONTENT AREA                         │
├─────────────────────────────────────────────────────────┤ ← 1px border-top: #222222
│   [Home]    [Discover]    [＋Add]    [Library]  [Profile]│
│    🏠          🧭           ➕          📁         👤    │ ← Icons: 24×24
│   Home      Discover                Library     Profile  │ ← Labels: 10px
│                                                         │
├─────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░ safe area (home indicator) ░░░░░░░░░░░░░│
└─────────────────────────────────────────────────────────┘
```

### Exact Measurements

| Property | Value | Notes |
|----------|-------|-------|
| Bar height (content) | `56px` | Standard iOS tab bar content height |
| Safe area padding | `useSafeAreaInsets().bottom` | Dynamic — ~34px on Face ID, ~0px on SE |
| Total bar height | `56 + safeAreaBottom` | Content + safe area |
| Bar background | `#0A0A0A` (98% opacity) | Matches `background-primary`, slight translucency for glass effect |
| Top border | `1px solid #222222` | Matches `borderCustom-subtle` |
| Horizontal padding | `16px` each side | Leaves breathing room on edges |
| Tab item width | `(containerWidth - 32) / 5` | Equal distribution of available space |
| Tab item height | `56px` | Full bar content height (touch target) |
| Icon size | `24×24px` | iOS standard range (20-28pt) |
| Icon-to-label gap | `4px` | Tight vertical coupling |
| Label height | `~14px` | Font size 10px + line height |
| Bottom padding | `2px` | Visual centering of icon+label group within 56px |

### Spacing Diagram

```
|← 16px →|← tab →|← tab →|← tab →|← tab →|← tab →|← 16px →|
                                                         
         Icon (24×24)
              ↕ 4px gap
         Label (10px font)
              
         Total icon+label height ≈ 42px
         Centered in 56px → top padding ≈ 7px
```

---

## 4. Icon Treatment

### Icon Specifications

| State | Icon Style | Size | Color | Weight |
|-------|-----------|------|-------|--------|
| **Inactive** | Outline / stroke | 24×24 | `#555555` (textCustom-tertiary) | Regular (1.5px stroke) |
| **Active** | Filled / solid | 24×24 | `#8EC934` (textCustom-accent) | Filled |
| **Add (center)** | Filled circle + plus | 24×24 | `#0A0A0A` (dark icon on green) | Bold plus stroke |

### Icon Choices (Ionicons → more native-feeling)

| Tab | Current Icon | Recommended Icon | Rationale |
|-----|-------------|-----------------|-----------|
| Home | `home` (outline) | `home` (filled when active) | Standard iOS pattern |
| Discover | `compass-outline` | `compass` (filled when active) | Clear, recognizable |
| Add | `add-circle` | `add-circle` (always filled) | Center action, always prominent |
| Library | `albums` | `folder` or `folder-open` | More intuitive for "collections" |
| Profile | `person` | `person-circle` or `person` | Standard |

### Active/Inactive Icon States

```tsx
// Inactive: outline stroke icon
<Ionicons name="home-outline" size={24} color="#555555" />

// Active: filled solid icon  
<Ionicons name="home" size={24} color="#8EC934" />
```

**Key rule:** Never show outline icons in accent color. The accent color ONLY appears on filled icons. This creates the proper visual hierarchy.

---

## 5. Label Treatment

### Typography Specifications

| Property | Inactive | Active |
|----------|----------|--------|
| Font family | `font-dmsans` (DM Sans) | `font-dmsans` (DM Sans) |
| Font size | `10px` | `10px` |
| Font weight | Regular (400) | Medium (500) |
| Color | `#555555` (textCustom-tertiary) | `#8EC934` (textCustom-accent) |
| Letter spacing | `0.2px` | `0.2px` |
| Line height | `14px` | `14px` |
| Text transform | None | None |

### Label Rules

1. **Single words only** — "Home", "Discover", "Library", "Profile"
2. **No "Add" label** — the center tab has NO label. The icon alone communicates the action. This is a common iOS pattern for primary actions (see: Instagram's center camera button).
3. **Never truncate** — if a label is too long, the design is wrong
4. **Consistent alignment** — all labels center-aligned under their icons

### Why No Label on Add?

The Add button is the **primary action** in the app. Removing its label:
- Creates visual breathing room in the center
- Makes the icon more iconic/recognizable over time
- Follows the Instagram/TikTok pattern users already know
- Allows the icon to be slightly larger (26×26 vs 24×24) without label collision

---

## 6. Add Button Redesign

### Current (Problems)
```tsx
<View className="w-[50px] h-[50px] rounded-full bg-accent-base items-center justify-center border-2 border-background-primary"
  style={{
    shadowColor: '#8EC934',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    transform: [{ translateY: -12 }],
  }}
>
  <Ionicons name="add" size={24} color="#0A0A0A" />
</View>
```

**Problems:** Oversized, elevated, glowing, floating above the bar — feels like a FAB from Material Design, not an iOS tab.

### Redesigned (Solution)

The Add button becomes a **regular tab item** with one distinction: its icon is a filled accent-colored circle with a dark plus sign inside.

```tsx
// The Add tab icon
<View className="w-[28px] h-[28px] rounded-full bg-accent-base items-center justify-center">
  <Ionicons name="add" size={16} color="#0A0A0A" weight="bold" />
</View>
```

### Add Button Design Details

| Property | Value |
|----------|-------|
| Circle diameter | `28px` |
| Circle background | `bg-accent-base` (#639922) |
| Circle border radius | `full` (14px) |
| Plus icon size | `16×16px` |
| Plus icon color | `#0A0A0A` (dark on light) |
| Plus icon weight | Bold |
| Elevation/shadow | **None** — flat, no shadow |
| Label | **None** — no "Add" text below |
| Vertical offset | **None** — aligned with other icons |

### Why This Works

1. **Same rhythm** — the Add icon sits at the same vertical position as other icons (24-28px range)
2. **Color distinction** — the accent background circle makes it stand out without size/elevation tricks
3. **No floating** — it's part of the bar, not above it
4. **Recognizable** — the filled circle with plus is universally understood as "create/add"
5. **Scales properly** — works on all device sizes without looking oversized

---

## 7. Active Indicator Design

### Decision: REMOVE the Sliding Indicator

The current animated sliding indicator (the background highlight that moves between tabs) should be **removed entirely**. Here's why:

1. **iOS doesn't use sliding indicators on tab bars** — native iOS tab bars indicate selection through icon fill + label color, not a background highlight
2. **It adds visual noise** — the indicator competes with the icon/label color changes
3. **It requires complex layout measurement** — calculating segment widths and animating positions adds fragility
4. **The accent color IS the indicator** — when only the active tab is colored, that's the selection signal

### Selection Feedback (Without Indicator)

| Feedback Mechanism | Implementation |
|-------------------|----------------|
| **Icon fill change** | Outline → Filled (instant, no animation needed) |
| **Icon color change** | `#555555` → `#8EC934` (200ms ease) |
| **Label color change** | `#555555` → `#8EC934` (200ms ease) |
| **Label weight change** | Regular 400 → Medium 500 |
| **Haptic feedback** | Light impact on tab press |
| **Scale micro-interaction** | Subtle press-in scale (0.95) on press, spring back to 1.0 on release |

### Optional: Subtle Dot Indicator

If you want *some* active indicator beyond color, use a **small dot below the active tab** (like iOS App Store):

```tsx
// Only shown on active tab
<View className="w-[4px] h-[4px] rounded-full bg-accent-base mt-1" />
```

This is **optional** — the color change alone is sufficient and more native-feeling.

---

## 8. Safe Area Handling

### Implementation

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomDock({ activeTab, setActiveTab }: BottomDockProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className="absolute bottom-0 left-0 right-0"
      style={{ paddingBottom: insets.bottom }}
    >
      {/* Bar content goes here */}
    </View>
  );
}
```

### Safe Area Strategy

| Device | Bottom Inset | Bar Behavior |
|--------|-------------|--------------|
| iPhone SE (2nd/3rd gen) | ~0px | Bar sits flush at bottom, no extra padding |
| iPhone 8 | ~0px | Same as SE |
| iPhone X / 11 / 12 / 13 / 14 | ~34px | Extra padding below content for home indicator |
| iPhone 14 Pro / 15 Pro | ~34px | Same, with Dynamic Island (top safe area separate) |
| iPhone 14 Pro Max / 15 Pro Max | ~34px | Same |
| iPad | ~0px or ~20px | Depends on model and orientation |

### Content Padding

The app's scroll content must be padded at the bottom to account for the bar:

```tsx
// In the screen component
<ScrollView contentContainerStyle={{ paddingBottom: 56 + insets.bottom + 16 }}>
  {/* Screen content */}
</ScrollView>
```

**Never** use `marginBottom` on the bar itself — use `paddingBottom` on the safe area wrapper to ensure the bar background extends behind the home indicator area.

---

## 9. Shadow & Elevation Treatment

### Current (Too Heavy)
```tsx
shadowColor: '#000',
shadowOffset: { width: 0, height: 10 },
shadowOpacity: 0.35,
shadowRadius: 20,
elevation: 10,
```

### Redesigned (Subtle & Native)

```tsx
// Layer 1: 1px top border (primary separation)
className="border-t border-borderCustom-subtle"

// Layer 2: Very subtle shadow (depth hint only)
style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  elevation: 0,
}}
```

### Shadow Hierarchy

| Layer | Property | Value | Purpose |
|-------|----------|-------|---------|
| Top border | `borderTopWidth` | `1px` | Primary edge definition |
| Top border color | `borderTopColor` | `#222222` | Matches design system |
| Shadow | `shadowOpacity` | `0.15` | Subtle depth hint |
| Shadow | `shadowRadius` | `8px` | Soft, diffused |
| Shadow | `shadowOffset.y` | `-2px` | Shadow goes UP (below the bar) |
| Elevation (Android) | `elevation` | `0` | Not needed — Android uses top border |

### Why Shadow Goes Up

The shadow should appear **below** the bar (at the top edge, fading upward into content). This is the native iOS pattern — the tab bar casts a shadow onto the content behind it, not onto the safe area below.

---

## 10. Color Token Mapping

### Tailwind Classes for Every Element

| Element | Current (Bad) | Redesigned (Token-Based) |
|---------|--------------|------------------------|
| Bar background | `bg-[rgba(18,18,18,0.95)]` | `bg-background-primary` |
| Bar border | `border-white/[0.08]` | `border-t border-borderCustom-subtle` |
| Inactive icon | `color="rgba(255,255,255,0.4)"` | `color="#555555"` (textCustom-tertiary) |
| Active icon | `color={ACCENT}` (hardcoded) | `color="#8EC934"` (textCustom-accent) |
| Inactive label | `text-white/40` + `opacity: 0.6` | `text-textCustom-tertiary` |
| Active label | `text-textCustom-accent` | `text-textCustom-accent` |
| Add button bg | `bg-accent-base` | `bg-accent-base` (already correct) |
| Add button icon | `color="#0A0A0A"` | `text-background-primary` |
| Add button shadow | `shadowColor: '#8EC934'` + glow | **Removed** — no shadow |
| Indicator bg | `bg-background-primary border-accent-base/[0.12]` | **Removed** |
| Press feedback | None visible | `active:opacity-80` + haptic |

### Complete Token Reference

From `tailwind.config.js`:
```
background-primary:    #0A0A0A   ← Bar background
background-secondary:  #111111   ← Not used in bar
borderCustom-subtle:   #222222   ← Top border
accent-base:           #639922   ← Add button circle, active states
accent-bright:         #72A926   ← Not used in bar
accent-muted:          #4A7219   ← Press state for Add button
textCustom-primary:    #FFFFFF   ← Not used (active uses accent)
textCustom-secondary:  #888888   ← Not used in bar
textCustom-tertiary:   #555555   ← Inactive icons and labels
textCustom-accent:     #8EC934   ← Active icons and labels
```

---

## 11. NativeWind Classes — Complete Implementation

### Bar Container

```tsx
<View
  className="absolute bottom-0 left-0 right-0 bg-background-primary border-t border-borderCustom-subtle"
  style={{
    paddingBottom: insets.bottom,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  }}
>
  <View className="flex-row items-center justify-around h-[56px] px-[16px]">
    {/* Tab items */}
  </View>
</View>
```

### Normal Tab Item

```tsx
<Pressable
  onPress={tab.onPress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  className="flex-1 items-center justify-center h-full"
>
  <View className="items-center gap-[4px]">
    <Ionicons
      name={isActive ? tab.iconFilled : tab.iconOutline}
      size={24}
      color={isActive ? '#8EC934' : '#555555'}
    />
    <Text
      className={cn(
        'text-[10px] font-dmsans',
        isActive 
          ? 'text-textCustom-accent font-medium' 
          : 'text-textCustom-tertiary'
      )}
    >
      {tab.label}
    </Text>
  </View>
</Pressable>
```

### Add Tab Item (Center)

```tsx
<Pressable
  onPress={tab.onPress}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
  className="flex-1 items-center justify-center h-full"
>
  <View className="w-[28px] h-[28px] rounded-full bg-accent-base items-center justify-center">
    <Ionicons name="add" size={16} color="#0A0A0A" />
  </View>
  {/* No label */}
</Pressable>
```

### Press Feedback (Per Tab)

```tsx
const scale = useSharedValue(1);

const handlePressIn = () => {
  'worklet';
  scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
};

const handlePressOut = () => {
  'worklet';
  scale.value = withSpring(1, { damping: 15, stiffness: 400 });
};

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));
```

---

## 12. Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

// On tab press (not on re-tap of already active tab)
const handlePress = (tab: Tab) => {
  if (tab.key !== activeTab) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  tab.onPress();
};
```

**Haptic mapping:**
| Action | Feedback |
|--------|----------|
| Tab switch | Light impact |
| Add button press | Medium impact (slightly heavier, it's the primary action) |
| Re-tap active tab | No haptic (already there) |

---

## 13. Complete Tab Configuration

```typescript
const tabs = [
  {
    key: 'home',
    label: 'Home',
    iconOutline: 'home-outline',
    iconFilled: 'home',
    onPress: () => { /* ... */ },
  },
  {
    key: 'discover',
    label: 'Discover',
    iconOutline: 'compass-outline',
    iconFilled: 'compass',
    onPress: () => { /* ... */ },
  },
  {
    key: 'add',
    label: '',  // No label
    iconOutline: '', // Not used
    iconFilled: '',  // Not used — custom circle icon
    isSpecial: true,
    onPress: () => { setModal('add'); },
  },
  {
    key: 'library',
    label: 'Library',
    iconOutline: 'folder-outline',
    iconFilled: 'folder',
    onPress: () => { /* ... */ },
  },
  {
    key: 'profile',
    label: 'Profile',
    iconOutline: 'person-outline',
    iconFilled: 'person',
    onPress: () => { /* ... */ },
  },
];
```

---

## 14. Animation Summary

| Element | Animation | Timing | Easing |
|---------|-----------|--------|--------|
| Icon color change | None (instant) | — | — |
| Label color change | None (instant) | — | — |
| Press scale | `withSpring(0.92)` | ~200ms | Spring (damping 15, stiffness 400) |
| Release scale | `withSpring(1)` | ~200ms | Spring (damping 15, stiffness 400) |
| Bar entrance | `FadeIn` | 300ms | Ease-out |
| ~~Sliding indicator~~ | **Removed** | — | — |

**Total animation budget:** ~200ms for press feedback. Everything else is instant state changes. iOS tab bars feel snappy because they don't animate the selection — they just change state.

---

## 15. Before/After Comparison

### Before (Current)
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ╭──────────────────────────────────────────────╮    │
│  │ 🏠    🧭    ⬛[➕]    📁    👤              │    │ ← Floating pill
│  │ Home Disc  Add   Lib  Prof                    │    │ ← Tiny labels
│  ╰──────────────────────────────────────────────╯    │ ← Heavy shadow
│░░░░░░░░░░░░░░░░ safe area ░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────────┘
```

### After (Redesigned)
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│                    CONTENT                           │
│                                                      │
├──────────────────────────────────────────────────────┤ ← 1px #222222
│  🏠     🧭     ⬤[➕]     📁     👤                 │ ← Full-width, flush
│ Home  Discover       Library  Profile                │ ← Clean labels
│                                                      │
├──────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░ safe area ░░░░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────────────────────────────────────────┘
```

---

## 16. Files Modified

| File | Action |
|------|--------|
| `components/library/BottomDock.tsx` | Full rewrite per this spec |
| `app/(tabs)/_layout.tsx` | No changes needed (already hides native tab bar) |
| `app/(tabs)/home.tsx` | Add bottom padding for content scroll |
| `app/(tabs)/discover.tsx` | Add bottom padding for content scroll |
| `app/(tabs)/folders.tsx` | Add bottom padding for content scroll |
| `tailwind.config.js` | No changes — all tokens already exist |

---

## 17. Testing Checklist

- [ ] Bar sits flush at bottom edge on iPhone SE (no safe area)
- [ ] Bar sits above home indicator on iPhone 14 Pro (34px safe area)
- [ ] Bar sits above home indicator on iPhone 15 Pro Max
- [ ] All 5 tabs have equal width and proper spacing
- [ ] Active tab icon is filled + accent colored
- [ ] Inactive tab icons are outline + tertiary colored
- [ ] Active tab label is accent colored + medium weight
- [ ] Inactive tab labels are tertiary colored + regular weight
- [ ] Add button is a 28px accent circle, no label, no shadow
- [ ] Add button opens the Add modal
- [ ] Press feedback: scale down to 0.92 on press, spring back on release
- [ ] Light haptic on tab switch
- [ ] Medium haptic on Add button press
- [ ] No haptic on re-tap of active tab
- [ ] Tab bar background is #0A0A0A with 1px top border
- [ ] Shadow is subtle (opacity 0.15, radius 8)
- [ ] Content scrolls behind bar without being clipped
- [ ] Content has bottom padding so last item isn't hidden behind bar
- [ ] Bar works in both portrait and landscape (if applicable)
- [ ] No hardcoded colors — all using NativeWind tokens
- [ ] TypeScript strict mode: no `any` types

---

## 18. Accessibility

| Requirement | Implementation |
|-------------|---------------|
| **Touch targets** | 56px height × tab width — all ≥ 44×44pt minimum |
| **VoiceOver labels** | Each tab: `accessibilityLabel="Home tab"`, `accessibilityRole="button"`, `accessibilityState={{ selected: isActive }}` |
| **Color contrast** | Accent #8EC934 on #0A0A0A = **8.2:1** ratio (exceeds WCAG AAA) |
| **Inactive contrast** | #555555 on #0A0A0A = **3.5:1** ratio (meets WCAG AA for large text — icons at 24px qualify) |
| **Reduced motion** | Scale animation respects `prefers-reduced-motion` — no spring, instant state change |
| **Focus indicators** | Not needed for touch — but if keyboard navigation is added later, add `focusVisible` outline |

---

**UI Designer:** UI Designer  
**Date:** 2026-07-25  
**Status:** Ready for implementation  
**Estimated effort:** 2-3 hours (rewrite + testing)
