# Stash — Build Guide (Share Intent requires Custom Dev Build)

## Why you can't use Expo Go for sharing

Expo Go is a sandboxed app. It can't register as a share target in Android/iOS.
You need a **custom development build** with `expo-dev-client`.

---

## Step 1 — Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

---

## Step 2 — Configure your Expo account

```bash
eas build:configure
```

---

## Step 3 — Build a dev APK (Android)

```bash
eas build --profile development --platform android
```

This produces a `.apk` file you can download and install directly on your Android phone.

---

## Step 4 — Install on your phone

1. Download the `.apk` from the EAS dashboard link
2. Open it on your Android phone (enable "Install from Unknown Sources" in settings)
3. Launch **Stash** from the installed app

---

## Step 5 — Start your dev server

```bash
npx expo start --dev-client
```

---

## Step 6 — Test share from Instagram

1. Open Instagram on your phone
2. Find any video or post
3. Tap the **Share** button → **More** → you will see **"Stash"** in the list!
4. Tap it — Stash opens with a beautiful bottom sheet pre-filled with the link, title, and auto-detected platform
5. Pick a collection (optional) and tap **Stash it!**
6. Done — it saves to your library and syncs to Supabase ✅

---

## Local build (no EAS account needed)

If you don't want to use EAS cloud, you can build locally:

```bash
# Android (needs Android Studio installed)
npx expo run:android

# iOS (needs Xcode on macOS)
npx expo run:ios
```

---

## Supabase Schema

Run `schema.sql` in your Supabase SQL Editor to set up the database tables before testing.
