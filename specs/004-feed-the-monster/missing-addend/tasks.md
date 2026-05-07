# Tasks: Missing Addend Mode

**Input**: `specs/004-feed-the-monster/missing-addend/`
**Branch**: `004-feed-the-monster`
**Prerequisites**: plan.md ✅ spec.md ✅ quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: Which user story this task belongs to
- No automated tests — manual verification follows `quickstart.md`

---

## Phase 1: Setup

**Purpose**: Add the one new DOM element and the two new CSS rules needed before any logic lands.

- [x] T001 Add `<div id="pre-fed-zone"></div>` inside `#monster-container` in `app/www/monster/index.html`, between `.monster-face` and `#monster-mouth`
- [x] T002 [P] Add `#pre-fed-zone` and `.pre-fed-item` rules to `app/www/css/monster.css`: pre-fed-zone is `position:absolute; bottom:72px; left:50%; transform:translateX(-50%); display:flex; gap:4px; justify-content:center;` and pre-fed-item is `width:36px; height:36px; font-size:24px; line-height:36px; text-align:center; border-radius:50%; background:rgba(0,0,0,0.08); filter:grayscale(1) opacity(0.5); user-select:none; touch-action:none; pointer-events:none;`

**Checkpoint**: Open `monster/index.html` in browser. The `#pre-fed-zone` div exists in the DOM (visible in DevTools) and is empty. No visual change yet.

---

## Phase 2: Foundational

**Purpose**: The `buildPreFedItems()` helper — used by both user stories, must exist before either phase.

- [x] T003 Add `buildPreFedItems()` function to `app/www/js/monster/monster.js` after `buildItems()`: clear `#pre-fed-zone`; if `level !== 3` or `round.displayA === null`, return early; create `round.displayA` divs each with class `pre-fed-item`, a random emoji from FOOD_EMOJIS, and append to `#pre-fed-zone`
- [x] T004 Add a `clearPreFedItems()` one-liner to `app/www/js/monster/monster.js`: `document.getElementById('pre-fed-zone').innerHTML = ''` — called from `newRound()` at the top before `buildItems()`

**Checkpoint**: Temporarily hardcode a Level 3 round in `newRound()` and call `buildPreFedItems()` manually in the browser console. Greyed emoji appear above the mouth. Touching them does nothing.

---

## Phase 3: User Story 1 — Solve a Missing Addend Problem (Priority: P1)

**Goal**: At Level 3, `round.target` equals `displayB`; sign shows "A + ? = total"; tray has B + decoys; winning feeds exactly B items.

**Independent Test**: Force Level 3 via localStorage, reload. Verify sign format, pre-fed count, tray item count, and that feeding B items (not A+B) triggers celebration. See quickstart.md Scenarios 1 and 2.

- [x] T005 [US1] Edit `newRound()` in `app/www/js/monster/monster.js`: after assigning `round.target`, add a Level 3 override — `if (level === 3 && round.displayB !== null) { round.target = round.displayB; }`; then call `clearPreFedItems()` and `buildPreFedItems()` before `buildItems()`
- [x] T006 [US1] Edit `updateSign()` in `app/www/js/monster/monster.js`: change the Level 3 branch from `round.displayA + ' + ' + round.displayB` to `round.displayA + ' + ? = ' + (round.displayA + round.displayB)`; reduce font size to `'22px'` for Level 3 to fit the longer string
- [x] T007 [US1] Edit `speakPrompt()` in `app/www/js/monster/monster.js`: change the Level 3 TTS text from `round.displayA + ' plus ' + round.displayB + ', feed me ' + round.target + '!'` to `round.displayA + ' plus what equals ' + (round.displayA + round.displayB) + '? Feed me ' + round.displayB + ' more!'`

**Checkpoint**: Quickstart Scenarios 1 and 2 both pass. Counter runs 0→B, celebration fires at B, not at A+B.

---

## Phase 4: User Story 2 — Visual Clarity of Pre-Fed vs Available Items (Priority: P2)

**Goal**: Pre-fed items are visually distinct and non-interactive; clearing between rounds works correctly.

**Independent Test**: Show the Level 3 screen to someone unfamiliar with the game — they identify tray items as draggable without being told. Touch a belly item — nothing moves. Complete a round, tap Play Again — old belly items gone, new ones appear. See quickstart.md Scenarios 3, 4, and 5.

