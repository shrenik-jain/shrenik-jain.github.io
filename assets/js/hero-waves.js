/**
 * Layered flowing light waves — home hero (#dots) or inner pages (.page-header-waves).
 */
(function () {
  var container =
    document.querySelector(".page-header-waves") || document.getElementById("dots");
  if (!container || typeof document.createElement("canvas").getContext !== "function") {
    return;
  }

  var reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;display:block;";
  container.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  var w = 0;
  var h = 0;
  var dpr = 1;
  var time = 0;

  var bands = [
    { base: 0.14, thick: 0.14, amp: 0.022, k: 0.0028, spd: 0.00085, ph: 0, rgb: [55, 85, 160], a: 0.2 },
    { base: 0.32, thick: 0.16, amp: 0.028, k: 0.0034, spd: -0.00072, ph: 1.7, rgb: [84, 129, 237], a: 0.16 },
    { base: 0.52, thick: 0.14, amp: 0.024, k: 0.0025, spd: 0.00055, ph: 0.9, rgb: [130, 95, 200], a: 0.12 },
    { base: 0.68, thick: 0.12, amp: 0.018, k: 0.003, spd: 0.00062, ph: 2.4, rgb: [40, 65, 140], a: 0.1 },
  ];

  function waveY(x, t, b) {
    var yN = b.base * h;
    var wobble =
      b.amp *
      h *
      (Math.sin(x * b.k + t * b.spd + b.ph) * 0.62 +
        Math.sin(x * b.k * 1.55 - t * b.spd * 0.65 + b.ph * 1.3) * 0.38);
    return yN + wobble;
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
  }

  function drawFrame() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "screen";
    var step = 3;
    var bi;
    var b;
    var x;
    var yTop;
    var yBot;
    var g;
    for (bi = 0; bi < bands.length; bi++) {
      b = bands[bi];
      ctx.beginPath();
      for (x = 0; x <= w; x += step) {
        yTop = waveY(x, time, b);
        if (x === 0) {
          ctx.moveTo(x, yTop);
        } else {
          ctx.lineTo(x, yTop);
        }
      }
      for (x = w; x >= 0; x -= step) {
        yBot = waveY(x, time, b) + b.thick * h;
        ctx.lineTo(x, yBot);
      }
      ctx.closePath();
      g = ctx.createLinearGradient(0, waveY(0, time, b), 0, waveY(0, time, b) + b.thick * h);
      g.addColorStop(
        0,
        "rgba(" + b.rgb[0] + "," + b.rgb[1] + "," + b.rgb[2] + "," + (b.a * 1.1) + ")"
      );
      g.addColorStop(1, "rgba(" + b.rgb[0] + "," + b.rgb[1] + "," + b.rgb[2] + "," + (b.a * 0.35) + ")");
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function step() {
    if (!w || !h) {
      return;
    }
    time += reduced ? 0 : 22;
    drawFrame();
    if (!reduced) {
      requestAnimationFrame(step);
    }
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
