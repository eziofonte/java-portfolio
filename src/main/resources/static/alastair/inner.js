document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('content-favorites');
  if (!page) return;

    // ---- Curry <-> LeBron switch ----
  const playerCard = document.getElementById('favorite-player');
  const playerName = document.getElementById('favorite-player-name');
  const players = {
    curry:  { name: 'Stephen Curry', image: '/alastair/images/curry.jpg' },
    lebron: { name: 'LeBron James',  image: '/alastair/images/lebron.jpg' }
  };

  if (playerCard && playerName) {
    playerCard.addEventListener('click', () => {
      const next = playerCard.dataset.player === 'curry' ? 'lebron' : 'curry';
      playerCard.dataset.player = next;
      playerCard.style.setProperty('--favorite-image', `url('${players[next].image}')`);
      playerName.textContent = players[next].name;
    });
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
let state = 'ready';
let made = 0, attempts = 0;

let shotStreak = 0;
let goldenBallUnlocked = localStorage.getItem('goldenBallUnlocked') === 'true';

let scored = false, touchedRim = false, bounces = 0, flightTime = 0;
  let lastTime = 0, acc = 0;

  const setScore = () => {
  score.textContent = `${made} of ${attempts} made`;

  if (goldenBallUnlocked) {
    score.textContent += ' | Golden Ball Unlocked';
  }
};

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
   ctx.fillStyle = goldenBallUnlocked ? '#ffd700' : '#ff8a2b';
ctx.strokeStyle = goldenBallUnlocked ? '#8a6500' : '#5a2a0a';
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
// ---------- ball controls and animation ----------
function resetBall() {
  ball.x = START.x;
  ball.y = START.y;
  ball.vx = 0;
  ball.vy = 0;

  state = 'ready';
  scored = false;
  touchedRim = false;
  bounces = 0;
  flightTime = 0;
  acc = 0;

  draw();
}

function launch() {
  ball.vx = (START.x - ball.x) * POWER;
  ball.vy = (START.y - ball.y) * POWER;

  attempts++;
  scored = false;
  touchedRim = false;
  bounces = 0;
  flightTime = 0;
  acc = 0;

  state = 'flying';
  result.textContent = 'Shot taken!';

  lastTime = performance.now();
  requestAnimationFrame(loop);
}

function loop(now) {
  if (state !== 'flying') return;

  const elapsed = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  acc += elapsed;
  flightTime += elapsed;

  while (acc >= DT) {
    step(DT);
    acc -= DT;
  }

  draw();

  const outOfCourt =
    ball.x > W + R ||
    ball.x < -R ||
    ball.y > H + R;

  const shotFinished =
    outOfCourt ||
    (bounces >= 2 && Math.abs(ball.vy) < 80) ||
    flightTime > 5;

  if (shotFinished) {
    finishShot();
    return;
  }

  requestAnimationFrame(loop);
}
  // ---------- shot flow ----------
  function finishShot() {
  state = 'resetting';
  if (scored) {
    made++;
    shotStreak++;

    result.textContent = touchedRim
      ? 'Bucket! Rattled in.'
      : 'Swish! Nothing but net.';

    // Secret Easter egg: 3 consecutive shots
    if (shotStreak >= 3 && !goldenBallUnlocked) {
      goldenBallUnlocked = true;
      localStorage.setItem('goldenBallUnlocked', 'true');
    }

  } else {
    shotStreak = 0;
    result.textContent = 'Missed. Pull back and try again.';
  }

  setScore();
  setTimeout(resetBall, 800);
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

    let dx = p.x - START.x;
    let dy = p.y - START.y;

    const len = Math.hypot(dx, dy);

    if (len > MAX_PULL) {
      dx *= MAX_PULL / len;
      dy *= MAX_PULL / len;
    }

    ball.x = Math.max(R, START.x + dx);
    ball.y = Math.min(FLOOR - R - 2, START.y + dy);

    draw();
  }

  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', e => {
    if (state !== 'ready') return;

    e.preventDefault();
    state = 'aiming';

    canvas.setPointerCapture(e.pointerId);

    result.textContent = 'Aim, then let go!';
    aimTo(e);
  });

  canvas.addEventListener('pointermove', e => {
    if (state === 'aiming') {
      e.preventDefault();
      aimTo(e);
    }
  });

  function release(e) {
    if (state !== 'aiming') return;

    e.preventDefault();

    const p = pointerPos(e);
    aimTo(e);

    const pulled = Math.hypot(
      START.x - ball.x,
      START.y - ball.y
    );

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

  document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('favorite-audio');
  const play = document.getElementById('playlist-play');
  if (!audio || !play) return;

  const tracks = [
    { file: 'untitled.mp3', title: 'Untitled', artist: 'Rex Orange County' },
    { file: 'jimmy-cooks.mp3', title: 'Jimmy Cooks', artist: 'Drake' },
    { file: 'chasing-cars.mp3', title: 'Chasing Cars', artist: 'Snow Patrol' },
    { file: 'solo-mission.mp3', title: 'Solo Mission', artist: 'Waiian' },
    { file: '99-percent-swag.mp3', title: '99% Swag', artist: 'Nio' }
  ];

  const list = document.getElementById('favorite-track-list');
  const title = document.getElementById('playlist-title');
  const artist = document.getElementById('playlist-artist');
  const cover = audio.closest('.favorite-playlist').querySelector('.playlist-cover');
  const status = document.getElementById('favorite-track-status');
  let current = 0;

  function playTrack() {
    const requested = current;
    status.textContent = '';

    audio.play().catch(error => {
      if (error.name !== 'AbortError' && requested === current) {
        status.textContent = `Couldn’t play ${tracks[current].title}. Check the audio filename.`;
      }
    });
  }

  const trackButtons = tracks.map((track, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = `${track.title} — ${track.artist}`;
    button.addEventListener('click', () => selectTrack(index, true));

    item.append(button);
    list.append(item);
    return button;
  });

  function selectTrack(index, autoplay) {
    const next = (index + tracks.length) % tracks.length;
    const track = tracks[next];

    if (next !== current || !audio.getAttribute('src')) {
      audio.src = `/alastair/music/${track.file}`;
    }

    current = next;
    title.textContent = track.title;
    artist.textContent = track.artist;
    const coverFile = track.file.replace(/\.mp3$/i, '-cover.jpg');
cover.style.setProperty('--playlist-cover', `url("/alastair/images/${coverFile}")`);
    status.textContent = '';

    trackButtons.forEach((button, position) => {
      button.setAttribute('aria-current', String(position === current));
    });

    if (autoplay) playTrack();
  }

  function updatePlayButton() {
    play.textContent = audio.paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', audio.paused ? 'Play' : 'Pause');
  }

  play.addEventListener('click', () => {
    if (audio.paused) playTrack();
    else audio.pause();
  });

  document.getElementById('playlist-previous').addEventListener('click', () => {
    selectTrack(current - 1, !audio.paused);
  });

  document.getElementById('playlist-next').addEventListener('click', () => {
    selectTrack(current + 1, !audio.paused);
  });

  audio.addEventListener('play', updatePlayButton);
  audio.addEventListener('pause', updatePlayButton);

  audio.addEventListener('ended', () => {
    if (current + 1 < tracks.length) selectTrack(current + 1, true);
    else updatePlayButton();
  });

  document.querySelector('#content-favorites .back-btn').addEventListener('click', () => {
    audio.pause();
  });

  selectTrack(0, false);
});
document.addEventListener('DOMContentLoaded', () => {
  const skillsPage = document.getElementById('content-skills');
  if (!skillsPage) return;

  const tabs = Array.from(skillsPage.querySelectorAll('.val-tab'));
  const domainCards = Array.from(skillsPage.querySelectorAll('.val-agent-card'));
  const rows = Array.from(skillsPage.querySelectorAll('.val-row'));

  const detailCode = document.getElementById('val-detail-code');
  const detailDomain = document.getElementById('val-detail-domain');
  const detailTitle = document.getElementById('val-detail-title');
  const detailTier = document.getElementById('val-detail-tier');
  const detailDesc = document.getElementById('val-detail-desc');

  function selectRow(row) {
    if (!row) return;
    rows.forEach(item => item.classList.toggle('is-selected', item === row));
  }

  function filterSkills(category) {
    tabs.forEach(tab => {
      const active = tab.dataset.valFilter === category;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    domainCards.forEach(card => {
      card.classList.toggle('is-active', card.dataset.valFilter === category);
    });

    let firstVisible = null;
    rows.forEach(row => {
      const match = category === 'all' || row.dataset.category === category;
      row.hidden = !match;
      if (match && !firstVisible) firstVisible = row;
    });

    const current = skillsPage.querySelector('.val-row.is-selected');
    if (!current || current.hidden) selectRow(firstVisible);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => filterSkills(tab.dataset.valFilter)));
  domainCards.forEach(card => {
    card.addEventListener('click', () => {
      const target = card.dataset.valFilter;
      filterSkills(card.classList.contains('is-active') ? 'all' : target);
    });
  });
  rows.forEach(row => {
    row.querySelector('.val-row-btn')?.addEventListener('click', () => selectRow(row));
  });

  filterSkills('all');
});

document.addEventListener('DOMContentLoaded', () => {
  const funFactsPage = document.getElementById('content-fun-facts');
  if (!funFactsPage) return;

  const episodes = [
    {
      title: 'BEST CHEF IN TOWN',
      tag: 'Chef Arc',
      desc: 'Pinaka magaling magluto sa earth.',
      image: '/alastair/images/ff1.jpg'
    },
    {
      title: 'BESTFRIENDS WITH JED',
      tag: 'LOLS',
      desc: 'Friends since day one',
      image: '/alastair/images/ff2.jpg'
    },
    {
      title: 'BEST PROCRASTINATOR',
      tag: 'Clutch Mode',
      desc: 'Starts at 11PM. Finishes at 3AM. Still passes.',
      image: '/alastair/images/ff3.jpg'
    },
    {
      title: 'BASKETBALL ONCE A WEEK',
      tag: 'Hoop Life',
      desc: 'Once a week is enough. Still like Curry.',
      image: '/alastair/images/ff4.jpg'
    },
    {
      title: 'THE PARLAY CURSE',
      tag: 'Bad Beats',
      desc: 'One leg away from being rich. Every. Single. Time.',
      image: '/alastair/images/ff5.jpg'
    },
    {
      title: 'FISHBALL STICK INCIDENT',
      tag: 'Core Memory',
      desc: 'My brother stabbed me with a fishball stick because I would not share my fishball. Was it worth it? The fishball was THAT good. Yes.',
      image: '/alastair/images/ff6.jpg'
    },
    {
      title: 'AMERICAN SITCOMS',
      tag: 'Binge Watch',
      desc: 'The Office. Brooklyn Nine-Nine. Friends. If it has a laugh track, I am watching it. This page is basically my life as a sitcom.',
      image: '/alastair/images/ff7.jpg'
    }
  ];

  const cards = Array.from(funFactsPage.querySelectorAll('.af-episode-card'));
  const featureImage = funFactsPage.querySelector('#af-feature-image');
  const featureTitle = funFactsPage.querySelector('#af-feature-title');
  const featureDesc = funFactsPage.querySelector('#af-feature-desc');
  const featureEpisode = funFactsPage.querySelector('#af-feature-episode');
  const featureTag = funFactsPage.querySelector('#af-feature-tag');

  const watchButton = funFactsPage.querySelector('#af-watch-btn');
  const nextButton = funFactsPage.querySelector('#af-next-btn');

  const imageModal = funFactsPage.querySelector('#af-image-modal');
  const modalImage = funFactsPage.querySelector('#af-modal-image');
  const modalTitle = funFactsPage.querySelector('#af-modal-title');
  const modalDesc = funFactsPage.querySelector('#af-modal-desc');
  const modalEpisode = funFactsPage.querySelector('#af-modal-episode');
  const closeButton = funFactsPage.querySelector('#af-close');

  let currentEpisode = 0;

  function showEpisode(index) {
    currentEpisode = (index + episodes.length) % episodes.length;
    const episode = episodes[currentEpisode];

    featureImage.src = episode.image;
    featureImage.alt = episode.title;
    featureTitle.textContent = episode.title;
    featureDesc.textContent = episode.desc;
    featureEpisode.textContent = `S1 · E${currentEpisode + 1}`;
    if (featureTag) featureTag.textContent = episode.tag;

    cards.forEach((card, cardIndex) => {
      card.classList.toggle('is-active', cardIndex === currentEpisode);
    });
  }

  function openEpisodePreview() {
    const episode = episodes[currentEpisode];

    modalImage.src = episode.image;
    modalImage.alt = episode.title;
    modalTitle.textContent = episode.title;
    modalDesc.textContent = episode.desc;
    modalEpisode.textContent = `SEASON 1 · EPISODE ${currentEpisode + 1}`;

    imageModal.hidden = false;
  }

  function closeEpisodePreview() {
    imageModal.hidden = true;
    modalImage.src = '';
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const episodeIndex = Number(card.dataset.ep);
      if (!Number.isNaN(episodeIndex) && episodes[episodeIndex]) {
        showEpisode(episodeIndex);
      }
    });
  });

  watchButton.addEventListener('click', openEpisodePreview);
  nextButton?.addEventListener('click', () => showEpisode(currentEpisode + 1));
  closeButton.addEventListener('click', closeEpisodePreview);

  imageModal.addEventListener('click', (event) => {
    if (event.target === imageModal) closeEpisodePreview();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !imageModal.hidden) {
      closeEpisodePreview();
    }
  });

  showEpisode(0);
});