class Maze {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
    this.stack = [];

    this.initGrid();
    this.generateMaze();
  }

  initGrid() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid.push({
          row: r,
          col: c,
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

  index(row, col) {
    if (row < 0 || col < 0 || row >= this.rows || col >= this.cols) {
      return -1;
    }
    return row * this.cols + col;
  }

  getNeighbors(cell) {
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

  generateMaze() {
    let current = this.grid[0];
    current.visited = true;

    do {
      const neighbors = this.getNeighbors(current);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.stack.push(current);
        this.removeWalls(current, next);
        current = next;
        current.visited = true;
      } else if (this.stack.length > 0) {
        current = this.stack.pop();
      }
    } while (this.stack.length > 0);
  }
}
