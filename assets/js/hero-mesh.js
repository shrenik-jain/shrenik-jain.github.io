/**
 * Home hero: wire mesh warps from the cursor + soft ripples + pulsing node glows + subtle shooting stars.
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
  var shootingStars = [];
  var nextShootingStarIn = 90;

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
    var k;
    var si;
    var sj;
    for (k = 0; k < 9; k++) {
      si = 1 + Math.floor((cols - 2) * (((k * 37 + 13) % 97) / 97));
      sj = 1 + Math.floor((rows - 2) * (((k * 53 + 19) % 89) / 89));
      sparkles.push({ i: si, j: sj, phase: k * 1.23 });
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
    return {
      x: bx + (dx / d) * push,
      y: by + (dy / d) * push,
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
    shootingStars.length = 0;
    nextShootingStarIn = 45 + Math.floor(Math.random() * 75);
    tx = cx = w * 0.5;
    ty = cy = h * 0.45;
  }

  function spawnShootingStar() {
    var fromTop = Math.random() > 0.4;
    var x;
    var y;
    var speed = 5.5 + Math.random() * 4.5;
    var angle = 0.52 + Math.random() * 0.42;
    var vx = Math.cos(angle) * speed;
    var vy = Math.sin(angle) * speed;
    if (fromTop) {
      x = Math.random() * w * 0.95;
      y = -40 - Math.random() * 80;
    } else {
      x = -50 - Math.random() * 100;
      y = Math.random() * h * 0.45;
    }
    shootingStars.push({
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      age: 0,
      maxAge: 140 + Math.floor(Math.random() * 100),
      tailPx: 68 + Math.random() * 78,
    });
  }

  function updateShootingStars() {
    nextShootingStarIn--;
    if (nextShootingStarIn <= 0 && shootingStars.length < 3) {
      spawnShootingStar();
      nextShootingStarIn = 40 + Math.floor(Math.random() * 85);
    }
    var i;
    var s;
    for (i = shootingStars.length - 1; i >= 0; i--) {
      s = shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.age++;
      if (s.age > s.maxAge || s.x > w + 80 || s.y > h + 80) {
        shootingStars.splice(i, 1);
      }
    }
  }

  function drawShootingStars() {
    var i;
    var s;
    var life;
    var ax;
    var ay;
    var alpha;
    var sp;
    var nx;
    var ny;

    ctx.globalCompositeOperation = "lighter";

    for (i = 0; i < shootingStars.length; i++) {
      s = shootingStars[i];
      life = 1 - s.age / s.maxAge;
      if (life < 0.05) {
        continue;
      }
      sp = Math.sqrt(s.vx * s.vx + s.vy * s.vy) || 1;
      nx = s.vx / sp;
      ny = s.vy / sp;
      ax = s.x - nx * s.tailPx;
      ay = s.y - ny * s.tailPx;

      alpha = 0.13 * life;

      var g = ctx.createLinearGradient(s.x, s.y, ax, ay);
      g.addColorStop(0, "rgba(255, 255, 255, " + (alpha * 1.15) + ")");
      g.addColorStop(0.12, "rgba(220, 236, 255, " + (alpha * 0.92) + ")");
      g.addColorStop(0.45, "rgba(140, 180, 250, " + (alpha * 0.45) + ")");
      g.addColorStop(1, "rgba(84, 129, 237, 0)");

      ctx.strokeStyle = g;
      ctx.lineWidth = 1.55;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, " + (0.2 * life) + ")";
      ctx.lineWidth = 0.82;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - nx * Math.min(28, s.tailPx * 0.3), s.y - ny * Math.min(28, s.tailPx * 0.3));
      ctx.stroke();
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
      drawShootingStars();
      drawRipplesAndSparkles();
    }

    var g = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.75);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.7, "rgba(0,0,0,0.15)");
    g.addColorStop(1, "rgba(0,0,0,0.4)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawRipplesAndSparkles() {
    var k;
    var rad;
    var al;
    var p;
    var pulse;
    var grd;

    ctx.globalCompositeOperation = "lighter";

    for (k = 0; k < 4; k++) {
      rad = ((time * 0.125 + k * 68) % 270) + 22;
      al = Math.max(0, (1 - rad / 310) * 0.16);
      if (al < 0.025) {
        continue;
      }
      ctx.strokeStyle = "rgba(100, 155, 255, " + al + ")";
      ctx.lineWidth = 1.15;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (k = 0; k < sparkles.length; k++) {
      p = vertex(sparkles[k].i, sparkles[k].j);
      pulse = 0.45 + 0.55 * Math.sin(time * 0.0038 + sparkles[k].phase * 2.1);
      grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
      grd.addColorStop(0, "rgba(170, 205, 255, " + 0.1 * pulse + ")");
      grd.addColorStop(0.55, "rgba(84, 129, 237, " + 0.05 * pulse + ")");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
      ctx.fill();
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
      updateShootingStars();
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
  root.addEventListener("pointerdown", onPointer, { passive: true });
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
