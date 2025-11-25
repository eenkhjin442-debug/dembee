
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

/* =========================
   RESPONSIVE CANVAS
========================= */
function resizeCanvas(){
  const cssSize = Math.min(
    window.innerWidth * 0.92,
    window.innerHeight * 0.62,
    520
  );
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.floor(cssSize * dpr);
  canvas.height = Math.floor(cssSize * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const GRID = 24;
function CELL(){ 
  return canvas.width / (window.devicePixelRatio||1) / GRID; 
}

/* =========================
   GAME STATE
========================= */
let snake, dir, nextDir, gift, score, clicks;
let speed = 6;        // steps per second
let running = false;  // start paused
let lastTime = 0;
let acc = 0;

/* =========================
   COLORS
========================= */
const C = {
  red:"#e74a4a",
  darkRed:"#b02f2f",
  white:"#f7f7f7",
  black:"#141414",
  skin:"#f2c9a0",
  gold:"#f5c84c",
  green:"#3bd26b",
};

/* =========================
   HUD
========================= */
const scoreEl = document.getElementById("score");
const clicksEl = document.getElementById("clicks");
const speedEl = document.getElementById("speed");
function updateHUD(){
  scoreEl.textContent = score;
  clicksEl.textContent = clicks;
  speedEl.textContent = speed;
}

/* =========================
   START SCREEN
========================= */
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

startBtn?.addEventListener("click", ()=>{
  startScreen.style.display = "none";
  running = true;
  reset();
});

/* =========================
   RESTART BUTTON
========================= */
document.getElementById("restart")?.addEventListener("click", ()=>{
  running = true;
  reset();
});

/* =========================
   RESET / INIT
========================= */
function reset(){
  snake = [
    {x:12, y:12},
    {x:11, y:12},
    {x:10, y:12}
  ];
  dir = {x:1, y:0};
  nextDir = {x:1, y:0};

  gift = spawnGift();
  score = 0;
  clicks = 0;
  speed = 6;

  lastTime = 0;
  acc = 0;

  updateHUD();
}

// ✅ page нээхэд preview харагдахаар init reset
reset();

/* =========================
   RANDOM GIFT SPAWN
========================= */
function spawnGift(){
  while(true){
    const g = { 
      x: (Math.random()*GRID)|0, 
      y: (Math.random()*GRID)|0 
    };
    if(!snake.some(s=>s.x===g.x && s.y===g.y)) return g;
  }
}

/* =========================
   KEYBOARD INPUT
========================= */
window.addEventListener("keydown", (e)=>{
  if(!running) return;

  const key = e.key;
  let nd=null;

  if(key==="ArrowUp") nd={x:0,y:-1};
  if(key==="ArrowDown") nd={x:0,y:1};
  if(key==="ArrowLeft") nd={x:-1,y:0};
  if(key==="ArrowRight") nd={x:1,y:0};

  if(nd){
    if(!(nd.x === -dir.x && nd.y === -dir.y)){
      nextDir = nd;
      clicks++;       // keyboard = click
      updateHUD();
    }
    e.preventDefault();
  }
});

/* =========================
   MOBILE DPAD INPUT (B)
   (index.html + style.css дээр
    dpad нэмсэн байх ёстой)
========================= */
document.querySelectorAll(".dpad button").forEach(btn=>{
  btn.addEventListener("touchstart", (e)=>{
    e.preventDefault();
    if(!running) return;

    const d = btn.dataset.dir;
    let nd = null;

    if(d==="up") nd={x:0,y:-1};
    if(d==="down") nd={x:0,y:1};
    if(d==="left") nd={x:-1,y:0};
    if(d==="right") nd={x:1,y:0};

    if(nd && !(nd.x === -dir.x && nd.y === -dir.y)){
      nextDir = nd;
      clicks++;  // dpad = click
      updateHUD();
    }
  }, {passive:false});
});

/* =========================
   GAME STEP
========================= */
function step(){
  dir = nextDir;
  const head = snake[0];
  const nx = head.x + dir.x;
  const ny = head.y + dir.y;

  // wall hit
  if(nx<0 || ny<0 || nx>=GRID || ny>=GRID){ 
    gameOver(); 
    return; 
  }
  // self hit
  if(snake.some((s,i)=>i>0 && s.x===nx && s.y===ny)){ 
    gameOver(); 
    return; 
  }

  snake.unshift({x:nx,y:ny});

  // eat gift
  if(nx===gift.x && ny===gift.y){
    score++;
    gift = spawnGift();

    // speed up every 3 gifts
    if(score%3===0) speed++;

    updateHUD();
  } else {
    snake.pop();
  }
}

/* =========================
   GAME OVER
========================= */
function gameOver(){
  running = false;
  draw();

  const w = canvas.width/(window.devicePixelRatio||1);
  const h = canvas.height/(window.devicePixelRatio||1);

  ctx.fillStyle="rgba(0,0,0,0.6)";
  ctx.fillRect(0,0,w,h);
  ctx.fillStyle="#fff";
  ctx.font="bold 26px system-ui";
  ctx.textAlign="center";
  ctx.fillText("GAME OVER", w/2, h/2-8);
  ctx.font="14px system-ui";
  ctx.fillText("Press Restart", w/2, h/2+16);
}

/* =========================
   PIXEL DRAW HELPER
========================= */
function drawPixelArt(px, py, map, palette){
  const cell = CELL();
  const size = cell/8;
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const ch = map[r][c];
      if(ch===".") continue;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(px + c*size, py + r*size, size, size);
    }
  }
}

