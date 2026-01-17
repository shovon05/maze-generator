const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");

const printBtn = document.getElementById("printBtn");
const guideBtn = document.getElementById("guideBtn");

const guideOverlay = document.getElementById("guideOverlay");
const closeGuideBtn = document.getElementById("closeGuideBtn");

const resultOverlay = document.getElementById("resultOverlay");
const replayBtn = document.getElementById("replayBtn");

let maze = null;
let cellSize = 25;

const levels = { easy: 10, medium: 20, hard: 40 };

/* SHOW GUIDE POPUP */
guideBtn.onclick = () => guideOverlay.classList.remove("hidden");
closeGuideBtn.onclick = () => guideOverlay.classList.add("hidden");

/* DIFFICULTY */
document.querySelectorAll("#menu button").forEach(btn => {
  btn.onclick = () => startGame(btn.dataset.level);
});

replayBtn.onclick = () => location.reload();

printBtn.onclick = () => window.print();

function startGame(level) {
  const size = levels[level];
  cellSize = Math.floor(600 / size);

  canvas.width = canvas.height = size * cellSize;
  canvas.style.display = "block";

  printBtn.style.display = "inline-flex";
  guideBtn.style.display = "inline-flex";

  maze = new Maze(size, size);
  drawMaze();
}

function drawMaze() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;

  maze.grid.forEach(c => {
    const x = c.col * cellSize;
    const y = c.row * cellSize;

    if (c.walls.top) line(x,y,x+cellSize,y);
    if (c.walls.right) line(x+cellSize,y,x+cellSize,y+cellSize);
    if (c.walls.bottom) line(x+cellSize,y+cellSize,x,y+cellSize);
    if (c.walls.left) line(x,y+cellSize,x,y);
  });

  ctx.fillStyle = "green";
  ctx.fillRect(2,2,cellSize-4,cellSize-4);

  ctx.fillStyle = "red";
  ctx.fillRect(
    canvas.width-cellSize+2,
    canvas.height-cellSize+2,
    cellSize-4,
    cellSize-4
  );
}

function line(x1,y1,x2,y2){
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}
