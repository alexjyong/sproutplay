# Feature Specification: Screen Lock — Global App Pinning

**Feature Branch**: `007-screen-lock`
**Created**: 2026-06-06
**Status**: Draft

## Overview

Implement Android system-level screen pinning for the entire SproutPlay app. When a parent enables the lock, the app is pinned at the OS level — the child cannot exit via home button, recent apps, or back button. The parent unlocks by tapping a visible lock icon 4 times quickly (matching the babbypaint pattern from `babbypaint/app/www/js/index.js`).

This is a **global** lock — it covers the entire app, not individual mini-apps. The lock is managed from Settings and applies to all navigation within SproutPlay.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Parent Enables Lock, Child Cannot Exit (Priority: P1)

A parent enables "Lock SproutPlay" in Settings. The app is pinned at the Android OS level. The child cannot leave — not from mini-apps, not from the hub, not via home button or recent apps. The parent can still exit by unlocking first.

**Why this priority**: This is the core security boundary. Without it, there's no true containment — kids can still exit the app through any route.

**Independent Test**: Enable lock in Settings, tap the lock icon to pin. Try to exit via home button, recent apps, and back button — all blocked. Tap lock icon 4 times quickly to unlock — normal exit works again.

**Acceptance Scenarios**:

1. **Given** screen lock is enabled in Settings, **When** the parent taps the lock icon in the hub header, **Then** Android screen pinning activates (system UI confirms "App is pinned")
2. **Given** the app is pinned, **When** the child tries to exit (home button, recent apps, back button), **Then** all exit attempts are blocked by Android OS
3. **Given** the app is pinned, **When** the parent taps the lock icon 4 times within 1-second intervals, **Then** screen pinning deactivates and normal exit works

---

### User Story 2 — Visible Lock/Unlock Button (Priority: P1)

A small lock icon appears in the hub header (top-right, next to the settings gear). When not locked, it says "Lock app". When locked, it says "Unlock app". The button is always visible on the hub (and optionally in mini-apps) so parents can find it.

**Why this priority**: Without a visible button, parents can't unlock the app. The button must be easy to find and clearly indicate state.

**Independent Test**: Open the hub with lock enabled. The lock icon is visible in the header. Tap it to lock/unlock. Text changes between "Lock app" and "Unlock app".

**Acceptance Scenarios**:

1. **Given** lock is enabled but not yet pinned, **When** viewing the hub header, **Then** a lock icon (🔒) is visible next to the settings gear
2. **Given** the app is pinned, **When** viewing the hub header, **Then** the lock icon changes to "Unlock app" (🔓)
3. **Given** the app is pinned, **When** the parent taps the lock icon 4 times quickly (within 1-second windows), **Then** the app unlocks and the icon reverts to "Lock app"

---

### User Story 3 — 4-Tap Unlock Sequence (Priority: P2)

To unlock, the parent taps the lock icon 4 times within 1-second windows. Toast notifications guide the parent: "Tap 3 more times", "Tap 2 more times", etc. If the parent pauses >1 second between taps, the counter resets.

**Why this priority**: Prevents accidental unlocks while still being simple enough for parents to use. The 4-tap sequence is proven from babbypaint and works well for preventing kids from figuring it out.

**Independent Test**: With the app pinned, tap the lock icon 4 times quickly (within 1-second windows). The app should unlock. Tap fewer than 4 times, or pause >1 second between taps — the counter resets.

**Acceptance Scenarios**:

1. **Given** the app is pinned, **When** the parent taps the lock icon 4 times within 1-second windows, **Then** the app unlocks (screen pinning deactivates)
2. **Given** the app is pinned, **When** the parent taps fewer than 4 times, **Then** no unlock occurs and the counter resets after 1 second
3. **Given** the app is pinned, **When** the parent pauses >1 second between taps, **Then** the tap counter resets to 0

---

### User Story 4 — Settings Integration (Priority: P3)

The Settings screen has a "Lock SproutPlay" toggle (similar to the existing parental gate toggle). When enabled, it saves the lock state to localStorage and shows the lock icon on the hub. When disabled, it unlocks the app (if pinned) and hides the lock icon.

**Why this priority**: Parents need a way to enable/disable the lock from Settings. This is lower priority because the lock icon on the hub provides an alternative path.

