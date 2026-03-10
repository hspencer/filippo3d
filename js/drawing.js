// Filippo 3D - Drawing & 3D scene rendering

function drawScene() {
  // Background
  let bg = darkMode ? BG_DARK : BG_LIGHT;
  background(bg[0], bg[1], bg[2]);

  // Animate view transitions
  if (animatingView) {
    let ease = 0.12;
    let done = true;

    let dx = nx - ux;
    let dy = ny - uy;
    let dz = nz - uz;

    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001 || Math.abs(dz) > 0.001) {
      ux += dx * ease;
      uy += dy * ease;
      uz += dz * ease;
      done = false;
    } else {
      ux = nx;
      uy = ny;
      uz = nz;
    }

    if (done) animatingView = false;
  }

  push();

  // Apply pan (translation in screen space, before rotation)
  translate(panX, panY, panZ);

  // Apply view rotation
  rotateX(ux);
  rotateY(uy);
  rotateZ(uz);

  // Draw reference axis
  drawAxis();

  // Draw all completed strokes
  for (let t of trazos) {
    t.draw();
  }

  // Draw current stroke being drawn
  if (trazoActual && isDrawing) {
    trazoActual.draw();
  }

  pop();
}

function drawAxis() {
  let len = 60;
  let alpha = 80;
  strokeWeight(1);

  // X axis - red
  stroke(255, 60, 60, alpha);
  line(0, 0, 0, len, 0, 0);

  // Y axis - green
  stroke(60, 255, 60, alpha);
  line(0, 0, 0, 0, len, 0);

  // Z axis - blue
  stroke(60, 60, 255, alpha);
  line(0, 0, 0, 0, 0, len);

  // Small grid on XY plane (drawing plane)
  stroke(255, 255, 255, 15);
  strokeWeight(0.5);
  let gridSize = 400;
  let step = 50;
  for (let i = -gridSize; i <= gridSize; i += step) {
    line(i, -gridSize, 0, i, gridSize, 0);
    line(-gridSize, i, 0, gridSize, i, 0);
  }
}

function setView(viewName) {
  if (VIEW_PRESETS[viewName]) {
    let v = VIEW_PRESETS[viewName];
    nx = v[0];
    ny = v[1];
    nz = v[2];
    animatingView = true;
    currentView = viewName;
    freeRotate = false;
    updateViewButtons();
    removeRotateIndicator();
  }
}

function exportPNG() {
  let timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  saveCanvas('filippo3d-' + timestamp, 'png');
}
