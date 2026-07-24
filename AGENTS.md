# Stash — Agent Rules

Personal bookmark brain for TikTok/Instagram saves. iOS app. Expo + React Native + TypeScript + Supabase.

---

## Stack (Exact Versions)

- Expo SDK 54 (`~54.0.33`)
- React Native 0.81.5
- TypeScript 5.9.2 (strict mode)
- Expo Router v6 (`~6.0.23`)
- NativeWind v4 (`^4.2.4`) + Tailwind 3.4
- Zustand 5 (`^5.0.13`)
- Supabase JS (`^2.105.4`)
- Moti (`^0.30.0`) + Reanimated (`~4.1.1`)
- React 19.1.0

---

## Directory Layout

```
stash/
├── app/                    # Expo Router screens ONLY
│   ├── _layout.tsx         # Root layout (fonts, auth, share intent)
│   ├── index.tsx           # Redirect → /home
│   ├── share.tsx           # Share intent bottom sheet
│   ├── profile.tsx         # Profile screen
│   ├── notifications.tsx   # Notifications
│   ├── recently-imported.tsx
│   ├── (auth)/             # Unauthenticated flow
│   │   ├── _layout.tsx
│   │   ├── splash.tsx
│   │   ├── sign-up.tsx
│   │   ├── sign-in.tsx
│   │   └── onboarding/     # Import + AI processing flow
│   ├── (tabs)/             # Main app tabs
│   │   ├── _layout.tsx     # Custom BottomDock (not native tabs)
│   │   ├── home.tsx
│   │   ├── search.tsx
│   │   ├── folders.tsx
│   │   ├── discover.tsx
│   │   └── settings.tsx
│   ├── folder/[id].tsx     # Dynamic folder detail
│   ├── save/[id].tsx       # Dynamic save detail
│   └── settings/           # Settings sub-screens
├── components/
│   ├── ui/                 # Design system primitives (Button, Card, etc.)
│   ├── library/            # Home/library screen components
│   └── modals/             # Bottom sheets and overlays
├── hooks/
│   └── useStore.ts         # Zustand global state
├── lib/
│   ├── supabase.ts         # Supabase client with SecureStore adapter
│   └── parser/             # TikTok + Instagram JSON parsers
└── supabase/
    └── schema.sql          # Database schema
```

---

## RED LINES (NEVER)

| Rule | Why |
|------|-----|
| NEVER use `any` types | TypeScript strict mode — define proper interfaces |
| NEVER use class components | Functional + hooks only |
| NEVER use React Navigation | Expo Router file-based routing exclusively |
| NEVER use `navigation.navigate()` | Use `router.push()` or `<Link>` |
| NEVER store tokens in AsyncStorage | Use `expo-secure-store` (Supabase adapter already in `lib/supabase.ts`) |
| NEVER call Anthropic API from client | All AI calls go through Supabase Edge Functions |
| NEVER hardcode colors | Use NativeWind classes matching DESIGN.md tokens |
| NEVER use inline styles | Use NativeWind `className` prop |
| NEVER use `require()` / `module.exports` | ESM `import`/`export` only |
| NEVER use `useGlobalSearchParams` | Use `useLocalSearchParams` to prevent cascading re-renders |
| NEVER use bare `useStore()` | Always use selector: `useStore((s) => s.field)` |
| NEVER create barrel exports (`index.ts`) in components/ | Breaks fast refresh — import directly from file |
| NEVER use `FlatList` for >20 items without `keyExtractor` | Performance — always provide `keyExtractor` and `getItemLayout` |
| NEVER use default Image component | Use `expo-image` for caching + blurhash |
| NEVER skip error handling on Supabase calls | Always check `error` return value |
| NEVER add expo-dev-client for Expo Go | This project uses Expo Go — no native modules that require dev builds |
| NEVER force-assign folders below 0.7 confidence | Unsorted items go to `is_unsorted = true` |
| NEVER render Android-only UI on iOS | Platform-specific code must check `Platform.OS` |

---

## Run Commands

```bash
# Development
npx expo start              # Start Expo Go dev server
npx expo start --ios        # Start with iOS simulator
npx expo start --clear      # Clear cache and restart

# Type checking
npx tsc --noEmit            # Run TypeScript compiler

# Linting (if configured)
npx eslint .                # Run ESLint
```

---

## Code Conventions

