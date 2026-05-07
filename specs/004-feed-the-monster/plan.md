# Implementation Plan: Feed the Monster Math Game

**Branch**: `004-feed-the-monster` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)

## Summary

A self-contained counting/arithmetic mini-app for kids ages 3–7. A cartoon monster holds a sign with a target number; the child drags emoji food items from a tray into the monster's mouth one at a time. Each item triggers a chomp animation and increments a counter. When the count matches the target, a celebration fires and the round resets. Three difficulty levels (counting 1–5, counting 1–10, addition to 10) unlock automatically after 5 consecutive wins and persist to localStorage. Built with vanilla JS following the DOMContentLoaded pattern used by all other SproutPlay mini-apps, reusing the `abc.js` drag system and `Sound.js` audio pipeline.

---

## Technical Context

**Language/Version**: JavaScript ES6+ (vanilla, no transpiler)
**Primary Dependencies**: `Sound.js` (Web Audio + TTS), `Settings.js` (global sound toggle); no new npm packages
**Storage**: `localStorage['sproutplay_monster']` — JSON with `level` and `consecutiveWins`
**Testing**: Manual, per `quickstart.md` scenarios
**Target Platform**: Android 7+ via Capacitor WebView; secondary browser testing in Chrome DevTools
**Project Type**: Mobile mini-app (Capacitor-wrapped)
**Performance Goals**: Chomp animation + counter update perceived as instantaneous (<16ms DOM update after touchend)
**Constraints**: Offline-only, no image files, touch targets ≥ 48px, respects global `soundEnabled` setting

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Simplicity First | ✅ PASS | Vanilla JS, DOMContentLoaded pattern, no abstractions beyond what the task requires |
| II. Kid-First Design | ✅ PASS | Items and mouth zone sized ≥ 64px; large emoji; no time pressure |
| III. Offline-Capable | ✅ PASS | No network calls; emoji rendered from Unicode; localStorage only |
| IV. Privacy by Default | ✅ PASS | No data collected or transmitted; localStorage key is local only |
| V. Modular Mini-App | ✅ PASS | Self-contained under `monster/`; registered via `AppRegistry.register()`; hub has no dependency on it |

**Gate result: PASS — no violations.**

---

## Project Structure

### Documentation (this feature)

```text
specs/004-feed-the-monster/
├── plan.md           ← this file
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── checklists/
│   └── requirements.md
└── missing-addend/   ← sub-feature spec
    ├── spec.md
    ├── plan.md
    ├── tasks.md
    └── checklists/
        └── requirements.md
```

### Source Code

```text
app/www/
├── monster/
│   └── index.html           ← new: mini-app HTML shell
├── js/
│   ├── monster/
│   │   └── monster.js       ← new: all game logic
│   ├── registry.js          ← edit: add monster registration entry
│   └── sound.js             ← edit: add Sound.chomp() and Sound.overfed()
└── css/
    └── monster.css          ← new: monster + tray + celebration styles
```

---

## Implementation Tasks (summary — see tasks.md for full list)

### Phase 1: Setup
- Create `monster/index.html`, `css/monster.css`, stub `js/monster/monster.js`
- Add `Sound.chomp()` + `Sound.overfed()` to `sound.js`
- Register monster in `registry.js`

### Phase 2: Foundational
- `loadProgress()`, `saveProgress()`, `pickTarget()`
- `buildItems()`, `findFreePosition()`
- Full drag system (`startDrag`, `moveDrag`, `endDrag`, `cancelDrag`, `cleanupDrag`, `animateBack`)
- `setMonsterState()`, `updateSign()`, `updateCounter()`, `speakPrompt()`

### Phase 3: Core game loop (MVP)
- `feedItem()`, `checkWin()` (with overfed guard)
- `onOverfed()`, `showCelebration()`, `hideCelebration()`
- `onRoundComplete()`, `newRound()`, `init()`

### Phase 4: Level progression
- `checkLevelUp()`, `showLevelUp()`

### Phase 5: Polish
- Sound settings integration, back button, touch target audit, full quickstart pass, APK build

---

## Scope boundary (explicitly out of scope)

- Manual difficulty picker — progression is automatic only
- Haptic feedback — not in the constitution-approved stack
- Sound files or sprites — Web Audio oscillators only per constitution
- Parental gate on level reset — not in spec
