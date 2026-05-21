# Feature Specification: Missing Addend Mode (Level 3)

**Feature Branch**: `004-feed-the-monster`
**Created**: 2026-05-07
**Updated**: 2026-05-21
**Status**: Implemented
**Parent feature**: Feed the Monster (`specs/004-feed-the-monster/spec.md`)

## Summary

Level 3 upgrades from "feed the sum" to a missing addend format. The sign shows "3 + ? = 5 🍇" and TTS asks "3 plus what equals 5?" The child must figure out and feed the missing number. The rest of the game mechanics — same food per round, wrong-food decoys, celebration, overfed — work identically to Levels 1 and 2.

The pre-fed belly zone (originally specced) was built and subsequently removed as it confused players. The sign and TTS carry the mechanic without any visual belly decoration.

---

## User Scenarios & Testing

### User Story 1 — Solve a Missing Addend Problem (Priority: P1)

A child (ages 5–7) reaches Level 3. The sign reads "3 + ? = 5 🍇" and TTS says "3 plus what equals 5?" The tray has some grapes (the missing addend count) and some wrong-food decoys. The child works out they need to feed 2 grapes, drags them in, and triggers celebration.

**Acceptance Scenarios**:

1. **Given** a Level 3 round starts, **When** the screen loads, **Then** the sign reads "[A] + ? = [total] [emoji]" and TTS says "[A] plus what equals [total]?"
2. **Given** the child identifies the correct food from the sign, **When** they drag correct food into the mouth, **Then** the counter increments normally toward displayB (not toward A+B)
3. **Given** the child drags a wrong-food decoy into the mouth, **When** it lands, **Then** it bounces back with "Yuck! The monster wants [food]!" — identical to Levels 1 and 2
4. **Given** the counter reaches displayB, **When** 600ms passes, **Then** celebration fires — the child fed the missing addend correctly
5. **Given** TTS was missed, **When** the child taps 🔊, **Then** TTS repeats "[A] plus what equals [total]?"

---

### Edge Cases

- What if TTS is unavailable? The sign "[A] + ? = [total] [emoji]" is sufficient — game is fully playable visually
- What if the child feeds extra correct items in the 600ms window? Same overfed path as other levels — shake + reset
- What if the child feeds wrong-food items? Same "Yuck!" bounce-back as other levels — counter unchanged

---

## Requirements

- **FR-001**: At Level 3, `round.target` MUST equal `displayB` (the missing addend), not the full sum
- **FR-002**: The sign MUST display "[A] + ? = [total] [emoji]" at Level 3, at a font size that fits the container
- **FR-003**: TTS MUST read "[A] plus what equals [total]?" — it MUST NOT reveal the answer by saying "feed me [B] more"
- **FR-004**: The 🔊 button MUST replay this prompt correctly at Level 3
- **FR-005**: LEVEL3_PAIRS MUST be constrained to pairs where displayB ≤ 5 to keep tray item count manageable
- **FR-006**: All other game mechanics (correct food, wrong-food decoys, celebration, overfed, level persistence) MUST behave identically to Levels 1 and 2

---

## Success Criteria

- **SC-001**: A child aged 5–7 can identify how many items to feed from the "[A] + ? = [total]" sign without adult explanation
- **SC-002**: Win condition fires at exactly displayB correct items — never at the full sum A+B
- **SC-003**: TTS prompt does not reveal the answer; sign provides sufficient visual information for non-verbal play

---

## Assumptions

- `displayA` ≥ 1 and `displayB` ≥ 1 and `displayB` ≤ 5 (enforced by the LEVEL3_PAIRS table)
- `round.target = displayB` — the counter counts toward B, not toward A+B
- No pre-fed belly zone items; the "[A] + ? = [total]" sign is the sole indicator of the first addend
- Levels 1 and 2 are unaffected by this mode
