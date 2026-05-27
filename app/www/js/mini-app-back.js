/**
 * SproutPlay - Mini-App Hardware Back Button Handler
 *
 * Mini-apps are separate HTML pages from the hub, so they don't load app.js
 * or router.js — meaning no Capacitor backButton listener exists in their
 * page context. Without this file, pressing the Android hardware/gesture back
 * button while in a mini-app falls through to the OS default, which minimizes
 * the app instead of returning to the hub.
 *
 * Requires the `@capacitor/app` plugin to be installed.
 *
 * Include this script in every mini-app's index.html (after the Capacitor
 * bridge, before the app-specific JS).
 */

(function () {
  function goToHub() {
    window.location.href = '../index.html';
  }

  function tryRegister() {
    if (typeof Capacitor === 'undefined' || !Capacitor.Plugins || !Capacitor.Plugins.App) {
      return false;
    }
    Capacitor.Plugins.App.addListener('backButton', goToHub);
    console.log('mini-app-back: Capacitor backButton listener registered');
    return true;
  }

  // Try immediately (bridge is usually ready by the time scripts run)
  if (!tryRegister()) {
    // Fall back to DOMContentLoaded, then a short retry window — the
    // Capacitor bridge can lag behind in some startup conditions.
    document.addEventListener('DOMContentLoaded', function () {
      if (tryRegister()) return;
      var attempts = 0;
      var iv = setInterval(function () {
        attempts++;
        if (tryRegister() || attempts >= 20) clearInterval(iv);
      }, 100);
    });
  }

  // Browser popstate — fires during desktop browser testing
  window.addEventListener('popstate', goToHub);
})();
