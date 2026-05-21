# Tasks: Feed the Monster Math Game

**Branch**: `004-feed-the-monster`
**Updated**: 2026-05-21
**Status**: Implementation complete — manual device testing remaining

---

## Completed Implementation

### Phase 1: Setup
- [x] T001 Created `app/www/monster/index.html` — full HTML shell with monster container, sign row (sign + 🔊 button), mouth, counter, item tray, celebration overlay, levelup overlay
- [x] T002 Created `app/www/css/monster.css` — full layout, monster states, food item styles, sign-row, speak button, tray, celebration card
- [x] T003 Created `app/www/js/monster/monster.js` — all constants, state, and DOM refs
- [x] T004 Added `Sound.chomp()` and `Sound.overfed()` to `app/www/js/sound.js`
- [x] T005 Added monster entry to `app/www/js/registry.js`

### Phase 2: Foundational
- [x] T006 `loadProgress()` / `saveProgress()` — localStorage key `sproutplay_monster`, try/catch fallback
- [x] T007 `pickTarget()` — L1: 1–5, L2: 1–7, L3: pick from LEVEL3_PAIRS avoiding last pair
- [x] T008 `buildItems()` / `spawnItem()` / `findFreePosition()` — slots-based shuffle, correct + wrong-food decoys, grid fallback to prevent stacking; `touch-action:none` on tray
- [x] T009 Full drag system — `startDrag`, `moveDrag`, `endDrag`, `cancelDrag`, `cleanupDrag`, `animateBack`
- [x] T010 `setMonsterState(cls)` — removes idle/chomping/happy/yuck/overfed, adds given class; chomping auto-reverts after 200ms
- [x] T011 `updateSign()` / `updateCounter()` / `speakPrompt()` — sign shows `"[N] [emoji]"` (L1/L2) or `"[A] + ? = [total] [emoji]"` (L3); TTS uses food name

### Phase 3: Core Game Loop
- [x] T012 `feedItem()` — wrong-food check first (bounce + yuck shake + TTS); correct food increments counter; pendingWinTimer (600ms) on reaching target
- [x] T013 `onRoundComplete()` — sets celebrating, increments consecutiveWins, calls checkLevelUp(), routes to showLevelUp or showCelebration
- [x] T014 `showCelebration()` / `hideCelebration()` — overlay with food name, 3s auto-dismiss, Sound.celebrate(), TTS
- [x] T015 `newRound()` — clears pendingWinTimer, picks target, picks food (emoji + name), applies L3 target override, builds items, speaks after 300ms
- [x] T016 `init()` — wires back, play-again, celebration-back, levelup-continue, speak-btn; calls newRound after 200ms
- [x] T017 Hit detection via `getBoundingClientRect()` on `#monster-mouth`; mouth zone 110×60px dashed oval

### Phase 4: Difficulty Progression
- [x] T018 `checkLevelUp()` — ≥5 consecutive wins advances level, resets counter, saves
- [x] T019 `showLevelUp()` — levelup overlay with TTS announcement
- [x] T020 Progress correctly restored from localStorage on fresh launch

### Phase 5: Additional Features (Built Beyond Original Spec)
- [x] T021 Wrong-food mechanic — tray contains `round.target` correct items + 2–3 wrong-food decoys; wrong food bounces back with "Yuck!" and monster yuck shake; does not affect consecutiveWins
- [x] T022 Per-round food type — one random food emoji + name per round (FOOD_EMOJIS / FOOD_NAMES); all correct items use that emoji; decoys use different emojis; all emoji Unicode ≤ 9.0 for broad Android compatibility
- [x] T023 Pending-win window — 600ms delay after reaching target; overfed (counter-based) reachable if another correct item fed during window
- [x] T024 🔊 speak button — replays TTS prompt any time during a round; sits in sign-row beside the sign; disabled during celebration
- [x] T025 Missing addend Level 3 — `round.target = displayB`; sign shows "[A] + ? = [total] [emoji]"; TTS says "[A] plus what equals [total]?" without revealing the answer; LEVEL3_PAIRS pruned to displayB ≤ 5
- [x] T026 Monster yuck state — CSS `animation: shake 0.25s ease 1` on wrong-food drop; auto-clears after 500ms
- [x] T027 Sign repositioned above monster (out of monster-container) as a full-width centered card in game-area; color explicitly set to prevent dark-mode invisible text

---

## Remaining: Manual Device Testing

- [ ] T028 Verify Sound Effects setting respected — disable sound in Settings, play a round, confirm silence
- [ ] T029 Verify Android hardware back button returns to hub — test on device or emulator
- [ ] T030 Touch target audit — confirm back button, food items, speak button, mouth zone, play-again all ≥ 48px on mobile viewport
- [ ] T031 Full game loop on device — L1 through L3 unlock, wrong-food rejection, overfed, celebration, level-up, progress persists after close/reopen
- [ ] T032 APK install and smoke test — `adb install app/android/app/build/outputs/apk/debug/app-debug.apk`; verify hub shows monster icon, game launches, full round plays

---

## Key Files

| File | Role |
|------|------|
| `app/www/monster/index.html` | Game shell |
| `app/www/css/monster.css` | All game styles |
| `app/www/js/monster/monster.js` | All game logic |
| `app/www/js/sound.js` | `Sound.chomp()`, `Sound.overfed()` added here |
| `app/www/js/registry.js` | Monster hub registration |

---

## Test Shortcuts

```js
// Force Level 3
localStorage.setItem('sproutplay_monster', JSON.stringify({level:3, consecutiveWins:0}));
location.reload();

// Reset to Level 1
localStorage.removeItem('sproutplay_monster');
location.reload();
```
