# Research: Screen Lock — Global App Pinning

**Branch**: `007-screen-lock` | **Date**: 2026-06-06

## Status: Complete — No Unknowns

All decisions were resolved by direct code scan of babbypaint (the reference implementation) and SproutPlay's existing infrastructure. No external research required.

---

## Decision Log

### D-001: Custom Capacitor Java plugin vs. npm package?

- **Decision**: Hand-written Java plugin (copy from babbypaint), NOT an npm package.
- **Rationale**: The `ScreenPinningPlugin.java` in babbypaint is only ~20 lines — two methods that call `startLockTask()` and `stopLockTask()`. There's no npm package for this (Android screen pinning is a native OS feature with no official Capacitor plugin). Copying the Java file is simpler than creating an npm package.
- **Alternatives considered**:
  - Search for existing npm Capacitor plugin — none found (screen pinning is Android-specific, not a cross-platform concern).
  - Use Capacitor's native API directly — rejected; requires Java code changes, more complex than a simple plugin.

### D-002: How to register the plugin in SproutPlay?

- **Decision**: Add `registerPlugin(ScreenPinningPlugin.class)` to `MainActivity.java`'s `onCreate()` method, before `super.onCreate()`.
- **Rationale**: This is how babbypaint registers its plugin (confirmed by code scan). SproutPlay's `MainActivity.java` is currently empty (just extends `BridgeActivity`) — one line of code.
- **Alternatives considered**:
  - Register via `capacitor.config.ts` — rejected; Capacitor plugins are registered in Java, not config.

### D-003: 4-tap unlock sequence (from babbypaint) vs. hold-button challenge (from 006)?

- **Decision**: Use the 4-tap sequence (proven in babbypaint), NOT the hold-button challenge from 006.
- **Rationale**: The 4-tap sequence is simpler, faster to execute, and proven in production (babbypaint). The hold-button challenge from 006 is designed for blocking exit — it's a "hold to stay" mechanic. The 4-tap sequence is a "tap to unlock" mechanic — different interaction patterns for different purposes.
- **Alternatives considered**:
  - Use the hold-button challenge from 006 as the unlock mechanism — rejected; different interaction model, slower to execute, and the hold-button is already used for blocking internal navigation (006).

### D-004: Lock icon placement?

- **Decision**: Small circular button in the hub header (top-right, next to settings gear). Visible on the hub, hidden when lock is disabled.
- **Rationale**: The hub header already has a settings gear button (`.settings-btn`) in the same position. Adding a lock icon next to it is consistent with existing UI patterns. It's visible on all views since the header is part of the hub shell (not per-mini-app).
- **Alternatives considered**:
  - Hidden gesture (long-press on hub logo) — rejected; not discoverable, parents need to find it easily.
  - Per-mini-app lock buttons — rejected; the spec calls for a **global** lock, not per-app.

### D-005: Should the lock icon be visible in mini-apps?

- **Decision**: No. The lock icon only appears on the hub header. Mini-apps don't need a visible lock button because:
  1. The lock is global — it applies to the entire app, not individual mini-apps
  2. When pinned, Android blocks all exit attempts (home, recent, back) — no need for a visible button in mini-apps
  3. The parent can navigate back to the hub (if not pinned) to access the lock icon
- **Alternatives considered**:
  - Show lock icon in all mini-app headers — rejected; adds UI clutter, not necessary since the lock is global.

### D-006: Toast feedback for 4-tap sequence?

- **Decision**: Create a simple toast notification in `lock.js` (or reuse babbypaint's `showCustomToast()` if it exists in SproutPlay).
- **Rationale**: The 4-tap sequence needs feedback so parents know how many taps remain. Babbypaint uses `showCustomToast()` — if SproutPlay doesn't have an equivalent, create a simple one (or use `alert()` as fallback for MVP).
- **Alternatives considered**:
  - No feedback — rejected; parents need to know how many taps remain.
  - Vibration feedback — rejected; requires Capacitor haptics plugin (not installed in SproutPlay).
