/**
 * SproutPlay - Piano Play Mini-App
 * A landscape-mode piano with 12 keys (one octave: C4–B4).
 * Tap keys to hear synthesized musical notes via the Web Audio API.
 *
 * Copy of _template/js/_template.js adapted for piano.
 *
 * Dependencies (loaded before this file by index.html):
 *   - Sound    (window.Sound)    — audio playback, TTS
 *   - Settings (window.Settings) — sound enabled/disabled toggle
 */

const Piano = (function () {

    // ── DOM refs ─────────────────────────────────────────────────
    var backBtn         = null;
    var keyboardEl      = null;

    // ── State ─────────────────────────────────────────────────────
    var isInitialized   = false;

    // ── Piano key data (C4–B4, 12 keys) ──────────────────────────
    var KEYS = [
        { note: 'C4',   frequency: 261.63, isBlack: false, whiteKeyIndex: 0, label: 'C'  },
        { note: 'C#4',  frequency: 277.18, isBlack: true,  whiteKeyIndex: 0, label: 'C#' },
        { note: 'D4',   frequency: 293.66, isBlack: false, whiteKeyIndex: 1, label: 'D'  },
        { note: 'D#4',  frequency: 311.13, isBlack: true,  whiteKeyIndex: 1, label: 'D#' },
        { note: 'E4',   frequency: 329.63, isBlack: false, whiteKeyIndex: 2, label: 'E'  },
        { note: 'F4',   frequency: 349.23, isBlack: false, whiteKeyIndex: 3, label: 'F'  },
        { note: 'F#4',  frequency: 369.99, isBlack: true,  whiteKeyIndex: 3, label: 'F#' },
        { note: 'G4',   frequency: 392.00, isBlack: false, whiteKeyIndex: 4, label: 'G'  },
        { note: 'G#4',  frequency: 415.30, isBlack: true,  whiteKeyIndex: 4, label: 'G#' },
        { note: 'A4',   frequency: 440.00, isBlack: false, whiteKeyIndex: 5, label: 'A'  },
        { note: 'A#4',  frequency: 466.16, isBlack: true,  whiteKeyIndex: 5, label: 'A#' },
        { note: 'B4',   frequency: 493.88, isBlack: false, whiteKeyIndex: 6, label: 'B'  }
    ];

    // ── PianoAudio module ────────────────────────────────────────
    var PianoAudio = (function () {
        var audioCtx    = null;
        var activeNotes = new Map(); // keyElement → { oscillator, gainNode }

        function init() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function playNote(frequency, keyElement) {
            if (!audioCtx) init();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            // Don't restart if already playing (prevents double-trigger)
            if (activeNotes.has(keyElement)) return;

            var oscillator = audioCtx.createOscillator();
            var gainNode   = audioCtx.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

            // Attack: quick ramp to full volume (0.5 gain)
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.02);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.start();

            activeNotes.set(keyElement, { oscillator: oscillator, gainNode: gainNode });
        }

        function stopNote(keyElement) {
            var note = activeNotes.get(keyElement);
            if (!note) return;

            var { oscillator, gainNode } = note;
            var now = audioCtx.currentTime;

            // Release: ramp gain to 0 over 300ms, stop oscillator after 350ms
            gainNode.gain.cancelScheduledValues(now);
            gainNode.gain.setValueAtTime(gainNode.gain.value, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            oscillator.stop(now + 0.35);

            // Cleanup after release
            setTimeout(function () {
                oscillator.disconnect();
                gainNode.disconnect();
            }, 400);

            activeNotes.delete(keyElement);
        }

        function destroy() {
            activeNotes.forEach(function (note, keyEl) {
                try { note.oscillator.stop(); } catch (e) {}
                try { note.oscillator.disconnect(); } catch (e) {}
                try { note.gainNode.disconnect(); } catch (e) {}
            });
            activeNotes.clear();
            if (audioCtx) {
                audioCtx.close();
                audioCtx = null;
            }
        }

        return {
            init: init,
            playNote: playNote,
            stopNote: stopNote,
            destroy: destroy
        };
    })();

    // ── Keyboard rendering ───────────────────────────────────────
    function renderKeyboard() {
        keyboardEl.innerHTML = '';

        // Build white keys first (7 keys, grid columns 1–7)
        var whiteKeys = KEYS.filter(function (k) { return !k.isBlack; });
        var blackKeys = KEYS.filter(function (k) { return k.isBlack; });

        // Create white key elements
        for (var i = 0; i < whiteKeys.length; i++) {
            var wk = whiteKeys[i];
            var keyEl = document.createElement('div');
            keyEl.className = 'key white-key';
            keyEl.dataset.note = wk.note;
            keyEl.dataset.frequency = wk.frequency;
            keyEl.style.gridColumn = (i + 1);

            var label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = wk.label;
            keyEl.appendChild(label);

            keyboardEl.appendChild(keyEl);
        }

        // Create black key elements
        // Black keys sit between white keys using grid-column: N / span 1
        // C#4 → between white key 1 (C) and 2 (D) → grid-column: 1
        // D#4 → between white key 2 (D) and 3 (E) → grid-column: 2
        // F#4 → between white key 4 (F) and 5 (G) → grid-column: 4
        // G#4 → between white key 5 (G) and 6 (A) → grid-column: 5
        // A#4 → between white key 6 (A) and 7 (B) → grid-column: 6
        var blackKeyGridCols = { 'C#4': 1, 'D#4': 2, 'F#4': 4, 'G#4': 5, 'A#4': 6 };
        for (var j = 0; j < blackKeys.length; j++) {
            var bk = blackKeys[j];
            var keyEl = document.createElement('div');
            keyEl.className = 'key black-key';
            keyEl.dataset.note = bk.note;
            keyEl.dataset.frequency = bk.frequency;
            keyEl.style.gridColumn = blackKeyGridCols[bk.note];

            var label = document.createElement('span');
            label.className = 'key-label';
            label.textContent = bk.label;
            keyEl.appendChild(label);

            keyboardEl.appendChild(keyEl);
        }
    }

    // ── Touch handling ────────────────────────────────────────────
    function wireTouchHandling() {
        // Prevent default touch behaviors on the keyboard container
        keyboardEl.addEventListener('touchstart', function (e) {
            // Allow touch events to propagate to key elements only
            if (!e.target.classList.contains('key')) return;
        }, { passive: true });

        keyboardEl.addEventListener('touchstart', function (e) {
            var key = e.target.closest('.key');
            if (!key) return;
            e.preventDefault();

            var freq = parseFloat(key.dataset.frequency);
            PianoAudio.playNote(freq, key);
            key.classList.add('active');
        }, { passive: false });

        keyboardEl.addEventListener('touchend', function (e) {
            var key = e.target.closest('.key');
            if (!key) return;
            e.preventDefault();

            PianoAudio.stopNote(key);
            key.classList.remove('active');
        }, { passive: false });

        keyboardEl.addEventListener('touchcancel', function (e) {
            var key = e.target.closest('.key');
            if (!key) return;

            PianoAudio.stopNote(key);
            key.classList.remove('active');
        });

        // Mouse fallback for desktop testing
        keyboardEl.addEventListener('mousedown', function (e) {
            var key = e.target.closest('.key');
            if (!key) return;
            e.preventDefault();

            var freq = parseFloat(key.dataset.frequency);
            PianoAudio.playNote(freq, key);
            key.classList.add('active');
        });

        keyboardEl.addEventListener('mouseup', function (e) {
            var key = e.target.closest('.key');
            if (!key) return;

            PianoAudio.stopNote(key);
            key.classList.remove('active');
        });

        keyboardEl.addEventListener('mouseleave', function (e) {
            var key = e.target.closest('.key');
            if (!key) return;

            PianoAudio.stopNote(key);
            key.classList.remove('active');
        });
    }

    // ── Label toggle ──────────────────────────────────────────────
    function initLabels() {
        var showLabels = localStorage.getItem('piano_showLabels');
        if (showLabels === 'true') {
            keyboardEl.setAttribute('data-labels', 'true');
        }
    }

    // ── Navigation ────────────────────────────────────────────────
    function goToHub() {
        PianoAudio.destroy();
        window.location.href = '../index.html';
    }

    // ── Init ──────────────────────────────────────────────────────
    function init() {
        backBtn         = document.getElementById('piano-back');
        keyboardEl      = document.getElementById('piano-keyboard');

        if (backBtn) backBtn.addEventListener('click', goToHub);

        PianoAudio.init();
        renderKeyboard();
        wireTouchHandling();
        initLabels();

        isInitialized = true;
    }

    // ── Public API ────────────────────────────────────────────────
    return {
        init: init
    };

})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', Piano.init);