**Independent Test**: Open Settings → Parental Controls. Toggle "Lock SproutPlay" ON/OFF. Verify the lock icon appears/disappears on the hub.

**Acceptance Scenarios**:

1. **Given** the Settings screen is open, **When** viewing Parental Controls, **Then** a "Lock SproutPlay" toggle is present
2. **Given** the lock is enabled, **When** viewing the hub, **Then** a lock icon appears in the header (next to settings gear)
3. **Given** the lock is disabled, **When** viewing the hub, **Then** no lock icon appears (or it's hidden)

---

## Edge Cases

- **App crash during pinning**: If the app crashes while pinned, Android's system-level pinning should still hold (the OS manages it, not the app). The child can't exit until a force-close via Android Settings.
- **Lock icon hidden by keyboard**: If a mini-app shows a keyboard (unlikely in SproutPlay), the lock icon should remain visible above it.
- **Rapid tap spam**: Tapping the lock icon rapidly (more than 4 taps) should not cause errors — the counter simply stops at 4.
- **Orientation change during pinning**: Android handles this natively — the pinned screen rotates with the device. No special handling needed.
- **Multiple devices / family use**: The lock is per-device, not per-parent. If multiple parents share the device, any of them can unlock by knowing the 4-tap sequence.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When "Lock SproutPlay" is enabled in Settings, a lock icon (🔒) MUST appear in the hub header (top-right, next to settings gear)
- **FR-002**: Tapping the lock icon MUST activate Android screen pinning (`startLockTask()`) — the child cannot exit via home, recent apps, or back button
- **FR-003**: When pinned, the lock icon text MUST change to "Unlock app" (🔓)
- **FR-004**: To unlock, the parent MUST tap the lock icon 4 times within 1-second windows
- **FR-005**: Toast notifications MUST guide the parent: "Tap 3 more times", "Tap 2 more times", etc.
- **FR-006**: If the parent pauses >1 second between taps, the tap counter MUST reset
- **FR-007**: On the 4th valid tap, screen pinning MUST deactivate (`stopLockTask()`) and normal exit works
- **FR-008**: When lock is disabled in Settings, the app MUST unlock (if pinned) and the lock icon MUST be hidden
- **FR-009**: The lock state MUST persist across app restarts (saved to localStorage via Settings module)

### Constraints

- Vanilla JS only — no frameworks, bundlers, or new npm packages
- Must use a **custom Capacitor Java plugin** (hand-written, copied from babbypaint) — no npm package
- Must follow the existing IIFE singleton pattern for any new JS modules
- Must use the existing `Settings` IIFE module (`settings.js`) for lock state persistence
- Must match the babbypaint unlock pattern (4-tap sequence, 1-second window, toast feedback)
- No new dependencies — the ScreenPinning plugin is a hand-written Java file, not an npm package

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When lock is enabled and the icon is tapped, Android screen pinning activates within 500ms (verifiable by system UI confirmation)
- **SC-002**: While pinned, all exit attempts (home button, recent apps, back button) are blocked by Android OS (verified by testing each exit method)
- **SC-003**: Tapping the lock icon 4 times within 1-second windows successfully unlocks the app (verified by testing the full unlock sequence)
- **SC-004**: Pausing >1 second between taps resets the counter to 0 (verified by tapping 2 times, waiting 2 seconds, then tapping 2 more times — should NOT unlock)
- **SC-005**: Lock state persists across app restarts (verified by enabling lock, restarting app, verifying lock icon still shows)
- **SC-006**: Disabling lock in Settings deactivates screen pinning and hides the lock icon (verified by toggling off, then exiting app)

---

## Assumptions

- The babbypaint `ScreenPinningPlugin.java` (custom Capacitor plugin) can be copied directly to SproutPlay's Android source — it's a simple 2-method plugin that calls `startLockTask()` / `stopLockTask()`.
- Android API 21+ (required by Capacitor 8) supports screen pinning — confirmed by Android documentation.
- The lock icon will be placed in the hub header (top-right, next to settings gear) — this is visible on all views since the header is part of the hub shell.
- The 4-tap sequence (proven in babbypaint) is sufficient to prevent kids from figuring out the unlock — no additional challenge (like the hold-button from 006) is needed for unlocking.
- Screen pinning is an Android OS feature — once activated, it cannot be bypassed by the app itself. The only way to exit is through `stopLockTask()` (called after successful 4-tap unlock).
