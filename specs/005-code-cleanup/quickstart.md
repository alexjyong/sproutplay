# Quickstart: Manual Test Guide — Code Cleanup

**Branch**: `005-code-cleanup` | **Date**: 2026-05-27

This guide describes how to verify the cleanup changes haven't broken anything. Test in a browser (`file://` or `npx cap sync android && npx cap open android`) after each group of changes.

---

## Setup

```bash
cd app
npm install
npx cap sync android
```

Or for quick browser testing, open any `app/www/<miniapp>/index.html` directly in Chrome.

---

## Test 1 — ABC App: Audio Still Works

**After**: removing 26 `<audio>` tags and adding `base.css` to `abc/index.html`

1. Open `app/www/abc/index.html` in browser
2. Tap any letter tile (e.g., the "A" tile)
3. ✅ Expect: phonics sound plays (or synthesized tone fallback in browser)
4. ✅ Expect: no console errors (`Sound is not defined`, `Cannot read properties`, etc.)
5. Open DevTools → Elements → confirm no `<audio>` tags in the DOM
6. ✅ Expect: zero `<audio>` elements

---

## Test 2 — All Mini-Apps: Back Button and Celebration Styles

**After**: adding `base.css` to all mini-app HTMLs + removing duplicate CSS rules

Test each app:

| App | URL |
|-----|-----|
| ABC | `abc/index.html` |
| Memory | `memory/index.html` |
| Monster | `monster/index.html` |
| Paint | `paint/index.html` |
| Space | `space/index.html` |

For each app:
1. ✅ Expect: Back button visible in top-left, styled correctly (white text, semi-transparent bg)
2. ✅ Expect: Back button tap navigates to hub (or `../index.html`)
3. Play through to win condition to trigger celebration overlay
4. ✅ Expect: Celebration overlay appears correctly — centered card, emoji, buttons
5. ✅ Expect: "Play Again" and "Back to Hub" buttons are correctly styled and tappable

---

## Test 3 — Memory & Monster: Sound Works

**After**: `var → const` change in `sound.js`

1. Open `memory/index.html` — flip two cards
2. ✅ Expect: flip sound plays on first card; match/no-match sound on second card
3. Open `monster/index.html` — drag a food item to the monster
4. ✅ Expect: chomp sound plays

---

## Test 4 — No Dead Script Errors

**After**: deleting `phonics-audio.js`

1. Open each mini-app in browser with DevTools Console open
2. ✅ Expect: zero `Failed to load resource` errors for `phonics-audio.js`
3. ✅ Expect: zero `PhonicsAudio is not defined` errors

---

## Test 5 — Hub Back Button (router.js)

**After**: removing Phase 1/Phase 2 stub comments from `router.js`

1. Open `app/www/index.html`
2. Tap the Settings gear icon
3. ✅ Expect: settings view appears
4. Tap Back (or press Android back button)
5. ✅ Expect: returns to hub view

---

## Test 6 — APK Build (final gate)

```bash
./build.sh
```

✅ Expect: `BUILD SUCCESSFUL` with APK at `app/android/app/build/outputs/apk/debug/app-debug.apk`

Install on device:
```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

Run through all 5 mini-apps on device — audio, back button, celebration overlays.
