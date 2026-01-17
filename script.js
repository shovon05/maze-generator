/* =============================
   DOM REFERENCES
   ============================= */

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const overlay = document.getElementById("resultOverlay");
const timeText = document.getElementById("timeText");
const scoreText = document.getElementById("scoreText");
const highScoreText = document.getElementById("highScoreText");
const replayBtn = document.getElementById("replayBtn");
const printBtn = document.getElementById("printBtn");

/* =============================
   INITIAL STATE
   ============================= */

overlay.classList.add("hidden");
canvas.style.display = "none";
printBtn.style.display = "none";

let maze = null;
let cellSize = 25;
let currentLevel = null;

let gameStarted = false;
let gameFinished = false;
let startTime = 0;
let lastCell = null;
let pathPoints = [];

/* =============================
   CONFIG
   ============================= */

const levels = {
  easy: 10,
  medium: 20,
  hard: 40
};

const difficultyMultiplier = {
  easy: 1,
  medium: 2,
  hard: 3
};

/* =============================
   EVENT LISTENERS
   ============================= */

// Difficulty selection
document.querySelectorAll("#menu button").forEach(button => {
  button.addEventListener("click", () => {
    startGame(button.dataset.level);
  });
});

// Replay button
replayBtn.addEventListener("click", () => {
  overlay.classList.add("hidden");
  gameFinished = false;
  startGame(currentLevel);
});

// Print button (Maze page 1 + Guide page 2)
printBtn.addEventListener("click", () => {
  if (!maze) return; // safety guard
  window.print();
});

/* =============================
   GAME SETUP
   ============================= */

function startGame(level) {
  currentLevel = level;

  const size = levels[level];
  cellSize = Math.floor(600 / size);

  canvas.width = size * cellSize;
  canvas.height = size * cellSize;

  maze = new Maze(size, size);

  gameStarted = false;
  gameFinished = false;
  lastCell = null;
  pathPoints = [];

  canvas.style.display = "block";
  printBtn.style.display = "inline-flex";
  overlay.classList.add("hidden");

  drawAll();
}

/* =============================
   DRAWING
   ============================= */

function drawAll() {
  drawMaze();
  drawPath();
  drawStartAndEnd();
}

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

// Glowing mouse path
function drawPath() {
  if (pathPoints.length < 2) return;

  for (let i = 1; i < pathPoints.length; i++) {
    const prev = pathPoints[i - 1];
    const curr = pathPoints[i];
    const alpha = i / pathPoints.length;

    ctx.strokeStyle = `rgba(76, 201, 240, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(255, 110, 199, 0.6)";
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
}

function drawStartAndEnd() {
  ctx.fillStyle = "green";
  ctx.fillRect(2, 2, cellSize - 4, cellSize - 4);

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
   GAME LOGIC
   ============================= */

canvas.addEventListener("mousemove", handleMouseMove);

function handleMouseMove(e) {
  if (!maze || gameFinished) return;

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
    pathPoints.push({ x, y });
    drawAll();
    return;
  }

  // Wall collision
  if (isTouchingWall(x, y, cell)) {
    showFailure(cell);
    resetGame();
    return;
  }

  // Enforce adjacency & valid wall
  const dr = Math.abs(cell.row - lastCell.row);
  const dc = Math.abs(cell.col - lastCell.col);

  if (dr + dc > 1 || !isValidMove(lastCell, cell)) {
    showFailure(cell);
    resetGame();
    return;
  }

  lastCell = cell;

  // Smooth sampling
  const lastPoint = pathPoints[pathPoints.length - 1];
  if (!lastPoint || Math.hypot(lastPoint.x - x, lastPoint.y - y) > 3) {
    pathPoints.push({ x, y });
  }

  drawAll();

  // Finish
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
   END GAME / RESET
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
  pathPoints = [];
  printBtn.style.display = "none";
  drawAll();
}

function finishGame() {
  gameFinished = true;

  const timeTaken = (Date.now() - startTime) / 1000;

  let score = Math.floor(
    1000 - timeTaken * 100 * difficultyMultiplier[currentLevel]
  );
  score = Math.max(score, 0);

  timeText.textContent = `Time: ${timeTaken.toFixed(2)} seconds`;
  scoreText.textContent = `Score: ${score}`;

  const key = `mazeHighScore_${currentLevel}`;
  const best = localStorage.getItem(key);

  if (!best || score > best) {
    localStorage.setItem(key, score);
    highScoreText.textContent = "🏆 New High Score!";
  } else {
    highScoreText.textContent = `High Score: ${best}`;
  }

  overlay.classList.remove("hidden");
}
