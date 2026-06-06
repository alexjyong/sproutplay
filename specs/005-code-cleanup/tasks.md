# Tasks: Code Cleanup & Restructuring

**Input**: Design documents from `specs/005-code-cleanup/`  
**Branch**: `005-code-cleanup`  
**Prerequisites**: [plan.md](plan.md) ✅ | [spec.md](spec.md) ✅ | [research.md](research.md) ✅ | [quickstart.md](quickstart.md) ✅

**Tests**: No automated tests — manual verification per [quickstart.md](quickstart.md)

**Organization**: Tasks follow the safe implementation order from plan.md (add CSS before removing it; delete dead files early; cosmetic fixes last).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1–US5)

---

## Phase 1: Foundational — Add `base.css` to All Mini-App HTML Files

**Purpose**: `base.css` must be linked *before* duplicate CSS rules are removed from mini-app files. Doing this first guarantees no visual regression at any point during the cleanup.

**⚠️ CRITICAL**: Complete all Phase 1 tasks before any Phase 2 CSS removal begins.

- [x] T001 [P] Add `<link rel="stylesheet" href="../css/base.css" type="text/css">` as the first stylesheet in `app/www/abc/index.html` `<head>` (before the existing `abc.css` link)
- [x] T002 [P] Add `<link rel="stylesheet" href="../css/base.css" type="text/css">` as the first stylesheet in `app/www/memory/index.html` `<head>` (before the existing `memory.css` link)
- [x] T003 [P] Add `<link rel="stylesheet" href="../css/base.css" type="text/css">` as the first stylesheet in `app/www/monster/index.html` `<head>` (before the existing `monster.css` link)
- [x] T004 [P] Add `<link rel="stylesheet" href="../css/base.css" type="text/css">` as the first stylesheet in `app/www/paint/index.html` `<head>` (before the existing `paint.css` link)

> Note: `space/index.html` already loads `base.css` — no change needed for T005.

**Checkpoint**: Open each of the 4 mini-apps in browser. Back button, celebration overlay, and play-again button should still render correctly (now backed by `base.css`).

---

## Phase 2: User Story 2 — Remove Duplicate CSS Rules from Mini-App Files

**Goal**: Eliminate ~80 lines of duplicated CSS that are already authoritatively defined in `base.css`. Each file can be done independently.

**Independent Test**: Open each mini-app in browser after its CSS is updated. Back button, celebration overlay, and play-again buttons must render and behave identically to before. No visual regressions.

**Selectors to remove** from each file (compare with `base.css` before deleting — if any values differ from `base.css`, keep the rule and add a `/* mini-app override */` comment):
```
.back-button
.back-button:active
.celebration-overlay
.celebration-card
.celebration-card h2
.celebration-card p
.play-again-button
.play-again-button.secondary
.play-again-button:active
```

- [x] T005 [P] [US2] Remove the 9 shared selectors listed above from `app/www/css/abc.css` (lines ~23–39 and ~207–285). Diff each rule against `base.css` before deleting. Visual check: open `abc/index.html`, verify back button and celebration overlay render correctly.
- [x] T006 [P] [US2] Remove the 9 shared selectors from `app/www/css/memory.css` (lines ~23–39 and ~195–285). Diff each rule against `base.css` before deleting. Visual check: open `memory/index.html`, complete a game to trigger celebration overlay.
- [x] T007 [P] [US2] Remove the 9 shared selectors from `app/www/css/monster.css` (lines ~21 and ~192–250). Diff each rule against `base.css` before deleting. Visual check: open `monster/index.html`, verify back button and celebration overlay render correctly.
- [x] T008 [P] [US2] Remove the 9 shared selectors from `app/www/css/space.css` (lines ~132–199). Diff each rule against `base.css` before deleting. Visual check: open `space/index.html`, verify back button, gameover overlay, and celebration overlay render correctly.

**Checkpoint**: All 5 mini-apps open and visually match their pre-cleanup appearance. US2 complete.

---

## Phase 3: User Story 1 — Remove Dead Phonics Audio Systems

**Goal**: Delete the orphaned `phonics-audio.js` file and the 26 legacy `<audio>` tags from `abc/index.html`, leaving `Sound.phonics()` as the sole phonics audio path.

**Independent Test**: Open `abc/index.html` → tap a letter tile → phonics sound plays with no console errors. Inspect DOM: zero `<audio>` elements present. Confirm `phonics-audio.js` no longer exists on disk.

- [x] T009 [US1] Delete the file `app/www/js/phonics-audio.js` from the repository entirely. Verify no HTML file references it (run: `grep -r "phonics-audio" app/www/`; expect zero results).
- [x] T010 [US1] Remove all 26 `<audio id="snd-A">` through `<audio id="snd-Z">` tags from the bottom of `app/www/abc/index.html` (lines 49–74). Verify `abc.js` has no `getElementById('snd-*')` or `Audio` references (already confirmed zero; double-check after edit). Open `abc/index.html` in browser, tap letter tiles, confirm audio plays via `Sound.phonics()` with no console errors.

**Checkpoint**: `phonics-audio.js` is gone. `abc/index.html` has no `<audio>` tags. ABC app plays phonics audio correctly. US1 complete.

---

## Phase 4: User Story 3 — Normalize JS Module Declaration Style

**Goal**: Change `var Sound = (function() {` to `const Sound = (function() {` in `sound.js` to match the ES6 style used by all other shared modules.

**Independent Test**: Grep `app/www/js/*.js` for `^var ` at module level — zero results. Exercise `Sound.flip()` in memory, `Sound.phonics()` in abc, `Sound.chomp()` in monster, `Sound.speak()` in monster — all work correctly.

