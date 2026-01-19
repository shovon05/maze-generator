/* =============================
   DOM REFERENCES
   ============================= */
const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const printBtn = document.getElementById("printBtn");
const guideBtn = document.getElementById("guideBtn");
const controlsPanel = document.getElementById("controls");
const guideOverlay = document.getElementById("guideOverlay");
const resultOverlay = document.getElementById("resultOverlay");
const timeText = document.getElementById("timeText");
const scoreText = document.getElementById("scoreText");
const highScoreText = document.getElementById("highScoreText");

/* =============================
   GAME STATE
   ============================= */
let maze = null;
let cellSize = 0;
let currentLevel = "easy";
let startTime = 0;
let gameFinished = false;
let gameInterval = null;

// Player Position & Path History
let player = { 
  row: 0, 
  col: 0,
  path: [] // Stores coordinates of visited cells
};

const levels = {
  easy: 10,
  medium: 20,
  hard: 30 
};

// Multipliers for scoring
const difficultyBonus = {
  easy: 1,
  medium: 1.5,
  hard: 2.5
};

/* =============================
   INITIALIZATION
   ============================= */

// Event: Difficulty Buttons
document.querySelectorAll("#menu button").forEach(btn => {
  btn.addEventListener("click", () => startGame(btn.dataset.level));
});

// Event: Replay
document.getElementById("replayBtn").addEventListener("click", () => {
  resultOverlay.classList.add("hidden");
  startGame(currentLevel);
});

// Event: Guide
guideBtn.addEventListener("click", () => guideOverlay.classList.remove("hidden"));
document.getElementById("closeGuideBtn").addEventListener("click", () => guideOverlay.classList.add("hidden"));

// Event: Print
printBtn.addEventListener("click", () => window.print());

/* =============================
   GAME LOOP
   ============================= */

function startGame(level) {
  currentLevel = level;
  gameFinished = false;
  
  // Reset Player & Path
  player = { 
    row: 0, 
    col: 0,
    path: [{row: 0, col: 0}] // Start point is implicitly visited
  };

  // 1. Calculate Canvas Size (Responsive)
  const size = levels[level];
  const screenWidth = window.innerWidth - 40; // 20px padding each side
  const maxCanvasWidth = 600;
  
  // Fit canvas to screen or max width
  const totalWidth = Math.min(screenWidth, maxCanvasWidth);
  cellSize = Math.floor(totalWidth / size);

  canvas.width = cellSize * size;
  canvas.height = cellSize * size;

  // 2. Generate Maze
  maze = new Maze(size, size); // Uses your existing maze.js class

  // 3. Show UI
  canvas.style.display = "block";
  controlsPanel.classList.remove("hidden");
  
  // If using the Grid layout for controls, ensure it uses Grid, not Flex
  controlsPanel.style.display = "grid"; 

  printBtn.classList.remove("hidden");
  printBtn.style.display = "inline-flex";
  guideBtn.classList.remove("hidden");
  guideBtn.style.display = "inline-flex";
  
  // 4. Start Timer
  startTime = Date.now();
  if (gameInterval) clearInterval(gameInterval);
  
  // 5. Initial Draw
  drawGame();
}

/* =============================
   RENDERING
   ============================= */

function drawGame() {
  if (!maze) return;

  // Clear Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // --- 1. Draw Visited Path (The Trail) ---
  // We draw this first so it appears *under* the walls and player
  ctx.fillStyle = "rgba(76, 201, 240, 0.2)"; // Light Blue, transparent
  player.path.forEach(step => {
    ctx.fillRect(
      step.col * cellSize, 
      step.row * cellSize, 
      cellSize, 
      cellSize
    );
  });

  // --- 2. Draw Start (Green) ---
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(4, 4, cellSize - 8, cellSize - 8);

  // --- 3. Draw Goal (Red) ---
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(
    (maze.cols - 1) * cellSize + 4,
    (maze.rows - 1) * cellSize + 4,
    cellSize - 8,
    cellSize - 8
  );

  // --- 4. Draw Maze Walls (Thicker) ---
  ctx.strokeStyle = "#1b103a"; // Dark blue walls
  ctx.lineWidth = 4;           // Thicker lines for better visuals
  ctx.lineCap = "round";

  maze.grid.forEach(cell => {
    const x = cell.col * cellSize;
    const y = cell.row * cellSize;

    ctx.beginPath();
    if (cell.walls.top) { ctx.moveTo(x, y); ctx.lineTo(x + cellSize, y); }
    if (cell.walls.right) { ctx.moveTo(x + cellSize, y); ctx.lineTo(x + cellSize, y + cellSize); }
    if (cell.walls.bottom) { ctx.moveTo(x + cellSize, y + cellSize); ctx.lineTo(x, y + cellSize); }
    if (cell.walls.left) { ctx.moveTo(x, y + cellSize); ctx.lineTo(x, y); }
    ctx.stroke();
  });

  // --- 5. Draw Player (The Ball) ---
  const px = player.col * cellSize + cellSize / 2;
  const py = player.row * cellSize + cellSize / 2;
  // Size the ball relative to the cell (slightly smaller than full cell)
  const radius = cellSize / 3.5; 

  ctx.beginPath();
  ctx.arc(px, py, radius, 0, 2 * Math.PI);
  
  // Neon Glow Effect
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff6ec7"; // Pink Glow
  ctx.fillStyle = "#ff6ec7";   // Pink Fill
  
  ctx.fill();
  
  // Reset shadow so it doesn't affect other drawings next frame
  ctx.shadowBlur = 0; 
}

