/**
 * SproutPlay - [TODO: App Name] Mini-App
 * TODO: one-line description of what this mini-app does
 *
 * Copy to: app/www/js/<your-app>/<your-app>.js
 * Rename the IIFE variable from MyApp to your app's name.
 *
 * Dependencies (loaded before this file by index.html):
 *   - Sound    (window.Sound)    — audio playback, TTS
 *   - Settings (window.Settings) — sound enabled/disabled toggle
 *                                  (only needed if you check Sound.isEnabled)
 */

/* TODO: rename MyApp to your app name (e.g. MemoryGame, SpaceHero) */
const MyApp = (function () {

    // ── DOM refs ─────────────────────────────────────────────────
    // Grab all elements you need up front; set to null and check before use.

    var backBtn         = null;
    var gameArea        = null;
    var celebrationEl   = null;
    var playAgainBtn    = null;
    var celebrationBack = null;

    // ── State ─────────────────────────────────────────────────────
    // TODO: add your game state variables here

    var gameActive = false;

    // ── Init ──────────────────────────────────────────────────────

    function init() {
        // Cache DOM elements
        backBtn         = document.getElementById('myapp-back');       // TODO: update id
        gameArea        = document.getElementById('game-area');
        celebrationEl   = document.getElementById('celebration');
        playAgainBtn    = document.getElementById('play-again-btn');
        celebrationBack = document.getElementById('celebration-back');

        // Wire up navigation
        if (backBtn) backBtn.addEventListener('click', goToHub);
        if (celebrationBack) celebrationBack.addEventListener('click', goToHub);
        if (playAgainBtn) playAgainBtn.addEventListener('click', startGame);

        // Start the game
        startGame();
    }

    // ── Navigation ────────────────────────────────────────────────

    function goToHub() {
        window.location.href = '../index.html';
    }

    // ── Game logic ────────────────────────────────────────────────

    function startGame() {
        hideCelebration();
        gameActive = true;

        // TODO: set up your game state and render initial UI
    }

    function endGame() {
        gameActive = false;
        showCelebration();
    }

    // ── Celebration ───────────────────────────────────────────────

    function showCelebration() {
        if (!celebrationEl) return;

        // TODO: optionally update celebration text dynamically:
        // document.getElementById('celebration-title').textContent = 'You did it!';
        // document.getElementById('celebration-msg').textContent   = 'Score: ' + score;

        celebrationEl.style.display = 'flex';

        if (typeof Sound !== 'undefined') {
            Sound.celebrate();
            // TODO: optionally speak a message:
            // Sound.speak('You did it! Great job!');
        }
    }

    function hideCelebration() {
        if (celebrationEl) celebrationEl.style.display = 'none';
    }

    // ── Sound helpers (optional) ──────────────────────────────────
    // Call Sound.* only after checking typeof Sound !== 'undefined'.
    // Available: Sound.flip(), Sound.match(), Sound.noMatch(),
    //            Sound.celebrate(), Sound.chomp(), Sound.speak(text, rate),
    //            Sound.phonics(letter), Sound.tone(freq, dur, type, vol)

    // ── Public API ────────────────────────────────────────────────

    return {
        init: init
    };

})();

// Boot on DOM ready
document.addEventListener('DOMContentLoaded', MyApp.init);