/* =========================
   PIXEL MAPS
========================= */
// Santa head (8x8)
const santaMap=[
  "..rrrr..",
  ".rwwwwr.",
  "rwwbbwwr",
  "rws sswr",
  "rwwssssr",
  ".rwwwwr.",
  "..rddr..",
  "...rr..."
];
const santaPalette={
  "r":C.red,
  "d":C.darkRed,
  "w":C.white,
  "b":C.black,
  "s":C.skin,
  ".":"transparent"
};

// Gift body (8x8)
const giftMap=[
  "ggggrrrr",
  "ggggrrrr",
  "yyyyrrrr",
  "yyyyrrrr",
  "rrrryyyy",
  "rrrryyyy",
  "rrrrgggg",
  "rrrrgggg"
];
const giftPalette={
  "g":C.green,
  "r":C.red,
  "y":C.gold,
  ".":"transparent"
};

// Food gift (8x8)
const foodMap=[
  "rrrrrrrr",
  "rggggggr",
  "rgyyyygr",
  "rgyrrygr",
  "rgyyyygr",
  "rggggggr",
  "rrrrrrrr",
  "..yyyy.."
];
const foodPalette={
  "r":C.red,
  "g":C.green,
  "y":C.gold,
  ".":"transparent"
};

/* =========================
   DRAW FRAME
========================= */
function draw(){
  const cell = CELL();
  const w = canvas.width/(window.devicePixelRatio||1);
  const h = canvas.height/(window.devicePixelRatio||1);

  ctx.clearRect(0,0,w,h);

  // food
  drawPixelArt(gift.x*cell, gift.y*cell, foodMap, foodPalette);

  // snake (head + body)
  snake.forEach((s,i)=>{
    const px=s.x*cell, py=s.y*cell;
    if(i===0) drawPixelArt(px,py,santaMap,santaPalette);
    else drawPixelArt(px,py,giftMap,giftPalette);
  });

  // border
  ctx.strokeStyle="#9bd3ff";
  ctx.lineWidth=2;
  ctx.strokeRect(0,0,w,h);
}

/* =========================
   GAME LOOP
========================= */
function loop(ts){
  // paused preview
  if(!running){
    draw();
    requestAnimationFrame(loop);
    return;
  }

  if(!lastTime) lastTime = ts;
  const dt = (ts-lastTime)/1000;
  lastTime = ts;
  acc += dt;

  const stepTime = 1/speed;
  while(acc > stepTime){
    step();
    acc -= stepTime;
  }

  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

