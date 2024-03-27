let selectedPiece = null;
let currentPlayer = 'red';
let redWins = 0;
let blackWins = 0;
let gameOver = false;
let messageBox; // Variável global para armazenar a caixa de mensagem

function startGame() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const container = document.getElementById('container');
    welcomeScreen.style.display = 'none'; // Oculta a tela de boas-vindas
    container.style.display = 'flex'; // Adiciona a tela de Jogo
    // Cria o tabuleiro somente após o início do jogo
    createBoard();
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
            cell.addEventListener('click', () => movePiece(cell)); // Adiciona evento de clique para mover a peça
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
    // Verifica se há uma peça selecionada e se pertence ao jogador atual
    if (!piece || !piece.classList.contains(currentPlayer)) return;

    // Remove a classe 'selected' da peça anteriormente selecionada
    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
    }
    
    // Define a peça selecionada e adiciona a classe 'selected' a ela
    selectedPiece = piece;
    selectedPiece.classList.add('selected');
}

function movePiece(cell) {
    if (!selectedPiece) return; // Verifica se há uma peça selecionada

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const selectedRow = parseInt(selectedPiece.parentElement.dataset.row);
    const selectedCol = parseInt(selectedPiece.parentElement.dataset.col);

    const isValidMove = isValidMoveForPlayer(row, col, selectedRow, selectedCol, currentPlayer);

    if (isValidMove) {
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

        // Verifica se a peça chegou à base inimiga para se tornar uma "dama"
        if (selectedPiece.classList.contains('red') && row === 7) {
            selectedPiece.classList.add('king');
        }

        selectedPiece.classList.remove('selected');
        selectedPiece = null;

        updateTurnDisplay();
        checkWinner(); // Verifica se alguém ganhou após cada movimento
    }
}

function updateBoard() {
    const board = document.getElementById('board');
    const cells = board.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.innerHTML = ''; // Limpa todas as células do tabuleiro
    });

    // Recria o tabuleiro com as novas posições das peças
    createBoard();
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
        gameOver = true; // Define o jogo como encerrado
    } else if (blackPieces === 0) {
        winnerMessage = "O jogador Vermelho venceu!";
        redWins++;
        gameOver = true; // Define o jogo como encerrado
    }

    if (winnerMessage !== '') {
        messageBox = document.createElement('div');
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
    if (!gameOver) return; // Não continue se o jogo já tiver terminado
    if (messageBox) {
        messageBox.remove();
    }
}

function resetGame() {
    board.innerHTML = '';
    createBoard();
    gameOver = false; // Reseta o status do jogo
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



const turnDisplay = document.createElement('div');
turnDisplay.id = 'turn-display';
document.body.appendChild(turnDisplay);
updateTurnDisplay();


