/**
 * =============================================================================
 * INDEX.HTML HERO — pick ONE animation (change HERO_BACKGROUND below)
 * =============================================================================
 *
 *   "particles"    Original particles.js: triangles, repulse, push
 *                  → CDN particles.min.js + assets/js/bubbles.js
 *
 *   "flow"         Flow-field streaks + pointer swirl / wake
 *                  → assets/js/hero-flow.js
 *
 *   "mesh"         Wire grid + sparkles + click ripples through the mesh (default)
 *                  → assets/js/hero-mesh.js
 *
 *   "waves"        Layered sine-wave ribbons (aurora-like)
 *                  → assets/js/hero-waves.js
 *
 * Unknown values fall back to "mesh".
 * =============================================================================
 */
var HERO_BACKGROUND = "mesh";

(function () {
  function loadScript(src) {
    var el = document.createElement("script");
    el.src = src;
    document.body.appendChild(el);
    return el;
  }

  var mode = String(HERO_BACKGROUND || "").toLowerCase().trim();

  switch (mode) {
    case "particles":
      loadParticles();
      return;
    case "flow":
      loadScript("assets/js/hero-flow.js");
      return;
    case "mesh":
      loadScript("assets/js/hero-mesh.js");
      return;
    case "waves":
      loadScript("assets/js/hero-waves.js");
      return;
    default:
      console.warn(
        'hero-bg-loader: unknown HERO_BACKGROUND "' +
          HERO_BACKGROUND +
          '". Use: particles | flow | mesh | waves. Falling back to mesh.'
      );
      loadScript("assets/js/hero-mesh.js");
      return;
  }

  function loadParticles() {
    var lib = loadScript("https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js");
    lib.onload = function () {
      loadScript("assets/js/bubbles.js");
    };
    lib.onerror = function () {
      console.warn("particles.js failed to load; falling back to hero-flow.js");
      loadScript("assets/js/hero-flow.js");
    };
  }
})();
