/**
 * Home hero: premium multi-column Tetris field (inspired by loktar00/CodePen BaGqXY).
 * Glassy gradient blocks, smooth drops, brand ambient glow.
 */
(function () {
  var container = document.getElementById("dots");
  if (!container || typeof document.createElement("canvas").getContext !== "function") {
    return;
  }

  var reduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  container.classList.add("hero-tetris-host");

  var SHAPES = [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 1],
      [0, 0, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 1, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ];

  /* Brand hues — #5481ed, #a571bd, #c46a90, #d46678 */
  var HUES = [221, 228, 278, 330, 350, 248, 292];

  var EMPTY_PALETTE = { hue: 0, active: false };

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.className = "hero-tetris-canvas";
  canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;display:block;";
  container.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  var w = 0;
  var h = 0;
  var dpr = 1;
  var columns = [];
  var vignetteGrad = null;
  var edgeGrad = null;
  var ambientGrad = null;

  function columnCount(width) {
    if (width < 480) return 3;
    if (width < 768) return 5;
    if (width < 1100) return 6;
    return 8;
  }

  function randomPalette() {
    return { hue: HUES[Math.floor(Math.random() * HUES.length)], active: false };
  }

  function paletteForShape(index, active) {
    return { hue: HUES[index % HUES.length], active: !!active };
  }

  function makeCell(data, palette) {
    return { data: data, palette: palette || EMPTY_PALETTE };
  }

  function drawBlock(cx, gridX, gridY, unit, palette) {
    var active = palette.active;
    var hue = palette.hue;
    var pad = unit > 11 ? 0.65 : 0.45;
    var size = unit - pad * 2;
    var gx = gridX * unit + pad;
    var gy = gridY * unit + pad;
    var inset = size > 8 ? 2 : 1;
    var outerA = active ? 0.38 : 0.24;
    var midA = active ? 0.3 : 0.17;
    var innerA = active ? 0.22 : 0.12;

    if (active) {
      cx.save();
      cx.shadowColor = "hsla(" + hue + ", 85%, 68%, 0.4)";
      cx.shadowBlur = Math.max(5, unit * 0.5);
    }

    /* Classic box stack: outer frame → mid → inner face */
    cx.fillStyle = "hsla(" + hue + ", 68%, 58%, " + outerA + ")";
    cx.fillRect(gx, gy, size, size);

    cx.fillStyle = "hsla(" + hue + ", 72%, 66%, " + midA + ")";
    cx.fillRect(gx + inset, gy + inset, size - inset * 2, size - inset * 2);

    var face = cx.createLinearGradient(gx, gy, gx, gy + size);
    face.addColorStop(0, "hsla(" + hue + ", 75%, 72%, " + innerA + ")");
    face.addColorStop(0.5, "hsla(" + hue + ", 68%, 52%, " + (innerA * 0.9) + ")");
    face.addColorStop(1, "hsla(" + hue + ", 60%, 38%, " + (innerA * 0.75) + ")");
    cx.fillStyle = face;
    cx.fillRect(gx + inset * 2, gy + inset * 2, size - inset * 4, size - inset * 4);

    cx.fillStyle = "rgba(255, 255, 255, " + (active ? 0.1 : 0.05) + ")";
    cx.fillRect(gx + inset * 2, gy + inset * 2, size - inset * 4, Math.max(1, (size - inset * 4) * 0.35));

    cx.strokeStyle = "hsla(" + hue + ", 90%, 90%, " + (active ? 0.16 : 0.08) + ")";
    cx.lineWidth = 1;
    cx.beginPath();
    cx.moveTo(gx, gy + 0.5);
    cx.lineTo(gx + size, gy + 0.5);
    cx.stroke();

    if (active) {
      cx.restore();
    }
  }

  function TetrisColumn(offsetX, colWidth, height, unit, staggerMs) {
    this.offsetX = offsetX;
    this.colWidth = colWidth;
    this.unit = unit;
    this.boardWidth = Math.max(4, Math.floor(colWidth / unit));
    this.boardHeight = Math.max(12, Math.floor(height / unit));
    this.board = [];
    this.curPiece = { data: null, palette: EMPTY_PALETTE, x: 0, y: 0, animY: 0 };
    this.lastMove = performance.now() + (staggerMs || 0);
    this.dropMs = 85 + Math.random() * 55;
    this.initBoard();
    this.checkLines();
    this.newPiece();
  }

  TetrisColumn.prototype.initBoard = function () {
    var x;
    var y;
    var fillFrom = Math.floor(this.boardHeight * 0.72);
    this.board = [];
    for (x = 0; x <= this.boardWidth; x++) {
      this.board[x] = [];
      for (y = 0; y <= this.boardHeight; y++) {
        this.board[x][y] = makeCell(0, EMPTY_PALETTE);
        if (Math.random() > 0.94 && y > fillFrom) {
          this.board[x][y] = makeCell(1, randomPalette());
        }
      }
    }
    this.collapseBoard();
  };

  TetrisColumn.prototype.collapseBoard = function () {
    var x;
    var y;
    var yy;
    for (x = 0; x <= this.boardWidth; x++) {
      for (y = this.boardHeight - 1; y > 0; y--) {
        if (this.board[x][y].data === 0) {
          for (yy = y; yy > 0; yy--) {
            if (this.board[x][yy - 1].data) {
              this.board[x][yy].data = 1;
              this.board[x][yy].palette = this.board[x][yy - 1].palette;
              this.board[x][yy - 1] = makeCell(0, EMPTY_PALETTE);
            }
          }
        }
      }
    }
  };

  TetrisColumn.prototype.checkMovement = function (piece, data, px, py, dx, dy) {
    var x;
    var y;
    var bx;
    var by;
    for (x = 0; x < 4; x++) {
      for (y = 0; y < 4; y++) {
        if (data[x][y] === 1) {
          bx = px + x + dx;
          by = py + y + dy;
          if (bx < 0 || bx >= this.boardWidth || by >= this.boardHeight) {
            return false;
          }
          if (!this.board[bx]) {
            this.board[bx] = [];
          }
          if (!this.board[bx][by]) {
            this.board[bx][by] = makeCell(0, EMPTY_PALETTE);
          }
          if (by >= 0 && this.board[bx][by].data === 1) {
            return false;
          }
        }
      }
    }
    return true;
  };

  TetrisColumn.prototype.checkLines = function () {
    var x;
    var y;
    var lines;
    var lineY;
    while (true) {
      y = this.boardHeight;
      var cleared = false;
      while (y--) {
        lines = 0;
        for (x = 0; x < this.boardWidth; x++) {
          if (this.board[x][y].data === 1) {
            lines++;
          }
        }
        if (lines === this.boardWidth) {
          cleared = true;
          lineY = y;
          while (lineY > 0) {
            for (x = 0; x <= this.boardWidth; x++) {
              if (lineY - 1 >= 0 && this.board[x][lineY - 1]) {
                this.board[x][lineY].data = this.board[x][lineY - 1].data;
                this.board[x][lineY].palette = this.board[x][lineY - 1].palette;
              } else {
                this.board[x][lineY] = makeCell(0, EMPTY_PALETTE);
              }
            }
            lineY--;
          }
          y++;
        }
      }
      if (!cleared) {
        break;
      }
    }
  };

  TetrisColumn.prototype.fillBoard = function () {
    var piece = this.curPiece;
    var x;
    var y;
    for (x = 0; x < 4; x++) {
      for (y = 0; y < 4; y++) {
        if (piece.data[x][y] === 1) {
          if (!this.board[piece.x + x]) {
            this.board[piece.x + x] = [];
          }
          var locked = { hue: piece.palette.hue, active: false };
          this.board[piece.x + x][piece.y + y] = makeCell(1, locked);
        }
      }
    }
    this.checkLines();
  };

  TetrisColumn.prototype.newPiece = function () {
    var n = Math.floor(Math.random() * SHAPES.length);
    var data = SHAPES[n];
    this.curPiece.data = data;
    this.curPiece.palette = paletteForShape(n, true);
    this.curPiece.x = Math.floor(Math.random() * Math.max(1, this.boardWidth - 3));
    this.curPiece.y = -2;
    this.curPiece.animY = -2;
    this.dropMs = 80 + Math.random() * 50;
    this.lastMove = performance.now();
    if (!this.checkMovement(this.curPiece, data, this.curPiece.x, this.curPiece.y, 0, 0)) {
      this.initBoard();
    }
  };

  TetrisColumn.prototype.tick = function (now) {
    var p = this.curPiece;
    if (!p.data) {
      return;
    }
    if (now < this.lastMove) {
      return;
    }
    this.lastMove = now + this.dropMs;
    if (this.checkMovement(p, p.data, p.x, p.y, 0, 1)) {
      p.y++;
    } else {
      if (p.y < -1) {
        this.initBoard();
        this.newPiece();
        return;
      }
      this.fillBoard(p);
      this.newPiece();
    }
  };

  TetrisColumn.prototype.smoothPiece = function () {
    var p = this.curPiece;
    if (!p.data) {
      return;
    }
    if (typeof p.animY !== "number") {
      p.animY = p.y;
    }
    p.animY += (p.y - p.animY) * 0.34;
    if (Math.abs(p.y - p.animY) < 0.004) {
      p.animY = p.y;
    }
  };

  TetrisColumn.prototype.draw = function (cx) {
    var x;
    var y;
    var p = this.curPiece;
    var unit = this.unit;
    var ox = this.offsetX;
    var drawY = typeof p.animY === "number" ? p.animY : p.y;

    cx.save();
    cx.translate(ox, 0);

    for (x = 0; x < this.boardWidth; x++) {
      for (y = 0; y < this.boardHeight; y++) {
        if (this.board[x][y].data !== 0) {
          drawBlock(cx, x, y, unit, this.board[x][y].palette);
        }
      }
    }

    if (p.data) {
      for (x = 0; x < 4; x++) {
        for (y = 0; y < 4; y++) {
          if (p.data[x][y] === 1) {
            var py = drawY + y;
            if (py > -2) {
              drawBlock(cx, p.x + x, py, unit, p.palette);
            }
          }
        }
      }
    }

    cx.restore();
  };

  function buildColumns() {
    var n = columnCount(w);
    var colW = w / n;
    var unit = Math.max(12, Math.min(18, Math.floor(colW / 12)));
    columns = [];
    var i;
    for (i = 0; i < n; i++) {
      columns.push(new TetrisColumn(i * colW, colW, h, unit, i * 90));
    }
  }

  function updateVignettes() {
    var cx = w * 0.5;
    var cy = h * 0.42;
    vignetteGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.55);
    vignetteGrad.addColorStop(0, "rgba(0, 0, 0, 0.52)");
    vignetteGrad.addColorStop(0.42, "rgba(0, 0, 0, 0.16)");
    vignetteGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    edgeGrad = ctx.createLinearGradient(0, 0, 0, h);
    edgeGrad.addColorStop(0, "rgba(0, 0, 0, 0.28)");
    edgeGrad.addColorStop(0.08, "rgba(0, 0, 0, 0)");
    edgeGrad.addColorStop(0.92, "rgba(0, 0, 0, 0)");
    edgeGrad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
    ambientGrad = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.75);
    ambientGrad.addColorStop(0, "rgba(84, 129, 237, 0.04)");
    ambientGrad.addColorStop(0.45, "rgba(165, 113, 189, 0.025)");
    ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  function drawAmbient() {
    var n = columns.length;
    var i;
    var x;
    var colW = w / n;

    if (ambientGrad) {
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
    ctx.lineWidth = 1;
    for (i = 1; i < n; i++) {
      x = Math.round(i * colW) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    var unit = columns[0] ? columns[0].unit : 16;
    ctx.strokeStyle = "rgba(84, 129, 237, 0.03)";
    for (x = 0; x < w; x += unit) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (var gy = 0; gy < h; gy += unit) {
      ctx.beginPath();
      ctx.moveTo(0, gy + 0.5);
      ctx.lineTo(w, gy + 0.5);
      ctx.stroke();
    }
  }

  function drawFrame() {
    var i;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawAmbient();
    for (i = 0; i < columns.length; i++) {
      columns[i].draw(ctx);
    }
    if (vignetteGrad) {
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, w, h);
    }
    if (edgeGrad) {
      ctx.fillStyle = edgeGrad;
      ctx.fillRect(0, 0, w, h);
    }
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
    buildColumns();
    updateVignettes();
    drawFrame();
  }

  function step(now) {
    var i;
    if (!reduced) {
      for (i = 0; i < columns.length; i++) {
        columns[i].tick(now);
        columns[i].smoothPiece();
      }
    }
    drawFrame();
    if (!reduced) {
      requestAnimationFrame(step);
    }
  }

  var ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(function () {
          resize();
        })
      : null;

  resize();
  if (ro) {
    ro.observe(container);
  }
  window.addEventListener("resize", resize, { passive: true });

  if (reduced) {
    return;
  }
  requestAnimationFrame(step);
})();
