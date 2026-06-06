# Feature Specification: Code Cleanup & Restructuring

**Feature Branch**: `005-code-cleanup`  
**Created**: 2026-05-27  
**Status**: Draft  

## Overview

Remove dead code, consolidate duplicated styles, and normalize inconsistencies across the SproutPlay `app/www/` codebase. No new features are introduced — this is a pure cleanup and deduplication pass.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Dead Phonics Files Removed (Priority: P1)

The codebase currently has three competing phonics audio systems. The orphaned `phonics-audio.js` module is not loaded by any HTML file and the 26 hardcoded `<audio>` tags in `abc/index.html` are a legacy holdover. Both should be removed, leaving `Sound.phonics()` via NativeAudio as the sole phonics system.

**Why this priority**: Dead code creates confusion for future developers, and the duplicate `<audio>` tags waste page load time on every ABC session.

**Independent Test**: Open `abc/index.html` in a browser or device. Tap a letter tile — it plays audio correctly via the Sound module. Inspect the HTML source: no `<audio>` tags present. Confirm `phonics-audio.js` file no longer exists in the repo.

**Acceptance Scenarios**:

1. **Given** the ABC mini-app is open, **When** a letter tile is tapped, **Then** the correct phonics sound plays (via `Sound.phonics()`) with no errors in the console
2. **Given** the repo source, **When** searching for `phonics-audio.js`, **Then** no file or reference is found
3. **Given** `abc/index.html`, **When** viewing the source, **Then** no `<audio>` tags appear

---

### User Story 2 — Shared CSS Loaded by All Mini-Apps (Priority: P1)

`base.css` defines `.back-button`, `.celebration-overlay`, `.celebration-card`, `.play-again-button` and related rules. Four mini-apps (abc, memory, monster, paint) do not load `base.css` and instead copy those rules into their own CSS files. Adding `base.css` to all mini-apps and removing the duplicated rules gives a single source of truth.

**Why this priority**: CSS duplication means any style fix must be made in 4+ places. It's the largest source of inconsistency in the project.

**Independent Test**: Open each mini-app (abc, memory, monster, paint, space). Verify the back button, celebration overlay, and play-again button all render and behave identically across all five apps. No visual regressions.

**Acceptance Scenarios**:

1. **Given** any mini-app HTML file, **When** viewing `<head>`, **Then** a `<link>` to `../css/base.css` is present
2. **Given** `abc.css`, `memory.css`, `monster.css`, `space.css`, **When** searching for `.back-button`, `.celebration-overlay`, `.celebration-card`, `.play-again-button`, **Then** none of those selectors appear (rules live only in `base.css`)
3. **Given** each mini-app running on device, **When** navigating to the celebration screen, **Then** the overlay renders correctly with no broken styles

---

### User Story 3 — JS Module Style Normalized (Priority: P2)

`sound.js` declares its IIFE with `var Sound = (function() {` while every other shared module uses `const`. This inconsistency signals the file predates the ES6 adoption that happened across the rest of the codebase.

**Why this priority**: Consistency aids readability and prevents confusion about whether the inconsistency is intentional.

**Independent Test**: Grep the repo for `^var ` at module level in shared JS files — zero results. All sound functionality continues to work across all mini-apps that use `Sound`.

**Acceptance Scenarios**:

1. **Given** `sound.js`, **When** viewing the module declaration, **Then** it reads `const Sound = (function() {`
2. **Given** all mini-apps that call `Sound.flip()`, `Sound.phonics()`, `Sound.speak()`, etc., **When** exercised, **Then** all audio works correctly with no errors

---

### User Story 4 — HTML Indentation Normalized (Priority: P3)

`monster/index.html` uses 2-space indentation throughout; `space/index.html` switches from 4-space to 2-space mid-file. All other HTML files use 4-space consistently.

**Why this priority**: Cosmetic inconsistency; low risk but makes diffs noisier.

**Independent Test**: Run an indentation check on all mini-app HTML files — all use 4-space indent throughout. Both mini-apps function identically after reformatting.

**Acceptance Scenarios**:

