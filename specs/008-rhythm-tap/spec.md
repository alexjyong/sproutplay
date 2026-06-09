# Feature Specification: Rhythm Tap

**Feature Branch**: `008-rhythm-tap`
**Created**: 2026-06-09
**Status**: Draft
**Input**: User description: "Rhythm Tap - A Simon-style beat game where a character plays/claps a pattern and the kid taps it back. Uses Web Audio API (already in sound.js). Targets 3-4 year olds who aren't ready for reading or math yet. Pattern length starts at 2 beats and increases by 1 each round (max 8). Different difficulty tiers: Easy (2-4 beats, slower tempo), Medium (4-6 beats, normal tempo), Hard (6-8 beats, faster tempo). Visual feedback: each beat shows a glowing pulse on the character. No wrong answers — just repeat what you hear."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Watch and Repeat (Priority: P1)

A child (age 3–4) opens Rhythm Tap. A cute character on screen plays a short rhythm pattern (2 beats) using claps or drum sounds. Each beat is accompanied by a visual pulse on the character. After the pattern finishes, the child taps the screen in the same rhythm to repeat it back. There are no wrong answers — tapping too fast or slow just plays that tap's sound. When the child's taps match the pattern (same number of beats in the same order), a celebration appears and the next round starts with one more beat.

**Why this priority**: This is the core MVP — without it, there is no game. It delivers immediate value: a fun, zero-friction rhythm game for pre-readers.

**Independent Test**: Can be fully tested by opening the app, watching a 2-beat pattern, tapping twice to match it, and seeing the celebration screen.

**Acceptance Scenarios**:

1. **Given** the game has just started, **When** the character plays a 2-beat pattern with visual pulses, **Then** the child sees and hears each beat clearly
2. **Given** the pattern has finished playing, **When** the child taps the screen to repeat the pattern, **Then** each tap produces a distinct sound and visual pulse
3. **Given** the child's taps match the original pattern (same number of beats in same order), **When** the last matching tap is played, **Then** a celebration screen appears with confetti/stars
4. **Given** the child's taps do not match the pattern, **When** all taps are played, **Then** the game replays the original pattern so the child can try again

---

### User Story 2 - Progress Through Rounds (Priority: P2)

The child plays multiple rounds. Each successful round adds one more beat to the pattern (starting at 2, going up to 8). The child can fail any round and must replay until they match the pattern. The game tracks how far they've gotten (current round number) and shows it on screen.

**Why this priority**: This adds the progression loop that makes the game replayable and rewarding. Without it, the child gets no sense of achievement or growth.

**Independent Test**: Can be tested by successfully matching 5 consecutive rounds (2 → 3 → 4 → 5 → 6 beats) and verifying the round counter increases each time.

**Acceptance Scenarios**:

1. **Given** the child successfully matched the previous round, **When** a new round starts, **Then** the pattern has exactly one more beat than the previous round (capped at 8)
2. **Given** the child has completed N rounds, **When** looking at the screen, **Then** the round number (e.g., "Round 3") is clearly displayed
3. **Given** the pattern has reached 8 beats (maximum), **When** the child completes that round, **Then** the game congratulates them and offers to restart from 2 beats (or continue at 8 beats)

---

### User Story 3 - Difficulty Selection (Priority: P3)

Before starting, the child (or parent) selects a difficulty level: Easy, Medium, or Hard. This determines the starting pattern length and tempo. Easy starts at 2 beats with slow tempo, Medium starts at 4 beats with normal tempo, Hard starts at 6 beats with faster tempo.

**Why this priority**: This makes the game accessible to a wider age range (2–6 years). A 2-year-old would be overwhelmed by Hard mode, while a 5-year-old might find Easy too boring.

**Independent Test**: Can be tested by selecting each difficulty and verifying the starting pattern length and tempo match the expected values.

**Acceptance Scenarios**:

1. **Given** Easy mode is selected, **When** the first round starts, **Then** the pattern has 2 beats at a slow tempo
2. **Given** Medium mode is selected, **When** the first round starts, **Then** the pattern has 4 beats at a normal tempo
3. **Given** Hard mode is selected, **When** the first round starts, **Then** the pattern has 6 beats at a faster tempo
4. **Given** any difficulty, **When** the child completes rounds, **Then** the pattern grows by 1 beat per round until it reaches that mode's maximum (Easy: 4, Medium: 6, Hard: 8)

---

### Edge Cases

- What happens if the child taps during the playback phase? — Taps are ignored during playback; visual feedback only shows during the child's turn
- What happens if the child leaves and returns to the app? — The current round is preserved; no progress is lost
- What happens if Web Audio API is unavailable (older browser)? — The game shows a friendly message and does not crash
- What happens if the child taps extremely fast (faster than the beat)? — Each tap is registered individually; no penalty, just a sound

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a character that plays rhythm patterns using distinct sounds (claps, drum hits, or synthesized tones)
- **FR-002**: System MUST provide visual feedback (glowing pulse or animation) synchronized with each beat in the pattern
- **FR-003**: System MUST allow the child to tap the screen to repeat the pattern they just heard
- **FR-004**: System MUST compare the child's tap sequence against the original pattern and determine a match
- **FR-005**: System MUST increase the pattern length by 1 beat after each successful round (starting at 2, max 8)
- **FR-006**: System MUST replay the original pattern when the child's attempt does not match, allowing them to try again
- **FR-007**: System MUST display a celebration screen (stars/confetti) when the child successfully matches a pattern
- **FR-008**: System MUST provide three difficulty levels (Easy, Medium, Hard) that control starting pattern length and tempo
- **FR-009**: System MUST reuse the existing `sound.js` Web Audio API for all rhythm sounds (no new audio dependencies)
- **FR-010**: System MUST follow the existing mini-app template structure (HTML, CSS, JS) and integrate with `mini-app-back.js` for hub navigation
- **FR-011**: System MUST register the game in `registry.js` so it appears on the hub launcher
- **FR-012**: System MUST have no wrong answers — every tap produces a sound, and there is no penalty for "mistakes"

### Key Entities

- **Pattern**: A sequence of beats, each with a sound type and timing. Defined by the game logic, not persisted.
- **Difficulty Tier**: Configuration object containing starting beat count and tempo. Three tiers: Easy, Medium, Hard.
- **Round State**: Current round number and the active pattern being played. Reset on game end or hub navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child aged 3–4 can successfully match a 2-beat pattern on the first attempt within 10 seconds of the pattern ending
- **SC-002**: The game supports patterns up to 8 beats with no audio lag (each beat plays within 50ms of its scheduled time)
- **SC-003**: 90% of test sessions result in at least one successful round completion within the first 2 minutes
- **SC-004**: The game loads and is playable within 3 seconds of tapping the icon on the hub (no loading screens)

## Assumptions

- The child's primary interaction method is tapping the screen (no swipe, no button presses)
- The game is played in short sessions (1–5 minutes), typical for the 3–4 age range
- The existing `sound.js` module provides all necessary audio synthesis (oscillators for different beat sounds)
- The existing `mini-app-back.js` handles hardware back button navigation to the hub
- The existing celebration overlay pattern (used in Memory, ABC, Space, Monster) will be reused for Rhythm Tap's success screen
- No user accounts or progress persistence across sessions (each session is self-contained)
- The game runs on Android devices via Capacitor (no desktop browser testing required for release)
