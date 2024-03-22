let selectedPiece = null;
let currentPlayer = 'red';
let redWins = 0;
let blackWins = 0;
let gameOver = false;

function startGame() {
    const welcomeScreen = document.getElementById('welcome-screen');
    welcomeScreen.style.display = 'none'; // Oculta a tela de boas-vindas
    createBoard(); // Inicia o jogo criando o tabuleiro
}

function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = ''; // Limpa o conteúdo do tabuleiro

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if ((row + col) % 2 === 0) {
                cell.classList.add('light');
            } else {
                cell.classList.add('dark');
                if (row < 3) {
                    const piece = createPiece('red');
                    piece.addEventListener('click', () => selectPiece(piece));
                    cell.appendChild(piece);
                }
                if (row > 4) {
                    const piece = createPiece('black');
                    piece.addEventListener('click', () => selectPiece(piece));
                    cell.appendChild(piece);
                }
            }
            cell.dataset.row = row;
            cell.dataset.col = col;
            board.appendChild(cell);
        }
    }
}

function createPiece(color) {
    const piece = document.createElement('div');
    piece.classList.add('piece', color);
    return piece;
}

function selectPiece(piece) {
    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
    }
    selectedPiece = piece;
    selectedPiece.classList.add('selected');
}

function movePiece(cell) {
    if (gameOver) return; // Se o jogo terminou, não permita mais movimentos

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const selectedRow = parseInt(selectedPiece.parentElement.dataset.row);
    const selectedCol = parseInt(selectedPiece.parentElement.dataset.col);

    const isValidMove = isValidMoveForPlayer(row, col, selectedRow, selectedCol, currentPlayer);

    if (selectedPiece && isValidMove) {
        if (cell.childNodes.length === 0) {
            // Movimento simples
            cell.appendChild(selectedPiece);
            currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
        } else if (cell.childNodes.length === 1) {
            const opponentPiece = cell.childNodes[0];
            const opponentRow = parseInt(cell.dataset.row);
            const opponentCol = parseInt(cell.dataset.col);
            const nextRow = row + (row - selectedRow);
            const nextCol = col + (col - selectedCol);

            if (nextRow >= 0 && nextRow < 8 && nextCol >= 0 && nextCol < 8) {
                const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);

                if (nextCell.childNodes.length === 0) {
                    // Movimento de captura
                    cell.removeChild(opponentPiece);
                    nextCell.appendChild(selectedPiece);
                    currentPlayer = currentPlayer === 'red' ? 'black' : 'red';
                }
            }
        }

        selectedPiece.classList.remove('selected');
        selectedPiece = null;

        updateTurnDisplay(); 
        checkWinner(); // Verifica se alguém ganhou após cada movimento
    }
}

function isValidMoveForPlayer(row, col, selectedRow, selectedCol, player) {
    const direction = player === 'red' ? 1 : -1;
    const selectedPieceInRightDirection = (selectedRow + direction * 2) >= 0 && (selectedRow + direction * 2) < 8;
    const isMoveWithinBoard = row >= 0 && row < 8;

    if (!isMoveWithinBoard || (selectedRow === row)) {
        return false;
    }

    if ((row === selectedRow + direction) && (col === selectedCol + direction || col === selectedCol - direction)) {
        return true;
    }
    
    return false;
}

function updateTurnDisplay() {
    const turnDisplay = document.getElementById('turn-display');
    turnDisplay.textContent = `Player ${currentPlayer}, your round`;
    if (currentPlayer === 'red') {
        turnDisplay.style.backgroundColor = 'red';
    } else {
        turnDisplay.style.backgroundColor = '#333';
    }
}

function checkWinner() {
    const redPieces = document.querySelectorAll('.piece.red').length;
    const blackPieces = document.querySelectorAll('.piece.black').length;

    let winnerMessage = '';
    if (redPieces === 0) {
        winnerMessage = "O jogador Preto venceu!";
        blackWins++;
        gameOver = true;
    } else if (blackPieces === 0) {
        winnerMessage = "O jogador Vermelho venceu!";
        redWins++;
        gameOver = true;
    }

    if (winnerMessage !== '') {
        const messageBox = document.createElement('div');
        messageBox.classList.add('message-box');
        messageBox.innerHTML = `
            <p>${winnerMessage}</p>
            <button onclick="continueGame()">Continuar</button>
            <button onclick="resetGame()">Reiniciar</button>
        `;
        document.body.appendChild(messageBox);
    }
    updateWinsPanel();
}

function continueGame() {
    const messageBox = document.querySelector('.message-box');
    if (messageBox) {
        messageBox.remove();
    }
}

function updateWinsPanel() {
    const redWinsElement = document.querySelector('.red-wins');
    const blackWinsElement = document.querySelector('.black-wins');

    redWinsElement.textContent = redWins;
    blackWinsElement.textContent = blackWins;
}

function resetGame() {
    board.innerHTML = '';
    createBoard();
    gameOver = false; // Reseta o status do jogo
}

const turnDisplay = document.createElement('div');
turnDisplay.id = 'turn-display';
document.body.appendChild(turnDisplay);
updateTurnDisplay();