- [x] T008 [US2] Verify `pointer-events:none` on `.pre-fed-item` blocks all interaction — open DevTools on a Level 3 round, attempt `document.querySelector('.pre-fed-item').dispatchEvent(new TouchEvent('touchstart'))` and confirm no drag initiates and `activeDrag` remains null
- [ ] T009 [US2] Verify `clearPreFedItems()` is called at the start of every `newRound()` — trace through a Play Again flow in DevTools; confirm `#pre-fed-zone` is empty before `buildPreFedItems()` repopulates it
- [ ] T010 [US2] Verify the greyed appearance is distinct enough at a glance — load Level 3 in browser, screenshot or observe: pre-fed items should be noticeably faded vs the bright tray items; if not distinct enough, increase `opacity` reduction in `.pre-fed-item` filter or add a `border: 2px dashed rgba(0,0,0,0.15)`

---

## Phase 5: Polish & Regression

**Purpose**: Confirm Level 1/2 are untouched, edge cases hold, and the full quickstart passes.

- [ ] T011 [P] Run quickstart.md Scenario 6 — force Level 1 and Level 2 via localStorage, play full rounds; confirm zero visual or behavioral difference from before this feature; specifically confirm `#pre-fed-zone` is empty and sign shows plain number
- [ ] T012 [P] Run quickstart.md Scenario 3 (overfed at Level 3) — force a pair with small B (e.g. `[4,2]`), feed 2 then attempt a 3rd; confirm bounce-back fires at `currentCount >= round.target` (which is B=2, not the full sum 6)
- [ ] T013 Check Level 3 sign legibility at 22px on a real device or DevTools mobile viewport — if "4 + ? = 9" is clipped by the sign container, reduce to 20px or allow the sign div to grow with `min-width:auto; padding:4px 8px`
- [ ] T014 Run full quickstart.md pass (all 6 scenarios) — note any failures and fix before marking complete

---

## Dependencies & Execution Order

- **Phase 1** (T001–T002): No dependencies — start immediately; T002 is parallel with T001 (different files)
- **Phase 2** (T003–T004): Depends on T001 (needs `#pre-fed-zone` in DOM)
- **Phase 3** (T005–T007): Depends on Phase 2 complete; T006 and T007 are parallel (different functions, same file)
- **Phase 4** (T008–T010): Depends on Phase 3 complete; all three are parallel (verification tasks)
- **Phase 5** (T011–T014): Depends on Phase 4 complete; T011 and T012 are parallel

---

## Parallel Opportunities

```
# Phase 1 — run simultaneously:
T001: Add pre-fed-zone div to index.html
T002: Add CSS rules to monster.css

# Phase 3 — after T005 lands:
T006: Edit updateSign()
T007: Edit speakPrompt()

# Phase 4 — all verification, run simultaneously:
T008: Verify pointer-events block
T009: Verify clearPreFedItems() on new round
T010: Verify visual distinction

# Phase 5 — run simultaneously:
T011: Level 1/2 regression
T012: Overfed threshold regression
```

---

## Implementation Strategy

### MVP (Phases 1–3 only, 7 tasks)

1. Phase 1: DOM + CSS scaffolding
2. Phase 2: `buildPreFedItems()` + `clearPreFedItems()`
3. Phase 3: Wire into `newRound()`, `updateSign()`, `speakPrompt()`
4. **STOP and VALIDATE** — quickstart Scenarios 1 and 2
5. Ship if validation passes; Phases 4–5 are verification, not logic

### Total: 14 tasks across 5 phases

- Phase 1 (Setup): 2 tasks
- Phase 2 (Foundational): 2 tasks
- Phase 3 (US1 — core mechanic): 3 tasks
- Phase 4 (US2 — visual clarity): 3 tasks
- Phase 5 (Polish): 4 tasks

---

## Notes

- The only behavioral change is in `newRound()`: `round.target = displayB` at Level 3. All win/overfed/celebration logic is untouched.
- `clearPreFedItems()` must run before `buildPreFedItems()` on every new round — order matters.
- LEVEL3_PAIRS max `displayA` is 5 — a single flex row of 5 × 36px items = 180px, exactly fits the container.
- After any edit to `app/www/`, run `npx cap sync android` before rebuilding APK.