- [x] T011 [US3] In `app/www/js/sound.js` line 6, change `var Sound = (function() {` to `const Sound = (function() {`. No other changes to this file. Open memory, abc, and monster mini-apps in browser and verify audio still works.

**Checkpoint**: All shared IIFE modules now use `const`. US3 complete.

---

## Phase 5: User Story 4 — Normalize HTML Indentation

**Goal**: Reformat `monster/index.html` (2-space → 4-space throughout) and `space/index.html` (fix mixed 4-space/2-space → uniform 4-space). Logic and content unchanged.

**Independent Test**: Both files have consistent 4-space indentation. Both mini-apps open and function identically to before (diff is cosmetic only).

- [x] T012 [P] [US4] Reformat `app/www/monster/index.html` from 2-space to 4-space indentation throughout. No content or logic changes. Open `monster/index.html` in browser and verify the game still loads and plays correctly.
- [x] T013 [P] [US4] Reformat `app/www/space/index.html` to consistent 4-space indentation throughout (the file currently switches from 4-space to 2-space around line 43). No content or logic changes. Open `space/index.html` in browser and verify the game still loads and plays correctly.

**Checkpoint**: Both HTML files have uniform 4-space indentation. US4 complete.

---

## Phase 6: User Story 5 — Remove Dead Stub Comments from router.js

**Goal**: Remove the Phase 1/Phase 2 stub comments inside `router.js`'s `back()` function. Functional logic is preserved; only comment noise is removed.

**Independent Test**: Open `router.js` — no "Phase 1" or "Phase 2" text in `back()`. Open hub in browser, navigate to settings, press back — returns to hub correctly.

- [x] T014 [US5] In `app/www/js/router.js` `back()` function (lines ~74–86), remove the dead comments: `// For Phase 1, just log - gate challenge will be added in Phase 2`, `// In Phase 2, this will trigger the hold-button challenge`, and `// Always return to hub for now`. Preserve the `if (typeof Settings !== 'undefined' && Settings.isParentalGateEnabled())` check and `navigate('hub')` call. Verify hub back-navigation still works in browser.

**Checkpoint**: `router.js` `back()` is clean. US5 complete.

---

## Phase 7: Bug Fix — Monster Grammar (singular food names)

**Goal**: When the monster wants exactly 1 food item, use singular ("one apple") not plural ("one apples"). Affects the sign text, TTS speech, yuck speech, and celebration message.

- [x] T017 Fix singular/plural grammar in `app/www/js/monster/monster.js`: add a `FOOD_SINGULAR` map and `foodLabel(count)` helper; replace all four uses of `round.foodName` with `foodLabel(round.target)` or `foodLabel(1)` as appropriate.

---

## Final Phase: Polish & Verification

**Purpose**: Full end-to-end verification and a final grep sweep confirming all cleanup goals are met.

- [x] T015 Run the full [quickstart.md](quickstart.md) manual test checklist: open all 5 mini-apps, verify back buttons, celebration overlays, audio playback, and build success.
- [x] T016 [P] Run cleanup verification greps and confirm all pass:
  - `grep -r "phonics-audio" app/www/` → zero results
  - `grep -n "<audio" app/www/abc/index.html` → zero results
  - `grep -rn "^var " app/www/js/sound.js` → zero results
  - `grep -n "celebration-overlay\|back-button\|play-again-button" app/www/css/abc.css app/www/css/memory.css app/www/css/monster.css app/www/css/space.css` → zero results
  - `grep -n "Phase 1\|Phase 2" app/www/js/router.js` → zero results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately. All T001–T004 are parallel.
- **Phase 2 (US2)**: Depends on Phase 1 complete — base.css must be linked before rules are removed.
- **Phase 3 (US1)**: Independent of Phase 2 — can start after Phase 1 (phonics cleanup touches different files).
- **Phase 4 (US3)**: Independent — `sound.js` touches no HTML or CSS. Can start any time.
- **Phase 5 (US4)**: Independent — cosmetic HTML reformatting. Can start any time.
- **Phase 6 (US5)**: Independent — comment removal in `router.js`. Can start any time.
- **Final Phase**: Depends on all prior phases complete.

### Parallel Opportunities (Single Developer)

After Phase 1 completes:
- Run Phase 2 (CSS cleanup) in sequence per file
- Then run Phase 3, 4, 5, 6 in any order — all touch different files

### Parallel Example: Phase 1

```
All four tasks can be done simultaneously (different files):
T001 — abc/index.html
T002 — memory/index.html
T003 — monster/index.html
T004 — paint/index.html
```

### Parallel Example: Phase 2

```
All four CSS files can be edited simultaneously:
T005 — css/abc.css
T006 — css/memory.css
T007 — css/monster.css
T008 — css/space.css
```

---

## Implementation Strategy

### Safest Order (Recommended)

1. ✅ Complete Phase 1 (add base.css links) — verify visually
2. ✅ Complete Phase 2 (remove duplicate CSS) — verify each app
3. ✅ Complete Phase 3 (delete dead phonics files) — verify ABC audio
4. ✅ Complete Phases 4, 5, 6 in any order — each is independent
5. ✅ Run Final Phase verification — grep sweep + full quickstart

### MVP Scope

All phases are low-risk and tightly scoped. The natural MVP is **Phase 1 + Phase 2** (the CSS consolidation), which is the highest-value change and affects every mini-app.

---

## Notes

- [P] tasks = different files, no blocking dependencies on each other
- Always add `base.css` (Phase 1) before removing CSS rules (Phase 2) — never the reverse
- For any CSS rule removal: diff against `base.css` first. Identical → delete. Different → keep with `/* mini-app override */` comment
- Commit after each phase completes, or after each task if preferred
