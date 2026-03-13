// Filippo 3D - Drawing & 3D scene rendering

function drawScene() {
  updateTrigCache();

  // Projection
  if (useOrtho) {
    ortho(-width / 2, width / 2, -height / 2, height / 2, -10000, 10000);
  } else {
    perspective();
  }

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

  // Depth guide overlay
  if (depthGuide) {
    drawDepthGuide();
  }

  // Marquee selection rectangle (drawn in screen space)
  if (marquee) {
    push();
    // Reset to screen coordinates in WEBGL
    let mx = (marquee.x0 + marquee.x1) / 2 - width / 2;
    let my = (marquee.y0 + marquee.y1) / 2 - height / 2;
    let mw = Math.abs(marquee.x1 - marquee.x0);
    let mh = Math.abs(marquee.y1 - marquee.y0);

    noFill();
    stroke(0, 210, 255, 180);
    strokeWeight(1);
    rect(mx - mw / 2, my - mh / 2, mw, mh);

    // Light fill
    fill(0, 210, 255, 15);
    noStroke();
    rect(mx - mw / 2, my - mh / 2, mw, mh);
    pop();
  }

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

  // Draw 'F' calada on front face (z+ plane, visible from both sides)
  let fCol = darkMode ? color(255, 255, 255, 200) : color(40, 40, 40, 200);
  stroke(fCol);
  strokeWeight(1.8);
  noFill();

  let fl = size * 0.3;  // letter half-height
  let fw = size * 0.2;  // letter half-width

  // F on front (z = s) and back of same face (z = s - 0.5)
  for (let fz of [s + 0.3, s - 0.3]) {
    line(-fw, -fl, fz, -fw, fl, fz);                      // vertical |
    line(-fw, -fl, fz, fw, -fl, fz);                      // top —
    line(-fw, -fl * 0.15, fz, fw * 0.6, -fl * 0.15, fz);  // middle —
  }

  // Axis color hints on edges (from origin corner -s,-s,-s)
  strokeWeight(2);
  // X axis edge (red) — runs along x
  stroke(255, 60, 60, 150);
  line(-s, s, s, s, s, s);

  // Y axis edge (green) — runs along y
  stroke(60, 255, 60, 150);
  line(-s, -s, s, -s, s, s);

  // Z axis edge (blue) — runs along z
  stroke(60, 60, 255, 150);
  line(-s, s, -s, -s, s, s);

  pop();
}

function drawDepthGuide() {
  let threshold = 12;

  push();
  noStroke();

  for (let t of trazos) {
    for (let i = 0; i < t.points.length; i++) {
      let sp = t._modelToScreen(t.points[i]);
      let dz = Math.abs(sp.z);

      // Draw nearby points with fade
      if (dz < threshold) {
        let alpha = map(dz, 0, threshold, 200, 30);
        let sz = map(dz, 0, threshold, 6, 3);
        fill(0, 210, 255, alpha);
        ellipse(sp.x - width / 2, sp.y - height / 2, sz, sz);
      }

      // Interpolated exact crossing points (where segment crosses z=0)
      if (i < t.points.length - 1) {
        let sp1 = t._modelToScreen(t.points[i + 1]);
        if (sp.z * sp1.z < 0) {
          let param = -sp.z / (sp1.z - sp.z);
          let ix = sp.x + param * (sp1.x - sp.x);
          let iy = sp.y + param * (sp1.y - sp.y);
          fill(0, 210, 255, 255);
          ellipse(ix - width / 2, iy - height / 2, 8, 8);
        }
      }
    }
  }

  // Label
  fill(0, 210, 255, 160);
  noStroke();
  textSize(11);
  textAlign(RIGHT, TOP);
  textFont('monospace');
  text('DEPTH GUIDE [D]  scroll: ajustar profundidad', width / 2 - 12, -height / 2 + 12);

  pop();
}

function drawAxis() {
  if (!showGrid) return;

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
  {
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
    updateViewButtons();
    removeRotateIndicator();
  }
}

function exportPNG() {
  let timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  saveCanvas('filippo3d-' + timestamp, 'png');
}

function exportJSON() {
  let data = {
    version: VERSION,
    view: { ux, uy, uz, panX, panY, panZ, useOrtho, darkMode },
    strokes: trazos.map(t => ({
      color: t.col,
      weight: t.weight,
      points: t.points.map(p => ({
        x: Math.round(p.x * 100) / 100,
        y: Math.round(p.y * 100) / 100,
        z: Math.round(p.z * 100) / 100,
        pressure: Math.round((p.pressure || 0.5) * 1000) / 1000
      }))
    }))
  };
  let json = JSON.stringify(data, null, 2);
  let blob = new Blob([json], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  let timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  a.download = 'filippo3d-' + timestamp + '.f3d';
  a.click();
  URL.revokeObjectURL(url);
}

function importJSON() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = '.f3d,.json';
  input.onchange = (e) => {
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let data = JSON.parse(ev.target.result);
        loadFromJSON(data);
      } catch (err) {
        console.error('Invalid JSON file', err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function loadFromJSON(data) {
  trazos = [];
  undoStack = [];
  transformSnapshot = null;

  if (data.view) {
    ux = data.view.ux || 0; uy = data.view.uy || 0; uz = data.view.uz || 0;
    nx = ux; ny = uy; nz = uz;
    panX = data.view.panX || 0; panY = data.view.panY || 0; panZ = data.view.panZ || 0;
    if (data.view.useOrtho !== undefined) {
      useOrtho = data.view.useOrtho;
      syncProjectionButtons();
    }
    if (data.view.darkMode !== undefined && data.view.darkMode !== darkMode) {
      toggleTheme();
    }
  }

  for (let s of (data.strokes || [])) {
    let stroke = new Stroke3D(s.color, s.weight);
    stroke.points = s.points.map(p => {
      let v = createVector(p.x, p.y, p.z);
      v.pressure = p.pressure || 0.5;
      return v;
    });
    trazos.push(stroke);
  }

  currentView = null;
  updateViewButtons();
  updateStatus();
}
