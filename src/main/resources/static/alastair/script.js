document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const victoryButton = document.getElementById('victory-btn');

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
  document.querySelectorAll('.avatar-frame img, .robux-balance img').forEach(image => {
    const showPortrait = () => {
      image.hidden = false;
    };

    if (image.naturalWidth > 0) {
      showPortrait();
    } else {
      image.addEventListener('load', showPortrait, { once: true });
    }
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

  document.getElementById('unlock-all-btn').addEventListener('click', unlockAll);
  victoryButton.addEventListener('click', closeVictory);

  const unlocked = {
    game1: false,
    game2: false,
    game3: false,
    game4: false,
    game5: false
  };

  const contentIds = {
    game1: 'content-about',
    game2: 'content-achievements',
    game3: 'content-favorites',
    game4: 'content-skills',
    game5: 'content-fun-facts'
  };

  let unlockedCount = 0;
  let gameLoops = [];
  let toastTimer;
  let g1Arr = [];
  let g1Selected = null;

  function openGame(gameId) {
    if (unlocked[gameId]) {
      const contentPage = document.getElementById(contentIds[gameId]);
      contentPage.style.display = 'flex';

      setTimeout(() => {
        contentPage.querySelector('.modal-content').style.transform = 'translateX(0)';
      }, 10);

      return;
    }

    startCountdown(() => {
      document.getElementById(gameId).style.display = 'flex';
      if (gameId === 'game1') initGame1();
      if (gameId === 'game2') initGame2();
      if (gameId === 'game3') initGame3();
      if (gameId === 'game4') initGame4();
    });
  }

  function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
      if (modal.classList.contains('content-page')) {
        if (modal.style.display !== 'flex') return;

        modal.querySelector('.modal-content').style.transform = 'translateX(100px)';
        setTimeout(() => {
          modal.style.display = 'none';
        }, 200);
      } else {
        modal.style.display = 'none';
      }
    });

    gameLoops.forEach(loop => clearInterval(loop));
    gameLoops = [];
  }

  function startCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    let count = 3;

    overlay.style.display = 'flex';
    text.textContent = count;

    const timer = setInterval(() => {
      count--;

      if (count > 0) {
        text.textContent = count;
      } else if (count === 0) {
        text.textContent = 'GO!';
      } else {
        clearInterval(timer);
        overlay.style.display = 'none';
        callback();
      }
    }, 800);
  }

  function showToast() {
    const toast = document.getElementById('minecraft-toast');
    const text = document.getElementById('toast-desc');

    text.textContent = unlockedCount >= 5
      ? 'GOATED INFO COMPLETE!'
      : `GOATED INFO ${unlockedCount}/5 UNLOCKED`;

    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4000);
  }

  function unlockGame(gameId) {
    if (unlocked[gameId]) return;

    unlocked[gameId] = true;
    unlockedCount++;

    const card = document.querySelector(`.game-card[data-game="${gameId}"]`);
    card.classList.remove('is-locked');
  }

  function unlockAll() {
    Object.keys(unlocked).forEach(unlockGame);
    alert('Prof Mode Activated: All info unlocked.');
  }

  function endGame(gameId, outcome) {
    closeModal();

    const overlay = document.getElementById('victory-overlay');
    const text = document.getElementById('victory-text');

    text.className = '';

    if (outcome === 'win') {
      if (gameId === 'game4') {
        text.innerHTML = '<span class="coke-font">TOTA TOLA!</span>';
      } else {
        text.textContent = 'VICTORY!';
      }

      victoryButton.textContent = 'Collect Reward';
    } else if (outcome === 'lose') {
      if (gameId === 'game2') text.textContent = 'TOO SLOW!';
      else if (gameId === 'game3') text.textContent = 'DEFEATED.';
      else text.textContent = 'TIME IS UP!';

      text.classList.add('lose-text');
      victoryButton.textContent = 'Try Again';
    } else if (outcome === 'tie') {
      text.textContent = 'STALEMATE!';
      text.classList.add('tie-text');
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

    if (overlay.dataset.outcome === 'win') {
      unlockGame(gameId);
      showToast();
      return;
    }

    openGame(gameId);
  }

  // Game 1: Echo Echo Sort
  function initGame1() {
    g1Arr = [1, 2, 3, 4, 5, 6];

    do {
      g1Arr.sort(() => Math.random() - 0.5);
    } while (g1Arr.every((number, index) => number === index + 1));

    g1Selected = null;
    renderG1();
  }

  function renderG1() {
    const container = document.getElementById('echo-container');
    container.innerHTML = '';

    g1Arr.forEach((number, index) => {
      const tile = document.createElement('div');
      tile.className = 'echo-clone';
      if (g1Selected === index) tile.classList.add('selected');

      tile.innerHTML = `
        <div class="echo-body">
          <img src="/alastair/images/echo.png" class="echo-img" alt="Echo">
          <span class="echo-number">${number}</span>
        </div>`;

      tile.onclick = () => selectRabbit(index);
      container.appendChild(tile);
    });
  }

  function selectRabbit(index) {
    if (g1Selected === null) {
      g1Selected = index;
    } else {
      if (Math.abs(g1Selected - index) === 1) {
        const selectedNumber = g1Arr[g1Selected];
        g1Arr[g1Selected] = g1Arr[index];
        g1Arr[index] = selectedNumber;
      }

      g1Selected = null;

      if (g1Arr.every((number, position) => number === position + 1)) {
        endGame('game1', 'win');
      }
    }

    renderG1();
  }

  // Game 2: Yoshi Egg Hunt
  function initGame2() {
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

    gameLoops.push(setInterval(() => {
      time--;
      timeText.textContent = time;
      if (time <= 0) endGame('game2', 'lose');
    }, 1000));

    gameLoops.push(setInterval(() => {
      if (time <= 0) return;

      const isBomb = Math.random() < 0.25;
      const item = document.createElement('div');

      item.className = 'falling-item';
      item.textContent = isBomb ? '💣' : '🥚';
      item.style.left = `${Math.random() * 80 + 10}%`;
      item.style.top = '-50px';

      item.onclick = event => {
        event.stopPropagation();
        shootTongue(item);
        item.remove();

        score = isBomb ? Math.max(0, score - 1) : score + 1;
        scoreText.textContent = score;

        if (score >= 10) endGame('game2', 'win');
      };

      arena.appendChild(item);

      let top = -50;
      const animation = setInterval(() => {
        top += 4;
        item.style.top = `${top}px`;

        if (top > arena.offsetHeight) {
          clearInterval(animation);
          item.remove();
        }
      }, 20);

      gameLoops.push(animation);
    }, 700));
  }

  function shootTongue(target) {
    const tongue = document.getElementById('yoshi-tongue');
    const arena = document.getElementById('yoshi-arena');
    const targetRect = target.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();

    const x = targetRect.left - arenaRect.left + targetRect.width / 2;
    const y = targetRect.top - arenaRect.top + targetRect.height / 2;
    const yoshiX = arenaRect.width / 2;
    const yoshiY = arenaRect.height - 80;
    const distance = Math.hypot(x - yoshiX, y - yoshiY);
    const angle = Math.atan2(y - yoshiY, x - yoshiX);

    tongue.style.display = 'block';
    tongue.style.left = `${yoshiX}px`;
    tongue.style.top = `${yoshiY}px`;
    tongue.style.width = `${distance}px`;
    tongue.style.transform = `rotate(${angle}rad)`;

    setTimeout(() => {
      tongue.style.display = 'none';
    }, 150);
  }

  // Game 3: Tic Tac Toe
  function initGame3() {
    const board = document.getElementById('ttt-board');
    const status = document.getElementById('game3-status');
    const state = Array(9).fill(null);

    board.innerHTML = '';
    status.textContent = 'Your Turn (X)';

    for (let index = 0; index < 9; index++) {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell';

      cell.onclick = () => {
        if (state[index] || status.textContent.includes('Win') || status.textContent.includes('Draw')) {
          return;
        }

        state[index] = 'X';
        cell.textContent = 'X';
        cell.classList.add('x');

        if (checkTTTWin(state, 'X')) {
          status.textContent = 'You Win!';
          endGame('game3', 'win');
          return;
        }

        if (!state.includes(null)) {
          status.textContent = 'Draw!';
          endGame('game3', 'tie');
          return;
        }

        const empty = state
          .map((value, position) => value === null ? position : null)
          .filter(position => position !== null);
        const botMove = empty[Math.floor(Math.random() * empty.length)];

        state[botMove] = 'O';
        board.children[botMove].textContent = 'O';
        board.children[botMove].classList.add('o');

        if (checkTTTWin(state, 'O')) {
          status.textContent = 'Bot Wins!';
          endGame('game3', 'lose');
          return;
        }

        if (!state.includes(null)) {
          status.textContent = 'Draw!';
          endGame('game3', 'tie');
        }
      };

      board.appendChild(cell);
    }
  }

  function checkTTTWin(state, player) {
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    return winningLines.some(line => line.every(index => state[index] === player));
  }

  // Game 4: Tota Tola Catcher
  function initGame4() {
    const arena = document.getElementById('pinoy-arena');
    const scoreText = document.getElementById('game4-score');
    const timeText = document.getElementById('game4-time');

    arena.innerHTML = '<div id="pinoy-catcher"></div>';
    const catcher = document.getElementById('pinoy-catcher');

    let score = 0;
    let time = 30;
    scoreText.textContent = score;
    timeText.textContent = time;

    arena.onmousemove = event => {
      const rect = arena.getBoundingClientRect();
      const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width - 200));
      catcher.style.left = `${x}px`;
    };

    gameLoops.push(setInterval(() => {
      time--;
      timeText.textContent = time;
      if (time <= 0) endGame('game4', 'lose');
    }, 1000));

    gameLoops.push(setInterval(() => {
      if (time <= 0) return;

      const isRock = Math.random() < 0.25;
      const item = document.createElement('div');
      item.className = isRock ? 'falling-rock' : 'falling-coke';
      if (!isRock) item.textContent = 'Coke';
      item.style.left = `${Math.random() * 80 + 10}%`;
      item.style.top = '-70px';

      let top = -70;
      const animation = setInterval(() => {
        top += 6;
        item.style.top = `${top}px`;

        const itemRect = item.getBoundingClientRect();
        const catcherRect = catcher.getBoundingClientRect();
        const isHit = itemRect.left < catcherRect.right - 20
          && itemRect.right > catcherRect.left + 20
          && itemRect.bottom > catcherRect.top
          && itemRect.top < catcherRect.top + 100;

        if (isHit) {
          clearInterval(animation);
          item.remove();

          score = isRock ? Math.max(0, score - 1) : score + 1;
          scoreText.textContent = score;

          if (score >= 10) endGame('game4', 'win');
        } else if (top > arena.offsetHeight) {
          clearInterval(animation);
          item.remove();
        }
      }, 20);

      gameLoops.push(animation);
      arena.appendChild(item);
    }, 600));
  }
});