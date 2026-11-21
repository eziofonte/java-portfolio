const toast = document.getElementById('toast');
const lines = ["You're goddamn right.", "Heisenberg approves.", "Compiling... 99.1% pure.", "No half measures."];
let i = 0, timer;
document.getElementById('say-name').addEventListener('click', () => {
  toast.textContent = lines[i++ % lines.length].replace('goddamn ', '');
  toast.classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => toast.classList.remove('show'), 2200);
});

/* ---------- CRT contact TV ---------- */
(function () {
  const screen = document.getElementById('crtScreen');
  if (!screen) return;
  const $ = id => document.getElementById(id);
  const vid = $('crtVideo'), stat = $('crtStatic'), osd = $('crtOsd'), led = $('powerLed'), dialog = $('contactDialog');
  const themes = [
    { ch: 'CH-03 VIDEO',  bg: 'radial-gradient(ellipse at 50% 45%, #1E47CC 0%, #112B8A 58%, #071347 100%)', glow: 'rgba(28,78,224,.25)' },
    { ch: 'CH-04 MATRIX', bg: 'radial-gradient(ellipse at 50% 45%, #0F765B 0%, #084736 58%, #031F17 100%)', glow: 'rgba(16,185,129,.25)' },
    { ch: 'CH-05 STUDIO', bg: 'radial-gradient(ellipse at 50% 45%, #991B1B 0%, #5C0D0D 58%, #260404 100%)', glow: 'rgba(239,68,68,.25)' },
    { ch: 'CH-06 MEME TV', bg: '#000', glow: 'rgba(255,255,255,.14)', video: true }
  ];
  let t = 0, on = true, osdTimer;

  function showOsd(left, right, ms) {
    $('osdLeft').textContent = left; $('osdRight').textContent = right || 'PLAY \u25BA';
    osd.style.opacity = '1'; clearTimeout(osdTimer);
    osdTimer = setTimeout(() => osd.style.opacity = '0', ms || 2200);
  }
  function switchChannel(next) {
    if (!on) return;
    stat.classList.add('active');
    setTimeout(() => {
      t = next % themes.length;
      screen.style.background = themes[t].bg;
      screen.style.boxShadow = 'inset 0 0 45px rgba(0,0,0,.85), inset 0 0 12px rgba(0,0,0,.95), 0 0 28px ' + themes[t].glow;
      const isVid = !!themes[t].video;
      screen.classList.toggle('video-on', isVid);
      if (isVid) {
        vid.currentTime = 0; vid.muted = false;
        const pr = vid.play();
        if (pr) pr.catch(() => { vid.muted = true; vid.play(); showOsd('PRESS MUTE FOR SOUND', 'MUTED', 3000); });
        showOsd(themes[t].ch, vid.muted ? 'MUTED' : 'VOL \u25AE\u25AE\u25AE\u25AE', 3000);
      } else {
        vid.pause();
        showOsd(themes[t].ch, 'STEREO');
      }
    }, 110);
    setTimeout(() => stat.classList.remove('active'), 230);
  }
  $('muteBtn').addEventListener('click', () => {
    vid.muted = !vid.muted;
    $('muteBtn').textContent = vid.muted ? 'UNMUTE' : 'MUTE';
    showOsd(themes[t].ch, vid.muted ? 'MUTED' : 'VOL \u25AE\u25AE\u25AE\u25AE', 1800);
  });
  $('chBtn').addEventListener('click', () => switchChannel(t + 1));
  $('powerBtn').addEventListener('click', () => {
    on = !on;
    screen.classList.toggle('tv-off', !on);
    led.classList.toggle('off', !on);
    if (!on) vid.pause();
    if (on) switchChannel(t);
  });

  $('callBtn').addEventListener('click', () => {
    if (!on) return;
    showOsd('DIALING...', '1-800', 1800);
    setTimeout(() => { dialog.showModal(); }, 280);
  });
  $('closeDialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  if (dialog.dataset.open === 'true') dialog.showModal();

  $('copyEmail').addEventListener('click', () => {
    const text = $('copyEmail').textContent.trim();
    const done = () => showOsd('COPIED TO CLIPBOARD', 'OK \u2713', 2600);
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => showOsd('EMAIL: ' + text, 'READY', 2800));
    else showOsd('EMAIL: ' + text, 'READY', 2800);
  });
})();

/* ---------- girlfriend photo album: slideshow + hover animation ---------- */
(function () {
  const root = document.getElementById('album');
  if (!root) return;
  const card = root.querySelector('.album-card');
  const dotsBox = document.getElementById('albumDots');
  const prev = root.querySelector('.prev'), next = root.querySelector('.next');
  const toggle = root.querySelector('.toggle'), like = root.querySelector('.like');
  const slides = () => [...root.querySelectorAll('.album-slide')];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0, timer, paused = false, hovering = false, x0 = null;
  const liked = new Set();

  function show(n) {
    const s = slides(); if (!s.length) return;
    i = (n + s.length) % s.length;
    s.forEach((el, k) => el.classList.toggle('active', k === i));
    [...dotsBox.children].forEach((d, k) => d.classList.toggle('on', k === i));
    like.classList.toggle('on', liked.has(i));
  }
  function restart() {
    clearInterval(timer);
    if (slides().length > 1 && !paused && !hovering && !calm) timer = setInterval(() => show(i + 1), 4200);
  }
  function build() {
    const s = slides();
    dotsBox.innerHTML = '';
    s.forEach((img, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Photo ' + (k + 1));
      b.addEventListener('click', () => { show(k); restart(); });
      dotsBox.appendChild(b);
    });
    const multi = s.length > 1;
    dotsBox.hidden = !multi; prev.hidden = next.hidden = toggle.hidden = !multi;
    show(Math.min(i, Math.max(s.length - 1, 0)));
    restart();
  }

  prev.addEventListener('click', () => { show(i - 1); restart(); });
  next.addEventListener('click', () => { show(i + 1); restart(); });
  toggle.addEventListener('click', () => {
    paused = !paused;
    toggle.innerHTML = paused ? '&#9654;' : '&#10074;&#10074;';
    toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    restart();
  });
  like.addEventListener('click', () => {
    liked.has(i) ? liked.delete(i) : liked.add(i);
    like.classList.toggle('on', liked.has(i));
    like.classList.remove('pop'); void like.offsetWidth; like.classList.add('pop');
  });

  // tilt toward the cursor, light follows the mouse
  card.addEventListener('mouseenter', () => { hovering = true; restart(); });
  card.addEventListener('mousemove', e => {
    if (calm) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.classList.add('hovering');
    card.style.setProperty('--ry', ((px - 0.5) * 14).toFixed(2) + 'deg');
    card.style.setProperty('--rx', ((0.5 - py) * 14).toFixed(2) + 'deg');
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    card.style.setProperty('--sc', '1.03');
  });
  card.addEventListener('mouseleave', () => {
    hovering = false; restart();
    card.classList.remove('hovering');
    ['--rx', '--ry', '--sc'].forEach(v => card.style.removeProperty(v));
  });

  card.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  card.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { show(i + (dx < 0 ? 1 : -1)); restart(); }
    x0 = null;
  });
  slides().forEach(img => img.addEventListener('error', () => { img.remove(); build(); }));
  build();
})();
