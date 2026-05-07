# Quickstart & Test Scenarios: Missing Addend Mode

**Branch**: `004-feed-the-monster` | **Date**: 2026-05-07

## Setup

Force Level 3 without grinding through levels:

```js
localStorage.setItem('sproutplay_monster', JSON.stringify({ level: 3, consecutiveWins: 0 }));
```

Then open `app/www/monster/index.html` (browser) or launch the APK.

---

## Scenario 1 — Sign format and pre-fed items appear correctly

1. Force Level 3 via localStorage, reload.
2. **Expected**: Sign shows "A + ? = [total]" (e.g. "3 + ? = 5"), not "3 + 2".
3. **Expected**: [A] small greyed emoji appear inside the monster belly zone above the mouth.
4. **Expected**: TTS says "[A] plus what equals [total]? Feed me [B] more!"
5. **Expected**: Item tray contains [B] + 2–4 draggable items (not [total] items).

---

## Scenario 2 — Feeding the correct missing addend wins

1. Force Level 3, reload.
2. Note the sign (e.g. "2 + ? = 6" — missing addend is 4).
3. Drag exactly 4 items into the mouth.
4. **Expected**: Celebration fires after the 4th item. Counter reads "4", not "6".

---

## Scenario 3 — Overfed rejects at the right threshold

1. Force Level 3, reload with a pair where B is small (e.g. [4,2] → "4 + ? = 6").
2. Feed 2 items correctly (counter = 2 = B) — celebration should fire.
3. Reload again, same pair. Feed 2 items then try a 3rd.
4. **Expected**: 3rd item bounces back (overfed), monster shakes, all items reset. Counter resets to 0.

---

## Scenario 4 — Pre-fed items cannot be dragged

1. Force Level 3, reload.
2. Touch and drag one of the greyed belly items.
3. **Expected**: Item does not lift, no drag shadow, no chomp, counter unchanged.

---

## Scenario 5 — New round clears old pre-fed items

1. Complete a Level 3 round (feed the missing addend).
2. Watch the celebration, then tap Play Again.
3. **Expected**: Old belly items are gone. New pre-fed count matches the new round's displayA.

---

## Scenario 6 — Levels 1 and 2 completely unaffected

1. Force Level 1 via localStorage, reload.
2. Play a full round — sign shows a plain number, no belly items, no "? =" format.
3. Force Level 2, repeat.
4. **Expected**: Zero visual or behavioral difference from before this feature was added.

---

## Regression checks

- [ ] Hub still loads without errors after changes
- [ ] Level 1 and 2 rounds look and behave identically to before
- [ ] Level 3 sign is readable at the smaller font size (not clipped)
- [ ] Pre-fed items fit within the monster container at max displayA (5 items)
- [ ] `./build.sh` succeeds
