/* Alastair arcade - sound effects + visual flourishes.
   Sounds are synthesized with the Web Audio API, so no audio files are required.
   Optional: drop real files into /alastair/sounds/ (victory.mp3, tota-tola.mp3, lose.mp3)
   and they will be used automatically instead of the built-in jingles. */
(() => {
  const MUTE_KEY = 'alastair:muted';
  let muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch {}

  let ctx = null;
  let noiseBuf = null;
  const lastPlayed = {};

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  // Create the audio context during the first real gesture so later sounds are allowed.
  ['pointerdown', 'keydown'].forEach(type =>
    document.addEventListener(type, () => audio(), { once: true, capture: true }));

  function tone({ freq = 440, to = null, dur = 0.15, type = 'sine', vol = 0.15, delay = 0 }) {
    if (muted) return;
    const c = audio();
    if (!c) return;
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  function noise({ dur = 0.2, vol = 0.12, delay = 0, f0 = 1000, f1 = 1000, type = 'bandpass', q = 1 }) {
    if (muted) return;
    const c = audio();
    if (!c) return;

    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }

    const t = c.currentTime + delay;
    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();

    src.buffer = noiseBuf;
    src.loop = true;
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) filter.frequency.exponentialRampToValueAtTime(f1, t + dur);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(filter).connect(gain).connect(c.destination);
    src.start(t);
    src.stop(t + dur + 0.03);
  }

  const arpeggio = (notes, step, opts) =>
    notes.forEach((freq, i) => tone({ ...opts, freq, delay: i * step }));

  const sounds = {
    click:   () => tone({ freq: 720, to: 480, dur: 0.05, type: 'square', vol: 0.03 }),
    hover:   () => tone({ freq: 900, dur: 0.03, vol: 0.015 }),
    pop:     () => tone({ freq: 520, to: 900, dur: 0.09, vol: 0.09 }),
    open:    () => noise({ dur: 0.28, vol: 0.1, f0: 300, f1: 2600, q: 0.8 }),
    beep:    () => tone({ freq: 660, dur: 0.14, type: 'square', vol: 0.06 }),
    go:      () => {
      tone({ freq: 880, dur: 0.35, type: 'square', vol: 0.07 });
      tone({ freq: 1320, dur: 0.35, type: 'square', vol: 0.04, delay: 0.04 });
    },
    shoot:   () => noise({ dur: 0.18, vol: 0.07, f0: 500, f1: 1800 }),
    swish:   () => {
      noise({ dur: 0.4, vol: 0.18, f0: 4500, f1: 1800, q: 0.6 });
      tone({ freq: 1200, to: 800, dur: 0.08, vol: 0.04 });
    },
    rim:     () => {
      tone({ freq: 950, to: 620, dur: 0.14, type: 'triangle', vol: 0.14 });
      tone({ freq: 1900, to: 1300, dur: 0.1, vol: 0.04 });
    },
    board:   () => tone({ freq: 240, to: 140, dur: 0.12, type: 'triangle', vol: 0.18 }),
    bounce:  () => tone({ freq: 170, to: 80, dur: 0.12, vol: 0.2 }),
    miss:    () => tone({ freq: 320, to: 160, dur: 0.28, type: 'sawtooth', vol: 0.045 }),
    sparkle: () => arpeggio([1046.5, 1318.5, 1568, 2093], 0.07, { dur: 0.25, vol: 0.08 }),
    unlock:  () => arpeggio([784, 988, 1175, 1568], 0.08, { dur: 0.3, vol: 0.08, type: 'triangle' }),
    win:     () => {
      arpeggio([523.25, 659.25, 783.99, 1046.5], 0.1, { dur: 0.3, vol: 0.12, type: 'triangle' });
      [523.25, 659.25, 783.99, 1046.5].forEach(freq =>
        tone({ freq, dur: 0.8, vol: 0.06, type: 'triangle', delay: 0.45 }));
    },
    tota:    () => {
      [400, 520, 680].forEach((freq, i) =>
        tone({ freq, to: freq * 1.8, dur: 0.1, vol: 0.1, delay: i * 0.12 }));
      setTimeout(() => sounds.win(), 360);
    },
    lose:    () => {
      tone({ freq: 392, to: 330, dur: 0.3, type: 'sawtooth', vol: 0.07 });
      tone({ freq: 330, to: 220, dur: 0.45, type: 'sawtooth', vol: 0.07, delay: 0.3 });
    },
    tie:     () => {
      tone({ freq: 440, dur: 0.18, type: 'square', vol: 0.05 });
      tone({ freq: 440, dur: 0.25, type: 'square', vol: 0.05, delay: 0.24 });
    }
  };

  function play(name) {
    if (muted || !sounds[name]) return;
    const now = performance.now();
    if (now - (lastPlayed[name] || 0) < 45) return;   // avoid machine-gun repeats
    lastPlayed[name] = now;
    try { sounds[name](); } catch {}
  }

  // Play a real audio file; if it is missing or fails to load, use the built-in sound instead.
  function file(src, fallbackName, volume = 0.8) {
    if (muted) return;
    let usedFallback = false;
    const fallback = () => {
      if (usedFallback) return;
      usedFallback = true;
      play(fallbackName);
    };

    const sound = new Audio(src);
    sound.volume = volume;
    sound.addEventListener('error', fallback);
    sound.play().catch(error => {
      if (error && error.name !== 'NotAllowedError' && error.name !== 'AbortError') fallback();
    });
  }

  // ---------- confetti ----------
  function confetti(count = 70) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:2100';
    const colors = ['#ffd700', '#ff4655', '#17c3b2', '#7aa2ff', '#b1e878', '#ff8a2b', '#e2d2ff'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('i');
      const size = 6 + Math.random() * 8;
      piece.style.cssText =
        `position:absolute;left:${Math.random() * 100}%;top:-14px;width:${size}px;` +
        `height:${size * 0.6}px;background:${colors[i % colors.length]};border-radius:2px`;
      box.appendChild(piece);

      const drift = (Math.random() - 0.5) * 260;
      piece.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          { transform: `translate(${drift}px, ${window.innerHeight + 40}px) rotate(${Math.random() * 720 - 360}deg)`, opacity: 1 }
        ],
        { duration: 1800 + Math.random() * 1400, delay: Math.random() * 400, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }
      );
    }

    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3800);
  }

  // ---------- mute toggle ----------
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.id = 'sound-toggle';
  toggle.className = 'sound-toggle';

  function renderToggle() {
    toggle.textContent = muted ? '🔇' : '🔊';
    toggle.setAttribute('aria-pressed', String(!muted));
    toggle.setAttribute('aria-label', muted ? 'Turn sound effects on' : 'Turn sound effects off');
    toggle.title = muted ? 'Sound effects: off' : 'Sound effects: on';
  }

  toggle.addEventListener('click', () => {
    muted = !muted;
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch {}
    renderToggle();
    if (!muted) play('pop');
  });

  renderToggle();
  document.body.appendChild(toggle);

  // ---------- automatic sounds ----------
  // Tick on buttons, cards and links (radio labels play their own "pop").
  document.addEventListener('click', event => {
    const target = event.target.closest('button, .game-card, a[href], [role="button"]');
    if (!target || target.id === 'sound-toggle') return;
    play('click');
  }, true);

  // Quiet tick when the mouse moves onto a game card.
  document.addEventListener('pointerover', event => {
    if (event.pointerType !== 'mouse') return;
    const card = event.target.closest('.game-card');
    if (card && !card.contains(event.relatedTarget)) play('hover');
  });

  // Whoosh whenever a game window or reward page opens.
  const wasShown = new WeakMap();
  const isShown = el => getComputedStyle(el).display !== 'none';
  const watcher = new MutationObserver(records => {
    records.forEach(({ target }) => {
      const now = isShown(target);
      if (now && !wasShown.get(target)) play('open');
      wasShown.set(target, now);
    });
  });
  document.querySelectorAll('.modal').forEach(modal => {
    wasShown.set(modal, isShown(modal));
    watcher.observe(modal, { attributes: true, attributeFilter: ['style'] });
  });

  window.SFX = { play, file, isMuted: () => muted };
  window.FX = { confetti };
})();