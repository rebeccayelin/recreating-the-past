const GRID_CONFIG = {
  shrinkFactor: 0.96,
  numRows: 9,
  numCols: 8,
  cellDim: 30,
  perturbRange: 5
};

let cellLookup = Array(GRID_CONFIG.numRows).fill().map(() => Array(GRID_CONFIG.numCols).fill(null));

function setup() {
  createCanvas(365, 380);
  noLoop();
  noStroke();
  fill(61, 61, 63);
}

function draw() {
  background(221, 220, 216);
  compute(GRID_CONFIG.numCols, GRID_CONFIG.numRows, 45, 50, 40, 0, 0);
  drawCells();
}

function drawCells() {
  for (let i = 0; i < GRID_CONFIG.numRows; i++) {
    for (let j = 0; j < GRID_CONFIG.numCols; j++) {
      if (cellLookup[i][j]) {
        cellLookup[i][j].draw();
      }
    }
  }
}

function compute(width, height, startX, startY, spacing, si, sj) {
  if (!isValidCompute(width, height, si, sj)) return;

  createTopEdgeCells(width, startX, startY, spacing, si, sj);
  createLeftEdgeCells(height, startX, startY, spacing, si, sj);

  // Recursive call with shrinking pattern
  compute(
    width - 1,
    height - 1,
    startX + spacing,
    startY + spacing,
    spacing * GRID_CONFIG.shrinkFactor,
    si + 1,
    sj + 1
  );
}

function isValidCompute(width, height, si, sj) {
  return width > 0 && height > 0 && si < GRID_CONFIG.numRows && sj < GRID_CONFIG.numCols;
}

function createTopEdgeCells(width, startX, startY, spacing, si, sj) {
  let x = startX;
  for (let i = 0; i < width && si + i < GRID_CONFIG.numRows; i++) {
    cellLookup[si + i][sj] = new Cell(x, startY);

    if (si === 0 && sj === 0 && i === 0) {
      cellLookup[0][0].resetPerturb();
    }

    if (si + i > 0) {
      cellLookup[si + i][sj].matchLeftCell(cellLookup[si + i - 1][sj]);
    }

    if (sj > 0) {
      if (si + i === 0) {
        cellLookup[si + i][sj].matchTopCell(cellLookup[si + i][sj - 1]);
      } else {
        cellLookup[si + i][sj].corners.topRight = cellLookup[si + i][sj - 1].corners.bottomRight.copy();
      }
    }
    x += spacing;
  }
}

function createLeftEdgeCells(height, startX, startY, spacing, si, sj) {
  for (let j = 1; j < height && sj + j < GRID_CONFIG.numCols; j++) {
    cellLookup[si][sj + j] = new Cell(startX, startY + j * spacing);

    cellLookup[si][sj + j].matchTopCell(cellLookup[si][sj + j - 1]);

    if (si > 0) {
      cellLookup[si][sj + j].matchLeftCell(cellLookup[si - 1][sj + j]);
    }
  }
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.corners = {
      topLeft: this.createPerturbedVector(),
      topRight: this.createPerturbedVector(),
      bottomLeft: this.createPerturbedVector(),
      bottomRight: this.createPerturbedVector()
    };
  }

  createPerturbedVector() {
    return createVector(
      random(-GRID_CONFIG.perturbRange, GRID_CONFIG.perturbRange),
      random(-GRID_CONFIG.perturbRange, GRID_CONFIG.perturbRange)
    );
  }

  draw() {
    const halfSize = GRID_CONFIG.cellDim / 2;
    quad(
      this.x - halfSize + this.corners.topLeft.x,
      this.y - halfSize + this.corners.topLeft.y,
      this.x + halfSize + this.corners.topRight.x,
      this.y - halfSize + this.corners.topRight.y,
      this.x + halfSize + this.corners.bottomRight.x,
      this.y + halfSize + this.corners.bottomRight.y,
      this.x - halfSize + this.corners.bottomLeft.x,
      this.y + halfSize + this.corners.bottomLeft.y
    );
  }

  resetPerturb() {
    Object.values(this.corners).forEach(corner => corner.set(0, 0));
  }

  matchLeftCell(leftCell) {
    this.corners.topLeft = leftCell.corners.topRight.copy();
    this.corners.bottomLeft = leftCell.corners.bottomRight.copy();
  }

  matchTopCell(topCell) {
    this.corners.topLeft = topCell.corners.bottomLeft.copy();
    this.corners.topRight = topCell.corners.bottomRight.copy();
  }
}