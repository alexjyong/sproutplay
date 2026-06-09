/**
 * SproutPlay - Screen Lock Module
 * Global app pinning via Android's startLockTask / stopLockTask.
 * Follows the existing IIFE singleton pattern (sound.js, settings.js, router.js).
 * 4-tap unlock sequence inspired by babbypaint's lock implementation.
 */

const Lock = (function() {
  // DOM references (populated by init)
  var lockBtn = null;
  var toastContainer = null;

  // State
  var isLocked = false;
  var tapCount = 0;
  var lastTapTime = 0;
  var TAP_WINDOW = 1000; // 1 second between taps
  var REQUIRED_TAPS = 4;

  /**
   * Initialize the lock module.
   * Called once on DOM ready.
   */
  function init() {
    lockBtn = document.getElementById('lock-btn');
    if (!lockBtn) return;

    // Create toast container if it doesn't exist (shared across hub)
    if (!document.getElementById('lock-toast-container')) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'lock-toast-container';
      toastContainer.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:10000;display:flex;flex-direction:column;align-items:center;pointer-events:none;';
      document.body.appendChild(toastContainer);
    } else {
      toastContainer = document.getElementById('lock-toast-container');
    }

    // Bind click handler to lock button
    lockBtn.addEventListener('click', onLockTap);

    console.log('Lock: Initialized');
  }

  /**
   * Handle a tap on the lock button.
   * If not locked: activate screen pinning.
   * If locked: handle 4-tap unlock sequence.
   */
  function onLockTap() {
    if (!isLocked) {
      // First tap — activate screen pinning
      lock();
    } else {
      // Already locked — handle 4-tap unlock sequence
      handleUnlockTap();
    }
  }

  /**
   * Activate Android screen pinning.
   */
  function lock() {
    var ScreenPinning = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ScreenPinning;
    if (!ScreenPinning) {
      console.error('Lock: ScreenPinning plugin not available');
      showToast('Screen pinning not available', 2000);
      return;
    }

    ScreenPinning.enterPinnedMode()
      .then(function() {
        isLocked = true;
        lockBtn.textContent = '🔓';
        lockBtn.setAttribute('aria-label', 'Unlock app');
        showToast('Tap 4 times quickly to unlock', 2000);
        // Reset tap counter for unlock sequence
        tapCount = 0;
        lastTapTime = 0;
      })
      .catch(function(err) {
        console.error('Lock: enterPinnedMode failed', err);
        showToast('Could not lock app', 2000);
      });
  }

  /**
   * Handle a tap during the unlock sequence.
   * 4 taps within 1-second windows unlocks the app.
   */
  function handleUnlockTap() {
    var now = Date.now();

    if (lastTapTime === 0 || now - lastTapTime >= TAP_WINDOW) {
      // First tap or reset (paused > 1 second)
      tapCount = 1;
      showToast('Tap ' + (REQUIRED_TAPS - 1) + ' more time' + (REQUIRED_TAPS - 1 === 1 ? '' : 's') + ' quickly to unlock', 2000);
    } else {
      // Within window — increment counter
      tapCount++;
      if (tapCount >= REQUIRED_TAPS) {
        unlock();
      } else {
        var remaining = REQUIRED_TAPS - tapCount;
        showToast('Tap ' + remaining + ' more time' + (remaining === 1 ? '' : 's') + ' quickly to unlock', 2000);
      }
    }

    lastTapTime = now;
  }

  /**
   * Deactivate Android screen pinning (unlock).
   */
  function unlock() {
    var ScreenPinning = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ScreenPinning;
    if (!ScreenPinning) {
      console.error('Lock: ScreenPinning plugin not available');
      return;
    }

    ScreenPinning.exitPinnedMode()
      .then(function() {
        isLocked = false;
        tapCount = 0;
        lastTapTime = 0;
        lockBtn.textContent = '🔒';
        lockBtn.setAttribute('aria-label', 'Lock app');
        lockBtn.style.display = 'flex';
        showToast('App unlocked', 2000);
      })
      .catch(function(err) {
        console.error('Lock: exitPinnedMode failed', err);
        showToast('Error unlocking app', 2000);
      });
  }

  /**
   * Show a toast notification.
   */
  function showToast(message, duration) {
    duration = duration || 3000;
    if (!toastContainer) return;

    var toast = document.createElement('div');
    toast.style.cssText = 'background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;margin-top:8px;opacity:0;transition:opacity 0.3s;';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(function() {
      toast.style.opacity = '1';
    });

    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, duration);
  }

  /**
   * Check if the app is currently locked (pinned).
   */
  function isLockedState() {
    return isLocked;
  }

  /**
   * Set the locked state (called from Settings when lock is toggled).
   * This only manages UI — the actual pinning happens when the user
   * taps the lock button.  When re-entering a locked state after a
   * page reload we restore the button visibility but reset isLocked
   * so the next tap on the button will re-activate pinning.
   */
  function setLockedState(locked) {
    // Do NOT set isLocked here — that is only true after actual pinning.
    if (lockBtn) {
      lockBtn.style.display = locked ? 'flex' : 'none';
      lockBtn.textContent = '🔒';
      lockBtn.setAttribute('aria-label', 'Lock app');
    }
    // Sync the Settings toggle UI when state changes from unlock flow
    if (!locked) {
      var screenLockToggle = document.getElementById('screen-lock-toggle');
      if (screenLockToggle) {
        screenLockToggle.checked = false;
      }
    }
  }

  // Public API
  return {
    init,
    lock,
    unlock,
    isLockedState,
    setLockedState
  };
})();

// Initialize lock on DOM ready (after Settings loads)
document.addEventListener('DOMContentLoaded', function() {
  Lock.init();
});
