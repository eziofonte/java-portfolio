document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('content-favorites');
  if (!page) return;

  // ---- Curry <-> LeBron switch (safe even if an old copy exists) ----
if (!window.__playerSwitchBound) {
  window.__playerSwitchBound = true;

  const players = {
    curry:  { name: 'Stephen Curry', image: '/alastair/images/curry.jpg' },
    lebron: { name: 'LeBron James',  image: '/alastair/images/lebron.jpg' }
  };

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.favorite-player');
    if (!card) return;

    e.stopPropagation();   // blocks any older handler on the card

    const next = card.dataset.player === 'curry' ? 'lebron' : 'curry';
    card.dataset.player = next;
    card.style.setProperty('--favorite-image', `url('${players[next].image}')`);

    const nameEl = card.querySelector('strong');
    if (nameEl) nameEl.textContent = players[next].name;
  }, true);   // true = runs before other click handlers
}
    // ---- Slingshot basketball ----
  const canvas = document.getElementById('favorite-court-canvas');
  const ctx = canvas.getContext('2d');
  const result = document.getElementById('favorite-shot-result');
  const score = document.getElementById('favorite-shot-score');

  const W = canvas.width, H = canvas.height;
  const FLOOR = H - 20;
  const R = 12;
  const START = { x: 80, y: 150 };
  const GRAVITY = 700;
  const POWER = 9;                 // launch speed per pixel pulled
  const MAX_PULL = 75;
  const DT = 1 / 120;              // fixed physics step

  const RIM_Y = 120, RIM_L = 372, RIM_R = 424;
  const BOARD_X = 424, BOARD_TOP = 55, BOARD_BOTTOM = 140;

  const ball = { x: START.x, y: START.y, vx: 0, vy: 0 };
  let state = 'ready';             // ready | aiming | flying | resetting
  let made = 0, attempts = 0;
  let scored = false, touchedRim = false, bounces = 0, flightTime = 0;
  let lastTime = 0, acc = 0;

  const setScore = () => { score.textContent = `${made} of ${attempts} made`; };

  // ---------- drawing ----------
  function drawHoop() {
    ctx.fillStyle = '#ffffff1f';
    ctx.fillRect(0, FLOOR, W, 4);

    ctx.fillStyle = '#f5d5a5';
    ctx.fillRect(BOARD_X, BOARD_TOP, 6, BOARD_BOTTOM - BOARD_TOP);

    ctx.strokeStyle = '#ffffff66';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 4; i++) {
      const topX = RIM_L + (i * (RIM_R - RIM_L)) / 4;
      const botX = RIM_L + 8 + (i * (RIM_R - RIM_L - 16)) / 4;
      ctx.beginPath();
      ctx.moveTo(topX, RIM_Y + 2);
      ctx.lineTo(botX, RIM_Y + 34);
      ctx.stroke();
    }

    ctx.strokeStyle = '#ff9a4d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(RIM_L, RIM_Y);
    ctx.lineTo(RIM_R, RIM_Y);
    ctx.stroke();
  }

  function drawBall() {
    ctx.fillStyle = '#ff8a2b';
    ctx.strokeStyle = '#5a2a0a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ball.x - R, ball.y); ctx.lineTo(ball.x + R, ball.y);
    ctx.moveTo(ball.x, ball.y - R); ctx.lineTo(ball.x, ball.y + R);
    ctx.stroke();
  }

  function drawAim() {
    ctx.strokeStyle = '#ffffffaa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(START.x, START.y);
    ctx.lineTo(ball.x, ball.y);
    ctx.stroke();

    // predicted path uses the exact same physics as the real shot
    const p = { x: ball.x, y: ball.y,
                vx: (START.x - ball.x) * POWER,
                vy: (START.y - ball.y) * POWER };
    ctx.fillStyle = '#ffffffcc';
    for (let i = 0; i < 22; i++) {
      for (let s = 0; s < 6; s++) integrate(p, DT);
      if (p.y > FLOOR - R) break;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawHoop();
    if (state === 'aiming') drawAim();
    drawBall();
  }

  // ---------- physics ----------
  function integrate(b, dt) {
    b.vy += GRAVITY * dt;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  function bounceOffPoint(px, py) {
    const dx = ball.x - px, dy = ball.y - py;
    const dist = Math.hypot(dx, dy);
    if (dist >= R + 2 || dist === 0) return;
    const nx = dx / dist, ny = dy / dist;
    ball.x = px + nx * (R + 2);
    ball.y = py + ny * (R + 2);
    const dot = ball.vx * nx + ball.vy * ny;
    if (dot < 0) {
      ball.vx -= 1.5 * dot * nx;
      ball.vy -= 1.5 * dot * ny;
      touchedRim = true;
    }
  }

  function step(dt) {
    const prevY = ball.y;
    integrate(ball, dt);

    bounceOffPoint(RIM_L, RIM_Y);
    bounceOffPoint(RIM_R, RIM_Y);

    // backboard
    if (ball.x + R > BOARD_X && ball.y > BOARD_TOP && ball.y < BOARD_BOTTOM && ball.vx > 0) {
      ball.x = BOARD_X - R;
      ball.vx *= -0.55;
      touchedRim = true;
    }

    // floor: only bounce when actually falling into it
    if (ball.y + R > FLOOR && ball.vy > 0) {
      ball.y = FLOOR - R;
      ball.vy *= -0.5;
      ball.vx *= 0.85;
      bounces++;
    }

    // basket: center crosses rim height going down, between the rim edges
    if (!scored && prevY < RIM_Y && ball.y >= RIM_Y && ball.vy > 0 &&
        ball.x > RIM_L + 2 && ball.x < RIM_R - 2) {
      scored = true;
    }
  }

  // ---------- shot flow ----------
  function finishShot() {
    state = 'resetting';
    if (scored) {
      made++;
      result.textContent = touchedRim ? 'Bucket! Rattled in.' : 'Swish! Nothing but net.';
    } else {
      result.textContent = 'Missed. Pull back and try again.';
    }
    setScore();
    setTimeout(resetBall, 800);
  }

  function resetBall() {
    ball.x = START.x; ball.y = START.y;
    ball.vx = ball.vy = 0;
    state = 'ready';
    draw();
  }

  function loop(time) {
    if (state !== 'flying') return;
    if (page.getClientRects().length === 0) { resetBall(); return; }

    acc += Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    while (acc >= DT) {
      step(DT);
      flightTime += DT;
      acc -= DT;
    }
    draw();

    const out = ball.x < -R || ball.x > W + R;
    const settled = bounces >= 2 || flightTime > 4;
    if (out || settled) { finishShot(); return; }
    requestAnimationFrame(loop);
  }

  function launch() {
    ball.vx = (START.x - ball.x) * POWER;
    ball.vy = (START.y - ball.y) * POWER;
    attempts++;
    scored = false; touchedRim = false; bounces = 0; flightTime = 0; acc = 0;
    state = 'flying';
    result.textContent = '...';
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  // ---------- input (press anywhere on the court and drag) ----------
  function pointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height)
    };
  }

  function aimTo(e) {
    const p = pointerPos(e);
    let dx = p.x - START.x, dy = p.y - START.y;
    const len = Math.hypot(dx, dy);
    if (len > MAX_PULL) { dx *= MAX_PULL / len; dy *= MAX_PULL / len; }
    ball.x = Math.max(R, START.x + dx);
    ball.y = Math.min(FLOOR - R - 2, START.y + dy);   // never below the floor
    draw();
  }

  canvas.addEventListener('pointerdown', e => {
    if (state !== 'ready') return;
    state = 'aiming';
    canvas.setPointerCapture(e.pointerId);
    result.textContent = 'Aim, then let go!';
    aimTo(e);
  });

  canvas.addEventListener('pointermove', e => {
    if (state === 'aiming') aimTo(e);
  });

  function release() {
    if (state !== 'aiming') return;
    const pulled = Math.hypot(START.x - ball.x, START.y - ball.y);
    if (pulled < 10) {
      result.textContent = 'Pull the ball back and let go to shoot.';
      resetBall();
      return;
    }
    launch();
  }

  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  setScore();
  draw();
  });