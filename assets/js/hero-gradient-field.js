/**
 * Home hero: cursor-linked soft gradient field — drifting orbs gently pulled toward the pointer.
 */
(function () {
  var container = document.getElementById("dots");
  if (!container || typeof document.createElement("canvas").getContext !== "function") {
    return;
  }

  var reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var hero = document.getElementById("hero");

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;display:block;";
  container.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  var w = 0;
  var h = 0;
  var dpr = 1;
  var time = 0;

  var mx = 0;
  var my = 0;
  var tx = 0;
  var ty = 0;
  var hasPointer = false;

  var orbs = [
    {
      ox: 0.28,
      oy: 0.38,
      wx: 0.11,
      wy: 0.09,
      px: 0.85,
      py: 1.05,
      phx: 0,
      phy: 1.1,
      r: 0.58,
      rgb: [38, 62, 118],
      a: 0.38,
      pull: 0.11,
    },
    {
      ox: 0.62,
      oy: 0.48,
      wx: 0.1,
      wy: 0.11,
      px: 1.1,
      py: 0.9,
      phx: 2.1,
      phy: 0.4,
      r: 0.52,
      rgb: [84, 129, 237],
      a: 0.22,
      pull: 0.14,
    },
    {
      ox: 0.48,
      oy: 0.72,
      wx: 0.12,
      wy: 0.08,
      px: 0.75,
      py: 1.15,
      phx: 1.2,
      phy: 2.3,
      r: 0.45,
      rgb: [130, 88, 168],
      a: 0.14,
      pull: 0.1,
    },
  ];

  function basePos(o) {
    var bx =
      (o.ox + o.wx * Math.sin(time * 0.00011 * o.px + o.phx) + 0.04 * Math.cos(time * 0.00009 * o.py)) * w;
    var by =
      (o.oy + o.wy * Math.cos(time * 0.000095 * o.py + o.phy) + 0.03 * Math.sin(time * 0.0001 * o.px)) * h;
    return { x: bx, y: by };
  }

  function resize() {
    var rect = container.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.floor(rect.width));
    h = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!hasPointer && w > 0 && h > 0) {
      tx = mx = w * 0.5;
      ty = my = h * 0.45;
    }
  }

  function drawFrame() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "screen";

    var i;
    var o;
    var bp;
    var cx;
    var cy;
    var radius;
    var g;
    var dx;
    var dy;

    for (i = 0; i < orbs.length; i++) {
      o = orbs[i];
      bp = basePos(o);
      dx = tx - bp.x;
      dy = ty - bp.y;
      cx = bp.x + dx * o.pull;
      cy = bp.y + dy * o.pull;
      radius = Math.max(w, h) * o.r;
      g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      g.addColorStop(0, "rgba(" + o.rgb[0] + "," + o.rgb[1] + "," + o.rgb[2] + "," + o.a + ")");
      g.addColorStop(0.42, "rgba(" + o.rgb[0] + "," + o.rgb[1] + "," + o.rgb[2] + "," + o.a * 0.35 + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    dx = tx - mx;
    dy = ty - my;
    if (dx * dx + dy * dy > 0.5) {
      g = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(w, h) * 0.35);
      g.addColorStop(0, "rgba(130, 165, 255, 0.07)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.globalCompositeOperation = "source-over";

    g = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.65, "rgba(0,0,0,0.25)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function step() {
    if (!w || !h) {
      return;
    }

    time += reduced ? 0 : 14;

    mx += (tx - mx) * 0.06;
    my += (ty - my) * 0.06;

    if (!hasPointer) {
      tx += (w * 0.5 - tx) * 0.012;
      ty += (h * 0.42 - ty) * 0.012;
    }

    drawFrame();
    if (!reduced) {
      requestAnimationFrame(step);
    }
  }

  function setPointer(clientX, clientY) {
    var rect = container.getBoundingClientRect();
    tx = clientX - rect.left;
    ty = clientY - rect.top;
    hasPointer = true;
  }

  function onPointerMove(ev) {
    setPointer(ev.clientX, ev.clientY);
  }

  function onPointerLeave() {
    hasPointer = false;
  }

  if (reduced) {
    resize();
    drawFrame();
    window.addEventListener(
      "resize",
      function () {
        resize();
        drawFrame();
      },
      { passive: true }
    );
    return;
  }

  var root = hero || container;
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerdown", onPointerMove, { passive: true });
  root.addEventListener("pointerleave", onPointerLeave, { passive: true });
  root.addEventListener(
    "pointerup",
    function (ev) {
      if (ev.pointerType === "touch") {
        hasPointer = false;
      }
    },
    { passive: true }
  );

  var ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(function () {
          resize();
        })
      : null;
  if (ro) {
    ro.observe(container);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();
  requestAnimationFrame(step);
})();
