const PAIRS = [
      { p1: '✖', p2: '⭕' },
      { p1: '☀️', p2: '🌙' },
      { p1: '❤️', p2: '💎' }
    ];

    let currentPair = 0;
    let clr1 = '#f7f7f7', clr2 = '#c7d5f8';
    let board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let turn = 1, ended = 0, startTime = null;
    let playerNames = ['Jugador 1', 'Jugador 2'];

    const WINS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

    // Elements
    const nameScreen = document.getElementById('name-screen');
    const gameScreen = document.getElementById('game-screen');
    const boardEl = document.getElementById('board');
    const timerEl = document.getElementById('timer');
    const statusEl = document.getElementById('status');
    const pv1 = document.getElementById('pv1');
    const pv2 = document.getElementById('pv2');
    const pv1Name = document.getElementById('pv1-name');
    const pv2Name = document.getElementById('pv2-name');
    const catOverlay = document.getElementById('cat-overlay');
    const catSub = document.getElementById('cat-sub');
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');

    function getName(p) { return playerNames[p - 1] || `Jugador ${p}`; }
    function getMark(p) { return p === 1 ? PAIRS[currentPair].p1 : PAIRS[currentPair].p2; }

    function startGame() {
      const n1 = name1Input.value.trim() || 'Jugador 1';
      const n2 = name2Input.value.trim() || 'Jugador 2';
      playerNames = [n1, n2];
      pv1Name.textContent = n1;
      pv2Name.textContent = n2;
      nameScreen.style.display = 'none';
      gameScreen.style.display = 'block';
      reset();
    }

    function updatePreviews() {
      pv1.textContent = PAIRS[currentPair].p1;
      pv2.textContent = PAIRS[currentPair].p2;
    }

    function cellColor(i) {
      return ((Math.floor(i / 3) + i) % 2 === 0) ? clr1 : clr2;
    }

    function buildBoard() {
      boardEl.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'cel';
        btn.dataset.i = i;
        btn.style.backgroundColor = cellColor(i);
        btn.addEventListener('click', onCell);
        boardEl.appendChild(btn);
      }
    }

    function recolorCells() {
      boardEl.querySelectorAll('.cel').forEach((el, i) => {
        el.style.backgroundColor = cellColor(i);
      });
    }

    function onCell(e) {
      const btn = e.currentTarget;
      const i = Number(btn.dataset.i);
      if (board[i] || ended) return;
      if (!startTime) startTime = Date.now();
      if (Date.now() - startTime > 180000) return;

      board[i] = turn;
      btn.textContent = getMark(turn);
      btn.dataset.played = '1';

      const win = checkWin();
      if (win) {
        ended = turn;
        win.forEach(idx => boardEl.querySelector(`.cel[data-i="${idx}"]`).classList.add('win'));
        statusEl.textContent = `🏆 ¡Ganó ${getName(turn)}! ${getMark(turn)}`;
        return;
      }
      if (board.every(Boolean)) {
        ended = 3;
        statusEl.textContent = '🐱 ¡Ganó el Gato!';
        catSub.textContent = `${getName(1)} y ${getName(2)} empataron esta vez`;
        setTimeout(() => catOverlay.classList.add('show'), 400);
        return;
      }
      turn = 3 - turn;
      statusEl.textContent = `Turno: ${getName(turn)} ${getMark(turn)}`;
    }

    function checkWin() {
      for (const line of WINS) {
        const [a, b, c] = line.map(i => board[i]);
        if (a && a === b && b === c) return line;
      }
      return null;
    }

    function reset() {
      board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      turn = 1; ended = 0; startTime = null;
      timerEl.textContent = '03:00';
      boardEl.classList.remove('lock');
      catOverlay.classList.remove('show');
      buildBoard();
      statusEl.textContent = `Turno: ${getName(1)} ${getMark(1)}`;
    }

    function tick() {
      if (ended || !startTime) return;
      const left = Math.max(0, 180 - Math.floor((Date.now() - startTime) / 1000));
      timerEl.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
      if (left === 0) {
        ended = 4;
        boardEl.classList.add('lock');
        statusEl.textContent = '⏰ Tiempo agotado';
      }
    }

    // ── Listeners ──

    document.getElementById('start-btn').addEventListener('click', startGame);
    [name1Input, name2Input].forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
    });

    document.getElementById('reset').addEventListener('click', reset);

    document.getElementById('change-names').addEventListener('click', () => {
      gameScreen.style.display = 'none';
      nameScreen.style.display = 'flex';
    });

    document.getElementById('cat-close').addEventListener('click', reset);

    document.querySelectorAll('.pair-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pair-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPair = Number(btn.dataset.pair);
        updatePreviews();
        boardEl.querySelectorAll('.cel[data-played]').forEach(el => {
          const idx = Number(el.dataset.i);
          el.textContent = getMark(board[idx]);
        });
        if (!ended) statusEl.textContent = `Turno: ${getName(turn)} ${getMark(turn)}`;
      });
    });

    document.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        const target = sw.dataset.target;
        const color = sw.dataset.color;
        document.querySelectorAll(`.swatch[data-target="${target}"]`).forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
        if (target === 'clr1') { clr1 = color; recolorCells(); }
        if (target === 'clr2') { clr2 = color; recolorCells(); }
        if (target === 'win') { document.documentElement.style.setProperty('--win', color); }
      });
    });

    setInterval(tick, 250);