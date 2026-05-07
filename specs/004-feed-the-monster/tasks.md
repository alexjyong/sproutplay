# Tasks: Feed the Monster Math Game

**Input**: Design documents from `specs/004-feed-the-monster/`
**Branch**: `004-feed-the-monster`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- No test tasks — no automated test suite in this project (per constitution and CLAUDE.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the three new files and wire the registry entry. No story-specific logic yet.

- [x] T001 Create directory `app/www/monster/` and stub `app/www/monster/index.html` with full HTML shell per plan.md Task 3 (meta tags, script tags, all overlay divs)
- [x] T002 [P] Create `app/www/css/monster.css` with all layout rules per plan.md Task 2 (app-container, monster-header, game-area, monster-container, monster-face, monster-sign, monster-mouth, feed-counter, item-tray, food-item, celebration-overlay, state classes)
- [x] T003 [P] Create `app/www/js/monster/` directory and stub `app/www/js/monster/monster.js` with DOMContentLoaded wrapper, all constant declarations (FOOD_EMOJIS, LEVEL3_PAIRS, WIN_THRESHOLD, STORAGE_KEY), and all state variable declarations
- [x] T004 Add `Sound.chomp()` and `Sound.overfed()` methods to `app/www/js/sound.js` and expose both in the return object per plan.md Task 1
- [x] T005 Add monster registration entry to `app/www/js/registry.js` inside the `init()` function after the space entry; check `app/www/css/hub.css` for `color-6` and add `.color-6 { background: #ff7043; }` if missing

**Checkpoint**: Hub loads, monster icon appears, tapping it opens a blank orange-gradient screen with the monster emoji and an empty tray. No errors in console.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core game infrastructure that all three user stories depend on — drag system, state helpers, and persistence layer. Must be complete before any story phase.

- [x] T006 Implement `loadProgress()` and `saveProgress()` in `app/www/js/monster/monster.js` — parse/write `localStorage['sproutplay_monster']` with try/catch fallback to `{level:1, consecutiveWins:0}`
- [x] T007 Implement `pickTarget()` in `app/www/js/monster/monster.js` — L1: random 1–5, L2: random 1–10, L3: pick from LEVEL3_PAIRS avoiding lastLevel3Pair; returns `{target, displayA, displayB}`
- [x] T008 Implement `buildItems()` and `findFreePosition()` in `app/www/js/monster/monster.js` — clear tray, create `round.target` food-item divs with random emoji, scatter with collision avoidance (64×64px tiles, 12px padding), attach touchstart+mousedown listeners
- [x] T009 Implement full drag system in `app/www/js/monster/monster.js`: `startDrag()`, `moveDrag()`, `endDrag()`, `cancelDrag()`, `cleanupDrag()`, `animateBack()` — following the abc.js pattern with activeDrag guard and try/finally in endDrag
- [x] T010 Implement `setMonsterState(cls)` in `app/www/js/monster/monster.js` — removes idle/chomping/happy classes, adds the given class; auto-reverts chomping→idle after 200ms
- [x] T011 Implement `updateSign()`, `updateCounter()`, and `speakPrompt()` in `app/www/js/monster/monster.js` — sign shows target or "A + B" for L3; counter shows currentCount; TTS reads the prompt with typeof Sound guard

**Checkpoint**: Drag system works — items can be picked up and animate back when dropped outside the mouth zone. Counter and sign update correctly. No celebration logic yet.

---

## Phase 3: User Story 1 — Count to the Target (Priority: P1) 🎯 MVP

**Goal**: Child drags items into monster mouth, counter ticks up, celebration fires on exact match, new round starts.

**Independent Test**: Launch `app/www/monster/index.html` in browser. Verify a Level 1 target appears, items equal the target count, dragging all items to the mouth triggers the celebration overlay, and Play Again resets the round. See quickstart.md Scenario 1.

- [x] T012 [US1] Implement `feedItem(item)` in `app/www/js/monster/monster.js` — mark fed, hide item, increment currentCount, call updateCounter(), setMonsterState('chomping'), Sound.chomp(), then checkWin()
- [x] T013 [US1] Implement `checkWin()` in `app/www/js/monster/monster.js` — if currentCount === round.target call onRoundComplete()
- [x] T014 [US1] Implement `showCelebration()` and `hideCelebration()` in `app/www/js/monster/monster.js` — show/hide `#celebration`, set `#celebration-msg` text, call Sound.celebrate() and Sound.speak("You did it! You fed the monster N!"), set 3-second auto-dismiss timeout that calls hideCelebration() then newRound()
- [x] T015 [US1] Implement `onRoundComplete()` in `app/www/js/monster/monster.js` — set celebrating=true, call Sound.celebrate(), increment consecutiveWins, call saveProgress(), call checkLevelUp(), then show the appropriate overlay
- [x] T016 [US1] Implement `newRound()` in `app/www/js/monster/monster.js` — set celebrating=false, call pickTarget(), assign to round, call updateSign(), updateCounter(), buildItems(), update `#level-badge` text, call speakPrompt() after 300ms setTimeout
- [x] T017 [US1] Implement `init()` in `app/www/js/monster/monster.js` — call loadProgress(), wire click listeners for `#monster-back`, `#play-again-btn`, `#celebration-back`, `#levelup-continue-btn`; warm up Sound with typeof guard; call newRound() after 200ms
- [x] T018 [US1] Verify hit detection in `endDrag()` uses `#monster-mouth` getBoundingClientRect() and that the mouth zone is visually prominent (min 100×56px, dashed border); adjust CSS if the target feels too small during manual testing

**Checkpoint**: Full happy-path loop works end-to-end at Level 1. Quickstart Scenario 1 and Scenario 2 (item misses) both pass. No level progression yet.

---

## Phase 4: User Story 2 — Difficulty Progression (Priority: P2)

**Note**: The spec had "overfed feedback" as US2 and "difficulty progression" as US3. Per research decision D-004, the overfed path is eliminated (items on screen = target, so overfeed is impossible). US2 here is therefore the difficulty/level system, which is the next highest-value story.

**Goal**: Game advances through Level 1 → 2 → 3 automatically; level persists across restarts.

**Independent Test**: Complete 5 rounds in a row at Level 1, verify Level 2 badge appears and number range increases to 1–10. Close and reopen — verify it resumes at Level 2. See quickstart.md Scenarios 3 and 4.

- [x] T019 [US2] Implement `checkLevelUp()` in `app/www/js/monster/monster.js` — if consecutiveWins >= WIN_THRESHOLD and level < 3: increment level, reset consecutiveWins, return true; else return false
- [x] T020 [US2] Implement `showLevelUp()` in `app/www/js/monster/monster.js` — set `#levelup-msg` text to "You unlocked Level N!", show `#levelup-overlay`, call Sound.celebrate() and Sound.speak() with the level-up message
- [x] T021 [US2] Wire `#levelup-continue-btn` in `init()` to call hideCelebration() then newRound() in `app/www/js/monster/monster.js`
- [x] T022 [US2] Verify `loadProgress()` correctly restores level and consecutiveWins so the level badge shows the correct level on fresh launch after progress was saved

**Checkpoint**: Quickstart Scenarios 3 and 4 both pass. Level badge updates, level-up overlay appears after 5 wins, Level 3 shows addition expressions, progress survives app restart.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Sound settings integration, back-button wiring, constitution compliance verification, and final manual test pass.

- [ ] T023 [P] Verify Sound Effects setting is respected — open SproutPlay Settings, disable sound, launch Feed the Monster, complete a round; confirm no audio plays. Trace through sound.js `enabled` flag if needed; no code change required if already working
- [ ] T024 [P] Verify Android hardware back button returns to hub — test on device or emulator; if not working, add Capacitor `App.addListener('backButton', ...)` in `app/www/js/monster/monster.js` mirroring how other mini-apps handle it
- [ ] T025 Measure all touch targets — tap Back button, food items, Play Again, Level Up continue, and the mouth zone on a physical device or DevTools mobile emulator; confirm all are ≥ 48px; increase padding/size in `app/www/css/monster.css` where needed
- [ ] T026 Run full quickstart.md test pass — work through all 6 scenarios; note any failures and fix them before marking complete
- [ ] T027 Run `./build.sh` and install APK on device; verify hub loads, monster icon appears, and full game loop works on Android

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 complete — blocks all story phases
- **Phase 3 (US1)**: Depends on Phase 2 complete
- **Phase 4 (US2)**: Depends on Phase 3 complete (checkLevelUp is called from onRoundComplete)
- **Phase 5 (Polish)**: Depends on Phase 4 complete

### Within-Phase Parallel Opportunities

**Phase 1**: T002 and T003 can run in parallel (different files). T004 and T005 can run in parallel (different files). T001 should go first (creates the directory).

**Phase 2**: T006–T011 are all in `monster.js` so should be sequential, but T008 (buildItems) and T009 (drag system) touch different function groups and can be written in parallel by different contributors.

**Phase 5**: T023 and T024 can run in parallel (independent manual checks).

---

## Parallel Example: Phase 1 Setup

```
# Run simultaneously (different files, no conflicts):
Task T002: Create monster.css
Task T003: Stub monster.js with constants and state

# After T001 (directory) exists, run simultaneously:
Task T004: Add Sound.chomp/overfed to sound.js
Task T005: Add registry entry + hub.css color
```

---

## Implementation Strategy

### MVP (Phase 1 + 2 + 3 only)

1. Complete Phase 1 — hub icon works, blank game screen loads
2. Complete Phase 2 — drag system works, items scatter correctly
3. Complete Phase 3 — full round loop at Level 1 works
4. **STOP and VALIDATE** — run quickstart.md Scenarios 1 and 2
5. Ship as MVP if needed; Level progression (Phase 4) adds on top cleanly

### Full Delivery

1. MVP as above
2. Phase 4 — level progression, persistence
3. Phase 5 — polish, full quickstart pass, APK build

### Total task count: 27 tasks across 5 phases
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 6 tasks
- Phase 3 (US1 — Core loop): 7 tasks
- Phase 4 (US2 — Progression): 4 tasks
- Phase 5 (Polish): 5 tasks

---

## Notes

- [P] tasks = different files or independent concerns, no blocking dependency
- No automated tests — manual verification follows quickstart.md scenarios
- All sound calls must be guarded with `typeof Sound !== 'undefined'`
- The `celebrating` flag must be checked at the top of `startDrag` to block drag during overlays
- Items on screen always equal `round.target` — the overfed path does not exist by design (research D-004)
- After any edit to `app/www/`, run `npx cap sync android` before rebuilding APK
