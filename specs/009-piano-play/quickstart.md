# Quickstart: Piano Play

**Feature**: 009-piano-play
**Date**: 2026-06-11

## Build and Install

### Prerequisites
- Node.js 18+ and npm installed
- Android SDK with API 34 and Build Tools 34.0.0
- Java 21 (Capacitor 8 requirement)

### Build Steps

```bash
# From repo root, on the 009-piano-play branch:
cd app && npm install && npx cap sync android && cd ..
./build.sh
```

APK output: `app/android/app/build/outputs/apk/debug/app-debug.apk`

### Install on Device

```bash
adb install app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Manual Testing Scenarios

### Test 1: Launch from Hub
1. Open SproutPlay app
2. Tap the "Piano Play" 🎹 card on the hub grid
3. **Expected**: Piano app opens, landscape keyboard fills the screen, no errors in console

### Test 2: Play Single Notes
1. Tap individual keys from left to right
2. **Expected**: Each key plays a distinct note (C, D, E, F, G, A, B ascending)
3. **Expected**: Each key visually highlights (changes color) on press
4. **Expected**: Note stops when finger is lifted

### Test 3: Play Sharps/Flats
1. Tap the black keys (shorter keys between white keys)
2. **Expected**: Each black key plays its correct note (C#, D#, F#, G#, A#)
3. **Expected**: Black keys are visually distinct from white keys (darker color, shorter height)

### Test 4: Chords (Simultaneous Notes)
1. Press 2–3 keys simultaneously with different fingers
2. **Expected**: All pressed notes play at the same time
3. **Expected**: Each key maintains its visual highlight independently
4. **Expected**: Release one key — that note stops, others continue

### Test 5: Rapid Tapping
1. Tap keys rapidly (slap the screen) for 30+ seconds
2. **Expected**: No audio dropouts, no UI freezes, no crashes
3. **Expected**: Each tap produces a sound with no perceptible delay

### Test 6: Back Navigation
1. While in the piano app, tap the "← Back" button
2. **Expected**: Returns to the hub grid
3. **Expected**: Hub displays correctly, no stale state

### Test 7: Re-launch
1. From the hub, tap "Piano Play" again
2. **Expected**: Piano app opens cleanly (no duplicate audio contexts, no memory leaks)

### Test 8: Portrait Mode Warning
1. Rotate device to portrait orientation (if possible)
2. **Expected**: A "Rotate your device" warning message is displayed
3. **Expected**: No piano keyboard is visible in portrait

### Test 9: Sound Toggle
1. From the hub, go to Settings and disable sound
2. Return to hub, launch Piano Play
3. Tap keys
4. **Expected**: Keys still show visual feedback (color change) but produce no audio

### Test 10: Note Labels (if implemented)
1. From Settings, enable note labels for piano
2. Launch Piano Play
3. **Expected**: Each key displays its letter name (C, D, E, F, G, A, B for white keys; C#, D#, etc. for black keys)
4. Disable note labels in Settings, re-launch
5. **Expected**: No text appears on keys

## Known Limitations (MVP)

- Only one octave (C4–B4). Two octaves deferred to future iteration.
- No game modes (copy melody, free play only). Game mechanics are out of scope for MVP.
- No recording or playback of played melodies.
- No volume control slider — uses fixed volume (0.5 gain).
- Portrait mode shows a warning; does not auto-rotate the device.

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `app/www/piano/index.html` | Created | Piano mini-app entry page |
| `app/www/css/piano.css` | Created | Piano-specific styles |
| `app/www/js/piano/piano.js` | Created | Piano logic (audio, touch, UI) |
| `app/www/js/registry.js` | Modified | Register piano in AppRegistry |
| `app/www/index.html` | May need update | If hub layout needs adjustment for new card |
| `README.md` | Modified | Document piano app in the list of mini-apps |
