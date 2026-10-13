// Configuration object
const CONFIG = {
  CANVAS: {
    WIDTH: 600,
    HEIGHT: 400,
    SCALE_FACTOR: 4
  },
  CURVE: {
    NUM_POINTS: 250,
    PERTURB_AMOUNT: 0.20,
    PHASE_OFFSETS: [
      [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 2, y: 2 }, { x: 3, y: 3 }],
      [{ x: 0, y: 0 }],
      [{ x: 0, y: 0 }],
      [{ x: 0, y: 0 }],
      [{ x: 0, y: 0 }],
      [{ x: 0, y: 0 }]
    ],
    BRIGHT_POINT_PROBABILITIES: [0.2, 0.99, 0.9, 0.6, 0.5, 0.99]
  }
};

class NeonRenderer {
  static createPerturbedColor(baseColor) {
    return color(
      constrain(red(baseColor) + random(-40, 40), 0, 255),
      constrain(green(baseColor) + random(-40, 40), 0, 255),
      constrain(blue(baseColor) + random(-40, 40), 0, 255)
    );
  }

  static drawLayer(x, y, layerColor, size, weight, alpha, brightness, rotation) {
    stroke(red(layerColor), green(layerColor), blue(layerColor), alpha * brightness);
    strokeWeight(weight * random(0.8, 1.2));
    rotate(rotation);

    const randomWidth = size + random(-0.4, 0.4);
    const randomHeight = size + random(-0.4, 0.4);
    ellipse(random(-0.2, 0.2), random(-0.2, 0.2), randomWidth, randomHeight);
  }

  static drawNeonPoint(x, y, baseColor, brightProb) {
    const perturbedX = x + random(-0.3, 0.3);
    const perturbedY = y + random(-0.3, 0.3);
    const brightness = random(0.6, 1.3) * (random() > (1 - brightProb) ? 1.4 : 1);
    const whiteBlend = color(255, 255, 255);

    push();
    translate(perturbedX, perturbedY);
    noFill();

    // Draw outer layers
    this.drawOuterLayers(baseColor, brightness);

    // Draw inner bright layers if probability check passes
    if (random() > (1 - brightProb)) {
      this.drawInnerLayers(baseColor, whiteBlend, brightness);
    }

    pop();
  }

  static drawOuterLayers(baseColor, brightness) {
    for (let i = 8; i >= 1; i--) {
      const layerColor = this.createPerturbedColor(baseColor);
      const size = map(i, 8, 1, 4, 0.5);
      const weight = map(i, 8, 1, 3, 0.5);
      const alpha = map(i, 8, 1, 5, 40) * (1 + random(-0.3, 0.3));
      this.drawLayer(0, 0, layerColor, size, weight, alpha, brightness, random(-0.15, 0.15));
    }
  }

  static drawInnerLayers(baseColor, whiteBlend, brightness) {
    for (let i = 5; i >= 1; i--) {
      const whiteAmount = map(i, 5, 1, 0.4, 0.95) + random(-0.1, 0.1);
      const layerColor = this.createPerturbedColor(baseColor);
      const blendedColor = lerpColor(layerColor, whiteBlend, whiteAmount);

      this.drawLayer(0, 0, blendedColor,
        map(i, 5, 1, 1.2, 0.3),  // size
        map(i, 5, 1, 0.8, 0.2),  // weight
        map(i, 5, 1, 80, 220) * (1 + random(-0.2, 0.2)),  // alpha
        brightness,
        random(-0.2, 0.2)  // rotation
      );
    }

    // Add solid center point
    const finalColor = lerpColor(baseColor, whiteBlend, 0.8);
    this.drawLayer(0, 0, finalColor, 0.2, 0.3, 255, 255, random(-0.15, 0.15));
  }
}

class RoseCurve {
  constructor() {
    this.k = 2;
    this.phases = this.initializePhases();
    this.colors = this.initializeColors();
  }

  initializePhases() {
    return [0, PI/6, PI/3, PI/2, 2*PI/3, 5*PI/6].map(phase =>
      phase + random(-CONFIG.CURVE.PERTURB_AMOUNT, CONFIG.CURVE.PERTURB_AMOUNT)
    );
  }

  initializeColors() {
    return [
      color(255, 0, 0),    // red
      color(100, 0, 255),  // magenta
      color(0, 255, 255),    // cyan
      color(0, 255, 0),    // green
      color(0, 0, 255),  // blue
      color(255, 0, 200)   // pink
    ];
  }

  calculatePoint(theta, phi, scale) {
    const r = cos(this.k * theta + phi) * scale;
    return {
      x: r * cos(theta),
      y: r * sin(theta)
    };
  }

  drawCurve(phi, offsets, colorIndex) {
    for (const offset of offsets) {
      for (let t = 0; t < CONFIG.CURVE.NUM_POINTS; t++) {
        const theta = map(t, 0, CONFIG.CURVE.NUM_POINTS, 0, TWO_PI);
        const point = this.calculatePoint(theta, phi, width / CONFIG.CANVAS.SCALE_FACTOR);
        NeonRenderer.drawNeonPoint(
          point.x + offset.x,
          point.y + offset.y,
          this.colors[colorIndex],
          CONFIG.CURVE.BRIGHT_POINT_PROBABILITIES[colorIndex]
        );
      }
    }
  }

  update() {
    this.k += 0.01;
  }

  draw() {
    background(0);
    translate(width / 2, height / 2);

    for (let i = this.phases.length - 1; i >= 0; i--) {
      noFill();
      this.drawCurve(this.phases[i], CONFIG.CURVE.PHASE_OFFSETS[i], i);
    }
  }
}

// Global instance
let roseCurve;

function setup() {
  createCanvas(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
  angleMode(RADIANS);
  roseCurve = new RoseCurve();
  noLoop();
}

function draw() {
  roseCurve.draw();
  roseCurve.update();
}