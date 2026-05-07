# Feature Specification: Missing Addend Mode

**Feature Branch**: `004-feed-the-monster`
**Created**: 2026-05-07
**Status**: Draft
**Parent feature**: Feed the Monster (`specs/004-feed-the-monster/spec.md`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Solve a Missing Addend Problem (Priority: P1)

A child (ages 5–7) reaches Level 3 of Feed the Monster. Instead of seeing "3 + 2 = ?", they see "3 + ? = 5" on the monster's sign. Three greyed-out items already appear inside or near the monster's belly — representing the first addend already eaten. Two normal draggable food items sit in the tray. The child figures out they need to feed 2 more items to reach 5 total, drags them in one at a time, and triggers the celebration.

**Why this priority**: Core of the feature — everything else is this one mechanic.

**Independent Test**: Set level to 3 in localStorage, launch the game. Verify the sign shows "A + ? = total" format, verify A items appear pre-fed (greyed, not draggable), verify only B items appear in the tray, verify feeding all B items triggers celebration.

**Acceptance Scenarios**:

1. **Given** a Level 3 round starts, **When** the screen loads, **Then** the sign reads "[A] + ? = [total]" and TTS says "[A] plus what equals [total]? Feed me [B] more!"
2. **Given** the round has started, **When** the child looks at the belly zone, **Then** [A] greyed-out non-draggable items are already visible there
3. **Given** [A] items are pre-fed and [B] items are in the tray, **When** the child drags all [B] tray items into the mouth, **Then** the celebration fires exactly as in the standard counting mode
4. **Given** the child tries to drag a pre-fed (greyed) item, **When** they touch it, **Then** nothing happens — it does not lift or respond to drag
5. **Given** the child drags more than [B] items (decoys exist), **When** the overfed threshold is hit, **Then** the same overfed rejection and reset behavior fires as in the base game

---

### User Story 2 — Visual Clarity of Pre-Fed vs Available Items (Priority: P2)

A child can immediately tell which items are already in the monster's belly and which ones they need to drag. The visual distinction is clear enough that a 5-year-old does not attempt to drag the pre-fed items after the first failed attempt.

**Why this priority**: If kids can't distinguish pre-fed from available, the learning mechanic breaks down entirely.

**Independent Test**: Show the game screen to a child or adult unfamiliar with it. Ask "which ones can you move?" — they should point to the tray items, not the belly items, without being told.

**Acceptance Scenarios**:

1. **Given** a Level 3 round starts, **When** the child views the screen, **Then** pre-fed items are visually distinct from tray items (greyed/faded appearance, different position)
2. **Given** a child touches a pre-fed item, **When** they try to drag it, **Then** it does not move and gives no drag feedback (no lift, no shadow)
3. **Given** the celebration fires and a new round starts, **When** the new round loads, **Then** the pre-fed count resets to the new [A] value — old belly items are gone

---

### Edge Cases

- What if `displayA` is 0? (Pair [0, N] does not exist in LEVEL3_PAIRS — minimum addend is 1, so this cannot happen)
- What if `displayB` is larger than the tray can fit with decoys? (Tray shows `displayB + 2–4` items; if total exceeds tray space, collision avoidance fallback positions them; acceptable for now)
- What if the child feeds some tray items then the app is backgrounded? (State is in-memory only; on resume the game continues from current count — same behavior as base game)
- What if TTS is unavailable? (Sign still shows "[A] + ? = [total]" visually; game is fully playable without audio)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a Level 3 round starts, the sign MUST display in the format "[A] + ? = [total]" where A is the first addend and total is the sum
- **FR-002**: At Level 3 round start, [A] pre-fed items MUST appear in the monster's belly zone, visually distinct from draggable items
- **FR-003**: Pre-fed items MUST NOT respond to touch or drag — they are decoration only
- **FR-004**: The item tray MUST contain [B] draggable items (the missing addend) plus 2–4 decoy extras, where B = total − A
- **FR-005**: The win condition MUST trigger when `currentCount` reaches [B] (not the full total), since [A] items are already counted as pre-fed
- **FR-006**: The overfed rejection MUST trigger when the child attempts to feed more than [B] items, using the same bounce-back and shake behavior as the base game
- **FR-007**: TTS MUST read the prompt as "[A] plus what equals [total]? Feed me [B] more!" when the round starts
- **FR-008**: On celebration or new round, all pre-fed items MUST be cleared and the next round's pre-fed items rendered fresh
- **FR-009**: Pre-fed items MUST be visually distinguishable from tray items (e.g. greyed/faded, positioned in the belly zone)
- **FR-010**: The feature MUST use the existing LEVEL3_PAIRS table with no new data — `displayA` is pre-fed, `displayB` is the missing addend to drag

### Key Entities

- **PreFedItem**: A non-interactive food emoji displayed in the belly zone; has position and emoji but no drag state
- **Round** (extended): At Level 3, `round.target` now equals `displayB` (the missing addend), not the full sum — this is the key behavioral change from the base Level 3

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A child aged 5–7 can correctly identify how many items to drag (the missing addend) after seeing the "[A] + ? = [total]" sign, without adult explanation, on at least 3 out of 5 attempts
- **SC-002**: Pre-fed and draggable items are visually distinguishable — 100% of test observers correctly identify which items are movable on first viewing
- **SC-003**: The win condition fires correctly on the exact missing addend count across all LEVEL3_PAIRS combinations — no off-by-one errors
- **SC-004**: The transition between rounds (clearing pre-fed items, showing new ones) is perceived as instantaneous — no flicker or leftover items visible

## Assumptions

- `displayA` is always ≥ 1 and `displayB` is always ≥ 1 (enforced by the existing LEVEL3_PAIRS table — no pair has a 0 addend)
- `round.target` is redefined at Level 3 to mean the missing addend (`displayB`), not the full sum — the counter counts toward B, not toward A+B
- Pre-fed items are rendered in the belly zone (inside or just above `#monster-mouth`) as absolutely-positioned emoji divs with a greyed CSS filter
- The number of pre-fed items shown is always `displayA`; they are created fresh each round and removed on round end
- Decoy items in the tray are always the same emoji pool as normal rounds — no visual distinction between decoys and valid items (the child must count, not sort by appearance)
- This change is scoped entirely to Level 3; Levels 1 and 2 are unaffected