/* =============================
   MOVEMENT LOGIC (COLLISION)
   ============================= */

function movePlayer(dRow, dCol) {
  if (gameFinished) return;

  const currentCell = maze.grid[maze.index(player.row, player.col)];
  const nextRow = player.row + dRow;
  const nextCol = player.col + dCol;

  // 1. Check bounds
  if (nextRow < 0 || nextCol < 0 || nextRow >= maze.rows || nextCol >= maze.cols) return;

  // 2. Check Walls (Collision Detection)
  // Note: We check the wall of the *current* cell in the direction we are moving
  if (dRow === -1 && currentCell.walls.top) return;    // Moving Up
  if (dRow === 1 && currentCell.walls.bottom) return;  // Moving Down
  if (dCol === 1 && currentCell.walls.right) return;   // Moving Right
  if (dCol === -1 && currentCell.walls.left) return;   // Moving Left

  // 3. Move
  player.row = nextRow;
  player.col = nextCol;

  // 4. Record Path
  player.path.push({ row: nextRow, col: nextCol });

  drawGame();
  checkWin();
}

/* =============================
   INPUT HANDLERS
   ============================= */

// 1. Keyboard (PC)
document.addEventListener("keydown", (e) => {
  if (canvas.style.display === "none") return;
  
  // Prevent default scrolling for arrow keys
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
  
  switch(e.key) {
    case "ArrowUp": case "w": movePlayer(-1, 0); break;
    case "ArrowDown": case "s": movePlayer(1, 0); break;
    case "ArrowLeft": case "a": movePlayer(0, -1); break;
    case "ArrowRight": case "d": movePlayer(0, 1); break;
  }
});

// 2. On-Screen Buttons (Mobile / Joystick)
document.getElementById("btnUp").addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("btnDown").addEventListener("click", () => movePlayer(1, 0));
document.getElementById("btnLeft").addEventListener("click", () => movePlayer(0, -1));
document.getElementById("btnRight").addEventListener("click", () => movePlayer(0, 1));

// 3. Mouse Hover (Hybrid)
// Allows PC users to guide the ball with the mouse
canvas.addEventListener("mousemove", (e) => {
  if (gameFinished) return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const mouseCol = Math.floor(mouseX / cellSize);
  const mouseRow = Math.floor(mouseY / cellSize);

  // Check if mouse is exactly 1 cell away from player (adjacent)
  const dRow = mouseRow - player.row;
  const dCol = mouseCol - player.col;

  // Only move if it's a direct neighbor (no diagonals, no jumps)
  if (Math.abs(dRow) + Math.abs(dCol) === 1) {
    movePlayer(dRow, dCol);
  }
});

/* =============================
   GAME OVER
   ============================= */

function checkWin() {
  if (player.row === maze.rows - 1 && player.col === maze.cols - 1) {
    gameFinished = true;
    
    // Scoring Calculation
    const timeTaken = (Date.now() - startTime) / 1000;
    
    // Base 1000 pts. Lose 10 pts per second.
    // Ensure base score doesn't drop below 50.
    let baseScore = Math.max(50, 1000 - (timeTaken * 10));
    
    // Apply Difficulty Multiplier
    const finalScore = Math.floor(baseScore * difficultyBonus[currentLevel]);

    timeText.innerText = `⏱️ ${timeTaken.toFixed(1)}s`;
    scoreText.innerText = `🏆 ${finalScore}`;

    // High Score Logic (LocalStorage)
    const key = `maze_high_${currentLevel}`;
    const best = localStorage.getItem(key) || 0;
    if (finalScore > parseInt(best)) {
      localStorage.setItem(key, finalScore);
      highScoreText.innerText = "✨ New High Score!";
    } else {
      highScoreText.innerText = `Best: ${best}`;
    }

    resultOverlay.classList.remove("hidden");
  }
}