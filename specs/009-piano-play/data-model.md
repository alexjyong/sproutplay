# Data Model: Piano Play

**Feature**: 009-piano-play
**Date**: 2026-06-11

## Overview

The piano mini-app has minimal data structures. It is a free-play instrument with no scoring, no progress tracking, and no user accounts. All state is transient (current key presses) or static (key definitions, frequencies).

## Entities

### Key

A single piano key with its visual and audio properties.

| Field | Type | Description |
|-------|------|-------------|
| `note` | string | Note name (e.g., "C4", "C#4", "D4") |
| `frequency` | number | Frequency in Hz (e.g., 261.63) |
| `isBlack` | boolean | `true` for sharps/flats, `false` for naturals |
| `whiteKeyIndex` | number | Zero-based index among white keys only (0–6 for C4–B4) |
| `label` | string | Display label (letter name, e.g., "C"). Shown only when note labels are enabled. |

**Validation**:
- `frequency` must be > 0 and < 20000 (within human hearing range)
- `isBlack` must be consistent with `note` (C, D, E, F, G, A, B are natural; C#, D#, F#, G#, A# are black)
- `whiteKeyIndex` must be unique across all natural keys

**Relationships**:
- Each `Key` belongs to the `PianoKeyboard` (one-to-many)
- Each `Key` maps to one `Note` in the Web Audio API (one-to-one)

### ActiveNote

Tracks a currently-playing note for touch handling and cleanup.

| Field | Type | Description |
|-------|------|-------------|
| `oscillator` | OscillatorNode | Web Audio API oscillator producing the tone |
| `gainNode` | GainNode | Web Audio API gain node controlling volume and envelope |
| `keyElement` | HTMLElement | The DOM element for the pressed key (for visual feedback) |

**Lifecycle**:
1. Created on `touchstart` of a key
2. Updated during touch (gain envelope)
3. Destroyed on `touchend` (gain decay → oscillator stop → cleanup)

**No persistence**: Active notes exist only during the user session.

## Static Data

### PianoKeyboard

A fixed set of 12 keys forming one octave (C4–B4). Defined as a constant array in `piano.js`.

```
Keys (in pitch order):
  C4   (white, 261.63 Hz)
  C#4  (black, 277.18 Hz)
  D4   (white, 293.66 Hz)
  D#4  (black, 311.13 Hz)
  E4   (white, 329.63 Hz)
  F4   (white, 349.23 Hz)
  F#4  (black, 369.99 Hz)
  G4   (white, 392.00 Hz)
  G#4  (black, 415.30 Hz)
  A4   (white, 440.00 Hz)
  A#4  (black, 466.16 Hz)
  B4   (white, 493.88 Hz)
```

**No persistence**: Keyboard definition is hardcoded in the source code. No database, no localStorage.

## State Diagram

```
[Idle] → touchstart on Key → [Playing] → touchend → [Idle]
                          ↘ simultaneous touch → [Playing (multi)]
```

- **Idle**: No keys pressed. AudioContext is created but idle.
- **Playing**: One or more keys held down. Each active key has an OscillatorNode + GainNode running.
- **Playing (multi)**: Multiple keys held simultaneously (chords). Each key has independent oscillator/gain.

## No Data Persistence Required

The piano is a free-play instrument. No scores, no progress, no settings specific to the piano. The only settings it shares are the global sound toggle (`Settings.isSoundEnabled()`).
