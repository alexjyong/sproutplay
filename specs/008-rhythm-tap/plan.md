# Implementation Plan: Rhythm Tap

**Branch**: `008-rhythm-tap` | **Date**: 2026-06-09 | **Spec**: [spec.md](../008-rhythm-tap/spec.md)
**Input**: Feature specification from `/specs/008-rhythm-tap/spec.md`

## Summary

A Simon-style rhythm game for children aged 3–4. A character plays a short beat pattern (claps/drum sounds with visual pulses), then the child taps the screen to repeat it back. Pattern length grows by 1 beat per successful round (2 → 3 → … → 8). Three difficulty tiers control starting length and tempo. No wrong answers — every tap produces sound. Uses existing `sound.js` Web Audio API; no new audio dependencies.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3
**Primary Dependencies**: `@capacitor/core`, `@capacitor/android` — existing project dependencies
**Storage**: None (session-only, no persistence needed)
**Testing**: Manual testing on Android device via `adb install`
**Target Platform**: Android (Capacitor web app, runs in WebView)
**Project Type**: Single-page kids app hub with mini-apps
**Performance Goals**: 60fps animation, audio beats within 50ms of scheduled time, game loads within 3s
**Constraints**: Must follow existing mini-app template structure; must reuse `sound.js`, `mini-app-back.js`; no new npm packages
**Scale/Scope**: One mini-app (~1 HTML file, ~1 CSS file, ~1 JS file)
**Pattern Reuse**: `sound.js` (Web Audio API), `mini-app-back.js` (hardware back button), template HTML structure (header, celebration overlay), `registry.js` (hub registration)

## Constitution Check

*Gates determined based on project constitution:*

- [x] Follows existing IIFE singleton / DOMContentLoaded pattern used by all mini-apps
- [x] Reuses `sound.js` — no new audio dependencies
- [x] Reuses `mini-app-back.js` — no back-button handling needed
- [x] Uses existing template HTML structure (header, celebration overlay)
- [x] No user data collected — no privacy/security concerns
- [x] No wrong answers — safe for youngest users (age 2–4)

## Project Structure

### Documentation (this feature)

```text
specs/008-rhythm-tap/
├── spec.md              # Feature specification (already written)
├── plan.md              # This file (/speckit.plan command output)
├── tasks.md             # Phase 2 output (/speckit.tasks command)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
app/www/
├── rhythm/
│   ├── index.html       # Mini-app HTML (template-based)
│   └── rhythm.css       # Per-game styles
├── js/
│   └── rhythm/
│       └── rhythm.js    # Game logic
├── js/
│   ├── sound.js         # Shared — reuse for all beat sounds
│   └── mini-app-back.js # Shared — reuse for back button
├── js/
│   └── registry.js      # Register rhythm app on hub
└── index.html           # Hub — no changes needed (reads from registry)
```

**Structure Decision**: Follows the existing mini-app template exactly:
- `app/www/rhythm/index.html` — HTML page, loaded from hub via `window.location.href = 'rhythm/index.html'`
- `app/www/rhythm/rhythm.css` — per-game stylesheet (loaded in `<head>`)
- `app/www/js/rhythm/rhythm.js` — game logic (loaded after `sound.js` and `mini-app-back.js`)
- `app/www/js/registry.js` — register the game so it appears on the hub

## Complexity Tracking

N/A — no violations. This feature uses existing patterns and dependencies.
