---
description: "Task list for Rhythm Tap implementation"
---

# Tasks: Rhythm Tap

**Input**: Design documents from `/specs/008-rhythm-tap/`
**Prerequisites**: plan.md, spec.md

**Tests**: Manual testing on Android device — no automated tests required for this mini-app.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Phase 1: Setup — Create mini-app directory structure

- [ ] T001 Create `app/www/rhythm/` directory with `index.html` (copy from `_template/index.html`, update all TODOs)
- [ ] T002 Create `app/www/css/rhythm.css` (per-game stylesheet, copy from template CSS pattern)
- [ ] T003 Create `app/www/js/rhythm/` directory with `rhythm.js` (game logic)

---

## Phase 2: Foundational — HTML structure and shared integration

**⚠️ CRITICAL**: No game logic can work until this phase is complete.

- [ ] T004 Update `rhythm/index.html` — set title to "SproutPlay - Rhythm Tap!", update header classes (`rhythm-header`, `rhythm-title`), update back button id (`rhythm-back`)
- [ ] T005 Update `rhythm/index.html` — include `../js/sound.js` and `../js/mini-app-back.js` in correct script load order (before game JS)
- [ ] T006 Update `rhythm/index.html` — add celebration overlay (reuse template pattern: `#celebration` with `#play-again-btn`, `#celebration-back`)
- [ ] T007 Create `rhythm.css` — header styles (`.rhythm-header`, `.rhythm-title`) following existing mini-app CSS conventions (see `memory.css`, `abc.css` for patterns)
- [ ] T008 Create `rhythm.css` — character display area styles (the main visual element that pulses with each beat)
- [ ] T009 Create `rhythm.css` — celebration overlay styles (reuse template pattern, match existing mini-app celebration styling)

**Checkpoint**: HTML page loads, shows character, back button navigates to hub, celebration overlay renders.

---

## Phase 3: User Story 1 — Watch and Repeat (Priority: P1) 🎯 MVP

**Goal**: Character plays a 2-beat pattern with visual pulses; child taps to repeat; celebration on match.

**Independent Test**: Open the game, watch a 2-beat pattern play with visual pulses, tap twice to match, see celebration screen.

### Implementation for User Story 1

- [ ] T010 [US1] Create `rhythm.js` — game configuration constants (BEAT_SOUNDS array with distinct frequencies/timbres, STARTING_BEATS = 2, MAX_BEATS = 8)
- [ ] T011 [US1] Create `rhythm.js` — DOM references (character element, game area, celebration overlay, back button, play again button)
- [ ] T012 [US1] Create `rhythm.js` — `playPattern(pattern)` function: iterates through beats, calls `Sound.tone()` for each beat sound, triggers visual pulse animation on character element
- [ ] T013 [US1] Create `rhythm.js` — `playBeat(index)` function: plays the sound for beat at given index, adds CSS class to character for pulse animation, removes class after animation completes
- [ ] T014 [US1] Create `rhythm.js` — CSS pulse animation keyframes (`.character.pulsing`) — glow/bounce effect synchronized with beat timing
- [ ] T015 [US1] Create `rhythm.js` — `startPlayback()` function: generates random pattern of N beats, calls `playPattern()`, disables input during playback
- [ ] T016 [US1] Create `rhythm.js` — `handleChildTap(e)` function: records child's tap, plays corresponding beat sound, adds visual pulse, compares against pattern
- [ ] T017 [US1] Create `rhythm.js` — `checkMatch()` function: compares child's tap sequence against original pattern, triggers celebration on match or replays pattern on mismatch
- [ ] T018 [US1] Create `rhythm.js` — `showCelebration()` function: shows celebration overlay, plays `Sound.celebrate()`
- [ ] T019 [US1] Create `rhythm.js` — `init()` function: sets up event listeners (back button, play again, celebration back), calls `startNewGame()`

**Checkpoint**: User Story 1 is fully functional — child can watch a 2-beat pattern, tap to repeat, see celebration on match.

---

## Phase 4: User Story 2 — Progress Through Rounds (Priority: P2)

**Goal**: Pattern grows by 1 beat per successful round (up to 8); round counter displayed; max round handling.

