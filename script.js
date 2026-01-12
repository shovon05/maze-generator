const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

let maze;
let cellSize = 25;

let gameStarted = false;
let startTime = 0;
let lastCell = null;

const levels = {
  easy: 10,
  medium: 20,
  hard: 40
};

document.querySelectorAll("#menu button").forEach(button => {
  button.addEventListener("click", () => {
    const level = button.dataset.level;
    startGame(level);
  });
});

function startGame(level) {
  const size = levels[level];
  cellSize = Math.floor(600 / size);

  canvas.width = size * cellSize;
  canvas.height = size * cellSize;

  maze = new Maze(size, size);
  gameStarted = false;
  lastCell = null;

  drawMaze();
  drawStartAndEnd();
}

/* =============================
   DRAWING
   ============================= */

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  maze.grid.forEach(cell => {
    const x = cell.col * cellSize;
    const y = cell.row * cellSize;

    if (cell.walls.top) drawLine(x, y, x + cellSize, y);
    if (cell.walls.right) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
    if (cell.walls.bottom) drawLine(x + cellSize, y + cellSize, x, y + cellSize);
    if (cell.walls.left) drawLine(x, y + cellSize, x, y);
  });
}

function drawStartAndEnd() {
  // Start
  ctx.fillStyle = "green";
  ctx.fillRect(2, 2, cellSize - 4, cellSize - 4);

  // End
  ctx.fillStyle = "red";
  ctx.fillRect(
    (maze.cols - 1) * cellSize + 2,
    (maze.rows - 1) * cellSize + 2,
    cellSize - 4,
    cellSize - 4
  );
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/* =============================
   MOUSE / GAME LOGIC
   ============================= */

canvas.addEventListener("mousemove", handleMouseMove);

function handleMouseMove(e) {
  if (!maze) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  if (row < 0 || col < 0 || row >= maze.rows || col >= maze.cols) {
    resetGame();
    return;
  }

  const cell = maze.grid[maze.index(row, col)];

  // Must start from green cell
  if (!gameStarted) {
    if (row !== 0 || col !== 0) return;

    gameStarted = true;
    startTime = Date.now();
    lastCell = cell;
    return;
  }

  // Wall collision (fine-grained)
  if (isTouchingWall(x, y, cell)) {
    showFailure(cell);
    resetGame();
    return;
  }

  // Enforce adjacency
  const dr = Math.abs(cell.row - lastCell.row);
  const dc = Math.abs(cell.col - lastCell.col);

  if (dr + dc > 1) {
    showFailure(cell);
    resetGame();
    return;
  }

  // Enforce open wall movement
  if (!isValidMove(lastCell, cell)) {
    showFailure(cell);
    resetGame();
    return;
  }

  lastCell = cell;

  // Finish check
  if (row === maze.rows - 1 && col === maze.cols - 1) {
    finishGame();
  }
}

function isTouchingWall(x, y, cell) {
  const localX = x - cell.col * cellSize;
  const localY = y - cell.row * cellSize;
  const margin = 3;

  if (cell.walls.top && localY <= margin) return true;
  if (cell.walls.left && localX <= margin) return true;
  if (cell.walls.right && localX >= cellSize - margin) return true;
  if (cell.walls.bottom && localY >= cellSize - margin) return true;

  return false;
}

function isValidMove(from, to) {
  if (from.row === to.row) {
    if (from.col < to.col) return !from.walls.right;
    if (from.col > to.col) return !from.walls.left;
  }

  if (from.col === to.col) {
    if (from.row < to.row) return !from.walls.bottom;
    if (from.row > to.row) return !from.walls.top;
  }

  return false;
}

/* =============================
   FEEDBACK / RESET
   ============================= */

function showFailure(cell) {
  ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
  ctx.fillRect(
    cell.col * cellSize,
    cell.row * cellSize,
    cellSize,
    cellSize
  );
}

function resetGame() {
  gameStarted = false;
  lastCell = null;
  drawMaze();
  drawStartAndEnd();
}

function finishGame() {
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  alert(`Maze completed in ${timeTaken} seconds`);
  gameStarted = false;
  lastCell = null;
}
