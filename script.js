/* =============================
   DOM REFERENCES
   ============================= */

const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const printBtn = document.getElementById("printBtn");
const guideBtn = document.getElementById("guideBtn");

const guideOverlay = document.getElementById("guideOverlay");
const guideBox = document.getElementById("guideBox");
const closeGuideBtn = document.getElementById("closeGuideBtn");

const resultOverlay = document.getElementById("resultOverlay");
const replayBtn = document.getElementById("replayBtn");
const timeText = document.getElementById("timeText");
const scoreText = document.getElementById("scoreText");
const highScoreText = document.getElementById("highScoreText");

/* =============================
   INITIAL STATE
   ============================= */

canvas.style.display = "none";
printBtn.style.display = "none";
guideBtn.style.display = "none";
guideOverlay.classList.add("hidden");
resultOverlay.classList.add("hidden");

/* =============================
   GAME VARIABLES
   ============================= */

let maze = null;
let cellSize = 25;
let currentLevel = null;
let startTime = 0;
let gameFinished = false;

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
   GUIDE MODAL LOGIC
   ============================= */

// Open guide
guideBtn.addEventListener("click", () => {
  guideOverlay.classList.remove("hidden");
});

// Close guide button
closeGuideBtn.addEventListener("click", closeGuide);

// Click outside to close
guideOverlay.addEventListener("click", (e) => {
  if (e.target === guideOverlay) closeGuide();
});

// ESC key to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !guideOverlay.classList.contains("hidden")) {
    closeGuide();
  }
});

function closeGuide() {
  guideOverlay.classList.add("hidden");
}

/* =============================
   DIFFICULTY SELECTION
   ============================= */

document.querySelectorAll("#menu button").forEach(button => {
  button.addEventListener("click", () => {
    startGame(button.dataset.level);
  });
});

/* =============================
   GAME SETUP
   ============================= */

function startGame(level) {
  currentLevel = level;
  gameFinished = false;

  const size = levels[level];
  cellSize = Math.floor(600 / size);

  canvas.width = size * cellSize;
  canvas.height = size * cellSize;

  maze = new Maze(size, size);

  canvas.style.display = "block";
  printBtn.style.display = "inline-flex";
  guideBtn.style.display = "inline-flex";

  startTime = Date.now();
  resultOverlay.classList.add("hidden");

  drawMaze();
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

  // Start (green)
  ctx.fillStyle = "green";
  ctx.fillRect(2, 2, cellSize - 4, cellSize - 4);

  // End (red)
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
   SIMPLE FINISH LOGIC (SAFE)
   ============================= */

canvas.addEventListener("mousemove", (e) => {
  if (!maze || gameFinished) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  if (row === maze.rows - 1 && col === maze.cols - 1) {
    finishGame();
  }
});

/* =============================
   END GAME
   ============================= */

function finishGame() {
  gameFinished = true;

  const timeTaken = (Date.now() - startTime) / 1000;
  const score = Math.max(
    0,
    Math.floor(1000 - timeTaken * 100 * difficultyMultiplier[currentLevel])
  );

  timeText.textContent = `⏱️ Time: ${timeTaken.toFixed(2)}s`;
  scoreText.textContent = `🏆 Score: ${score}`;

  const key = `mazeHighScore_${currentLevel}`;
  const best = localStorage.getItem(key);

  if (!best || score > best) {
    localStorage.setItem(key, score);
    highScoreText.textContent = "✨ New High Score!";
  } else {
    highScoreText.textContent = `Best: ${best}`;
  }

  resultOverlay.classList.remove("hidden");
}

/* =============================
   REPLAY
   ============================= */

replayBtn.addEventListener("click", () => {
  resultOverlay.classList.add("hidden");
  startGame(currentLevel);
});

/* =============================
   PRINT
   ============================= */

printBtn.addEventListener("click", () => {
  if (!maze) return;
  window.print();
});
