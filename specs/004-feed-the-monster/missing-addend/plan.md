# Implementation Plan: Missing Addend Mode

**Branch**: `004-feed-the-monster` | **Date**: 2026-05-07 | **Spec**: [spec.md](spec.md)

## Summary

Upgrade Level 3 of Feed the Monster from "3 + 2 = ?" (child feeds the full sum) to "3 + ? = 5" (child feeds only the missing addend). At round start, `displayA` greyed non-draggable items appear in the monster's belly; the tray holds `displayB` draggable items plus decoys. `round.target` is set to `displayB` so win/overfed logic requires zero changes. The diff from current code is four small edits: `newRound()`, a new `buildPreFedItems()` helper, `updateSign()`, and `speakPrompt()`. CSS adds a `.pre-fed-item` style.

---

## Technical Context

**Language/Version**: JavaScript ES6+ (vanilla, no transpiler)
**Primary Dependencies**: Existing `Sound.js` (TTS), `monster.js` (game loop) — no new dependencies
**Storage**: No change — `localStorage['sproutplay_monster']` unchanged
**Testing**: Manual, per `quickstart.md` scenarios in this directory
**Target Platform**: Android 7+ via Capacitor WebView; Chrome DevTools for layout testing
**Project Type**: Feature increment on existing mini-app
**Performance Goals**: Pre-fed item rendering completes before first frame is visible (synchronous DOM build)
**Constraints**: Level 1 and 2 completely unaffected; no new files except CSS additions; no new npm packages

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Four targeted edits + one new helper function; no new abstractions |
| II. Kid-First Design | ✅ PASS | Pre-fed items are large emoji (same size as food items); clearly greyed |
| III. Offline-Capable | ✅ PASS | No network calls; purely DOM + CSS change |
| IV. Privacy by Default | ✅ PASS | No new data collected or stored |
| V. Modular Mini-App | ✅ PASS | All changes self-contained within `monster.js` and `monster.css` |

**Gate result: PASS — no violations.**

---

## Project Structure

### Documentation (this sub-feature)

```text
specs/004-feed-the-monster/missing-addend/
├── plan.md       ← this file
├── spec.md
├── quickstart.md
├── tasks.md
└── checklists/
    └── requirements.md
```

### Source Code changes (no new files)

```text
app/www/
├── js/monster/monster.js   ← edit: newRound(), buildPreFedItems(), updateSign(), speakPrompt()
└── css/monster.css         ← edit: add .pre-fed-item style
```

---

## Phase 0: Research

### D-001: Where to render pre-fed items

**Decision**: Render pre-fed items inside `#monster-container` as absolutely-positioned divs stacked vertically just above `#monster-mouth`, using a new `#pre-fed-zone` div.

**Rationale**: Pre-fed items need to feel like they're "in the belly" — placing them inside the monster container directly above the mouth zone achieves this visually without any layout restructuring. The monster container is already `position: relative` and sized 180×180px.

**Alternatives considered**:
- Render inside `#item-tray` with a different CSS class — rejected because it visually mixes pre-fed and draggable items, defeating the purpose.
- Render as a separate full-width strip above the tray — rejected as too far from the monster; loses the "already eaten" metaphor.

---

### D-002: `round.target` meaning at Level 3

**Decision**: At Level 3, `round.target = displayB` (the missing addend). The counter counts from 0 to B. The pre-fed A items are purely visual — they do not affect `currentCount` or win logic.

**Rationale**: This means `feedItem()`, `checkWin()`, `onOverfed()`, and `onRoundComplete()` need zero changes. Only round setup and rendering change. Minimum diff, maximum safety.

**Alternatives considered**:
- Set `round.target = displayA + displayB` and pre-seed `currentCount = displayA` — rejected because it couples the counter display to a non-zero starting value, requiring changes to `updateCounter()` and the counter's visual meaning.

---

### D-003: Pre-fed item layout

**Decision**: Stack up to 5 pre-fed items in a single row inside `#pre-fed-zone`, centered horizontally, small size (40px). If `displayA > 5`, wrap to two rows (but LEVEL3_PAIRS max A is 5, so this never happens).

**Rationale**: LEVEL3_PAIRS has max `displayA` of 5 (pair [5,5] has A=5). A single row of 5 × 40px items = 200px, which fits in the 180px container with slight overflow — acceptable, or trim to 36px. No wrapping logic needed in practice.

---

## Phase 1: Design

### Data model changes

`round` object at Level 3 — reinterpreted fields:

| Field | Level 1/2 meaning | Level 3 meaning (after this change) |
|-------|-------------------|--------------------------------------|
| `target` | Number to feed | Missing addend B (not the full sum) |
| `displayA` | null | First addend (pre-fed count) |
| `displayB` | null | Missing addend = target |
| `currentCount` | Items fed | Items fed toward B (starts at 0) |

No new localStorage fields. No schema migration needed.

### New DOM element

Add `<div id="pre-fed-zone"></div>` inside `#monster-container` in `monster/index.html`, positioned between `.monster-face` and `#monster-mouth`.

### CSS additions (monster.css)

```css
#pre-fed-zone {
  position: absolute;
  bottom: 72px;          /* sits above the mouth zone */
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  justify-content: center;
}

.pre-fed-item {
  width: 36px;
  height: 36px;
  font-size: 24px;
  line-height: 36px;
  text-align: center;
  border-radius: 50%;
  background: rgba(0,0,0,0.08);
  filter: grayscale(1) opacity(0.5);
  user-select: none;
  touch-action: none;    /* prevents any scroll interference */
  pointer-events: none;  /* cannot be tapped or dragged */
}
```

### Sign format change

| Level | Before | After |
|-------|--------|-------|
| 1 | "4" | "4" (no change) |
| 2 | "7" | "7" (no change) |
| 3 | "3 + 2" | "3 + ? = 5" |

Font size for Level 3 sign drops further (22px) to fit the longer string.

### TTS prompt change

| Level | Before | After |
|-------|--------|-------|
| 3 | "3 plus 2, feed me 5!" | "3 plus what equals 5? Feed me 3 more!" |

---

## Implementation tasks (summary — see tasks.md)

1. Add `#pre-fed-zone` div to `monster/index.html`
2. Add `.pre-fed-item` and `#pre-fed-zone` CSS to `monster.css`
3. Write `buildPreFedItems()` in `monster.js`
4. Edit `newRound()` — set `round.target = displayB` at Level 3, call `buildPreFedItems()`
5. Edit `updateSign()` — Level 3 format becomes `"A + ? = total"`
6. Edit `speakPrompt()` — Level 3 TTS text updated
7. Clear `#pre-fed-zone` in `hideCelebration()` / `newRound()`
8. Manual test pass per `quickstart.md`
