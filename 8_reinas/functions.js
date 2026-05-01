class QueensPuzzle {
    constructor() {
        this.board = Array(64).fill(null).map(() => ({ queen: false, blocked: false, blockColor: null }));
        this.boardElement = document.getElementById('board');
        this.boardContainer = document.getElementById('boardContainer');
        this.statusElement = document.getElementById('status');
        this.solutionInfoElement = document.getElementById('solutionInfo');
        this.blockModeActive = false;
        this.solutions = this.generateSolutions();
        this.confettiFrame = null;
        this.solutionMode = false;
        this.savedBoard = null;
        this.lastPlacedQueen = null;
        this.lossCondition = false;
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

        // Event listeners para las tarjetas de solución
        document.querySelectorAll('.solution-item').forEach((item, idx) => {
            item.addEventListener('click', () => this.showSolution(idx));
        });

        const blockBtn = document.getElementById('blockModeBtn');
        blockBtn.addEventListener('click', () => {
            if (this.solutionMode) {
                this.showSolutionModeWarning();
                return;
            }
            if (this.lossCondition) {
                this.showLossWarning();
                return;
            }
            this.blockModeActive = !this.blockModeActive;
            blockBtn.classList.toggle('active', this.blockModeActive);
            blockBtn.textContent = this.blockModeActive ? '🔓 Desactivar Bloqueo' : '🔒 Bloquear';
        });

        this.boardElement.addEventListener('click', (e) => this.handleCellClick(e));

        document.getElementById('victoryClose').addEventListener('click', () => {
            document.getElementById('victoryOverlay').classList.remove('show');
        });

        document.getElementById('defeatRetryBtn').addEventListener('click', () => {
            this.reset();
            document.getElementById('defeatOverlay').classList.remove('show');
        });
    }

    showSolutionModeWarning() {
        const warning = document.createElement('div');
        warning.textContent = '⚠️ Haz clic en "Reiniciar" para salir del modo solución';
        warning.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: #ff5fa0;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 0.8rem;
            font-family: 'Unbounded', sans-serif;
            border: 1px solid #ff5fa0;
            z-index: 1001;
            pointer-events: none;
        `;
        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 2500);
    }

    showLossWarning() {
        const warning = document.createElement('div');
        warning.textContent = '💀 Ya has perdido. Haz clic en "Reiniciar" para jugar de nuevo';
        warning.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: #ff4444;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 0.8rem;
            font-family: 'Unbounded', sans-serif;
            border: 1px solid #ff4444;
            z-index: 1001;
            pointer-events: none;
        `;
        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 2500);
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
                    if (this.lossCondition && this.lastPlacedQueen === index) {
                        cell.classList.add('failed-queen');
                    }
                } else if (this.isUnderAttack(index)) {
                    cell.classList.add('attack');
                } else {
                    cell.classList.add('safe');
                }

                if (this.solutionMode) {
                    cell.style.cursor = 'not-allowed';
                    cell.style.opacity = '0.85';
                }

                if (this.lossCondition && !this.solutionMode) {
                    cell.style.cursor = 'not-allowed';
                    cell.style.opacity = '0.7';
                }

                this.boardElement.appendChild(cell);
            }
        }

        this.updateStatus();
        this.updateControlsState();
    }

    updateControlsState() {
        const blockBtn = document.getElementById('blockModeBtn');
        const solutionItems = document.querySelectorAll('.solution-item');
        const queenSelect = document.getElementById('queenImage');

        if (this.solutionMode || this.lossCondition) {
            blockBtn.disabled = true;
            blockBtn.style.opacity = '0.5';
            blockBtn.style.cursor = 'not-allowed';
            solutionItems.forEach(item => {
                item.style.pointerEvents = 'none';
                item.style.opacity = '0.5';
            });
            queenSelect.disabled = true;
            queenSelect.style.opacity = '0.5';
            queenSelect.style.cursor = 'not-allowed';
            if (this.solutionMode) {
                this.boardContainer.classList.add('solution-mode');
            } else {
                this.boardContainer.classList.remove('solution-mode');
            }
        } else {
            blockBtn.disabled = false;
            blockBtn.style.opacity = '1';
            blockBtn.style.cursor = 'pointer';
            solutionItems.forEach(item => {
                item.style.pointerEvents = 'auto';
                item.style.opacity = '1';
            });
            queenSelect.disabled = false;
            queenSelect.style.opacity = '1';
            queenSelect.style.cursor = 'pointer';
            this.boardContainer.classList.remove('solution-mode');
        }
    }

    getQueenSymbol() {
        const select = document.getElementById('queenImage');
        const symbols = { emoji: '👑', unicode: '♕', letter: 'Q', star: '★', diamond: '◆' };
        return symbols[select.value] || '👑';
    }

    handleCellClick(e) {
        if (this.solutionMode) {
            this.showSolutionModeWarning();
            return;
        }

        if (this.lossCondition) {
            this.showLossWarning();
            return;
        }

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

        if (!cellData.queen && this.countQueens() < 8) {
            const wouldBeUnderAttack = this.wouldBeUnderAttack(index);
            
            if (wouldBeUnderAttack) {
                this.triggerLoss(index, 'Has colocado una reina en una posición inválida. ¡Las reinas no pueden atacarse entre sí!');
                return;
            }
            
            this.board[index].queen = true;
            this.lastPlacedQueen = index;
        } else if (cellData.queen) {
            this.board[index].queen = false;
            this.lastPlacedQueen = null;
        }

        this.renderBoard();
        
        if (!this.lossCondition && this.countQueens() > 0 && !this.hasPossibleSolution()) {
            this.triggerLoss(null, 'Te has bloqueado. No hay forma de colocar las 8 reinas sin que se ataquen.');
        }
    }

    wouldBeUnderAttack(index) {
        const row = Math.floor(index / 8);
        const col = index % 8;

        for (let i = 0; i < 64; i++) {
            if (!this.board[i].queen) continue;
            const qRow = Math.floor(i / 8);
            const qCol = i % 8;
            if (qRow === row || qCol === col) return true;
            if (Math.abs(qRow - row) === Math.abs(qCol - col)) return true;
        }
        return false;
    }

    hasPossibleSolution() {
        const queensToPlace = 8 - this.countQueens();
        if (queensToPlace === 0) return true;
        
        const freeCells = [];
        for (let i = 0; i < 64; i++) {
            if (!this.board[i].blocked && !this.board[i].queen) {
                freeCells.push(i);
            }
        }
        
        if (freeCells.length < queensToPlace) return false;
        
        let possiblePlaces = 0;
        for (const cell of freeCells) {
            if (!this.wouldBeUnderAttack(cell)) {
                possiblePlaces++;
            }
        }
        return possiblePlaces >= queensToPlace;
    }

    triggerLoss(failedIndex, message) {
        this.lossCondition = true;
        this.lastPlacedQueen = failedIndex;
        
        this.boardElement.classList.add('shake-animation');
        setTimeout(() => {
            this.boardElement.classList.remove('shake-animation');
        }, 500);
        
        const defeatOverlay = document.getElementById('defeatOverlay');
        const defeatMsg = document.getElementById('defeatMsg');
        defeatMsg.innerHTML = message + '<br><br>💀 Reinicia el juego para intentarlo de nuevo 💀';
        defeatOverlay.classList.add('show');
        
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
        if (this.solutionMode) return false;
        if (this.lossCondition) return false;
        if (this.countQueens() !== 8) return false;
        for (let i = 0; i < 64; i++) {
            if (this.board[i].queen && this.isUnderAttack(i)) return false;
        }
        return true;
    }

    updateStatus() {
        const count = this.countQueens();
        
        if (this.lossCondition) {
            this.statusElement.textContent = '💀 HAS PERDIDO - Reinicia para jugar 💀';
            this.statusElement.classList.add('status-loss');
            return;
        }
        
        if (this.solutionMode) {
            this.statusElement.textContent = `📋 Vista previa de solución`;
            this.statusElement.style.color = '#5ef5c8';
            this.statusElement.classList.remove('status-win');
            this.statusElement.classList.remove('status-loss');
            return;
        }
        
        if (this.isSolved()) {
            this.statusElement.textContent = '👑 ¡Solución encontrada! 👑';
            this.statusElement.classList.add('status-win');
            document.querySelectorAll('.cell.queen').forEach(c => c.classList.add('success'));
            setTimeout(() => this.showVictory(), 400);
        } else {
            this.statusElement.classList.remove('status-win');
            this.statusElement.classList.remove('status-loss');
            this.statusElement.textContent = `👑 ${count} / 8 reinas`;
            this.statusElement.style.color = '';
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
        this.solutionMode = false;
        this.lossCondition = false;
        this.lastPlacedQueen = null;
        this.savedBoard = null;
        
        this.board = Array(64).fill(null).map(() => ({ queen: false, blocked: false, blockColor: null }));
        this.blockModeActive = false;
        
        const blockBtn = document.getElementById('blockModeBtn');
        blockBtn.classList.remove('active');
        blockBtn.textContent = '🔒 Bloquear';
        
        const infoElement = document.getElementById('solutionInfo');
        if (infoElement) infoElement.innerHTML = '';
        
        document.getElementById('victoryOverlay').classList.remove('show');
        document.getElementById('defeatOverlay').classList.remove('show');
        
        if (this.confettiFrame) cancelAnimationFrame(this.confettiFrame);
        const canvas = document.getElementById('confettiCanvas');
        if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        this.renderBoard();
    }

    showSolution(solutionIndex) {
        if (solutionIndex >= this.solutions.length) return;
        
        if (!this.solutionMode && !this.savedBoard) {
            this.savedBoard = this.board.map(cell => ({ 
                queen: cell.queen, 
                blocked: cell.blocked, 
                blockColor: cell.blockColor 
            }));
        }
        
        const solution = this.solutions[solutionIndex];
        const blockedCells = this.board.map(c => ({ blocked: c.blocked, blockColor: c.blockColor }));
        
        this.board = Array(64).fill(null).map((_, i) => ({
            queen: false,
            blocked: blockedCells[i].blocked,
            blockColor: blockedCells[i].blockColor,
        }));

        for (let col = 0; col < 8; col++) {
            const row = solution[col];
            const idx = row * 8 + col;
            if (!this.board[idx].blocked) {
                this.board[idx].queen = true;
            }
        }

        this.solutionMode = true;
        this.lossCondition = false;
        
        const infoElement = document.getElementById('solutionInfo');
        if (infoElement) {
            infoElement.innerHTML = `
                <span style="color: #ff5fa0;">📋 Solución ${solutionIndex + 1} — [${solution.join(', ')}]</span>
                <span style="display: block; font-size: 0.6rem; margin-top: 4px;">⚠️ Haz clic en "Reiniciar" para volver a jugar</span>
            `;
        }
        
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