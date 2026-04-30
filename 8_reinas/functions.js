class QueensPuzzle {
    constructor() {
        this.board = Array(64).fill(null).map(() => ({ queen: false, blocked: false, blockColor: null }));
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('status');
        this.solutionInfoElement = document.getElementById('solutionInfo');
        this.blockModeActive = false;
        this.solutions = this.generateSolutions();
        this.confettiFrame = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderBoard();
    }

    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('boardColor').addEventListener('change', (e) => this.changeTheme(e.target.value));
        document.getElementById('queenImage').addEventListener('change', () => this.renderBoard());
        document.getElementById('solution1Btn').addEventListener('click', () => this.showSolution(0));
        document.getElementById('solution2Btn').addEventListener('click', () => this.showSolution(1));
        document.getElementById('solution3Btn').addEventListener('click', () => this.showSolution(2));

        const blockBtn = document.getElementById('blockModeBtn');
        blockBtn.addEventListener('click', () => {
            this.blockModeActive = !this.blockModeActive;
            blockBtn.classList.toggle('active', this.blockModeActive);
            blockBtn.textContent = this.blockModeActive ? '🔓 Desactivar Bloqueo' : '🔒 Bloquear Celda';
        });

        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));

        document.getElementById('victoryClose').addEventListener('click', () => {
            document.getElementById('victoryOverlay').classList.remove('show');
        });
    }

    renderBoard() {
        this.boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                const index = row * 8 + col;
                cell.className = 'cell';

                const isLight = (row + col) % 2 === 0;
                cell.classList.add(isLight ? 'cell-white' : 'cell-black');

                cell.dataset.index = index;
                cell.dataset.row = row;
                cell.dataset.col = col;

                const cellData = this.board[index];

                if (cellData.blocked) {
                    cell.classList.add('blocked');
                    if (cellData.blockColor) {
                        cell.style.backgroundColor = cellData.blockColor;
                    }
                } else if (cellData.queen) {
                    cell.classList.add('queen');
                    cell.textContent = this.getQueenSymbol();
                } else if (this.isUnderAttack(index)) {
                    cell.classList.add('attack');
                } else {
                    cell.classList.add('safe');
                }

                this.boardElement.appendChild(cell);
            }
        }

        this.updateStatus();
    }

    getQueenSymbol() {
        const select = document.getElementById('queenImage');
        const symbols = { emoji: '👑', unicode: '♕', letter: 'Q', star: '★', diamond: '◆' };
        return symbols[select.value] || '👑';
    }

    handleCellClick(e) {
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const index = parseInt(cell.dataset.index);
        const cellData = this.board[index];

        if (this.blockModeActive) {
            if (cellData.queen) return;
            if (cellData.blocked) {
                this.board[index].blocked = false;
                this.board[index].blockColor = null;
            } else {
                this.board[index].blocked = true;
                this.board[index].blockColor = this.getRandomBlockColor();
            }
            this.renderBoard();
            return;
        }

        if (cellData.blocked) return;

        if (cellData.queen) {
            this.board[index].queen = false;
        } else if (this.countQueens() < 8) {
            this.board[index].queen = true;
        }

        this.renderBoard();
    }

    getRandomBlockColor() {
        const colors = [
            'rgba(220, 80, 80, 0.55)',
            'rgba(80, 120, 220, 0.55)',
            'rgba(80, 180, 100, 0.55)',
            'rgba(200, 140, 30, 0.55)',
            'rgba(160, 80, 200, 0.55)',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    isUnderAttack(index) {
        const row = Math.floor(index / 8);
        const col = index % 8;

        for (let i = 0; i < 64; i++) {
            if (!this.board[i].queen || i === index) continue;
            const qRow = Math.floor(i / 8);
            const qCol = i % 8;
            if (qRow === row || qCol === col) return true;
            if (Math.abs(qRow - row) === Math.abs(qCol - col)) return true;
        }

        return false;
    }

    countQueens() {
        return this.board.filter(cell => cell.queen).length;
    }

    isSolved() {
        if (this.countQueens() !== 8) return false;
        for (let i = 0; i < 64; i++) {
            if (this.board[i].queen && this.isUnderAttack(i)) return false;
        }
        return true;
    }

    updateStatus() {
        const count = this.countQueens();
        if (this.isSolved()) {
            this.statusElement.textContent = '¡Solución encontrada! 🎉';
            this.statusElement.classList.add('status-win');
            document.querySelectorAll('.cell.queen').forEach(c => c.classList.add('success'));
            setTimeout(() => this.showVictory(), 400);
        } else {
            this.statusElement.classList.remove('status-win');
            this.statusElement.textContent = `Reinas colocadas: ${count}/8`;
        }
    }

    showVictory() {
        document.getElementById('victoryOverlay').classList.add('show');
        this.launchConfetti();
    }

    launchConfetti() {
        const canvas = document.getElementById('confettiCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#667eea', '#f5576c', '#f093fb', '#ffd700', '#43e97b', '#fa709a', '#764ba2', '#00c9ff'];
        const pieces = Array.from({ length: 180 }, () => ({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 300,
            w: 7 + Math.random() * 9,
            h: 5 + Math.random() * 7,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 5,
            vy: 2.5 + Math.random() * 4,
            vr: (Math.random() - 0.5) * 0.18,
            alpha: 1,
        }));

        if (this.confettiFrame) cancelAnimationFrame(this.confettiFrame);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            for (const p of pieces) {
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vr;
                if (p.y > canvas.height * 0.75) p.alpha -= 0.018;
                if (p.alpha > 0) {
                    alive = true;
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, p.alpha);
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            }
            if (alive) this.confettiFrame = requestAnimationFrame(animate);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        animate();
    }

    changeTheme(theme) {
        this.boardElement.className = `board ${theme}`;
    }

    reset() {
        this.board = Array(64).fill(null).map(() => ({ queen: false, blocked: false, blockColor: null }));
        this.blockModeActive = false;
        const blockBtn = document.getElementById('blockModeBtn');
        blockBtn.classList.remove('active');
        blockBtn.textContent = '🔒 Bloquear Celda';
        this.solutionInfoElement.textContent = '';
        document.getElementById('victoryOverlay').classList.remove('show');
        if (this.confettiFrame) cancelAnimationFrame(this.confettiFrame);
        const canvas = document.getElementById('confettiCanvas');
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        this.renderBoard();
    }

    showSolution(solutionIndex) {
        if (solutionIndex >= this.solutions.length) return;

        const solution = this.solutions[solutionIndex];
        const blocked = this.board.map(c => ({ blocked: c.blocked, blockColor: c.blockColor }));

        this.board = Array(64).fill(null).map((_, i) => ({
            queen: false,
            blocked: blocked[i].blocked,
            blockColor: blocked[i].blockColor,
        }));

        for (let col = 0; col < 8; col++) {
            const row = solution[col];
            const idx = row * 8 + col;
            if (!this.board[idx].blocked) {
                this.board[idx].queen = true;
            }
        }

        this.solutionInfoElement.textContent =
            `Solución ${solutionIndex + 1} — Posiciones por columna: [${solution.join(', ')}]`;
        this.renderBoard();
    }

    generateSolutions() {
        const solutions = [];
        const isSafe = (board, row, col) => {
            for (let c = 0; c < col; c++) {
                if (board[c] === row) return false;
                if (Math.abs(board[c] - row) === Math.abs(c - col)) return false;
            }
            return true;
        };
        const solve = (board, col) => {
            if (col === 8) { solutions.push([...board]); return; }
            for (let row = 0; row < 8; row++) {
                if (isSafe(board, row, col)) { board[col] = row; solve(board, col + 1); }
            }
        };
        solve(Array(8).fill(-1), 0);
        return solutions.slice(0, 3);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new QueensPuzzle();
});
