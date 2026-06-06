# Tasks: Screen Lock — Global App Pinning

**Input**: Design documents from `specs/007-screen-lock/`
**Branch**: `007-screen-lock`
**Prerequisites**: [spec.md](spec.md) ✅ | [plan.md](plan.md) ✅

**Tests**: No automated tests — manual verification per quickstart.md

**Organization**: Tasks follow the implementation order from plan.md (Java plugin first, then JS module, then HTML/CSS, then wiring).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Foundational — Create `ScreenPinningPlugin.java`

**Purpose**: Create the custom Capacitor Java plugin that wraps Android's `startLockTask()` / `stopLockTask()`. This is a direct copy from babbypaint.

**⚠️ CRITICAL**: This plugin must be created before any frontend work. The JS code calls `Capacitor.Plugins.ScreenPinning` — without the plugin, it silently fails.

**Independent Test**: Create the plugin file, register it in `MainActivity.java`. Build succeeds — no compilation errors.

### Implementation

- [X] T001 Create `app/android/app/src/main/java/dev/alexjyong/sproutplay/ScreenPinningPlugin.java` — copy from `babbypaint/app/android/app/src/main/java/dev/alexjyong/babbypaint/ScreenPinningPlugin.java`. Two methods: `enterPinnedMode()` calls `getActivity().startLockTask()`, `exitPinnedMode()` calls `getActivity().stopLockTask()`. Package: `dev.alexjyong.sproutplay`.
- [X] T002 Modify `app/android/app/src/main/java/dev/alexjyong/sproutplay/MainActivity.java` — add `registerPlugin(ScreenPinningPlugin.class)` in `onCreate()` before `super.onCreate()`.

**Checkpoint**: Plugin compiles and registers. `Capacitor.Plugins.ScreenPinning` is available in JS.

---

## Phase 2: Core Logic — Create `lock.js` Module

**Purpose**: Build the lock/unlock logic as a new IIFE module following the existing pattern (sound.js, settings.js, router.js). Manages the 4-tap sequence, toast feedback, and pin/unpin actions.

**Independent Test**: Create the module, call `Lock.init()` on DOM ready. Verify that `Lock.lock()` calls `ScreenPinning.enterPinnedMode()` and `Lock.unlock()` calls `ScreenPinning.exitPinnedMode()`. No UI yet — just the core logic.

### Implementation

- [X] T003 Create `app/www/js/lock.js` — IIFE module with:
  - `init()` — caches DOM references (lock icon button), binds click handler
  - `lock()` — calls `Capacitor.Plugins.ScreenPinning.enterPinnedMode()`, sets `isLocked = true`, updates button text to "Unlock app"
  - `unlock()` — handles 4-tap sequence: tracks tap count with 1-second window, shows toast feedback ("Tap N more times"), calls `Capacitor.Plugins.ScreenPinning.exitPinnedMode()` on 4th valid tap
  - `isLocked()` — returns current lock state
  - Toast feedback: reuse babbypaint's `showCustomToast()` pattern (or create a simple one if SproutPlay doesn't have it)

**Checkpoint**: `Lock.init()` binds the click handler. `Lock.lock()` activates screen pinning. 4-tap sequence works (toast feedback, counter reset on pause >1s).

---

## Phase 3: HTML — Add Lock Icon to Hub Header

**Purpose**: Add the lock icon HTML element to the hub header in `index.html`. It sits next to the existing settings gear button (top-right).

**Independent Test**: Open `index.html` in browser. Inspect the DOM — lock icon exists as a child of `.hub-header`. It is visible (not hidden).

### Implementation

- [X] T004 [P] Add lock icon HTML to `app/www/index.html` inside `.hub-header` (next to existing settings gear button):
  ```html
  <button id="lock-btn" class="lock-btn" aria-label="Lock app">🔒</button>
  ```
  Add `<script src="js/lock.js"></script>` to the script includes at the bottom of `index.html` (after `settings.js`, before `router.js`).

