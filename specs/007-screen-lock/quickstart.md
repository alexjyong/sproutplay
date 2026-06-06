# Quickstart: Manual Test Guide — Screen Lock

**Branch**: `007-screen-lock` | **Date**: 2026-06-06

This guide describes how to verify the screen lock feature works correctly. Test on a physical Android device (browser testing cannot test Android screen pinning).

---

## Setup

```bash
cd app
npm install
npx cap sync android
./build.sh
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Test 1 — Lock Icon Appears on Hub

**Goal**: Verify the lock icon is visible in the hub header when lock is enabled.

1. Open SproutPlay on device
2. Tap Settings gear icon (top-right)
3. Toggle "Lock SproutPlay" ON
4. Return to hub (tap back)
5. ✅ Expect: A small lock icon (🔒) is visible in the hub header, next to the settings gear

---

## Test 2 — Activate Screen Pinning

**Goal**: Verify tapping the lock icon activates Android screen pinning.

1. With lock enabled, tap the lock icon (🔒) in the hub header
2. ✅ Expect: Android system UI appears: "App is pinned" (or similar confirmation)
3. ✅ Expect: The lock icon text changes to "🔓 Unlock app" (or similar unlock indicator)
4. ✅ Expect: The child cannot exit — try home button, recent apps, and back button (all blocked)

---

## Test 3 — 4-Tap Unlock Sequence

**Goal**: Verify the 4-tap sequence unlocks the app.

1. With the app pinned (from Test 2), tap the lock icon 4 times quickly (within 1-second windows)
2. ✅ Expect: Toast notifications appear: "Tap 3 more times", "Tap 2 more times", "Tap 1 more time"
3. ✅ Expect: On the 4th tap, screen pinning deactivates (system UI confirms "App is unpinned")
4. ✅ Expect: The lock icon reverts to "🔒 Lock app"
5. ✅ Expect: Normal exit works (home button, back button)

---

## Test 4 — Tap Counter Reset on Pause

**Goal**: Verify that pausing >1 second between taps resets the counter.

1. With the app pinned, tap the lock icon 2 times
2. Wait 2 seconds (pause >1 second between taps)
3. Tap the lock icon 2 more times
4. ✅ Expect: The app does NOT unlock (counter reset after pause)
5. ✅ Expect: Toast feedback shows "Tap 2 more times" (counter reset to 2)

---

## Test 5 — Lock State Persists Across App Restarts

**Goal**: Verify lock state is saved to localStorage and persists.

1. Enable lock in Settings (toggle ON)
2. Close the app completely (force-close via Android Settings)
3. Reopen the app
4. ✅ Expect: The lock icon (🔒) is visible on the hub header (lock state persisted)

---

## Test 6 — Disable Lock in Settings

**Goal**: Verify disabling lock in Settings unlocks the app and hides the lock icon.

1. With the app pinned, go to Settings
2. Toggle "Lock SproutPlay" OFF
3. Return to hub
4. ✅ Expect: The lock icon is hidden (no longer visible in header)
5. ✅ Expect: Normal exit works (home button, back button)

---

## Test 7 — All Mini-Apps Respect Lock

**Goal**: Verify the lock blocks exit from all mini-apps.

1. Enable lock in Settings
2. Navigate to each mini-app (abc, memory, monster, paint, space)
3. Try to exit from each (home button, recent apps, back button)
4. ✅ Expect: All exit attempts are blocked while pinned

---

## Test 8 — APK Build (final gate)

```bash
./build.sh
```

✅ Expect: `BUILD SUCCESSFUL` with APK at `app/android/app/build/outputs/apk/debug/app-debug.apk`

Install on device:
```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

Run through all tests on device — verify screen pinning activates, all exit methods blocked, 4-tap unlock works.
