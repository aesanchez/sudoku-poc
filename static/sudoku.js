let puzzle = [];
let solution = [];
let selectedCell = null;
let timerInterval;
let startTime;

function startTimer() {
  clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById('time').textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  clearInterval(timerInterval);
}

function getDifficulty() {
  return document.getElementById('difficulty').value;
}

function updateHighlights(cell) {
  // Remove highlights from all cells
  document.querySelectorAll('.sudoku-cell').forEach(c => {
    c.classList.remove('highlight-row', 'highlight-col');
  });

  if (!cell) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);

  // Add highlights to current row and column
  document.querySelectorAll(`[data-row="${row}"]`).forEach(c => {
    c.classList.add('highlight-row');
  });
  document.querySelectorAll(`[data-col="${col}"]`).forEach(c => {
    c.classList.add('highlight-col');
  });
}

function renderBoard() {
  const board = document.getElementById('sudoku-board');
  board.innerHTML = '';
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = document.createElement('input');
      cell.type = 'text';
      cell.maxLength = 1;
      cell.className = 'sudoku-cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      // Add thicker borders for 3x3 subgrids
      if (col % 3 === 2 && col < 8) {
        cell.classList.add('box-right');
      }
      if (row % 3 === 2 && row < 8) {
        cell.classList.add('box-bottom');
      }
      
      if (puzzle[row][col] !== 0) {
        cell.value = puzzle[row][col];
        cell.disabled = true;
        cell.classList.add('given');
      } else {
        cell.value = '';
        cell.addEventListener('input', onInput);
        cell.addEventListener('click', () => selectCell(cell));
        cell.addEventListener('keydown', handleKeyDown);
      }
      board.appendChild(cell);
    }
  }
}

function selectCell(cell) {
  if (selectedCell) {
    selectedCell.classList.remove('selected');
  }
  selectedCell = cell;
  cell.classList.add('selected');
  cell.focus();
  updateHighlights(cell);
}

function handleKeyDown(e) {
  if (!selectedCell) return;
  
  const row = parseInt(selectedCell.dataset.row);
  const col = parseInt(selectedCell.dataset.col);
  
  switch(e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (row > 0) {
        const newCell = document.querySelector(`[data-row="${row-1}"][data-col="${col}"]`);
        selectCell(newCell);
      }
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (row < 8) {
        const newCell = document.querySelector(`[data-row="${row+1}"][data-col="${col}"]`);
        selectCell(newCell);
      }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (col > 0) {
        const newCell = document.querySelector(`[data-row="${row}"][data-col="${col-1}"]`);
        selectCell(newCell);
      }
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (col < 8) {
        const newCell = document.querySelector(`[data-row="${row}"][data-col="${col+1}"]`);
        selectCell(newCell);
      }
      break;
    case 'Backspace':
    case 'Delete':
      if (!selectedCell.disabled) {
        selectedCell.value = '';
        selectedCell.classList.remove('incorrect');
        document.getElementById('feedback').textContent = '';
      }
      break;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
      if (!selectedCell.disabled) {
        e.preventDefault();
        selectedCell.value = e.key;
        onInput({ target: selectedCell });
      }
      break;
  }
}

function onInput(e) {
  const input = e.target;
  const row = parseInt(input.dataset.row);
  const col = parseInt(input.dataset.col);
  const value = input.value;
  
  input.classList.remove('incorrect');
  document.getElementById('feedback').textContent = '';
  
  if (value === '' || /^[1-9]$/.test(value)) {
    const numValue = value === '' ? 0 : parseInt(value);
    puzzle[row][col] = numValue;
    
    // Check if the number is incorrect
    if (numValue !== 0 && numValue !== solution[row][col]) {
      input.classList.add('incorrect');
      document.getElementById('feedback').textContent = 'Incorrect number!';
    }
    
    // Check if the puzzle is complete
    if (checkWin()) {
      stopTimer();
      document.getElementById('feedback').textContent = 'Congratulations! You solved the puzzle!';
    }
  } else {
    input.value = '';
  }
}

function checkWin() {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (puzzle[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

async function newGame() {
  const difficulty = getDifficulty();
  const res = await fetch(`/api/sudoku?difficulty=${difficulty}`);
  const data = await res.json();
  puzzle = data.puzzle;
  solution = data.solution;
  renderBoard();
  document.getElementById('feedback').textContent = '';
  startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  newGame();
}); 