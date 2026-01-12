const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

let maze;
let cellSize = 25;

// Difficulty mapping
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
  drawMaze();
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  maze.grid.forEach(cell => {
    const x = cell.col * cellSize;
    const y = cell.row * cellSize;

    if (cell.walls.top) {
      drawLine(x, y, x + cellSize, y);
    }
    if (cell.walls.right) {
      drawLine(x + cellSize, y, x + cellSize, y + cellSize);
    }
    if (cell.walls.bottom) {
      drawLine(x + cellSize, y + cellSize, x, y + cellSize);
    }
    if (cell.walls.left) {
      drawLine(x, y + cellSize, x, y);
    }
  });
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