### File Naming
- **Screens** (in `app/`): `kebab-case.tsx` (e.g., `sign-up.tsx`, `recently-imported.tsx`)
- **Components** (in `components/`): `PascalCase.tsx` (e.g., `BottomDock.tsx`, `FolderCard.tsx`)
- **Hooks** (in `hooks/`): `useCamelCase.ts` (e.g., `useStore.ts`)
- **Utils** (in `lib/`): `camelCase.ts` (e.g., `supabase.ts`)
- **Dynamic routes**: `[param].tsx` (e.g., `[id].tsx`)

### Exports
- **Components**: Named exports (`export function Button() {}`)
- **Screens**: Default exports (`export default function HomeScreen() {}`)
- **Hooks/Libs**: Named exports

### Component Structure
```tsx
import { View, Text } from 'react-native';
import { cn } from 'nativewind';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-[14px] px-[14px] py-[16px]',
        variant === 'primary' ? 'bg-[#639922]' : 'border border-[#2E2E2E]'
      )}
    >
      <Text className={cn(
        'font-dm-sans text-[15px]',
        variant === 'primary' ? 'text-white font-medium' : 'text-[#888888]'
      )}>
        {title}
      </Text>
    </Pressable>
  );
}
```

---

## Design System (Quick Reference)

### Colors
- Background: `#0A0A0A` (primary), `#111111` (cards), `#1A1A1A` (inputs)
- Accent: `#639922` (base), `#72A926` (bright), `#4A7219` (pressed)
- Text: `#FFFFFF` (primary), `#888888` (secondary), `#555555` (tertiary)
- Borders: `#222222` (subtle), `#2E2E2E` (medium)

### Typography
- Headings: Syne (Bold 700, ExtraBold 800)
- Body: DM Sans (Regular 400, Medium 500)
- Scale: xs(10), sm(12), base(14), md(16), lg(20), xl(24), 2xl(32)

### Spacing
- Base unit: 4px — all values multiples of 4
- Scale: xs(4), sm(8), md(12), lg(16), xl(24), 2xl(32), 3xl(48)

### Border Radius
- sm(8), md(12), lg(16), xl(24), full(9999)

---

## Apple HIG Compliance

- Minimum tap target: 44×44pt
- Always use `SafeAreaView` / `useSafeAreaInsets()`
- Dark mode only — never provide appearance toggle
- Haptics: light impact on button press, success on import complete
- Use SF Symbols icons via `@expo/vector-icons`
- Bottom sheet: slide from bottom, swipe to dismiss
- Back button: label with parent screen title, not generic "Back"

---

## State Management

- **Zustand** (`useStore.ts`): Global state — user, folders, saves, onboarding progress
- **Local state** (`useState`): UI-only — modals, input values, toggle states
- **Supabase**: Server state — all data lives in Supabase, fetched on demand

### Zustand Rules
```typescript
// CORRECT — selector pattern
const user = useStore((s) => s.user);
const folders = useStore((s) => s.folders);

// WRONG — bare store (re-renders on every state change)
const { user, folders } = useStore();
```

---

## Supabase Patterns

```typescript
// Always use typed client
import { supabase } from '../lib/supabase';

// Always handle errors
const { data, error } = await supabase.from('saves').select('*');
if (error) {
  console.error('Failed to fetch saves:', error.message);
  return;
}

// Always scope to user (RLS handles this, but be explicit in Edge Functions)
const { data, error } = await supabase
  .from('saves')
  .select('*')
  .eq('user_id', user.id);
```

---

## Navigation

- File-based routing via Expo Router
- Protected routes: check session in `(auth)/_layout.tsx`, redirect to `/(auth)/splash` if unauthenticated
- Tab navigation: custom `BottomDock` component (not native tab bar)
- Modals: placed outside tab groups in `app/` root
- Dynamic routes: `folder/[id].tsx`, `save/[id].tsx`

---

## Performance

- `expo-image` for all thumbnails (caching, blurhash, WebP)
- Lazy-load folder contents — don't fetch all saves on home
- Paginate search: 20 per page
- `React.memo()` on list items (SaveCard, FolderCard)
- Staggered animations via Moti for list appearance
- Background AI processing — never block UI during import

---

## Context Pointers

- Full design system: `../files/DESIGN.md`
- Architecture details: `../files/ARCHITECTURE.md`
- Product requirements: `../files/PRD.md`
- Supabase schema: `supabase/schema.sql`
- HTML UI mockup: `../files/stash-ui.html`
