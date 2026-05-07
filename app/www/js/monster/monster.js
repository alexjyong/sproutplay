/**
 * SproutPlay - Feed the Monster Math Game
 * Drag emoji food into the monster's mouth to match the target count.
 */

document.addEventListener('DOMContentLoaded', function () {

    // ── Constants ────────────────────────────────────────────────

    var FOOD_EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍕', '🍩', '🥕', '🍌', '🫐'];
    var FOOD_NAMES  = {
        '🍎': 'apples',   '🍊': 'oranges',      '🍋': 'lemons',
        '🍇': 'grapes',   '🍓': 'strawberries',  '🍕': 'pizza slices',
        '🍩': 'donuts',   '🥕': 'carrots',       '🍌': 'bananas',    '🫐': 'blueberries'
    };

    var LEVEL3_PAIRS = [
        [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 9],
        [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 8],
        [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
        [4, 4], [4, 5], [4, 6], [5, 5]
    ];

    var WIN_THRESHOLD = 5;
    var STORAGE_KEY = 'sproutplay_monster';

    // ── State ────────────────────────────────────────────────────

    var level = 1;
    var consecutiveWins = 0;
    var round = { target: 0, displayA: null, displayB: null, currentCount: 0, foodEmoji: '🍎', foodName: 'apples' };
    var items = [];         // { el, originalX, originalY, fed }
    var activeDrag = null;  // item being dragged, plus offsetX/Y
    var celebrating = false;
    var lastLevel3Pair = -1;
    var autoDismissTimer = null;
    var pendingWinTimer = null;

    // ── DOM refs ─────────────────────────────────────────────────

    var monsterContainer = document.getElementById('monster-container');
    var monsterSign      = document.getElementById('monster-sign');
    var monsterMouth     = document.getElementById('monster-mouth');
    var feedCounter      = document.getElementById('feed-counter');
    var levelBadge       = document.getElementById('level-badge');
    var itemTray         = document.getElementById('item-tray');
    var celebrationEl    = document.getElementById('celebration');
    var celebrationMsg   = document.getElementById('celebration-msg');
    var levelupOverlay   = document.getElementById('levelup-overlay');
    var levelupMsg       = document.getElementById('levelup-msg');

    // ── Persistence (T006) ───────────────────────────────────────

    function loadProgress() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                level = parsed.level || 1;
                consecutiveWins = parsed.consecutiveWins || 0;
            }
        } catch (e) {
            level = 1;
            consecutiveWins = 0;
        }
    }

    function saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ level: level, consecutiveWins: consecutiveWins }));
        } catch (e) {
            // Storage unavailable — progress just won't persist
        }
    }

    // ── Target picking (T007) ────────────────────────────────────

    function pickTarget() {
        var target, displayA, displayB;

        if (level === 1) {
            target = 1 + Math.floor(Math.random() * 5); // 1–5
            displayA = null;
            displayB = null;
        } else if (level === 2) {
            target = 1 + Math.floor(Math.random() * 10); // 1–10
            displayA = null;
            displayB = null;
        } else {
            // Level 3: pick an addition pair, avoid repeating the last one
            var idx;
            do {
                idx = Math.floor(Math.random() * LEVEL3_PAIRS.length);
            } while (idx === lastLevel3Pair && LEVEL3_PAIRS.length > 1);
            lastLevel3Pair = idx;
            displayA = LEVEL3_PAIRS[idx][0];
            displayB = LEVEL3_PAIRS[idx][1];
            target = displayA + displayB;
        }

        return { target: target, displayA: displayA, displayB: displayB };
    }

    // ── Item building (T008) ─────────────────────────────────────

    function buildItems() {
        itemTray.innerHTML = '';
        items = [];

        var trayRect = itemTray.getBoundingClientRect();
        var placed = [];

        var extras = 2 + Math.floor(Math.random() * 3); // 2–4 wrong-food decoys

        for (var i = 0; i < round.target; i++) {
            spawnItem(round.foodEmoji, true, trayRect, placed);
        }
        for (var j = 0; j < extras; j++) {
            spawnItem(pickWrongEmoji(), false, trayRect, placed);
        }

        // Shuffle DOM order so correct items aren't always first
        for (var k = items.length - 1; k > 0; k--) {
            var r = Math.floor(Math.random() * (k + 1));
            itemTray.appendChild(items[r].el);
            var tmp = items[k]; items[k] = items[r]; items[r] = tmp;
        }
    }

    function spawnItem(emoji, correct, trayRect, placed) {
        var pos = findFreePosition(trayRect, placed);
        var el = document.createElement('div');
        el.className = 'food-item';
        el.textContent = emoji;
        el.style.left = pos.x + 'px';
        el.style.top = pos.y + 'px';

        var item = { el: el, originalX: pos.x, originalY: pos.y, fed: false, correct: correct };
        items.push(item);
        placed.push({ x: pos.x, y: pos.y });

        el.addEventListener('touchstart', startDrag, { passive: false });
        el.addEventListener('mousedown', startDrag);

        itemTray.appendChild(el);
    }

    function pickWrongEmoji() {
        var emoji;
        do { emoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]; }
        while (emoji === round.foodEmoji);
        return emoji;
    }

    function findFreePosition(trayRect, placed) {
        var tileW = 64, tileH = 64, padding = 12;
        var maxX = trayRect.width - tileW - padding;
        var maxY = trayRect.height - tileH - padding;

        for (var attempt = 0; attempt < 100; attempt++) {
            var x = padding + Math.random() * (maxX - padding);
            var y = padding + Math.random() * (maxY - padding);

            var overlap = false;
            for (var i = 0; i < placed.length; i++) {
                if (Math.abs(x - placed[i].x) < tileW + padding &&
                    Math.abs(y - placed[i].y) < tileH + padding) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) return { x: x, y: y };
        }

        // Fallback: stack with slight offset
        return { x: padding + (placed.length * 10) % maxX, y: padding };
    }

    // ── Pre-fed items (missing addend) ──────────────────────────

    function clearPreFedItems() {
        document.getElementById('pre-fed-zone').innerHTML = '';
    }

    function buildPreFedItems() {
        clearPreFedItems();
        if (level !== 3 || round.displayA === null) return;
        var zone = document.getElementById('pre-fed-zone');
        for (var i = 0; i < round.displayA; i++) {
            var el = document.createElement('div');
            el.className = 'pre-fed-item';
            el.textContent = round.foodEmoji;
            zone.appendChild(el);
        }
    }

    // ── Monster state (T010) ─────────────────────────────────────

    function setMonsterState(cls) {
        monsterContainer.classList.remove('idle', 'chomping', 'happy');
        monsterContainer.classList.add(cls);
        if (cls === 'chomping') {
            setTimeout(function () {
                monsterContainer.classList.remove('chomping');
                monsterContainer.classList.add('idle');
            }, 200);
        }
    }

    // ── Display helpers (T011) ───────────────────────────────────

    function updateSign() {
        if (level === 3 && round.displayA !== null) {
            monsterSign.textContent = round.displayA + ' + ? = ' + (round.displayA + round.displayB) + '  ' + round.foodEmoji;
            monsterSign.style.fontSize = '24px';
        } else {
            monsterSign.textContent = round.target + ' ' + round.foodEmoji;
            monsterSign.style.fontSize = '36px';
        }
    }

    function updateCounter() {
        feedCounter.textContent = round.currentCount;
    }

    function speakPrompt() {
        if (typeof Sound === 'undefined') return;
        var text = level === 3 && round.displayA !== null
            ? round.displayA + ' plus what equals ' + (round.displayA + round.displayB) + '?'
            : 'Feed me ' + round.target + ' ' + round.foodName + '!';
        Sound.speak(text);
    }

    // ── Drag system (T009) ───────────────────────────────────────

    function findItemObj(el) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].el === el) return items[i];
        }
        return null;
    }

    function startDrag(e) {
        e.preventDefault();
        if (celebrating) return;
        if (activeDrag) cleanupDrag();

        var item = findItemObj(e.currentTarget);
        if (!item || item.fed) return;

        if (typeof Sound !== 'undefined') Sound.init();

        var rect = item.el.getBoundingClientRect();
        var point = e.touches ? e.touches[0] : e;

        activeDrag = item;
        activeDrag.offsetX = point.clientX - rect.left;
        activeDrag.offsetY = point.clientY - rect.top;

        item.el.classList.add('dragging');

        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
        document.addEventListener('touchcancel', cancelDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);
    }

    function moveDrag(e) {
        e.preventDefault();
        if (!activeDrag) return;

        var point = e.touches ? e.touches[0] : e;
        var trayRect = itemTray.getBoundingClientRect();

        activeDrag.el.style.left = (point.clientX - trayRect.left - activeDrag.offsetX) + 'px';
        activeDrag.el.style.top  = (point.clientY - trayRect.top  - activeDrag.offsetY) + 'px';
    }

    function endDrag(e) {
        if (!activeDrag) return;
        try {
            var point = e.changedTouches ? e.changedTouches[0] : e;
            var mouthRect = monsterMouth.getBoundingClientRect();

            var inMouth = point.clientX >= mouthRect.left &&
                          point.clientX <= mouthRect.right &&
                          point.clientY >= mouthRect.top  &&
                          point.clientY <= mouthRect.bottom;

            if (inMouth) {
                feedItem(activeDrag);
            } else {
                animateBack(activeDrag);
            }
        } finally {
            cleanupDrag();
        }
    }

    function cancelDrag() {
        if (!activeDrag) return;
        animateBack(activeDrag);
        cleanupDrag();
    }

    function cleanupDrag() {
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', endDrag);
        document.removeEventListener('touchcancel', cancelDrag);
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('mouseup', endDrag);
        if (activeDrag) activeDrag.el.classList.remove('dragging');
        activeDrag = null;
    }

    function animateBack(item) {
        item.el.style.transition = 'left 0.3s ease, top 0.3s ease';
        item.el.style.left = item.originalX + 'px';
        item.el.style.top  = item.originalY + 'px';
        setTimeout(function () { item.el.style.transition = ''; }, 300);
    }

    // ── Core game loop (T012–T017) ───────────────────────────────

    function feedItem(item) {
        if (!item.correct) {
            animateBack(item);
            if (typeof Sound !== 'undefined') {
                Sound.overfed();
                Sound.speak('Yuck! The monster wants ' + round.foodName + '!');
            }
            return;
        }
        if (round.currentCount >= round.target) {
            // Monster is full — cancel the pending win and reject this item
            if (pendingWinTimer !== null) { clearTimeout(pendingWinTimer); pendingWinTimer = null; }
            onOverfed(item);
            return;
        }
        item.fed = true;
        item.el.classList.add('fed');
        round.currentCount++;
        updateCounter();
        setMonsterState('chomping');
        if (typeof Sound !== 'undefined') Sound.chomp();
        if (round.currentCount === round.target) {
            // Brief pause before celebrating — feeding one more during this window triggers overfed
            pendingWinTimer = setTimeout(function () {
                pendingWinTimer = null;
                onRoundComplete();
            }, 4000);
        }
    }

    function onOverfed(rejectedItem) {
        // Bounce the item back — monster never swallowed it
        animateBack(rejectedItem);
        if (typeof Sound !== 'undefined') Sound.overfed();
        consecutiveWins = 0;
        saveProgress();
        if (typeof Sound !== 'undefined') {
            Sound.speak('Oops, too many! Let\'s try again!');
        }
        monsterContainer.classList.add('overfed');
        // Block dragging briefly so the shake plays out
        celebrating = true;
        setTimeout(function () {
            monsterContainer.classList.remove('overfed');
            round.currentCount = 0;
            updateCounter();
            // Restore all fed items
            for (var i = 0; i < items.length; i++) {
                items[i].fed = false;
                items[i].el.classList.remove('fed');
                animateBack(items[i]);
            }
            setMonsterState('idle');
            celebrating = false;
        }, 1500);
    }

    function onRoundComplete() {
        celebrating = true;
        setMonsterState('happy');
        if (typeof Sound !== 'undefined') Sound.celebrate();
        consecutiveWins++;
        saveProgress();
        if (checkLevelUp()) {
            showLevelUp();
        } else {
            showCelebration();
        }
    }

    function showCelebration() {
        celebrationMsg.textContent = 'You fed the monster ' + round.target + ' ' + round.foodName + '!';
        celebrationEl.style.display = 'flex';
        if (typeof Sound !== 'undefined') {
            Sound.speak('You did it! You fed the monster ' + round.target + ' ' + round.foodName + '!');
        }
        autoDismissTimer = setTimeout(function () {
            if (celebrating) {
                hideCelebration();
                newRound();
            }
        }, 3000);
    }

    function hideCelebration() {
        clearTimeout(autoDismissTimer);
        autoDismissTimer = null;
        celebrationEl.style.display = 'none';
        levelupOverlay.style.display = 'none';
        celebrating = false;
    }

    function newRound() {
        if (pendingWinTimer !== null) { clearTimeout(pendingWinTimer); pendingWinTimer = null; }
        celebrating = false;
        var picked = pickTarget();
        round.target = picked.target;
        round.displayA = picked.displayA;
        round.displayB = picked.displayB;
        // At Level 3 the child feeds only the missing addend (displayB), not the full sum
        if (level === 3 && picked.displayB !== null) {
            round.target = picked.displayB;
        }
        var emojiIdx = Math.floor(Math.random() * FOOD_EMOJIS.length);
        round.foodEmoji = FOOD_EMOJIS[emojiIdx];
        round.foodName  = FOOD_NAMES[round.foodEmoji];
        round.currentCount = 0;
        setMonsterState('idle');
        updateSign();
        updateCounter();
        levelBadge.textContent = 'Level ' + level;
        clearPreFedItems();
        buildPreFedItems();
        buildItems();
        setTimeout(speakPrompt, 300);
    }

    function init() {
        loadProgress();

        document.getElementById('monster-back').addEventListener('click', function () {
            window.location.href = '../index.html';
        });
        document.getElementById('play-again-btn').addEventListener('click', function () {
            hideCelebration();
            newRound();
        });
        document.getElementById('celebration-back').addEventListener('click', function () {
            window.location.href = '../index.html';
        });
        document.getElementById('levelup-continue-btn').addEventListener('click', function () {
            hideCelebration();
            newRound();
        });

        if (typeof Sound !== 'undefined') {
            Sound.init();
            Sound.speak('', 0.8).catch(function () {});
        }

        setTimeout(newRound, 200);
    }

    // ── Level progression (Phase 4) ──────────────────────────────

    function checkLevelUp() {
        if (consecutiveWins >= WIN_THRESHOLD && level < 3) {
            level++;
            consecutiveWins = 0;
            saveProgress();
            return true;
        }
        return false;
    }

    function showLevelUp() {
        levelupMsg.textContent = 'You unlocked Level ' + level + '!';
        levelupOverlay.style.display = 'flex';
        if (typeof Sound !== 'undefined') {
            Sound.celebrate();
            Sound.speak('Level up! You\'re amazing! You unlocked level ' + level + '!');
        }
    }

    // ── Start ────────────────────────────────────────────────────

    init();

});
