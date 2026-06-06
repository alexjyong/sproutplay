# Research: Code Cleanup & Restructuring

**Branch**: `005-code-cleanup` | **Date**: 2026-05-27

## Status: Complete — No Unknowns

All decisions were resolved by direct code scan before planning. No external research required.

---

## Decision Log

### D-001: Which phonics audio system to keep?

- **Decision**: `Sound.phonics()` via Capacitor NativeAudio (in `sound.js`)
- **Rationale**: This is the only system actively loaded and called. It has NativeAudio preloading with Web Audio API tone fallback — the most robust approach.
- **Alternatives considered**:
  - `PhonicsAudio` module (`phonics-audio.js`) — orphaned, not referenced in any HTML, uses plain HTML5 Audio with no NativeAudio integration. Deleted.
  - 26 `<audio>` tags in `abc/index.html` — legacy preload path, not referenced by `abc.js` (confirmed by grep). Removed.

### D-002: Where do shared CSS rules live?

- **Decision**: `base.css` exclusively. All mini-app CSS files remove duplicate definitions.
- **Rationale**: `base.css` already contains the authoritative definitions. The duplicates in mini-app CSS files were added because those HTMLs didn't load `base.css` — fixing the root cause (missing `<link>`) makes the duplicates unnecessary.
- **Alternatives considered**: Keep per-mini-app copies — rejected; maintains the duplication problem.

### D-003: Does `abc.js` reference the `<audio>` element IDs?

- **Decision**: No. Safe to delete all 26 tags.
- **Rationale**: `grep -n "snd-\|getElementById.*snd\|audio\|Audio" abc.js` → 0 matches. `abc.js` calls `Sound.phonics(letter)` exclusively.

### D-004: Do any mini-app CSS files have intentional overrides that happen to share a selector name?

- **Decision**: To be verified per-selector during implementation (CSS diff procedure in plan.md).
- **Rationale**: The selectors found are visually similar but values may diverge (e.g., different border-radius on celebration-card). The implementer must diff before deleting.
- **Approach**: If values match `base.css` → delete. If they differ → keep with `/* mini-app override */` comment.

### D-005: Is `paint/index.html` omitting `sound.js` intentionally?

- **Decision**: Yes, intentional. Paint does not use any audio.
- **Rationale**: `paint/index.html` has no `sound.js` script tag and `paint.js` makes no `Sound.*` calls. Adding `base.css` only introduces styles — no JS dependency.