**Checkpoint**: DOM contains `#lock-btn` in the hub header. Script tag loads `lock.js`.

---

## Phase 4: CSS — Add Lock Icon Styles to `base.css`

**Purpose**: Style the lock icon to match SproutPlay's existing header button styles (similar to `.settings-btn`).

**Independent Test**: After adding CSS, open `index.html` in browser. The lock icon renders correctly (small circular button, top-right header area).

### Implementation

- [X] T005 [P] Add `.lock-btn` styles to `app/www/css/base.css`. Match existing `.settings-btn` styles (position: absolute, top-right, 48x48px circular button, semi-transparent background, hover/active states).

**Checkpoint**: Lock icon renders correctly in the hub header, positioned next to the settings gear.

---

## Phase 5: Wiring — Connect `lock.js` to `app.js` and `settings.js`

**Purpose**: Wire the lock icon to the Settings module and connect it to pin/unpin actions.

**Independent Test**: Open Settings → enable "Lock SproutPlay" → return to hub. Lock icon appears. Tap lock icon → app pins. Tap 4 times quickly → app unlocks.

### Implementation

- [X] T006 [US1] In `app/www/js/settings.js`, add `setScreenLocked(boolean)` and `isScreenLocked()` methods. Save/load to localStorage under key `sproutplay_settings.screenLocked`.
- [X] T007 [US1] In `app/www/js/app.js`, wire the lock icon button:
  - On settings load, set initial state from `Settings.isScreenLocked()`
  - On lock icon click, call `Lock.lock()` or `Lock.unlock()` based on current state
  - Wire the Settings "Lock SproutPlay" toggle to `Settings.setScreenLocked()`
- [X] T008 [US2] In `app/www/js/lock.js`, bind the lock icon click handler in `init()`. On first tap (not locked), call `Lock.lock()`. On subsequent taps (locked), handle the 4-tap unlock sequence.

**Checkpoint**: Lock icon appears when lock is enabled. Tapping it pins/unpins the app. 4-tap sequence works with toast feedback.

---

## Phase 6: Router Integration — Block Hub Exit When Locked

**Purpose**: When the app is pinned, `handleBackButton()` on the hub must return `true` (block exit) instead of `false`. This prevents the child from exiting even if they somehow bypass screen pinning.

**Independent Test**: With lock enabled and app pinned, press back from hub — exit is blocked. With lock disabled, back works normally.

### Implementation

- [X] T009 [US1] In `app/www/js/router.js`'s `handleBackButton()` function, add a check: if `Settings.isScreenLocked()` returns true (or `Lock.isLocked()` returns true), return `true` (block exit) instead of calling `back()`.
- [X] T010 [US1] Ensure `handleBackButton()` on non-hub views also respects the lock state (they already route through `back()`, which is blocked when locked).

**Checkpoint**: When locked, all exit attempts (home, recent apps, back button) are blocked. When unlocked, normal exit works.

---

## Phase 7: Settings UI — Add Lock Toggle to Settings Screen

**Purpose**: Add a "Lock SproutPlay" toggle to the Parental Controls section in Settings (similar to the existing parental gate toggle).

**Independent Test**: Open Settings → Parental Controls. "Lock SproutPlay" toggle is present and reflects the saved state.

### Implementation

- [X] T011 [US4] Add "Lock SproutPlay" toggle HTML to `app/www/index.html` in the Parental Controls section (below the existing parental gate toggle):
  ```html
  <label class="settings-toggle">
    <span class="toggle-label">Lock SproutPlay</span>
    <input type="checkbox" id="screen-lock-toggle" class="toggle-input">
    <span class="toggle-switch"></span>
    <span class="toggle-description">Prevent app exit</span>
  </label>
  ```
- [X] T012 [US4] In `app/www/js/app.js`, wire the "Lock SproutPlay" toggle:
  - On settings load, set `screen-lock-toggle.checked = Settings.isScreenLocked()`
  - On toggle change, call `Settings.setScreenLocked(this.checked)`

