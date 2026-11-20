document.addEventListener("DOMContentLoaded", () => {
  
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  try {
    if (localStorage.getItem('theme') === 'dark') { body.classList.add('dark-mode'); themeToggle.textContent = '☀️'; }
  } catch(e) {}
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    try {
      if (body.classList.contains('dark-mode')) { localStorage.setItem('theme', 'dark'); themeToggle.textContent = '☀️'; } 
      else { localStorage.setItem('theme', 'light'); themeToggle.textContent = '🌙'; }
    } catch(e) {}
  });

  document.querySelectorAll('.game-card').forEach(card => card.addEventListener('click', function() { openGame(this.getAttribute('data-game')); }));
  document.querySelectorAll('[data-close="true"]').forEach(btn => btn.addEventListener('click', closeModal));
  document.querySelectorAll('[data-win]').forEach(btn => btn.addEventListener('click', function() { winGame(this.getAttribute('data-win')); }));
  document.getElementById('unlock-all-btn').addEventListener('click', unlockAll);

  const unlocked = { game1: false, game2: false, game3: false, game4: false, game5: false };
  let unlockedCount = 0;
  let gameLoops = []; 

  function openGame(gameId) {
    // If it's already unlocked, show the full-page content instead of the game
    if (unlocked[gameId]) {
      const contentId = 'content-' + (gameId === 'game1' ? 'about' : gameId === 'game2' ? 'achievements' : gameId === 'game3' ? 'favorites' : gameId === 'game4' ? 'skills' : 'fun-facts');
      
      const contentPage = document.getElementById(contentId);
      contentPage.style.display = 'flex';
      
      // Trigger the smooth slide-in animation
      setTimeout(() => {
        contentPage.querySelector('.modal-content').style.transform = 'translateX(0)';
      }, 10);
      return;
    }
    
    // Otherwise, start the game
    startCountdown(() => {
      document.getElementById(gameId).style.display = 'flex';
      if (gameId === 'game1') initGame1();
      if (gameId === 'game2') initGame2();
      if (gameId === 'game3') initGame3();
      if (gameId === 'game4') initGame4();
    });
  }

  function closeModal() {
    document.querySelectorAll('.modal').forEach(m => {
      // If it's a content page, animate it out first
      if (m.classList.contains('content-page')) {
        m.querySelector('.modal-content').style.transform = 'translateX(100px)';
        setTimeout(() => { m.style.display = 'none'; }, 200);
      } else {
        m.style.display = 'none';
      }
    });
    gameLoops.forEach(loop => clearInterval(loop));
    gameLoops = [];
  }

  function startCountdown(callback) {
    const overlay = document.getElementById('countdown-overlay');
    const text = document.getElementById('countdown-text');
    overlay.style.display = 'flex';
    let count = 3;
    text.textContent = count;
    
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        text.textContent = count;
      } else if (count === 0) {
        text.textContent = "GO!";
      } else {
        clearInterval(timer);
        overlay.style.display = 'none';
        callback();
      }
    }, 800);
  }

  function showToast() {
    const toast = document.getElementById('minecraft-toast');
    const desc = document.getElementById('toast-desc');
    
    if (unlockedCount >= 5) {
      desc.textContent = 'GOATED INFO COMPLETE!';
    } else {
      desc.textContent = `GOATED INFO ${unlockedCount}/5 UNLOCKED`;
    }

    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.add('show'); }, 50);

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  function endGame(gameId, outcome) {
    closeModal();
    const vicOverlay = document.getElementById('victory-overlay');
    const vicText = document.getElementById('victory-text');
    const vicBtn = document.getElementById('victory-btn');
    
    vicText.className = ''; 
    
    if (outcome === 'win') {
      if (!unlocked[gameId]) {
        unlocked[gameId] = true;
        unlockedCount++;
      }
      
      const lock = document.getElementById('lock-' + gameId);
      if (lock) { lock.textContent = '✅ Unlocked'; lock.style.background = 'rgba(0,0,0,0.5)'; }
      
      if (gameId === 'game4') {
        vicText.innerHTML = '<span class="coke-font">TOTA TOLA!</span>';
      } else {
        vicText.textContent = 'VICTORY!';
        vicText.style.color = '#FFD700';
      }
      
      vicBtn.textContent = 'Collect Reward';
      vicBtn.style.display = 'block';
      
      // Instant Popup
      vicOverlay.style.display = 'flex';
      showToast(); 

    } 
    else if (outcome === 'lose') {
      if (gameId === 'game2') vicText.textContent = 'TOO SLOW!';
      else if (gameId === 'game3') vicText.textContent = 'DEFEATED.';
      else vicText.textContent = 'TIME IS UP!';
      
      vicText.classList.add('lose-text');
      vicBtn.textContent = 'Try Again';
      vicBtn.style.display = 'block';
      vicOverlay.style.display = 'flex';
    } 
    else if (outcome === 'tie') {
      vicText.textContent = 'STALEMATE!';
      vicText.classList.add('tie-text');
      vicBtn.textContent = 'Try Again';
      vicBtn.style.display = 'block';
      vicOverlay.style.display = 'flex';
    }
    
    vicOverlay.dataset.currentGame = gameId; 
  }

  window.closeVictory = function() {
    const vicOverlay = document.getElementById('victory-overlay');
    const gameId = vicOverlay.dataset.currentGame;
    vicOverlay.style.display = 'none';
    
    // If they lost or tied, instantly restart the game
    if (document.getElementById('victory-text').classList.contains('lose-text') || 
        document.getElementById('victory-text').classList.contains('tie-text')) {
      openGame(gameId);
    }
  }

  function unlockAll() { 
    ['game1', 'game2', 'game3', 'game4', 'game5'].forEach(id => {
      if(!unlocked[id]) {
        unlocked[id] = true;
        unlockedCount++;
        const lock = document.getElementById('lock-' + id);
        if (lock) { lock.textContent = '✅ Unlocked'; lock.style.background = 'rgba(0,0,0,0.5)'; }
      }
    }); 
    alert("Prof Mode Activated: All info unlocked.");
  }

  function winGame(id) { endGame(id, 'win'); }

  // --- GAME 1: ECHO ECHO (RANDOMIZED) ---
  let g1Arr = [];
  let g1Selected = null;
  
  function initGame1() {
    g1Arr = [1, 2, 3, 4, 5, 6];
    g1Arr.sort(() => Math.random() - 0.5);
    while (JSON.stringify(g1Arr) === JSON.stringify([1,2,3,4,5,6])) {
      g1Arr.sort(() => Math.random() - 0.5);
    }
    g1Selected = null;
    renderG1();
  }
  
  function renderG1() {
    const container = document.getElementById('echo-container');
    container.innerHTML = '';
    g1Arr.forEach((num, index) => {
      const el = document.createElement('div');
      el.className = 'echo-clone';
      if (g1Selected === index) el.classList.add('selected');
      el.innerHTML = `<div class="echo-body"><img src="/alastair/images/echo.png" class="echo-img" alt="Echo"><span class="echo-number">${num}</span></div>`;
      el.onclick = () => selectRabbit(index);
      container.appendChild(el);
    });
  }
  
  function selectRabbit(index) {
    if (g1Selected === null) { g1Selected = index; } 
    else {
      if (Math.abs(g1Selected - index) === 1) {
        const temp = g1Arr[g1Selected]; g1Arr[g1Selected] = g1Arr[index]; g1Arr[index] = temp;
      }
      g1Selected = null;
      const sorted = [...g1Arr].sort((a,b) => a-b);
      if (JSON.stringify(g1Arr) === JSON.stringify(sorted)) { endGame('game1', 'win'); }
    }
    renderG1();
  }

  // --- GAME 2: YOSHI TOP-DOWN ---
  function initGame2() {
    const arena = document.getElementById('yoshi-arena');
    arena.innerHTML = '<div class="tongue" id="yoshi-tongue"></div><img src="/alastair/images/yoshi.png" class="yoshi-img" alt="Yoshi">';
    let score = 0; let time = 30;
    document.getElementById('game2-score').textContent = score;
    document.getElementById('game2-time').textContent = time;

    gameLoops.push(setInterval(() => {
      time--; document.getElementById('game2-time').textContent = time;
      if (time <= 0) { endGame('game2', 'lose'); }
    }, 1000));

    gameLoops.push(setInterval(() => {
      if (time <= 0) return;
      const isBomb = Math.random() < 0.25;
      const item = document.createElement('div');
      item.className = 'falling-item';
      item.textContent = isBomb ? '💣' : '🥚';
      item.style.left = Math.random() * 80 + 10 + '%';
      item.style.top = '-50px';
      
      item.onclick = (e) => {
        e.stopPropagation(); shootTongue(item); item.remove();
        if (isBomb) { score = Math.max(0, score - 1); } else { score++; }
        document.getElementById('game2-score').textContent = score;
        if (score >= 10) { endGame('game2', 'win'); }
      };
      arena.appendChild(item);

      let top = -50;
      const anim = setInterval(() => {
        top += 4; item.style.top = top + 'px';
        if (top > arena.offsetHeight) { clearInterval(anim); item.remove(); }
      }, 20);
      gameLoops.push(anim);
    }, 700));
  }

  function shootTongue(target) {
    const tongue = document.getElementById('yoshi-tongue');
    const arena = document.getElementById('yoshi-arena');
    const targetRect = target.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();
    
    const x = targetRect.left - arenaRect.left + (targetRect.width / 2);
    const y = targetRect.top - arenaRect.top + (targetRect.height / 2);
    
    const yoshiX = arenaRect.width / 2;
    const yoshiY = arenaRect.height - 80; // Lowered to align with mouth

    const distance = Math.hypot(x - yoshiX, y - yoshiY);
    const angle = Math.atan2(y - yoshiY, x - yoshiX);

    tongue.style.display = 'block';
    tongue.style.left = yoshiX + 'px';
    tongue.style.top = yoshiY + 'px';
    tongue.style.width = distance + 'px';
    tongue.style.transform = `rotate(${angle}rad)`;
    setTimeout(() => tongue.style.display = 'none', 150);
  }

  // --- GAME 3: PREMIUM TTT ---
  function initGame3() {
    const board = document.getElementById('ttt-board');
    board.innerHTML = ''; let state = Array(9).fill(null);
    document.getElementById('game3-status').textContent = "Your Turn (X)";
    
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div'); cell.className = 'ttt-cell';
      cell.onclick = () => {
        if (state[i] || document.getElementById('game3-status').textContent.includes('Win') || document.getElementById('game3-status').textContent.includes('Draw')) return;
        state[i] = 'X'; cell.textContent = 'X'; cell.classList.add('x');
        
        if (checkTTTWin(state, 'X')) { document.getElementById('game3-status').textContent = 'You Win!'; endGame('game3', 'win'); return; }
        if (!state.includes(null)) { document.getElementById('game3-status').textContent = 'Draw!'; endGame('game3', 'tie'); return; }
        
        let empty = state.map((val, idx) => val === null ? idx : null).filter(v => v !== null);
        let botMove = empty[Math.floor(Math.random() * empty.length)];
        state[botMove] = 'O'; board.children[botMove].textContent = 'O'; board.children[botMove].classList.add('o');
        
        if (checkTTTWin(state, 'O')) { document.getElementById('game3-status').textContent = 'Bot Wins!'; endGame('game3', 'lose'); return; }
        if (!state.includes(null)) { document.getElementById('game3-status').textContent = 'Draw!'; endGame('game3', 'tie'); return; }
      };
      board.appendChild(cell);
    }
  }
  function checkTTTWin(s, p) { return [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]].some(w => s[w[0]]===p && s[w[1]]===p && s[w[2]]===p); }

  // --- GAME 4: PINOY CATCHER (MID-AIR COLLISION) ---
  function initGame4() {
    const arena = document.getElementById('pinoy-arena');
    arena.innerHTML = '<div id="pinoy-catcher"></div>'; 
    let score = 0; let time = 30;
    document.getElementById('game4-score').textContent = score;
    document.getElementById('game4-time').textContent = time;
    
    const catcher = document.getElementById('pinoy-catcher');

    arena.onmousemove = (e) => {
      const rect = arena.getBoundingClientRect();
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width - 200));
      catcher.style.left = x + 'px';
    };

    gameLoops.push(setInterval(() => {
      time--; document.getElementById('game4-time').textContent = time;
      if (time <= 0) { endGame('game4', 'lose'); }
    }, 1000));

    gameLoops.push(setInterval(() => {
      if (time <= 0) return;
      const isRock = Math.random() < 0.25;
      const item = document.createElement('div');
      item.className = isRock ? 'falling-rock' : 'falling-coke';
      if (!isRock) item.textContent = 'Coke';
      item.style.left = Math.random() * 80 + 10 + '%';
      item.style.top = '-70px';
      
      let top = -70;
      const anim = setInterval(() => {
        top += 6; 
        item.style.top = top + 'px';
        
        const itemRect = item.getBoundingClientRect();
        const catcherRect = catcher.getBoundingClientRect();
        
        // Check collision mid-air
        const isHit = (
          itemRect.left < catcherRect.right - 20 &&
          itemRect.right > catcherRect.left + 20 &&
          itemRect.bottom > catcherRect.top &&
          itemRect.top < catcherRect.top + 100 
        );

        if (isHit) {
          clearInterval(anim);
          item.remove(); 
          if (isRock) { score = Math.max(0, score - 1); } else { score++; }
          document.getElementById('game4-score').textContent = score;
          if (score >= 10) { endGame('game4', 'win'); }
        } else if (top > arena.offsetHeight) {
          clearInterval(anim); 
          item.remove(); 
        }
      }, 20);
      
      gameLoops.push(anim);
      arena.appendChild(item);
    }, 600));
  }

});