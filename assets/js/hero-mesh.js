/**
 * Home hero: wire mesh warps from the cursor + pulsing node glows.
 * Pointer clicks send a soft wave through the grid (displacement + light rings).
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
  var cols = 0;
  var rows = 0;
  var sparkles = [];
  var ripples = [];
  var MAX_RIPPLES = 5;
  /* Must match drawSparkles() — one full sin cycle ⇒ new mesh position */
  var SPARKLE_WAVE_T = 0.00205;
  var SPARKLE_WAVE_PH = 2.1;
  var SPARKLE_TAU = Math.PI * 2;
  var MAX_SPARKLES = 6;

  var cx = 0;
  var cy = 0;
  var tx = 0;
  var ty = 0;
  var hasPointer = false;

  function initSparkles() {
    sparkles.length = 0;
    if (cols < 4 || rows < 4) {
      return;
    }
    var cells = [];
    var i;
    var j;
    var m;
    var t;
    var tmp;
    var count;
    for (j = 1; j <= rows - 2; j++) {
      for (i = 1; i <= cols - 2; i++) {
        cells.push({ i: i, j: j });
      }
    }
    m = cells.length;
    while (m > 1) {
      m--;
      t = Math.floor(Math.random() * (m + 1));
      tmp = cells[m];
      cells[m] = cells[t];
      cells[t] = tmp;
    }
    count = Math.min(MAX_SPARKLES, cells.length);
    for (m = 0; m < count; m++) {
      var ph = Math.random() * SPARKLE_TAU;
      sparkles.push({
        i: cells[m].i,
        j: cells[m].j,
        phase: ph,
        lastWaveCycle: Math.floor((time * SPARKLE_WAVE_T + ph * SPARKLE_WAVE_PH) / SPARKLE_TAU),
      });
    }
  }

  function sparkleWaveCycle(sp) {
    return Math.floor((time * SPARKLE_WAVE_T + sp.phase * SPARKLE_WAVE_PH) / SPARKLE_TAU);
  }

  function moveSparkleToRandomCell(index) {
    var used = Object.create(null);
    var q;
    var ii;
    var jj;
    var candidates = [];
    var pick;
    for (q = 0; q < sparkles.length; q++) {
      if (q !== index) {
        used[sparkles[q].i + "," + sparkles[q].j] = 1;
      }
    }
    for (jj = 1; jj <= rows - 2; jj++) {
      for (ii = 1; ii <= cols - 2; ii++) {
        if (!used[ii + "," + jj]) {
          candidates.push({ i: ii, j: jj });
        }
      }
    }
    if (candidates.length === 0) {
      return;
    }
    pick = candidates[Math.floor(Math.random() * candidates.length)];
    sparkles[index].i = pick.i;
    sparkles[index].j = pick.j;
    sparkles[index].phase = Math.random() * SPARKLE_TAU;
    sparkles[index].lastWaveCycle = sparkleWaveCycle(sparkles[index]);
  }

  function relocateSparklesOnShineCycle() {
    var k;
    var cyc;
    for (k = 0; k < sparkles.length; k++) {
      cyc = sparkleWaveCycle(sparkles[k]);
      if (typeof sparkles[k].lastWaveCycle !== "number") {
        sparkles[k].lastWaveCycle = cyc;
        continue;
      }
      if (cyc > sparkles[k].lastWaveCycle) {
        sparkles[k].lastWaveCycle = cyc;
        moveSparkleToRandomCell(k);
      }
    }
  }

  function smoothPointer() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    if (!hasPointer) {
      tx += (w * 0.5 - tx) * 0.02;
      ty += (h * 0.45 - ty) * 0.02;
    }
  }

  function rippleDisplacement(bx, by) {
    var ox = 0;
    var oy = 0;
    var q;
    var rp;
    var rdx;
    var rdy;
    var rd;
    var u;
    var front;
    var ring;
    var damp;
    var outward;
    var cp;

    for (q = 0; q < ripples.length; q++) {
      rp = ripples[q];
      u = (time - rp.start) * 0.00475;
      if (u > 3.25) {
        continue;
      }
      rdx = bx - rp.x;
      rdy = by - rp.y;
      rd = Math.sqrt(rdx * rdx + rdy * rdy) + 0.001;
      front = u * 195;
      ring = Math.exp(-((rd - front) * (rd - front)) / 4800);
      damp = Math.exp(-u * 0.92);
      outward = 12 * ring * damp;
      ox += (rdx / rd) * outward;
      oy += (rdy / rd) * outward;
      cp = Math.exp(-rd / 52) * Math.exp(-u * 1.35) * Math.sin(u * 6.2831853) * 4.5;
      ox += (rdx / rd) * cp;
      oy += (rdy / rd) * cp;
    }
    return { ox: ox, oy: oy };
  }

  function vertex(i, j) {
    var bx = (i / Math.max(1, cols - 1)) * w;
    var by = (j / Math.max(1, rows - 1)) * h;
    if (!reduced) {
      bx += 1.4 * Math.sin(time * 0.00014 + i * 0.35 + j * 0.18);
      by += 1.4 * Math.cos(time * 0.00011 + j * 0.32 + i * 0.12);
    }
    var dx = bx - cx;
    var dy = by - cy;
    var d = Math.sqrt(dx * dx + dy * dy) + 0.001;
    var maxR = 240;
    var falloff = Math.max(0, 1 - d / maxR);
    falloff *= falloff;
    var push = 26 * falloff;
    var x = bx + (dx / d) * push;
    var y = by + (dy / d) * push;

    if (!reduced && ripples.length) {
      var rp = rippleDisplacement(bx, by);
      x += rp.ox;
      y += rp.oy;
    }

    return {
      x: x,
      y: y,
    };
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
    cols = Math.max(6, Math.min(44, Math.floor(w / 38)));
    rows = Math.max(5, Math.min(32, Math.floor(h / 38)));
    initSparkles();
    ripples.length = 0;
    tx = cx = w * 0.5;
    ty = cy = h * 0.45;
  }

  function pruneRipples() {
    var i;
    var u;
    for (i = ripples.length - 1; i >= 0; i--) {
      u = (time - ripples[i].start) * 0.00475;
      if (u > 3.45) {
        ripples.splice(i, 1);
      }
    }
  }

  function drawRippleRings() {
    var q;
    var rp;
    var u;
    var progress;
    var rMain;
    var rEcho;
    var aMain;
    var aEcho;
    var g;
    var maxSpan;

    ctx.globalCompositeOperation = "lighter";
    maxSpan = Math.min(w, h) * 0.48;

    for (q = 0; q < ripples.length; q++) {
      rp = ripples[q];
      u = (time - rp.start) * 0.00475;
      if (u > 3.25) {
        continue;
      }
      progress = u / 3.25;
      rMain = 10 + u * maxSpan * 0.92;
      rEcho = rMain * 0.38;
      aMain = (1 - progress) * 0.11 * Math.exp(-u * 0.28);
      aEcho = aMain * 0.55;

      g = ctx.createRadialGradient(rp.x, rp.y, rMain - 2.2, rp.x, rp.y, rMain + 2.2);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.45, "rgba(148, 188, 255, " + aMain + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rMain + 2.2, 0, Math.PI * 2);
      ctx.fill();

      g = ctx.createRadialGradient(rp.x, rp.y, rEcho - 1.4, rp.x, rp.y, rEcho + 1.4);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.5, "rgba(220, 232, 255, " + aEcho + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rEcho + 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(240, 248, 255, " + (0.04 * (1 - progress) * Math.exp(-u * 0.5)) + ")";
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function drawFrame() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(84, 129, 237, 0.19)";
    ctx.lineWidth = 0.95;
    ctx.lineCap = "round";
    ctx.beginPath();

    var i;
    var j;
    var a;
    var b;
    var c;
    var d;

    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        a = vertex(i, j);
        if (i < cols - 1) {
          b = vertex(i + 1, j);
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        if (j < rows - 1) {
          c = vertex(i, j + 1);
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
        }
      }
    }
    ctx.stroke();

    ctx.fillStyle = "rgba(200, 215, 255, 0.12)";
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        d = vertex(i, j);
        ctx.fillRect(d.x - 0.65, d.y - 0.65, 1.3, 1.3);
      }
    }

    if (!reduced) {
      drawRippleRings();
      drawSparkles();
    }

    var g = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.7, "rgba(0,0,0,0.15)");
    g.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawSparkles() {
    var k;
    var p;
    var pulse;
    var grd;
    var t;
    var shine;
    var rayLen;
    var rayW;
    var d;

    ctx.globalCompositeOperation = "lighter";

    for (k = 0; k < sparkles.length; k++) {
      p = vertex(sparkles[k].i, sparkles[k].j);
      t = time * SPARKLE_WAVE_T + sparkles[k].phase * SPARKLE_WAVE_PH;
      pulse = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t));
      shine = pulse * pulse * 0.85;
      /* Soft glints — slightly brighter at peaks, still restrained */
      shine *= 0.82 + 0.18 * Math.pow(Math.max(0, Math.sin(t * 1.65)), 1.15);

      grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22);
      grd.addColorStop(0, "rgba(245, 248, 255, " + (0.2 * shine) + ")");
      grd.addColorStop(0.1, "rgba(200, 220, 255, " + (0.14 * pulse) + ")");
      grd.addColorStop(0.4, "rgba(130, 170, 245, " + (0.075 * pulse) + ")");
      grd.addColorStop(0.72, "rgba(84, 129, 237, " + (0.035 * pulse) + ")");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
      ctx.fill();

      grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3.8);
      grd.addColorStop(0, "rgba(255, 255, 255, " + (0.32 * shine) + ")");
      grd.addColorStop(0.55, "rgba(190, 210, 255, " + (0.12 * pulse) + ")");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2);
      ctx.fill();

      rayLen = 3.5 + 7.5 * shine;
      rayW = 0.32 + 0.55 * shine;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(250, 252, 255, " + (0.26 * shine) + ")";
      ctx.lineWidth = rayW;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - rayLen);
      ctx.lineTo(p.x, p.y + rayLen);
      ctx.moveTo(p.x - rayLen, p.y);
      ctx.lineTo(p.x + rayLen, p.y);
      ctx.stroke();

      d = rayLen * 0.65;
      ctx.strokeStyle = "rgba(200, 218, 255, " + (0.14 * shine) + ")";
      ctx.lineWidth = rayW * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x - d, p.y - d);
      ctx.lineTo(p.x + d, p.y + d);
      ctx.moveTo(p.x - d, p.y + d);
      ctx.lineTo(p.x + d, p.y - d);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function step() {
    if (!w || !h) {
      return;
    }
    time += reduced ? 0 : 12;
    smoothPointer();
    if (!reduced) {
      pruneRipples();
      relocateSparklesOnShineCycle();
    }
    drawFrame();
    if (!reduced) {
      requestAnimationFrame(step);
    }
  }

  function onPointer(ev) {
    var rect = container.getBoundingClientRect();
    tx = ev.clientX - rect.left;
    ty = ev.clientY - rect.top;
    hasPointer = true;
  }

  function onLeave() {
    hasPointer = false;
  }

  function onPointerDownRipple(ev) {
    if (ev.button !== undefined && ev.button !== 0) {
      return;
    }
    if (ev.target.closest && ev.target.closest('a, button, input, textarea, select, [role="button"]')) {
      return;
    }
    onPointer(ev);
    var rect = container.getBoundingClientRect();
    var px = ev.clientX - rect.left;
    var py = ev.clientY - rect.top;
    if (px < 0 || py < 0 || px > w || py > h || !w || !h) {
      return;
    }
    ripples.push({ x: px, y: py, start: time });
    while (ripples.length > MAX_RIPPLES) {
      ripples.shift();
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

  var root = hero || container;
  root.addEventListener("pointermove", onPointer, { passive: true });
  root.addEventListener("pointerdown", onPointerDownRipple, { passive: true });
  root.addEventListener("pointerleave", onLeave, { passive: true });
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
