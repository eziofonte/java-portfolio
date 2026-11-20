document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const victoryButton = document.getElementById('victory-btn');

  const contentIds = {
    game1: 'content-about',
    game2: 'content-achievements',
    game3: 'content-favorites',
    game4: 'content-skills',
    game5: 'content-fun-facts'
  };

  const unlocked = new Set();
  const gameLoops = new Set();
  let toastTimer;
  let echoNumbers = [];
  let selectedEcho = null;

  function setDarkMode(enabled) {
    document.body.classList.toggle('dark-mode', enabled);
    themeToggle.setAttribute('aria-pressed', String(enabled));
  }

  try {
    setDarkMode(localStorage.getItem('theme') === 'dark');
  } catch {}

  themeToggle.addEventListener('click', () => {
    const enabled = themeToggle.getAttribute('aria-pressed') !== 'true';
    setDarkMode(enabled);
    try {
      localStorage.setItem('theme', enabled ? 'dark' : 'light');
    } catch {}
  });

  document.querySelectorAll('.avatar-frame img').forEach(image => {
    const showImage = () => {
      image.hidden = false;
    };
    if (image.naturalWidth > 0) showImage();
    else image.addEventListener('load', showImage, { once: true });
  });

  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => openGame(card.dataset.game));
  });

  document.querySelectorAll('[data-close="true"]').forEach(button => {
    button.addEventListener('click', closeModal);
  });

  document.querySelectorAll('[data-win]').forEach(button => {
    button.addEventListener('click', () => endGame(button.dataset.win, 'win'));
  });

    setupGodmode(() => {
    Object.keys(contentIds).forEach(unlockGame);
  });

  victoryButton.addEventListener('click', closeVictory);

  function openGame(gameId) {
    if (unlocked.has(gameId)) {
      document.getElementById(contentIds[gameId]).style.display = 'flex';
      return;
    }

    startCountdown(() => {
      document.getElementById(gameId).style.display = 'flex';
      if (gameId === 'game1') initEchoSort();
      if (gameId === 'game2') initEggHunt();
      if (gameId === 'game3') initTicTacToe();
      if (gameId === 'game4') initCatcher();
    });
  }

  function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });

    gameLoops.forEach(timer => clearInterval(timer));
    gameLoops.clear();
  }

  function startCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    let count = 3;

    overlay.style.display = 'flex';
    text.textContent = count;

    const timer = setInterval(() => {
      count--;

      if (count >= 0) {
        text.textContent = count === 0 ? 'GO!' : count;
        return;
      }

      clearInterval(timer);
      overlay.style.display = 'none';
      callback();
    }, 800);
  }
  try {
    document.querySelectorAll('.game-card[data-game]').forEach(card => {
      const gameId = card.dataset.game;

      if (localStorage.getItem(`alastair:unlocked:${gameId}`) === '1') {
        unlockGame(gameId);
      }
    });
  } catch {}
  function unlockGame(gameId) {
    unlocked.add(gameId);
    document.querySelector(`.game-card[data-game="${gameId}"]`).classList.remove('is-locked');
  }

  function showToast() {
    const toast = document.getElementById('minecraft-toast');
    const text = document.getElementById('toast-desc');

    text.textContent = unlocked.size === 5
      ? 'GOATED INFO COMPLETE!'
      : `GOATED INFO ${unlocked.size}/5 UNLOCKED`;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  function endGame(gameId, outcome) {
    closeModal();

    const overlay = document.getElementById('victory-overlay');
    const text = document.getElementById('victory-text');
    const lossMessages = {
      game2: 'TOO SLOW!',
      game3: 'DEFEATED.',
      game4: 'TIME IS UP!'
    };

    text.className = '';

    if (outcome === 'win') {
      if (gameId === 'game4') {
        text.innerHTML = '<span class="coke-font">TOTA TOLA!</span>';
      } else {
        text.textContent = 'VICTORY!';
      }
      victoryButton.textContent = 'Collect Reward';
    } else {
      text.textContent = outcome === 'tie' ? 'STALEMATE!' : lossMessages[gameId];
      text.classList.add(outcome === 'tie' ? 'tie-text' : 'lose-text');
      victoryButton.textContent = 'Try Again';
    }

    overlay.dataset.currentGame = gameId;
    overlay.dataset.outcome = outcome;
    overlay.style.display = 'flex';
  }

  function closeVictory() {
  const overlay = document.getElementById('victory-overlay');
  const gameId = overlay.dataset.currentGame;
  overlay.style.display = 'none';

  if (overlay.dataset.outcome !== 'win') {
    openGame(gameId);
    return;
  }

  unlockGame(gameId);

  try {
    localStorage.setItem(`alastair:unlocked:${gameId}`, '1');
  } catch {}

  showToast();
}

  /* Game 1: Echo Echo Sort */
  function initEchoSort() {
    echoNumbers = [1, 2, 3, 4, 5, 6];
    do {
      echoNumbers.sort(() => Math.random() - 0.5);
    } while (echoNumbers.every((number, index) => number === index + 1));

    selectedEcho = null;
    renderEchoTiles();
  }

  function renderEchoTiles() {
    const container = document.getElementById('echo-container');
    container.replaceChildren();

    echoNumbers.forEach((number, index) => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'echo-clone';
      tile.classList.toggle('selected', selectedEcho === index);
      tile.setAttribute('aria-pressed', String(selectedEcho === index));

      tile.innerHTML = `
        <span class="echo-body">
          <img src="/alastair/images/echo.png" class="echo-img" alt="">
          <span class="echo-number">${number}</span>
        </span>`;

      tile.addEventListener('click', () => selectEcho(index));
      container.appendChild(tile);
    });
  }

  function selectEcho(index) {
    if (selectedEcho === null) {
      selectedEcho = index;
    } else {
      if (Math.abs(selectedEcho - index) === 1) {
        const previous = echoNumbers[selectedEcho];
        echoNumbers[selectedEcho] = echoNumbers[index];
        echoNumbers[index] = previous;
      }

      selectedEcho = null;

      if (echoNumbers.every((number, position) => number === position + 1)) {
        endGame('game1', 'win');
      }
    }

    renderEchoTiles();
  }

  /* Game 2: Yoshi Egg Hunt */
  function initEggHunt() {
    const arena = document.getElementById('yoshi-arena');
    const scoreText = document.getElementById('game2-score');
    const timeText = document.getElementById('game2-time');

    arena.innerHTML = `
      <div class="tongue" id="yoshi-tongue"></div>
      <img src="/alastair/images/yoshi.png" class="yoshi-img" alt="Yoshi">`;

    let score = 0;
    let time = 30;
    scoreText.textContent = score;
    timeText.textContent = time;

    gameLoops.add(setInterval(() => {
      time--;
      timeText.textContent = time;
      if (time <= 0) endGame('game2', 'lose');
    }, 1000));

    gameLoops.add(setInterval(() => {
      const isBomb = Math.random() < 0.25;
      const item = document.createElement('div');
      item.className = 'falling-item';
      item.textContent = isBomb ? '💣' : '🥚';
      item.style.left = `${Math.random() * 80 + 10}%`;
      item.style.top = '-50px';
      arena.appendChild(item);

      let top = -50;
      const animation = setInterval(() => {
        top += 4;
        item.style.top = `${top}px`;
        if (top > arena.clientHeight) removeItem();
      }, 20);

      function removeItem() {
        clearInterval(animation);
        gameLoops.delete(animation);
        item.remove();
      }

      gameLoops.add(animation);
      item.addEventListener('click', () => {
        shootTongue(arena, item);
        removeItem();
        score = isBomb ? Math.max(0, score - 1) : score + 1;
        scoreText.textContent = score;
        if (score >= 10) endGame('game2', 'win');
      });
    }, 700));
  }

  function shootTongue(arena, target) {
    const tongue = arena.querySelector('.tongue');
    const targetRect = target.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();
    const targetX = targetRect.left - arenaRect.left + targetRect.width / 2;
    const targetY = targetRect.top - arenaRect.top + targetRect.height / 2;
    const yoshiX = arenaRect.width / 2;
    const yoshiY = arenaRect.height - 80;
    const distance = Math.hypot(targetX - yoshiX, targetY - yoshiY);
    const angle = Math.atan2(targetY - yoshiY, targetX - yoshiX);

    tongue.style.display = 'block';
    tongue.style.left = `${yoshiX}px`;
    tongue.style.top = `${yoshiY}px`;
    tongue.style.width = `${distance}px`;
    tongue.style.transform = `rotate(${angle}rad)`;

    setTimeout(() => {
      tongue.style.display = 'none';
    }, 150);
  }

  /* Game 3: Tic Tac Toe */
  function initTicTacToe() {
    const board = document.getElementById('ttt-board');
    const status = document.getElementById('game3-status');
    const state = Array(9).fill(null);
    let finished = false;

    board.replaceChildren();
    status.textContent = 'Your Turn (X)';

    function finishTurn(player) {
      if (checkTicTacToeWin(state, player)) {
        finished = true;
        status.textContent = player === 'X' ? 'You Win!' : 'Bot Wins!';
        endGame('game3', player === 'X' ? 'win' : 'lose');
      } else if (!state.includes(null)) {
        finished = true;
        status.textContent = 'Draw!';
        endGame('game3', 'tie');
      }
      return finished;
    }

    for (let index = 0; index < 9; index++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'ttt-cell';
      cell.setAttribute('aria-label', `Square ${index + 1}`);

      cell.addEventListener('click', () => {
        if (finished || state[index]) return;

        state[index] = 'X';
        cell.textContent = 'X';
        cell.classList.add('x');
        cell.setAttribute('aria-label', `Square ${index + 1}: X`);
        if (finishTurn('X')) return;

        const empty = state
          .map((value, position) => value === null ? position : -1)
          .filter(position => position >= 0);
        const botMove = empty[Math.floor(Math.random() * empty.length)];
        const botCell = board.children[botMove];

        state[botMove] = 'O';
        botCell.textContent = 'O';
        botCell.classList.add('o');
        botCell.setAttribute('aria-label', `Square ${botMove + 1}: O`);
        finishTurn('O');
      });

      board.appendChild(cell);
    }
  }

  function checkTicTacToeWin(state, player) {
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    return winningLines.some(line => line.every(index => state[index] === player));
  }

  /* Game 4: Tota Tola Catcher */
  function initCatcher() {
    const arena = document.getElementById('pinoy-arena');
    const scoreText = document.getElementById('game4-score');
    const timeText = document.getElementById('game4-time');

    arena.innerHTML = '<div id="pinoy-catcher"></div>';
    const catcher = arena.querySelector('#pinoy-catcher');

    let score = 0;
    let time = 30;
    scoreText.textContent = score;
    timeText.textContent = time;

    arena.onpointermove = event => {
      const rect = arena.getBoundingClientRect();
      const maxX = arena.clientWidth - catcher.offsetWidth;
      const x = Math.max(0, Math.min(event.clientX - rect.left, maxX));
      catcher.style.left = `${x}px`;
    };

    gameLoops.add(setInterval(() => {
      time--;
      timeText.textContent = time;
      if (time <= 0) endGame('game4', 'lose');
    }, 1000));

    gameLoops.add(setInterval(() => {
      const isRock = Math.random() < 0.25;
      const item = document.createElement('div');
      item.className = isRock ? 'falling-rock' : 'falling-coke';
      if (!isRock) item.textContent = 'Coke';
      item.style.left = `${Math.random() * Math.max(0, arena.clientWidth - 70)}px`;
      item.style.top = '-70px';
      arena.appendChild(item);

      let top = -70;
      const animation = setInterval(() => {
        top += 6;
        item.style.top = `${top}px`;

        const itemRect = item.getBoundingClientRect();
        const catcherRect = catcher.getBoundingClientRect();
        const hit = itemRect.left < catcherRect.right - 20
          && itemRect.right > catcherRect.left + 20
          && itemRect.bottom > catcherRect.top
          && itemRect.top < catcherRect.top + 100;

        if (hit) {
          removeItem();
          score = isRock ? Math.max(0, score - 1) : score + 1;
          scoreText.textContent = score;
          if (score >= 10) endGame('game4', 'win');
        } else if (top > arena.clientHeight) {
          removeItem();
        }
      }, 20);

      function removeItem() {
        clearInterval(animation);
        gameLoops.delete(animation);
        item.remove();
      }

      gameLoops.add(animation);
    }, 600));
  }

  /* About Me: unit selectors and profile switch */
  const about = document.getElementById('content-about');
  const cord = document.getElementById('about-cord');
  const loading = document.getElementById('about-loading');
  const portrait = about.querySelector('.about-portrait');
  const heightUnit = document.getElementById('height-unit');
  const weightUnit = document.getElementById('weight-unit');

  const profiles = [
    {
      name: 'Alastair Nichole A. Crucillo',
      birthday: 'September 18, 2005',
      age: '21',
      height: 174,
      weight: 70,
      personality: 'Matikas lang',
     photo: 'about-alastair.png'
    },
    {
      name: 'Dwight Ramos',
      birthday: 'September 2, 1998',
      age: '28 (as of November 2026)',
      height: 193,
      weight: 95,
      personality: 'Chill, humble, soft-spoken',
      photo: 'dwight.png'
    }
  ];

  let currentProfile = 0;
  let pullStart = null;
  let switching = false;

  function updateUnits() {
    const { height, weight } = profiles[currentProfile];
    const inches = Math.round(height / 2.54);

    const heights = {
      cm: `${height} cm`,
      m: `${(height / 100).toFixed(2)} m`,
      ft: `${Math.floor(inches / 12)}′ ${inches % 12}″`
    };

    const weights = {
      kg: `${weight} kg`,
      lb: `${Math.round(weight / 0.45359237)} lb`,
      st: `${(weight / 6.35029318).toFixed(2)} st`
    };

    document.getElementById('about-height').textContent = heights[heightUnit.value];
    document.getElementById('about-weight').textContent = weights[weightUnit.value];
  }

  heightUnit.addEventListener('change', updateUnits);
  weightUnit.addEventListener('change', updateUnits);

  cord.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || switching) return;
    pullStart = event.clientY;
    cord.setPointerCapture(event.pointerId);
  });

  cord.addEventListener('pointermove', event => {
    if (pullStart === null || !cord.hasPointerCapture(event.pointerId)) return;
    const distance = Math.max(0, Math.min(60, event.clientY - pullStart));
    cord.style.setProperty('--pull', `${distance}px`);
  });

  cord.addEventListener('lostpointercapture', () => {
    pullStart = null;
    cord.style.removeProperty('--pull');
  });

  cord.addEventListener('click', () => {
    if (switching) return;

    switching = true;
    loading.textContent = currentProfile === 0 ? 'Loading real info…' : 'Loading your profile…';
    loading.hidden = false;

    setTimeout(() => {
      currentProfile = 1 - currentProfile;
      const profile = profiles[currentProfile];
      const isAlternate = currentProfile === 1;

      about.dataset.profile = isAlternate ? 'alternate' : 'original';
      about.querySelector('.about-label').textContent = isAlternate ? 'Real Profile' : 'About Me';
      document.getElementById('about-title').textContent =
  profile === profiles[0] ? 'Alastair Crucillo' : profile.name;
      document.getElementById('about-name').textContent = profile.name;
      document.getElementById('about-birthday').textContent = profile.birthday;
      document.getElementById('about-age').textContent = profile.age;
      document.getElementById('about-personality').textContent = profile.personality;
      portrait.src = `/alastair/images/${profile.photo}`;
      portrait.alt = profile.name;
      cord.setAttribute('aria-pressed', String(isAlternate));
      updateUnits();

      loading.hidden = true;
      switching = false;
    }, 650);
  });
});
function createOtpInput(container, { length = 6, onChange, onComplete, validate } = {}) {
  const row = document.createElement('div');
  row.className = 'otp-row';
  row.style.setProperty('--otp-length', length);
  row.setAttribute('role', 'group');
  row.setAttribute('aria-label', 'One-time verification code');

  const status = document.createElement('div');
  status.className = 'otp-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const cells = Array.from({ length }, (_, index) => {
    const cell = document.createElement('input');
    cell.className = 'otp-cell';
    cell.type = 'text';
    cell.inputMode = 'numeric';
    cell.maxLength = 1;
    cell.autocomplete = 'one-time-code';
    cell.placeholder = ' ';
    cell.tabIndex = index === 0 ? 0 : -1;
    cell.setAttribute('aria-label', `Digit ${index + 1}`);
    row.append(cell);
    return cell;
  });

  container.replaceChildren(row, status);

  let revision = 0;
  const digitsOnly = value => String(value).replace(/\D/g, '');
  const getValue = () => cells.map(cell => cell.value).join('');

  function focusCell(index) {
    const position = Math.max(0, Math.min(length - 1, index));
    cells[position].focus();
  }

  function showState(state, message = '') {
    row.classList.remove('otp-error', 'otp-success');
    if (state === 'error') void row.offsetWidth;
    if (state) row.classList.add(`otp-${state}`);

    status.textContent = message;

    cells.forEach(cell => {
      cell.readOnly = state === 'success';
      cell.setAttribute('aria-invalid', String(state === 'error'));
    });
  }

  async function update() {
    const version = ++revision;
    showState('');

    const code = getValue();
    onChange?.(code);
    if (code.length !== length || version !== revision) return;

    onComplete?.(code);
    if (!validate || version !== revision) return;

    let valid;
    try {
      valid = await validate(code);
    } catch {
      valid = false;
    }

    if (version !== revision) return;

    if (valid) {
      showState('success', 'Verified');
    } else {
      showState('error', 'Invalid code, try again');
    }
  }

  cells.forEach((cell, index) => {
    cell.addEventListener('focus', () => {
      cells.forEach((input, position) => {
        input.tabIndex = position === index ? 0 : -1;
      });
      cell.select();
    });

    cell.addEventListener('beforeinput', event => {
      if (event.data && !digitsOnly(event.data)) event.preventDefault();
    });

    cell.addEventListener('input', () => {
      cell.value = digitsOnly(cell.value).slice(0, 1);

      if (cell.value) {
        const nextEmpty = cells.findIndex((input, position) => position > index && !input.value);
        focusCell(nextEmpty < 0 ? index + 1 : nextEmpty);
      }

      void update();
    });

    cell.addEventListener('keydown', event => {
      const { key } = event;

      if (key === 'ArrowLeft') {
        focusCell(index - 1);
      } else if (key === 'ArrowRight') {
        focusCell(index + 1);
      } else if (key === 'Home') {
        focusCell(0);
      } else if (key === 'End') {
        focusCell(Math.max(0, cells.findLastIndex(input => input.value)));
      } else if (!cell.readOnly && (key === 'Backspace' || key === 'Delete')) {
        const target = key === 'Backspace' && !cell.value
          ? Math.max(0, index - 1)
          : index;

        cells[target].value = '';
        focusCell(target);
        void update();
      } else {
        return;
      }

      event.preventDefault();
    });
  });

  container.addEventListener('paste', event => {
    event.preventDefault();
    if (cells[0].readOnly) return;

    const start = Math.max(0, cells.indexOf(document.activeElement));
    const digits = digitsOnly(event.clipboardData?.getData('text') ?? '')
      .slice(0, length - start);

    if (!digits) return;

    for (let offset = 0; offset < digits.length; offset++) {
      cells[start + offset].value = digits[offset];
    }

    focusCell(start + digits.length);
    void update();
  });

  function setValue(value) {
    const digits = digitsOnly(value).slice(0, length);

    cells.forEach((cell, index) => {
      cell.value = digits[index] ?? '';
    });

    void update();
  }

  function reset() {
    setValue('');
    cells.forEach((cell, index) => {
      cell.tabIndex = index === 0 ? 0 : -1;
    });
  }

  return {
    getValue,
    setValue,
    clear: reset,
    reset,
    focus: () => focusCell(0),

    setError(message = 'Invalid code, try again') {
      revision++;
      showState('error', message);
    },

    setSuccess(message = 'Verified') {
      revision++;
      showState('success', message);
    }
  };
}

