function setup() {
  createCanvas(640, 640);
  noLoop();
}

function draw() {
  background('#fcf7f2');

  let tileSize = 20;
  let padding = 40;

  let rows = floor((height - 2 * padding) / tileSize);
  let cols = floor((width - 2 * padding) / tileSize);

  let grid = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = 0;
    }
  }

  function edgesUsed(state) {
    switch (state) {
      case 0:
        return { top: false, right: false, bottom: false, left: false };
      case 1:
        return { top: true, right: false, bottom: false, left: true };
      case 2:
        return { top: false, right: true, bottom: true, left: false };
      case 3:
        return { top: false, right: false, bottom: true, left: true };
      case 4:
        return { top: true, right: true, bottom: false, left: false };
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let possibleStates = [0, 0, 1, 2, 3, 4];
      shuffle(possibleStates, true);

      let chosenState = 0;
      for (let s of possibleStates) {
        let e = edgesUsed(s);
        let valid = true;

        if (r > 0) {
          let topNeighborState = grid[r - 1][c];
          let topEdges = edgesUsed(topNeighborState);
          if (topEdges.bottom && e.top) {
            valid = false;
          }
        }

        if (c > 0) {
          let leftNeighborState = grid[r][c - 1];
          let leftEdges = edgesUsed(leftNeighborState);
          if (leftEdges.right && e.left) {
            valid = false;
          }
        }

        if (valid) {
          chosenState = s;
          break;
        }
      }

      grid[r][c] = chosenState;
    }
  }

  noStroke();
  let fillColor = color('#D45D36');

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let s = grid[r][c];
      let x = c * tileSize + padding;
      let y = r * tileSize + padding;

      push();
      translate(x, y);

      switch (s) {
        case 0:
          break;
        case 1:
          fill(fillColor);
          triangle(0, 0, tileSize, 0, 0, tileSize);
          break;
        case 2:
          fill(fillColor);
          triangle(tileSize, tileSize, tileSize, 0, 0, tileSize);
          break;
        case 3:
          fill(fillColor);
          triangle(0, tileSize, 0, 0, tileSize, tileSize);
          break;
        case 4:
          fill(fillColor);
          triangle(tileSize, 0, 0, 0, tileSize, tileSize);
          break;
      }

      pop();
    }
  }
}