**Independent Test**: Successfully match 5 consecutive rounds (2 → 3 → 4 → 5 → 6 beats) and verify round counter increases.

### Implementation for User Story 2

- [ ] T020 [US2] Create `rhythm.js` — game state variables (`currentRound`, `pattern`, `childTaps`, `isPlaying`, `isChildTurn`)
- [ ] T021 [US2] Create `rhythm.js` — `nextRound()` function: increments round, increases pattern length by 1 (capped at MAX_BEATS), generates new random pattern
- [ ] T022 [US2] Create `rhythm.js` — `updateRoundDisplay()` function: updates round counter text on screen
- [ ] T023 [US2] Create `rhythm.js` — `startNewGame()` function: resets round to 1, clears state, calls `nextRound()`
- [ ] T024 [US2] Create `rhythm.js` — `handleMaxRound()` function: when pattern reaches 8 beats and child completes it, show congratulations and offer to restart or continue at max
- [ ] T025 [US2] Update `rhythm.css` — round counter display styles (positioned in header or game area)

**Checkpoint**: User Stories 1 AND 2 work together — child can play multiple rounds with increasing difficulty.

---

## Phase 5: User Story 3 — Difficulty Selection (Priority: P3)

**Goal**: Three difficulty levels control starting pattern length and tempo.

**Independent Test**: Select each difficulty and verify starting pattern length and tempo match expected values.

### Implementation for User 3

- [ ] T026 [US3] Create `rhythm.js` — difficulty configuration object: `{ easy: { startBeats: 2, maxBeats: 4, tempo: 600 }, medium: { startBeats: 4, maxBeats: 6, tempo: 500 }, hard: { startBeats: 6, maxBeats: 8, tempo: 400 } }` (tempo = ms between beats)
- [ ] T027 [US3] Create `rhythm/index.html` — difficulty selection screen (3 buttons: Easy, Medium, Hard) shown before first round
- [ ] T028 [US3] Create `rhythm.css` — difficulty selection screen styles (3 large tap targets, colorful)
- [ ] T029 [US3] Create `rhythm.js` — `selectDifficulty(level)` function: sets current difficulty config, hides selection screen, starts first round
- [ ] T030 [US3] Create `rhythm.js` — `playPattern()` uses `tempo` from difficulty config for inter-beat delay

**Checkpoint**: All 3 user stories are independently functional.

---

## Phase 6: Hub Integration — Register on launcher

- [ ] T031 [P] Update `app/www/js/registry.js` — register rhythm app with `register({ id: 'rhythm', name: 'Rhythm Tap', icon: '🥁', description: 'Repeat the beats!', backgroundColor: 'color-4', placeholder: false, path: 'rhythm/index.html' })`
- [ ] T032 [P] Update `README.md` — add Rhythm Tap to "What's Inside" section under mini-apps

---

## Phase 7: Polish & QA

- [ ] T033 Ensure all mini-apps follow consistent visual design (character size, colors, animations match other mini-apps)
- [ ] T034 Test on Android device: verify audio plays correctly, animations are smooth (60fps), back button returns to hub
- [ ] T035 Test edge cases: rapid tapping during playback (ignored), leaving and returning to app (state preserved), sound toggle off (no audio but game still works)
- [ ] T036 Verify game loads within 3 seconds of tapping hub icon

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all game logic
- **Phase 3 (US1 MVP)**: Depends on Phase 2 — Core game must work first
- **Phase 4 (US2)**: Depends on Phase 3 — Progress builds on core game
- **Phase 5 (US3)**: Depends on Phase 4 — Difficulty is optional polish
- **Phase 6 (Hub Integration)**: Can run in parallel with Phases 3–5 (different file: `registry.js`)
- **Phase 7 (Polish)**: Depends on all user stories being complete

### Within Each Phase

- HTML structure before CSS styles
- CSS styles before JS logic
- Core game (US1) before progress (US2) before difficulty (US3)
- Hub registration can happen anytime after Phase 2

### Parallel Opportunities

- T031 (registry.js) can run in parallel with Phases 3–5 (different file)
- T032 (README.md) can run in parallel with everything (documentation only)