1. **Given** `monster/index.html`, **When** viewing source, **Then** all indentation is 4-space
2. **Given** `space/index.html`, **When** viewing source, **Then** all indentation is consistent 4-space with no 2-space sections

---

### User Story 5 — Dead Stub Comments Removed from router.js (Priority: P3)

`router.js`'s `back()` function contains Phase 1/Phase 2 TODO comments referencing a parental gate that was never implemented. These add noise without actionable context.

**Why this priority**: Lowest risk, purely cosmetic.

**Independent Test**: Open `router.js` — no Phase 1/Phase 2 stub comments in `back()`. Hub back-navigation still works correctly.

**Acceptance Scenarios**:

1. **Given** `router.js`, **When** reading the `back()` function, **Then** no "Phase 1" or "Phase 2" stub comments appear
2. **Given** the hub running on device, **When** pressing the Android back button from settings view, **Then** navigation returns to hub correctly

---

### Edge Cases

- Removing the `<audio>` tags from `abc/index.html` must not break any JS that references them by ID (e.g., `document.getElementById('snd-A')`) — verify `abc.js` does not use those IDs
- Removing duplicate CSS rules must not inadvertently remove any mini-app-specific overrides that happen to share a selector name but have different values
- `paint/index.html` does not load `sound.js` — adding `base.css` must not introduce any JS dependencies

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The file `app/www/js/phonics-audio.js` MUST be deleted from the repository
- **FR-002**: All 26 `<audio id="snd-*">` tags MUST be removed from `app/www/abc/index.html`
- **FR-003**: `abc.js` MUST NOT reference any removed `<audio>` element IDs; any such references must be updated to use `Sound.phonics()`
- **FR-004**: All five mini-app HTML files (abc, memory, monster, paint, space) MUST include `<link rel="stylesheet" href="../css/base.css">` in `<head>`
- **FR-005**: The selectors `.back-button`, `.back-button:active`, `.celebration-overlay`, `.celebration-card`, `.celebration-card h2`, `.celebration-card p`, `.play-again-button`, `.play-again-button.secondary`, `.play-again-button:active` MUST NOT appear in `abc.css`, `memory.css`, `monster.css`, or `space.css`
- **FR-006**: `app/www/js/sound.js` module declaration MUST use `const Sound = (function() {` instead of `var Sound = (function() {`
- **FR-007**: `app/www/monster/index.html` MUST use 4-space indentation throughout
- **FR-008**: `app/www/space/index.html` MUST use consistent 4-space indentation throughout
- **FR-009**: `app/www/js/router.js` `back()` function MUST NOT contain Phase 1/Phase 2 stub comments; functional logic MUST be preserved

### Constraints

- Vanilla JS only — no frameworks, bundlers, or new npm packages
- IIFE singleton pattern must be preserved in all shared modules
- No new features may be introduced
- All five mini-apps must remain fully functional after changes

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero duplicate definitions of `.back-button`, `.celebration-overlay`, `.celebration-card`, or `.play-again-button` across all CSS files (verifiable by grep)
- **SC-002**: Zero references to `phonics-audio.js` anywhere in the codebase
- **SC-003**: Zero `<audio>` tags in `abc/index.html`
- **SC-004**: All five mini-apps open and function correctly on device with no console errors after changes
- **SC-005**: All shared JS modules declare their IIFE with `const` (zero `var` declarations at module level in shared files)
- **SC-006**: All mini-app HTML files pass a uniform 4-space indentation check

---

## Assumptions

- `abc.js` does not call `document.getElementById('snd-*')` or any Audio DOM API directly — it delegates to `Sound.phonics()`. (To be verified during implementation.)
- `paint/index.html` intentionally omits `sound.js`; adding `base.css` only introduces styles, not script dependencies.
- The existing `.back-button` definition in `base.css` is visually identical to the copies in mini-app CSS files. If any mini-app has intentional overrides, those must be preserved as mini-app-specific rules with a comment.
- `space.css` already has `base.css` loaded in its HTML but still duplicates the shared rules — the duplicated rules in `space.css` can be removed safely since `base.css` takes precedence anyway.
