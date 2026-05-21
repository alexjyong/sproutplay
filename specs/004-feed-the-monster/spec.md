# Feature Specification: Feed the Monster Math Game

**Feature Branch**: `004-feed-the-monster`
**Created**: 2026-05-03
**Updated**: 2026-05-21
**Status**: Implemented

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Count and Feed the Right Food (Priority: P1)

A child (ages 3–7) sees a goofy cartoon monster holding a sign with a number and a food emoji (e.g. "3 🍇"). A mix of food items sits in a tray at the bottom — some are grapes (the right food), some are other foods (decoys). The child drags the correct food items one at a time into the monster's mouth. Each correct item triggers a chomp animation and an audio cue. A counter below the monster shows how many have been fed. When the count exactly matches the sign, the monster does a happy dance and a celebration screen appears. A 🔊 button lets the child replay the spoken prompt any time during the round.

**Why this priority**: Core game loop. Counting + food identification together form the base learning mechanic.

**Independent Test**: Launch with Level 1 active. Verify sign shows a number + food emoji, all correct items are the same food, decoys are different foods, dragging correct items increments counter, reaching target triggers celebration.

**Acceptance Scenarios**:

1. **Given** the game loads, **When** the child views the screen, **Then** a monster with a sign (e.g. "3 🍇"), a counter at 0, and a mixed tray of food items are visible, and TTS reads "Feed me 3 grapes!"
2. **Given** items are in the tray, **When** the child drags a correct food item into the monster's mouth, **Then** the monster chomps, the counter increments by 1, and a chomp sound plays
3. **Given** items are in the tray, **When** the child drags a wrong food item into the monster's mouth, **Then** the item bounces back, the monster shakes briefly, TTS says "Yuck! The monster wants grapes!", and the counter does not change
4. **Given** the counter matches the target, **When** the last correct item lands, **Then** a celebration overlay appears and TTS says "You did it! You fed the monster 3 grapes!"
5. **Given** a new round starts, **When** the celebration is dismissed, **Then** a new random target and food type appear with a freshly mixed tray
6. **Given** the child misses or forgets the TTS prompt, **When** they tap the 🔊 button, **Then** the prompt is spoken again

---

### User Story 2 — Overfed Feedback (Priority: P2)

After feeding the exact target of correct items, there is a brief 600ms window before the celebration fires. If the child drags another correct item into the mouth during that window, the monster rejects it with a shake animation, TTS says "Oops, too many! Let's try again!", and all items reset so the child can try again from zero with the same target and food type.

**Why this priority**: Teaches self-correction and counting discipline. The 600ms window means fast/careless dragging can trigger this — it is reachable but not punishing.

**Independent Test**: Feed exactly the right number of correct items rapidly and immediately drag one more; verify shake, reset, and retry with the same target.

**Acceptance Scenarios**:

1. **Given** the counter just reached the target, **When** no more items are fed within 600ms, **Then** celebration fires normally
2. **Given** the counter just reached the target, **When** the child drags another correct item within 600ms, **Then** overfed animation plays, TTS says "Oops, too many!", counter resets to 0, and all items animate back to their starting positions
3. **Given** the overfed reset occurs, **When** the reset completes, **Then** the same target and food type are still shown and all items are draggable again

---

### User Story 3 — Difficulty Progression (Priority: P3)

The game automatically advances through three difficulty levels as the child wins consecutive rounds. Level 1 uses targets 1–5; Level 2 uses targets 1–7; Level 3 presents missing addend problems ("3 + ? = 5 🍇") where the child feeds the missing number of items. Progress persists so a returning child resumes at their achieved level.

**Why this priority**: Extends the game's life across the full 3–7 age range. Levels 1 and 2 build counting fluency; Level 3 introduces early addition reasoning.

**Independent Test**: Complete 5 consecutive rounds at Level 1; verify Level 2 unlocks. Force Level 3 via localStorage; verify sign shows missing addend format and child feeds displayB items (not the full sum).

**Acceptance Scenarios**:

1. **Given** a child completes 5 consecutive correct rounds at their current level, **When** the 5th celebration finishes, **Then** the game announces the level-up and the next level begins
2. **Given** the child is on Level 3, **When** a round starts, **Then** the sign shows a missing addend expression (e.g. "3 + ? = 5 🍇") and TTS reads "3 plus what equals 5?"
3. **Given** a Level 3 round, **When** the child feeds exactly displayB correct items, **Then** celebration fires — not the full sum
4. **Given** the app is closed and reopened, **When** the game loads, **Then** it resumes at the level the child had last reached

---

### Edge Cases