**Checkpoint**: Lock toggle saves/loads correctly. Enabling it shows the lock icon on hub. Disabling it hides the lock icon and unlocks (if pinned).

---

## Phase 8: Polish & Verification

**Purpose**: Full end-to-end verification and edge case handling.

**Independent Test**: Complete the full manual test checklist from quickstart.md.

### Implementation

- [X] T013 [US3] Handle edge case: if the app crashes while pinned, Android's system-level pinning should still hold (OS-managed, no special handling needed — verify this works).
- [X] T014 [US3] Handle edge case: rapid tap spam (more than 4 taps) — the counter simply stops at 4, no errors.
- [X] T015 [US4] Full verification: test lock/unlock from hub, test all exit methods (home button, recent apps, back button) while pinned, verify 4-tap unlock sequence, test lock state persistence across app restarts.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately. Creates `ScreenPinningPlugin.java`.
- **Phase 2 (Core Logic)**: Depends on Phase 1 — needs the plugin to be registered.
- **Phase 3 (HTML)**: Independent of Phase 2 — can run in parallel with CSS.
- **Phase 4 (CSS)**: Independent of Phase 2 — can run in parallel with HTML.
- **Phase 5 (Wiring)**: Depends on Phases 1, 2, 3, 4 complete — needs the plugin, JS module, HTML, and CSS.
- **Phase 6 (Router Integration)**: Depends on Phase 5 complete — needs the lock state to be accessible.
- **Phase 7 (Settings UI)**: Independent of Phases 2–5 — can run in parallel with Phase 5 (touches different files).
- **Phase 8 (Polish)**: Depends on all prior phases complete.

### Parallel Opportunities (Single Developer)

After Phase 1 completes:
- Run Phase 3 (HTML) and Phase 4 (CSS) in parallel — different files, no cross-dependencies
- Phase 7 (Settings UI) can start after Phase 1 (touches `settings.js` and `app.js`, not `lock.js`)

---

## Implementation Strategy

### Safest Order (Recommended)

1. ✅ Complete Phase 1 (create `ScreenPinningPlugin.java` + register in `MainActivity.java`) — verify compilation
2. ✅ Complete Phase 2 (create `lock.js` with 4-tap sequence) — verify pin/unpin logic
3. ✅ Complete Phases 3 + 4 in parallel (HTML + CSS) — verify lock icon renders
4. ✅ Complete Phase 5 (wire `lock.js` to `app.js`) — verify lock/unpin from hub
5. ✅ Complete Phase 6 (block hub exit in `router.js`) — verify exit blocked when locked
6. ✅ Complete Phase 7 (Settings UI) — verify lock toggle in Settings
7. ✅ Complete Phase 8 (polish + full verification) — test all edge cases

### MVP Scope

The natural MVP is **Phases 1–5** (core lock/unlock with visible icon). Phase 6 (router integration) and Phase 7 (Settings UI) are P2/P3 priorities per spec.md. The MVP delivers:
- A visible lock icon on the hub header
- Tap to pin (Android system-level)
- 4-tap unlock sequence with toast feedback

---

## Notes

- [P] tasks = different files, no blocking dependencies on each other
- The `ScreenPinningPlugin.java` is a **direct copy** from babbypaint — only the package name changes (`dev.alexjyong.sproutplay` instead of `dev.alexjyong.babbypaint`)
- The 4-tap sequence logic (tap counter, 1-second window, toast feedback) is **copied from babbypaint's `index.js`** (lines 195–280)
- Toast feedback: SproutPlay may not have a `showCustomToast()` function — if so, create a simple one (or use `alert()` as fallback for MVP)
- Screen pinning is an **Android OS feature** — once activated, it cannot be bypassed by the app. The only way to exit is through `stopLockTask()` (called after successful 4-tap unlock)
