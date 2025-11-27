// MAIN GAME LOGIC (Santa Snake)

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =======================
// RESPONSIVE CANVAS
// =======================

const GRID = 24;

function resizeCanvas() {
  const cssSize = Math.min(
    window.innerWidth * 0.92,
    window.innerHeight * 0.62,
    520
  );
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(cssSize * dpr);
  canvas.height = Math.floor(cssSize * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function CELL() {
  const dpr = window.devicePixelRatio || 1;
  return canvas.width / dpr / GRID;
}

// =======================
// GAME STATE
// =======================

let snake, dir, nextDir, gift, score, clicks, speed;
let running = false;
let lastTime = 0;
let acc = 0;

// colors
const C = {
  bg: "#06152a",
  grid: "#102541",
  snakeHead: "#ff5a5a",
  snakeBody: "#3bd26b",
  gift: "#f5c84c"
};

// HUD elements
const scoreEl = document.getElementById("score");
const clicksEl = document.getElementById("clicks");
const speedEl = document.getElementById("speed");

function updateHUD() {
  scoreEl.textContent = score;
  clicksEl.textContent = clicks;
  speedEl.textContent = speed;
}

// =======================
// START / RESTART
// =======================

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  running = true;
  reset();
});

document.getElementById("restart").addEventListener("click", () => {
  running = true;
  reset();
});

// init / reset
function reset() {
  const center = Math.floor(GRID / 2);

  snake = [
    { x: center - 1, y: center },
    { x: center - 2, y: center },
    { x: center - 3, y: center }
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };

  gift = spawnGift();
  score = 0;
  clicks = 0;
  speed = 6;

  lastTime = 0;
  acc = 0;

  updateHUD();
}

// =======================
// SPAWN GIFT
// =======================

function spawnGift() {
  while (true) {
    const g = {
      x: (Math.random() * GRID) | 0,
      y: (Math.random() * GRID) | 0
    };
    if (!snake.some((s) => s.x === g.x && s.y === g.y)) return g;
  }
}

// =======================
// INPUT HELPERS
// =======================

function recordClick() {
  clicks++;
  try {
    if (window.ClickBattle && typeof ClickBattle.recordClick === "function") {
      ClickBattle.recordClick();
    }
  } catch (e) {
    // ignore if ClickBattle not loaded
  }
  updateHUD();
}

function trySetDirection(nd) {
  // reverse хөдөлгөөнийг хориглоно
  if (nd && !(nd.x === -dir.x && nd.y === -dir.y)) {
    nextDir = nd;
    recordClick();
  }
}

// keyboard input
window.addEventListener("keydown", (e) => {
  if (!running) return;

  const key = e.key;
  let nd = null;

  if (key === "ArrowUp") nd = { x: 0, y: -1 };
  if (key === "ArrowDown") nd = { x: 0, y: 1 };
  if (key === "ArrowLeft") nd = { x: -1, y: 0 };
  if (key === "ArrowRight") nd = { x: 1, y: 0 };

  if (nd) {
    e.preventDefault();
    trySetDirection(nd);
  }
});

// dpad / arrow buttons
function handleDirectionString(dirStr) {
  if (!running) return;

  let nd = null;
  if (dirStr === "up") nd = { x: 0, y: -1 };
  if (dirStr === "down") nd = { x: 0, y: 1 };
  if (dirStr === "left") nd = { x: -1, y: 0 };
  if (dirStr === "right") nd = { x: 1, y: 0 };

  trySetDirection(nd);
}

document.querySelectorAll(".arrow-btn").forEach((btn) => {
  const d = btn.dataset.dir;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    handleDirectionString(d);
  });

  btn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      handleDirectionString(d);
    },
    { passive: false }
  );
});

// =======================
// GAME STEP
// =======================

function step() {
  dir = nextDir;
  const head = snake[0];
  const nx = head.x + dir.x;
  const ny = head.y + dir.y;

  // wall hit
  if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) {
    gameOver();
    return;
  }

  // self hit
  if (snake.some((s, i) => i > 0 && s.x === nx && s.y === ny)) {
    gameOver();
    return;
  }

  // move
  snake.unshift({ x: nx, y: ny });

  // eat
  if (nx === gift.x && ny === gift.y) {
    score++;
    gift = spawnGift();
    if (score % 3 === 0) speed++; // 3 gift тутамд хурдан болно
    updateHUD();
  } else {
    snake.pop();
  }
}

// =======================
// DRAW
// =======================

function draw() {
  const cell = CELL();
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);

  // grid background (зөөлөн шугам)
  ctx.fillStyle = C.grid;
  for (let x = 0; x < GRID; x++) {
    for (let y = 0; y < GRID; y++) {
      ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
    }
  }

  // gift
  ctx.fillStyle = C.gift;
  ctx.fillRect(
    gift.x * cell + cell * 0.15,
    gift.y * cell + cell * 0.15,
    cell * 0.7,
    cell * 0.7
  );

  // snake (head + body)
  snake.forEach((s, i) => {
    if (i === 0) {
      // head
      ctx.fillStyle = C.snakeHead;
      ctx.beginPath();
      ctx.arc(
        s.x * cell + cell / 2,
        s.y * cell + cell / 2,
        cell * 0.45,
        0,
        Math.PI * 2
      );
      ctx.fill();
    } else {
      // body
      ctx.fillStyle = C.snakeBody;
      ctx.fillRect(
        s.x * cell + cell * 0.15,
        s.y * cell + cell * 0.15,
        cell * 0.7,
        cell * 0.7
      );
    }
  });

  // border
  ctx.strokeStyle = "#9bd3ff";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, h);
}

// =======================
// GAME OVER
// =======================

function gameOver() {
  running = false;
  draw();

  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#fff";
  ctx.font = "bold 26px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", w / 2, h / 2 - 8);
  ctx.font = "14px system-ui";
  ctx.fillText("Press Restart", w / 2, h / 2 + 16);
}

// =======================
// MAIN LOOP
// =======================

function loop(ts) {
  if (!running) {
    draw();
    requestAnimationFrame(loop);
    return;
  }

  if (!lastTime) lastTime = ts;
  const dt = (ts - lastTime) / 1000;
  lastTime = ts;
  acc += dt;

  const stepTime = 1 / speed;
  while (acc > stepTime) {
    step();
    acc -= stepTime;
  }

  draw();
  requestAnimationFrame(loop);
}

// эхний preview-д зориулж reset хийгээд loop эхлүүлнэ
reset();
requestAnimationFrame(loop);
