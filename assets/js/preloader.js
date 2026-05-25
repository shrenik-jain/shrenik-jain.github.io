/**
 * Premium page loader — minimum display time, curtain exit, reduced-motion fallback.
 */
(function () {
  var preloader = document.getElementById("preloader");
  if (!preloader) {
    return;
  }

  var reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var minShowMs = reduced ? 0 : 480;
  var exitMs = reduced ? 80 : 580;
  var startedAt = window.__preloaderStart || performance.now();
  var finished = false;

  function finish() {
    if (finished) {
      return;
    }
    finished = true;
    preloader.classList.add("loaded");
    window.setTimeout(function () {
      preloader.remove();
    }, exitMs);
  }

  function scheduleFinish() {
    var elapsed = performance.now() - startedAt;
    var wait = Math.max(0, minShowMs - elapsed);
    window.setTimeout(finish, wait);
  }

  if (document.readyState === "complete") {
    scheduleFinish();
  } else {
    window.addEventListener("load", scheduleFinish, { once: true });
  }

  window.setTimeout(finish, 9000);
})();
