/**
 * Custom hero background: flow-field streamlines on black — not a linked-particle demo.
 * Particles follow a curl-like 2D field; cursor position and motion distort the field
 * across the full hero (including over text).
 */
(function () {
  var container = document.getElementById("dots");
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

  var mx = 0;
  var my = 0;
  var goalMx = 0;
  var goalMy = 0;
  var cstr = 0;
  var cstrTarget = 0;
  var wakeX = 0;
  var wakeY = 0;

  var particles = [];
  var count = 0;

  var hero = document.getElementById("hero");

  function fieldAngle(x, y, t) {
    var nx = x * 0.0011;
    var ny = y * 0.0011;
    var nt = t * 0.00007;
    var fx =
      Math.sin(ny * 2.4 + nt * 1.1) +
      Math.cos(nx * 1.9 - nt * 0.8) * 0.55 +
      Math.sin((nx + ny) * 1.3 + nt * 0.5) * 0.35;
    var fy =
      Math.cos(nx * 2.6 - nt * 0.9) +
      Math.sin(ny * 2.1 + nt * 0.7) * 0.55 +
      Math.cos((nx - ny) * 1.1 - nt * 0.4) * 0.35;

    if (cstr > 0.04) {
      var dx = x - mx;
      var dy = y - my;
      var dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
      var r = 300;
      if (dist < r) {
        var falloff = (1 - dist / r) * (1 - dist / r) * cstr;
        fx += (-dy / dist) * 1.55 * falloff;
        fy += (dx / dist) * 1.55 * falloff;
        var wakeFalloff = falloff * (0.85 + 0.15 * Math.min(1, (Math.abs(wakeX) + Math.abs(wakeY)) * 0.08));
        fx += wakeX * 0.014 * wakeFalloff;
        fy += wakeY * 0.014 * wakeFalloff;
      }
    }

    return Math.atan2(fy, fx);
  }

  function spawnParticle(p) {
    p.x = Math.random() * w;
    p.y = Math.random() * h;
    var roll = Math.random();
    if (roll < 0.68) {
      p.hue = 208 + Math.random() * 22;
      p.sat = 56 + Math.random() * 18;
    } else if (roll < 0.88) {
      p.hue = 224 + Math.random() * 16;
      p.sat = 50 + Math.random() * 22;
    } else {
      p.hue = 238 + Math.random() * 14;
      p.sat = 42 + Math.random() * 18;
    }
    p.light = 58 + Math.random() * 24;
    p.a = 0.11 + Math.random() * 0.11;
    p.speed = 0.52 + Math.random() * 0.62;
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

    var area = w * h;
    var cap =
      typeof window.matchMedia === "function" && window.matchMedia("(max-width: 768px)").matches
        ? 560
        : 1180;
    count = reduced ? 0 : Math.min(cap, Math.max(220, Math.floor(area / 680)));
    particles.length = 0;
    for (var i = 0; i < count; i++) {
      var p = {};
      spawnParticle(p);
      particles.push(p);
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
  }

  function drawStaticBackdrop() {
    var g = ctx.createRadialGradient(w * 0.15, h * 0.2, 0, w * 0.15, h * 0.2, Math.max(w, h) * 0.75);
    g.addColorStop(0, "rgba(40, 55, 120, 0.35)");
    g.addColorStop(0.45, "rgba(0, 0, 0, 0)");
    g.addColorStop(1, "#000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    g = ctx.createRadialGradient(w * 0.85, h * 0.75, 0, w * 0.85, h * 0.75, Math.max(w, h) * 0.6);
    g.addColorStop(0, "rgba(84, 129, 237, 0.12)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function pointerFromClient(clientX, clientY, movementX, movementY) {
    var rect = container.getBoundingClientRect();
    goalMx = clientX - rect.left;
    goalMy = clientY - rect.top;
    cstrTarget = 1;
    if (typeof movementX === "number" && typeof movementY === "number") {
      wakeX += movementX * 0.1;
      wakeY += movementY * 0.1;
    }
  }

  function onHeroPointerMove(ev) {
    pointerFromClient(ev.clientX, ev.clientY, ev.movementX, ev.movementY);
  }

  function onHeroPointerLeave() {
    cstrTarget = 0;
  }

  function onPointerUp(ev) {
    if (ev.pointerType === "touch") {
      cstrTarget = 0;
    }
  }

  function step() {
    if (!w || !h) {
      return;
    }

    time += 12;

    cstr += (cstrTarget - cstr) * 0.11;
    if (cstr > 0.02) {
      mx += (goalMx - mx) * 0.2;
      my += (goalMy - my) * 0.2;
    }

    wakeX *= 0.84;
    wakeY *= 0.84;

    ctx.fillStyle = "rgba(0, 0, 0, 0.125)";
    ctx.fillRect(0, 0, w, h);

    var i;
    var p;
    var ang;
    for (i = 0; i < count; i++) {
      p = particles[i];
      ang = fieldAngle(p.x, p.y, time);
      p.x += Math.cos(ang) * p.speed;
      p.y += Math.sin(ang) * p.speed;

      if (p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
        spawnParticle(p);
      } else {
        ctx.fillStyle =
          "hsla(" + p.hue + ", " + p.sat + "%, " + p.light + "%, " + p.a + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(step);
  }

  if (reduced) {
    resize();
    drawStaticBackdrop();
    window.addEventListener(
      "resize",
      function () {
        resize();
        drawStaticBackdrop();
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

  var interactRoot = hero || container;
  interactRoot.addEventListener("pointermove", onHeroPointerMove, { passive: true });
  interactRoot.addEventListener("pointerleave", onHeroPointerLeave, { passive: true });
  interactRoot.addEventListener("pointerdown", onHeroPointerMove, { passive: true });
  interactRoot.addEventListener("pointerup", onPointerUp, { passive: true });
  interactRoot.addEventListener("pointercancel", onHeroPointerLeave, { passive: true });

  requestAnimationFrame(step);
})();
