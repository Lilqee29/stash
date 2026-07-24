########### FIXED

1. iOS Bundled 714ms — moti/worklets crash in discover.tsx
FIX: Removed `moti` import. Replaced MotiView with plain View.

########### FIXED

2. Unable to resolve "@/components/Button" in onboarding files
FIX: Replaced `@/` imports with relative paths (not configured in Metro).

########### FIXED

3. Unterminated JSX in import.tsx
FIX: Rewrote file with proper View tags.

########### FIXED

4. Unterminated JSX in processing.tsx
FIX: Rewrote file with proper View tags.

########### FIXED

5. After last onboarding, not going to sign-up
FIX: Changed redirect from `/onboarding` back to `/splash` (original entry point).
Fixed navigation in how-to-use.tsx and import.tsx to route to `/sign-up`.

Correct flow:
  splash → how-found → import → processing → how-to-use → sign-up → home
