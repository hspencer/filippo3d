// Filippo 3D - Drawing & 3D scene rendering

// On-demand rendering: stops the p5 loop whenever no interaction,
// animation, or panel transition requires continuous frames.
function maybeStopLoop() {
  if (animatingView) return;
  if (isDrawing) return;
  if (interacting) return;
  if (_orbitButton || _panButton) return;
  if (marquee) return;
  if (_panelAnimating) return;
  noLoop();
}

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

    if (done) {
      animatingView = false;
      maybeStopLoop();
    }
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
  let size = typeof cubeSize !== 'undefined' ? cubeSize : 32;
  let s = size / 2;

  // Position: top-left, follows panel with CSS transition offset
  let panelEl = document.getElementById('panel');
  let panelOffset = panelEl ? (panelEl.classList.contains('collapsed') ? 0 : 220) : 0;
  let margin = typeof CUBE_MARGIN !== 'undefined' ? CUBE_MARGIN : 15 + s;
  let cx = -width / 2 + panelOffset + margin;
  let cy = -height / 2 + margin;

  // Store screen position for hit-testing (convert from WEBGL to screen coords)
  _cubeScreenX = panelOffset + margin;
  _cubeScreenY = margin;

  push();
  translate(cx, cy, 0);
  rotateX(ux); rotateY(uy); rotateZ(uz);

  let edgeCol = darkMode ? 255 : 60;
  let edgeAlpha = darkMode ? 60 : 70;

  // 8 edges of the cube (wireframe)
  strokeWeight(size * 0.03);
  stroke(edgeCol, edgeAlpha);
  noFill();

  // Bottom face edges
  line(-s, s, -s, s, s, -s); line(s, s, -s, s, s, s);
  line(s, s, s, -s, s, s);   line(-s, s, s, -s, s, -s);
  // Top face edges
  line(-s, -s, -s, s, -s, -s); line(s, -s, -s, s, -s, s);
  line(s, -s, s, -s, -s, s);   line(-s, -s, s, -s, -s, -s);
  // Vertical edges
  line(-s, -s, -s, -s, s, -s); line(s, -s, -s, s, s, -s);
  line(s, -s, s, s, s, s);     line(-s, -s, s, -s, s, s);

  // Front face (z+) — translucent white
  fill(255, 255, 255, darkMode ? 35 : 25);
  stroke(edgeCol, edgeAlpha);
  beginShape();
  vertex(-s, -s, s); vertex(s, -s, s); vertex(s, s, s); vertex(-s, s, s);
  endShape(CLOSE);

  // Axis color hints on edges
  strokeWeight(size * 0.06);
  stroke(255, 60, 60, 150); line(-s, s, s, s, s, s);     // X red
  stroke(60, 255, 60, 150); line(-s, -s, s, -s, s, s);   // Y green
  stroke(60, 60, 255, 150); line(-s, s, -s, -s, s, s);   // Z blue

  // 'F' in red, 1px ahead of front face
  stroke(238, 43, 0, 200);
  strokeWeight(size * 0.06);
  noFill();

  let fl = size * 0.3;
  let fw = size * 0.2;
  let fOff = 1;
  for (let fz of [s + fOff, s - fOff]) {
    line(-fw, -fl, fz, -fw, fl, fz);
    line(-fw, -fl, fz, fw, -fl, fz);
    line(-fw, -fl * 0.15, fz, fw * 0.6, -fl * 0.15, fz);
  }

  pop();
}

// Cube screen position for hit-testing (updated each frame by drawReferenceCube)
let _cubeScreenX = 50, _cubeScreenY = 50;

function isCubeHit(screenX, screenY) {
  let hit = (typeof cubeSize !== 'undefined' ? cubeSize : 32) / 2 + 10;
  return Math.abs(screenX - _cubeScreenX) < hit && Math.abs(screenY - _cubeScreenY) < hit;
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
    if (typeof updateViewButtons === 'function') updateViewButtons();
    if (typeof removeRotateIndicator === 'function') removeRotateIndicator();
    loop();
  }
}

function exportPNG() {
  let timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  saveCanvas('filippo3d-' + timestamp, 'png');
}

function getDrawingData() {
  return {
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
}

function exportJSON() {
  let data = getDrawingData();
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
      if (typeof syncProjectionButtons === 'function') syncProjectionButtons();
    }
    if (data.view.darkMode !== undefined && data.view.darkMode !== darkMode) {
      if (typeof toggleTheme === 'function') toggleTheme();
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
  if (typeof updateViewButtons === 'function') updateViewButtons();
  if (typeof updateStatus === 'function') updateStatus();
  redraw();
}

// Returns { panX, panY, panZ, zoomScale } to frame all strokes.
// Does NOT mutate stroke data — caller applies via pan and zoom.
function calcExtents(viewportW, viewportH) {
  if (trazos.length === 0) return null;

  // Bounding box in model space
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let t of trazos) {
    let b = t.getBounds();
    if (!b) continue;
    if (b.min.x < minX) minX = b.min.x; if (b.max.x > maxX) maxX = b.max.x;
    if (b.min.y < minY) minY = b.min.y; if (b.max.y > maxY) maxY = b.max.y;
    if (b.min.z < minZ) minZ = b.min.z; if (b.max.z > maxZ) maxZ = b.max.z;
  }

  if (!isFinite(minX)) return null;

  // Center of bounding box
  let cx = (minX + maxX) / 2;
  let cy = (minY + maxY) / 2;
  let cz = (minZ + maxZ) / 2;

  // Project bounding box corners to find screen extent
  updateTrigCache();
  let { cosX, sinX, cosY, sinY, cosZ, sinZ } = _trig;

  let corners = [
    [minX, minY, minZ], [maxX, minY, minZ], [minX, maxY, minZ], [maxX, maxY, minZ],
    [minX, minY, maxZ], [maxX, minY, maxZ], [minX, maxY, maxZ], [maxX, maxY, maxZ]
  ];

  let sMinX = Infinity, sMaxX = -Infinity, sMinY = Infinity, sMaxY = -Infinity;
  for (let [px, py, pz] of corners) {
    let x1 = cosZ * px - sinZ * py, y1 = sinZ * px + cosZ * py, z1 = pz;
    let x2 = cosY * x1 + sinY * z1, y2 = y1;
    let x3 = x2, y3 = cosX * y2 - sinX * (-sinY * x1 + cosY * z1);
    if (x3 < sMinX) sMinX = x3; if (x3 > sMaxX) sMaxX = x3;
    if (y3 < sMinY) sMinY = y3; if (y3 > sMaxY) sMaxY = y3;
  }

  let drawingW = sMaxX - sMinX;
  let drawingH = sMaxY - sMinY;
  if (drawingW < 1) drawingW = 1;
  if (drawingH < 1) drawingH = 1;

  // Projected center of bounding box
  let x1c = cosZ * cx - sinZ * cy, y1c = sinZ * cx + cosZ * cy, z1c = cz;
  let x2c = cosY * x1c + sinY * z1c, y2c = y1c;
  let x3c = x2c, y3c = cosX * y2c - sinX * (-sinY * x1c + cosY * z1c);

  let margin = 0.9;
  let zs = Math.min((viewportW * margin) / drawingW, (viewportH * margin) / drawingH);

  // Pan centers the drawing; zoom is applied independently via projection
  return {
    panX: -x3c,
    panY: -y3c,
    panZ: 0,
    zoomScale: zs
  };
}
