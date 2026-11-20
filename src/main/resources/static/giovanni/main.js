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
  const stat = $('crtStatic'), osd = $('crtOsd'), led = $('powerLed'), dialog = $('contactDialog');
  const themes = [
    { ch: 'CH-03 VIDEO',  bg: 'radial-gradient(ellipse at 50% 45%, #1E47CC 0%, #112B8A 58%, #071347 100%)', glow: 'rgba(28,78,224,.25)' },
    { ch: 'CH-04 MATRIX', bg: 'radial-gradient(ellipse at 50% 45%, #0F765B 0%, #084736 58%, #031F17 100%)', glow: 'rgba(16,185,129,.25)' },
    { ch: 'CH-05 STUDIO', bg: 'radial-gradient(ellipse at 50% 45%, #991B1B 0%, #5C0D0D 58%, #260404 100%)', glow: 'rgba(239,68,68,.25)' }
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
      showOsd(themes[t].ch, 'STEREO');
    }, 110);
    setTimeout(() => stat.classList.remove('active'), 230);
  }
  $('chBtn').addEventListener('click', () => switchChannel(t + 1));
  $('powerBtn').addEventListener('click', () => {
    on = !on;
    screen.classList.toggle('tv-off', !on);
    led.classList.toggle('off', !on);
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
