/**
 * SproutPlay - Rhythm Tap Game
 * Simon-style beat matching game for kids aged 3–4.
 * Uses existing sound.js Web Audio API. No new dependencies.
 *
 * Follows the existing mini-app pattern (memory.js, abc.js, space.js).
 */

document.addEventListener('DOMContentLoaded', function () {

    // ── T010: Game Configuration Constants ───────────────────────────────────

    var DIFFICULTIES = {
        easy:   { startBeats: 2, maxBeats: 4, tempo: 600 },
        medium: { startBeats: 4, maxBeats: 6, tempo: 500 },
        hard:   { startBeats: 6, maxBeats: 8, tempo: 400 }
    };

    // Beat sounds — 8 distinct frequencies/timbres for tap zones
    var BEAT_SOUNDS = [
        { freq: 440, type: 'sine', volume: 0.3 },    // C5
        { freq: 523, type: 'triangle', volume: 0.3 }, // C6
        { freq: 349, type: 'square', volume: 0.2 },   // F4
        { freq: 392, type: 'sine', volume: 0.25 },    // G4
        { freq: 587, type: 'triangle', volume: 0.3 }, // D6
        { freq: 294, type: 'square', volume: 0.2 },   // D4
        { freq: 659, type: 'sine', volume: 0.3 },     // E6
        { freq: 262, type: 'triangle', volume: 0.25 }  // C4
    ];

    // ── T011: Game State ─────────────────────────────────────────────────────

    var currentDifficulty = null;
    var config = null;
    var currentRound = 0;
    var pattern = [];
    var childTaps = [];
    var isPlaying = false;
    var isChildTurn = false;

    // ── T011: DOM References ─────────────────────────────────────────────────

    var characterEl = document.getElementById('character');
    var gameArea = document.getElementById('game-area');
    var beatIndicator = document.getElementById('beat-indicator');
    var difficultyScreen = document.getElementById('difficulty-screen');
    var celebrationEl = document.getElementById('celebration');
    var celebrationTitle = document.getElementById('celebration-title');
    var celebrationMsg = document.getElementById('celebration-msg');
    var playAgainBtn = document.getElementById('play-again-btn');
    var celebrationBackBtn = document.getElementById('celebration-back');
    var backButton = document.getElementById('rhythm-back');

    // ── T019: Initialize (event listeners + start game) ──────────────────────

    function init() {
        setupEventListeners();
        showDifficultyScreen();
    }

    function setupEventListeners() {
        // Back button → hub
        if (backButton) {
            backButton.addEventListener('click', function() {
                window.location.href = '../index.html';
            });
        }

        // Play again → new game
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', function() {
                hideCelebration();
                startNewGame();
            });
        }

        // Celebration back → hub
        if (celebrationBackBtn) {
            celebrationBackBtn.addEventListener('click', function() {
                window.location.href = '../index.html';
            });
        }

        // Difficulty buttons
        var easyBtn = document.getElementById('easy-btn');
        if (easyBtn) {
            easyBtn.addEventListener('click', function() { selectDifficulty('easy'); });
        }

        var mediumBtn = document.getElementById('medium-btn');
        if (mediumBtn) {
            mediumBtn.addEventListener('click', function() { selectDifficulty('medium'); });
        }

        var hardBtn = document.getElementById('hard-btn');
        if (hardBtn) {
            hardBtn.addEventListener('click', function() { selectDifficulty('hard'); });
        }

        // Game area tap handler (child's turn)
        if (gameArea) {
            gameArea.addEventListener('click', handleGameAreaTap);
            gameArea.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleGameAreaTap(e);
            });
        }
    }

    // ── Difficulty Selection ────────────────────────────────────────────────

    function showDifficultyScreen() {
        if (difficultyScreen) {
            difficultyScreen.style.display = 'flex';
        }
    }

    function selectDifficulty(level) {
        currentDifficulty = level;
        config = DIFFICULTIES[level];

        if (difficultyScreen) {
            difficultyScreen.style.display = 'none';
        }

        startNewGame();
    }

    // ── T015: Game Logic — Watch and Repeat (User Story 1) ──────────────────

    /**
     * Start a fresh game (round 1).
     */
    function startNewGame() {
        currentRound = 0;
        pattern = [];
        childTaps = [];
        isPlaying = false;
        isChildTurn = false;
        nextRound();
    }

    /**
     * Advance to the next round (1 more beat, up to max).
     */
    function nextRound() {
        currentRound++;
        var beatCount = Math.min(currentRound, config.maxBeats);
        pattern = generatePattern(beatCount);
        childTaps = [];
        isChildTurn = false;

        // Show round counter
        updateRoundDisplay();

        // Start playback after a short pause
        setTimeout(function() {
            startPlayback(pattern);
        }, 800);
    }

    /**
     * Display the current round number on screen.
     */
    function updateRoundDisplay() {
        var existing = document.getElementById('round-display');
        if (existing) existing.remove();

        var roundEl = document.createElement('div');
        roundEl.id = 'round-display';
        roundEl.textContent = 'Round ' + currentRound;
        document.body.appendChild(roundEl);
    }

    /**
     * Generate a random pattern of the given length.
     */
    function generatePattern(length) {
        var result = [];
        for (var i = 0; i < length; i++) {
            result.push(Math.floor(Math.random() * BEAT_SOUNDS.length));
        }
        return result;
    }

    /**
     * Build 8 zone dots at the bottom of the screen.
     * Each dot represents one of the 8 tap zones (left to right).
     * Always visible — shows gray dots normally, highlights during playback,
     * turns green/red on match/mismatch.
     */
    function renderBeatDots() {
        if (!beatIndicator) return;
        beatIndicator.innerHTML = '';
        for (var i = 0; i < BEAT_SOUNDS.length; i++) {
            var dot = document.createElement('div');
            dot.className = 'beat-dot';
            dot.dataset.zone = i;
            beatIndicator.appendChild(dot);
        }
        // Always show the indicator (8 dots, one per zone)
        beatIndicator.classList.add('visible');
    }

    /**
     * Highlight a zone dot by its zone index (0–7).
     */
    function highlightDot(zoneIndex, className) {
        if (!beatIndicator) return;
        var dot = beatIndicator.querySelector('.beat-dot[data-zone="' + zoneIndex + '"]');
        if (dot) {
            dot.className = 'beat-dot ' + (className || 'active');
        }
    }

    /**
     * T015: Play back the original pattern beat by beat.
     * Disables child input during playback.
     */
    function startPlayback(pattern) {
        isPlaying = true;
        isChildTurn = false;
        // Hide beat dots during playback
        if (beatIndicator) {
            beatIndicator.classList.remove('visible');
        }
        var beatIndex = 0;

        function playNextBeat() {
            if (beatIndex >= pattern.length) {
                // Pattern complete — start child's turn
                isPlaying = false;
                isChildTurn = true;
                childTaps = [];
                // Show beat dots now that child can tap
                renderBeatDots();
                return;
            }

            playBeat(pattern[beatIndex]);
            beatIndex++;
            setTimeout(playNextBeat, config.tempo);
        }

        playNextBeat();
    }

    /**
     * T013: Play a single beat — sound + visual pulse on character.
     */
    function playBeat(beatIndex) {
        var sound = BEAT_SOUNDS[beatIndex];
        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.tone(sound.freq, 200, sound.type, sound.volume);
        }

        // Visual pulse on character (CSS animation)
        if (characterEl) {
            characterEl.classList.remove('pulsing');
            // Force reflow to restart animation
            void characterEl.offsetWidth;
            characterEl.classList.add('pulsing');
        }
    }

    /**
     * T016: Handle a tap during the child's turn.
     * The game area is divided into 8 zones (matching BEAT_SOUNDS).
     * Each zone maps to a distinct beat sound — child chooses which beat.
     */
    function handleGameAreaTap(e) {
        if (!isChildTurn || isPlaying) return;

        // Determine which beat zone was tapped (8 zones across the width)
        var rect = gameArea.getBoundingClientRect();
        var x;
        if (e.changedTouches) {
            x = e.changedTouches[0].clientX - rect.left;
        } else {
            x = e.clientX - rect.left;
        }
        var zoneWidth = rect.width / BEAT_SOUNDS.length;
        var tappedBeatIndex = Math.min(Math.floor(x / zoneWidth), BEAT_SOUNDS.length - 1);

        // Record child's tap
        childTaps.push(tappedBeatIndex);

        // Highlight the corresponding dot
        highlightDot(tappedBeatIndex, 'active');

        // Play the beat sound and visual pulse
        playBeat(tappedBeatIndex);

        // Check if child has completed the pattern
        if (childTaps.length === pattern.length) {
            isChildTurn = false;
            checkMatch();
        }
    }

    /**
     * T017: Compare child's tap sequence against the original pattern.
     * Triggers celebration on match or replays pattern on mismatch.
     */
    function checkMatch() {
        var matches = true;
        for (var i = 0; i < pattern.length; i++) {
            if (childTaps[i] !== pattern[i]) {
                matches = false;
                break;
            }
        }

        if (matches) {
            // Success — celebration
            if (typeof Sound !== 'undefined') {
                Sound.init();
                Sound.celebrate();
            }

            // Mark all dots green (matched)
            for (var i = 0; i < pattern.length; i++) {
                highlightDot(i, 'matched');
            }

            if (currentRound >= config.maxBeats) {
                handleMaxRound();
            } else {
                showCelebration();
            }
        } else {
            // Mismatch — mark wrong dots red, correct ones green
            for (var i = 0; i < pattern.length; i++) {
                if (childTaps[i] !== pattern[i]) {
                    highlightDot(i, 'mismatched');
                } else {
                    highlightDot(i, 'matched');
                }
            }

            // Replay pattern
            showToast('Listen carefully!', 1500);
            setTimeout(function() {
                playPattern(pattern);
            }, 1500);
        }
    }

    /**
     * T018: Show celebration overlay with round info.
     */
    function showCelebration() {
        if (celebrationTitle) {
            celebrationTitle.textContent = 'You did it!';
        }
        if (celebrationMsg) {
            celebrationMsg.textContent = 'Round ' + currentRound + ' complete!';
        }
        if (celebrationEl) {
            celebrationEl.style.display = 'flex';
        }
    }

    /**
     * T024: Handle max round completion.
     * When child completes all beats at max difficulty, show congratulations
     * and offer to restart (new game) or continue at max round.
     */
    function handleMaxRound() {
        if (celebrationTitle) {
            celebrationTitle.textContent = "You're a Rhythm Master!";
        }
        if (celebrationMsg) {
            celebrationMsg.textContent = 'You completed all ' + config.maxBeats + ' beats!';
        }

        // Replace the single "Play Again" button with two options
        if (playAgainBtn) {
            playAgainBtn.textContent = 'Restart New Game 🎮';
        }

        // Add a "Continue at Max" button if it doesn't exist yet
        var continueBtn = document.getElementById('continue-max-btn');
        if (!continueBtn) {
            continueBtn = document.createElement('button');
            continueBtn.id = 'continue-max-btn';
            continueBtn.className = 'play-again-button secondary';
            continueBtn.textContent = 'Continue at Max 🔄';
            celebrationEl.insertBefore(continueBtn, celebrationBackBtn);

            continueBtn.addEventListener('click', function() {
                hideCelebration();
                // Stay at max round — generate a new pattern of the same length
                pattern = generatePattern(config.maxBeats);
                childTaps = [];
                isChildTurn = false;
                setTimeout(function() {
                    startPlayback(pattern);
                }, 800);
            });
        }

        // Wire restart button to fully reset the game
        playAgainBtn.onclick = function() {
            hideCelebration();
            startNewGame();
        };

        if (celebrationEl) {
            celebrationEl.style.display = 'flex';
        }
    }

    /**
     * Hide celebration overlay and clean up round display.
     */
    function hideCelebration() {
        if (celebrationEl) {
            celebrationEl.style.display = 'none';
        }
        var existing = document.getElementById('round-display');
        if (existing) existing.remove();
        // Hide beat indicator when celebration is hidden
        if (beatIndicator) {
            beatIndicator.classList.remove('visible');
            beatIndicator.innerHTML = '';
        }
    }

    /**
     * Show a brief toast notification.
     */
    function showToast(message, duration) {
        duration = duration || 2000;
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:20px;font-size:16px;z-index:5000;';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(function() {
            if (toast.parentNode) toast.remove();
        }, duration);
    }

    /**
     * Replay the original pattern (used on mismatch).
     */
    function playPattern(pattern) {
        startPlayback(pattern);
    }

    // ── Start ──────────────────────────────────────────────────────────────

    init();

});
