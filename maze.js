class Maze {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
    this.stack = [];

    this.initGrid();
    this.generateMaze();
  }

  /* =============================
     GRID INITIALIZATION
     ============================= */

  initGrid() {
    this.grid = [];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.grid.push({
          row,
          col,
          visited: false,
          walls: {
            top: true,
            right: true,
            bottom: true,
            left: true
          }
        });
      }
    }
  }

  /* =============================
     INDEX HELPER
     ============================= */

  index(row, col) {
    if (row < 0 || col < 0 || row >= this.rows || col >= this.cols) {
      return -1;
    }
    return row * this.cols + col;
  }

  /* =============================
     NEIGHBOR CHECK
     ============================= */

  getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { row, col } = cell;

    const top = this.grid[this.index(row - 1, col)];
    const right = this.grid[this.index(row, col + 1)];
    const bottom = this.grid[this.index(row + 1, col)];
    const left = this.grid[this.index(row, col - 1)];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    return neighbors;
  }

  /* =============================
     WALL REMOVAL
     ============================= */

  removeWalls(current, next) {
    const dx = current.col - next.col;
    const dy = current.row - next.row;

    if (dx === 1) {
      current.walls.left = false;
      next.walls.right = false;
    } else if (dx === -1) {
      current.walls.right = false;
      next.walls.left = false;
    }

    if (dy === 1) {
      current.walls.top = false;
      next.walls.bottom = false;
    } else if (dy === -1) {
      current.walls.bottom = false;
      next.walls.top = false;
    }
  }

  /* =============================
     MAZE GENERATION (DFS)
     ============================= */

  generateMaze() {
    let current = this.grid[0];
    current.visited = true;
    this.stack.push(current);

    while (this.stack.length > 0) {
      const neighbors = this.getUnvisitedNeighbors(current);

      if (neighbors.length > 0) {
        const next =
          neighbors[Math.floor(Math.random() * neighbors.length)];

        this.removeWalls(current, next);

        next.visited = true;
        this.stack.push(current);
        current = next;
      } else {
        current = this.stack.pop();
      }
    }
  }
}