- What happens if the child drags very rapidly? The 600ms pending-win window makes overfeed reachable on fast input; the counter-overfed path resets all items cleanly
- What happens if TTS is unavailable? Chomp/celebrate SFX still play; the sign and 🔊 button remain; game is fully playable without audio
- What happens if the child never drags anything? No timeout; game waits indefinitely — no penalty for slow interaction
- What if the sound effects toggle is off in Settings? All audio suppressed; visuals carry the full experience
- What if the tray layout can't place all items without overlap? A grid fallback ensures items never pile on top of each other

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST display a cartoon monster with a sign showing the target count and the food emoji for the current round (e.g. "3 🍇")
- **FR-002**: The game MUST display a tray of food items containing exactly `round.target` correct-food items and 2–3 wrong-food decoy items, all positioned without overlap
- **FR-003**: Each round MUST use one randomly selected food type for correct items; decoys MUST be a different food type each
- **FR-004**: Dragging a correct item into the monster's mouth MUST trigger a chomp animation and increment the on-screen counter by 1
- **FR-005**: Dragging a wrong-food item into the monster's mouth MUST animate the item back to its origin, play a rejection sound, briefly shake the monster, and speak "Yuck! The monster wants [food name]!" via TTS
- **FR-006**: When the counter exactly matches the target, the game MUST wait 600ms before firing celebration — allowing an accidental overfeed to be caught
- **FR-007**: If a correct item is fed during the 600ms pending-win window, the game MUST play the overfed animation, speak "Oops, too many! Let's try again!", reset the counter to 0, and restore all items
- **FR-008**: The game MUST use TTS to read the target aloud when each new round begins (e.g. "Feed me 3 grapes!")
- **FR-009**: A 🔊 button MUST be visible at all times during a round and MUST replay the TTS prompt when tapped
- **FR-010**: The game MUST support three difficulty levels: Level 1 (targets 1–5), Level 2 (targets 1–7), Level 3 (missing addend: "A + ? = total", child feeds displayB items)
- **FR-011**: Level 3 MUST use pairs where displayA ≤ 5 and displayB ≤ 5 to keep tray item count manageable
- **FR-012**: The game MUST automatically advance the child to the next level after 5 consecutive correct rounds
- **FR-013**: The child's current level MUST be persisted to localStorage and restored on next launch
- **FR-014**: All draggable items and interactive targets MUST have touch areas of at least 48×48 dp
- **FR-015**: The game MUST function fully offline with no network dependency
- **FR-016**: The game MUST respect the global Sound Effects setting; if sounds are disabled, all audio is suppressed
- **FR-017**: The game MUST be accessible from the SproutPlay hub via a registered icon entry
- **FR-018**: The monster, items, and UI decorations MUST be built from emoji and CSS — no external image assets required
- **FR-019**: A "Back to Hub" button MUST be present and functional at all times

### Key Entities

- **Round**: A single counting challenge — has a target number, a food type (emoji + name), correct/wrong item counts, current count, and a result (success / overfed / wrong-food / in-progress)
- **Level**: Tracks the child's progression (1, 2, or 3), the number of consecutive wins at that level, and the win threshold (5) before advancing
- **DraggableItem**: An emoji icon the child drags to the monster; has a position, a correct/wrong flag, and a fed/unfed state
- **MonsterState**: The monster's current animation state (idle / chomping / happy / overfed / yuck)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child aged 3–7 can complete a full round without adult assistance after one observed practice round
- **SC-002**: Counter update and chomp animation are perceived as instantaneous — no visible lag between releasing a drag and seeing the counter change
- **SC-003**: Wrong-food rejection, overfed reset, and celebration each trigger correctly 100% of the time with no missed state transitions
- **SC-004**: A child who closes and reopens the app always resumes at their previously achieved level
- **SC-005**: The game remains fully playable in airplane mode
- **SC-006**: All tap/drag targets are large enough that 95% of first-attempt touches from a child's finger land on the intended target
- **SC-007**: A child cannot identify the correct food from audio alone — the sign and tray visuals are sufficient for a non-verbal child to play

---

## Assumptions

- The mini-app targets Android devices running SproutPlay; no iOS or web-only behavior is assumed
- The drag mechanic follows the same touch event model as `abc.js` (touchstart / touchmove / touchend with `touch-action: none` on both items and tray)
- "Emoji + CSS only" means the monster face and food items are Unicode emoji — no SVG or raster image files; all emoji used must be Unicode 9.0 or older for broad Android compatibility
- Level advancement resets after the child reaches Level 3; the game cycles new random problems within Level 3 indefinitely
- Level 3 missing addend pairs are drawn from a fixed table (LEVEL3_PAIRS) with displayA ≤ 5 and displayB ≤ 5; the last-used pair index is tracked to avoid immediate repeats
- Consecutive win count resets to 0 on any overfed round
- The celebration overlay auto-dismisses after 3 seconds or on tap, whichever comes first
- Wrong-food rejection does NOT reset consecutiveWins — only counter-overfed (feeding past target) does
