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

  // Reference cube (top-left corner, after main scene)
  drawReferenceCube();
}

function drawReferenceCube() {
  let size = 32;
  // Position: top-left, offset from edge (account for panel)
  let panelOffset = document.getElementById('panel').classList.contains('collapsed') ? 0 : 220;
  let cx = -width / 2 + panelOffset + 50;
  let cy = -height / 2 + 55;

  push();
  translate(cx, cy, 0);
  rotateX(ux);
  rotateY(uy);
  rotateZ(uz);

  // Cube faces - semi-transparent
  let faceAlpha = darkMode ? 30 : 20;
  let edgeAlpha = darkMode ? 80 : 100;
  let edgeCol = darkMode ? 255 : 60;

  strokeWeight(0.8);
  stroke(edgeCol, edgeAlpha);

  // Draw each face manually for control
  let s = size / 2;

  // Front face (z+) — the F face, slightly highlighted
  fill(231, 76, 60, faceAlpha + 25);
  beginShape();
  vertex(-s, -s, s);
  vertex( s, -s, s);
  vertex( s,  s, s);
  vertex(-s,  s, s);
  endShape(CLOSE);

  // Back face (z-)
  fill(edgeCol, faceAlpha);
  beginShape();
  vertex(-s, -s, -s);
  vertex( s, -s, -s);
  vertex( s,  s, -s);
  vertex(-s,  s, -s);
  endShape(CLOSE);

  // Top face (y-)
  fill(edgeCol, faceAlpha);
  beginShape();
  vertex(-s, -s, -s);
  vertex( s, -s, -s);
  vertex( s, -s,  s);
  vertex(-s, -s,  s);
  endShape(CLOSE);

  // Bottom face (y+)
  fill(edgeCol, faceAlpha);
  beginShape();
  vertex(-s, s, -s);
  vertex( s, s, -s);
  vertex( s, s,  s);
  vertex(-s, s,  s);
  endShape(CLOSE);

  // Right face (x+)
  fill(edgeCol, faceAlpha);
  beginShape();
  vertex(s, -s, -s);
  vertex(s,  s, -s);
  vertex(s,  s,  s);
  vertex(s, -s,  s);
  endShape(CLOSE);

  // Left face (x-)
  fill(edgeCol, faceAlpha);
  beginShape();
  vertex(-s, -s, -s);
  vertex(-s,  s, -s);
  vertex(-s,  s,  s);
  vertex(-s, -s,  s);
  endShape(CLOSE);

  // Draw 'F' on front face (z+ face)
  // The F is drawn as lines on the front face, slightly in front
  let fz = s + 0.5;
  let fCol = darkMode ? color(255, 255, 255, 200) : color(40, 40, 40, 200);
  stroke(fCol);
  strokeWeight(1.8);
  noFill();

  // F letter: vertical stroke
  let fl = size * 0.3;  // letter half-height
  let fw = size * 0.2;  // letter half-width
  line(-fw, -fl, fz, -fw, fl, fz);          // vertical |
  line(-fw, -fl, fz, fw, -fl, fz);          // top horizontal —
  line(-fw, -fl * 0.15, fz, fw * 0.6, -fl * 0.15, fz); // middle horizontal

  // Axis color hints on edges
  strokeWeight(2);
  // X axis edge (red)
  stroke(255, 60, 60, 150);
  line(s, s, s, s, s, -s);

  // Y axis edge (green)
  stroke(60, 255, 60, 150);
  line(-s, -s, s, s, -s, s);

  // Z axis edge (blue)
  stroke(60, 60, 255, 150);
  line(-s, s, s, -s, -s, s);

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
  if (showGrid) {
    let gridAlpha = darkMode ? 25 : 30;
    stroke(darkMode ? 255 : 0, gridAlpha);
    strokeWeight(0.5);
    let gridSize = 400;
    let step = 50;
    for (let i = -gridSize; i <= gridSize; i += step) {
      line(i, -gridSize, 0, i, gridSize, 0);
      line(-gridSize, i, 0, gridSize, i, 0);
    }
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