function setupGodmode(unlockAll) {
  const button = document.getElementById('unlock-all-btn');
  const dialog = document.getElementById('godmode-dialog');
  const demoActions = document.getElementById('otp-demo-actions');
  const demo = new URLSearchParams(location.search).get('otp-demo') === '1';
  const expected = demo ? '123456' : '061916';

  let unlockTimer;

  const otp = createOtpInput(document.getElementById('godmode-otp'), {
    length: 6,
    validate(code) {
      const match = code === expected;

      if (match && !demo) {
        unlockTimer = setTimeout(() => {
          if (!dialog.open) return;
          unlockAll();
          dialog.close();
        }, 500);
      }

      return match;
    }
  });

  button.addEventListener('click', () => {
    clearTimeout(unlockTimer);
    otp.reset();
    dialog.showModal();
    otp.focus();
  });

  dialog.addEventListener('close', () => clearTimeout(unlockTimer));

  if (demo) {
    demoActions.hidden = false;
    document.getElementById('godmode-hint').textContent = 'Demo PIN: 123456';

    demoActions.querySelector('[data-demo="valid"]').onclick = () => otp.setValue('123456');
    demoActions.querySelector('[data-demo="invalid"]').onclick = () => otp.setValue('000000');
    demoActions.querySelector('[data-demo="clear"]').onclick = () => {
      otp.clear();
      otp.focus();
    };
  }
}