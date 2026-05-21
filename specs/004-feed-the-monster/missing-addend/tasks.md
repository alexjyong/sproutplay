# Tasks: Missing Addend Mode

**Input**: `specs/004-feed-the-monster/missing-addend/`
**Branch**: `004-feed-the-monster`
**Status**: Complete

---

## What Was Built

The missing addend mode required changes to three functions in `app/www/js/monster/monster.js` only. No new DOM elements or CSS rules were needed in the final implementation.

> **Note**: A pre-fed belly zone (`#pre-fed-zone`, `.pre-fed-item`) was prototyped and built but subsequently removed — it confused players. The sign and TTS carry the mechanic on their own.

---

## Completed Tasks

- [x] T001 `newRound()` — set `round.target = displayB` at Level 3 so the child feeds the missing addend, not the full sum
- [x] T002 `updateSign()` — Level 3 branch shows `"[A] + ? = [total]  [emoji]"` at 24px; Levels 1/2 show `"[target] [emoji]"` at 36px
- [x] T003 `speakPrompt()` — Level 3 TTS reads `"[A] plus what equals [total]?"` with no answer reveal; Levels 1/2 read `"Feed me [N] [food name]!"`
- [x] T004 LEVEL3_PAIRS pruned to displayB ≤ 5 to keep tray item count manageable (removed [1,9], [2,6], [2,8], [3,6], [3,7], [4,6])

---

## Verification

To test Level 3 in browser:
```js
localStorage.setItem('sproutplay_monster', JSON.stringify({level:3, consecutiveWins:0}));
location.reload();
```

**Check**:
- Sign shows "[A] + ? = [total] [emoji]" (e.g. "3 + ? = 5 🍇")
- TTS says "3 plus what equals 5?" — does NOT say "feed me 2 more"
- 🔊 button replays the prompt
- Counter runs 0 → displayB (e.g. 0 → 2), celebration fires at displayB
- Wrong-food items bounce back with "Yuck!" as normal
- Levels 1 and 2 unaffected — sign shows plain "[N] [emoji]"
