let selectedPiece = null;
let currentPlayer = 'red';
let redWins = 0;
let blackWins = 0;
let gameOver = false;


function startGame() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const menuButton = document.getElementById('menu-button');
    const container = document.getElementById('container');
    welcomeScreen.style.display = 'none'; // Oculta a tela de boas-vindas
    container.style.display = 'flex'; // Adiciona a tela de Jogo
    menuButton.style.display = 'block'
    createBoard();
}

document.addEventListener('keydown', function(event) {
    // Verifica se a tecla pressionada é a tecla "Esc"
    if (event.key === 'Escape') {
        toggleMenuScreen();
    }
});

document.getElementById('info-button').addEventListener('click', toggleInfoScreen);

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

    if (selectedPiece) {
        selectedPiece.classList.remove('selected');
    }
    
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
            // Verifica se a peça chegou à base inimiga para se tornar uma "dama"
            if ((currentPlayer === 'red' && row === 7) || (currentPlayer === 'black' && row === 0)) {
                selectedPiece.classList.add('king');
                // Adiciona uma coroa apenas para as peças que se tornaram damas
                const crown = document.createElement('i');
                crown.classList.add('fas', 'fa-crown', 'crown-icon');
                selectedPiece.appendChild(crown);
            }
            currentPlayer = currentPlayer === 'red' ? 'black' : 'red'; // Alterna o jogador atual
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
                    // Verifica se a peça chegou à base inimiga para se tornar uma "dama" após capturar uma peça inimiga
                    if ((currentPlayer === 'red' && nextRow === 7) || (currentPlayer === 'black' && nextRow === 0)) {
                        selectedPiece.classList.add('king');
                        // Adiciona uma coroa apenas para as peças que se tornaram damas
                        const crown = document.createElement('i');
                        crown.classList.add('fas', 'fa-crown', 'crown-icon');
                        selectedPiece.appendChild(crown);
                    }
                    currentPlayer = currentPlayer === 'red' ? 'black' : 'red'; // Alterna o jogador atual
                }
            }
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
    createBoard();
}


function isValidMoveForPlayer(row, col, selectedRow, selectedCol, player) {
    const direction = player === 'red' ? 1 : -1;
    const selectedPieceInRightDirection = (selectedRow + direction * 2) >= 0 && (selectedRow + direction * 2) < 8;
    const isMoveWithinBoard = row >= 0 && row < 8;

    if (!isMoveWithinBoard || (selectedRow === row && selectedCol === col)) {
        return false;
    }

    // Verifica se o movimento é válido para uma peça comum
    if ((row === selectedRow + direction) && (col === selectedCol + direction || col === selectedCol - direction)) {
        return true;
    }

    // Verifica se o movimento é válido para uma dama
    if (selectedPiece.classList.contains('king')) {
        // Verifica se o movimento é na diagonal
        if (Math.abs(row - selectedRow) === Math.abs(col - selectedCol)) {
            // Verifica se não há peças no caminho
            const stepRow = Math.sign(row - selectedRow);
            const stepCol = Math.sign(col - selectedCol);
            let nextRow = selectedRow + stepRow;
            let nextCol = selectedCol + stepCol;
            while (nextRow !== row && nextCol !== col) {
                const nextCell = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
                if (nextCell.childNodes.length !== 0) {
                    return false;
                }
                nextRow += stepRow;
                nextCol += stepCol;
            }
            return true;
        }
    }

    // Verifica se o movimento é válido para capturar uma peça adversária
    if ((row === selectedRow + direction * 2) && (col === selectedCol + direction * 2 || col === selectedCol - direction * 2)) {
        const opponentRow = selectedRow + direction;
        const opponentCol = selectedCol + direction;
        const opponentCell = document.querySelector(`[data-row="${opponentRow}"][data-col="${opponentCol}"]`);
        if (opponentCell.childNodes.length !== 0 && !opponentCell.firstChild.classList.contains(player)) {
            return true;
        }
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
    if (redPieces === 0 || blackPieces === 0){
        toggleMenuScreen();
        if (redPieces === 0) {
            blackWins++;
            gameOver = true;
        } else if (blackPieces === 0) {
            redWins++;
            gameOver = true;
        }
    }
    
    updateWinsPanel();
}

function continueGame() {
   toggleMenuScreen();
}

function resetGame() {
    board.innerHTML = '';
    createBoard();
    gameOver = false; // Reseta o status do jogo
    toggleMenuScreen();
}

function updateWinsPanel() {
    const redWinsElement = document.getElementById('red-wins');
    const blackWinsElement = document.getElementById('black-wins');
    redWinsElement.textContent = `Red Wins: ${redWins}`;
    blackWinsElement.textContent = `Black Wins: ${blackWins}`;
}


function toggleMenuScreen() {
    const menuScreen = document.getElementById('menu-screen');

    if (menuScreen.style.display === 'none' || menuScreen.style.display === '') {
        menuScreen.style.display = 'flex';
    } else {
        menuScreen.style.display = 'none';
    }
}

function toggleInfoScreen(){
    const infoScreen = document.getElementById('info-screen');

    if (infoScreen.style.display === 'none' || infoScreen.style.display === '') {
        infoScreen.style.display = 'block';
    } else {
        infoScreen.style.display = 'none';
    }
}


updateTurnDisplay()