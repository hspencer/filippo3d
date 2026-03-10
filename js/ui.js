// Filippo 3D - UI panel logic

function setupUI() {
  // Panel toggle (open) and close buttons
  document.getElementById('panel-toggle').addEventListener('click', () => openPanel());
  document.getElementById('panel-close').addEventListener('click', () => closePanel());

  // Color picker
  document.getElementById('stroke-color').addEventListener('input', e => {
    strokeColor = e.target.value;
  });

  // Stroke weight slider
  let weightSlider = document.getElementById('stroke-weight');
  weightSlider.addEventListener('input', e => {
    strokeW = parseFloat(e.target.value);
    document.getElementById('weight-val').textContent = strokeW;
  });

  // Mode buttons
  document.getElementById('btn-draw').addEventListener('click', () => {
    drawMode = true;
    trazos.forEach(t => t.selected = false);
    cursor(CROSS);
    document.getElementById('btn-draw').classList.add('active');
    document.getElementById('btn-select').classList.remove('active');
  });

  document.getElementById('btn-select').addEventListener('click', () => {
    drawMode = false;
    cursor(ARROW);
    document.getElementById('btn-draw').classList.remove('active');
    document.getElementById('btn-select').classList.add('active');
  });

  // Projection buttons
  document.getElementById('btn-persp').addEventListener('click', () => {
    useOrtho = false;
    syncProjectionButtons();
  });
  document.getElementById('btn-ortho').addEventListener('click', () => {
    useOrtho = true;
    syncProjectionButtons();
  });

  // View buttons
  document.querySelectorAll('.cube-face').forEach(btn => {
    btn.addEventListener('click', () => {
      setView(btn.dataset.view);
    });
  });

  // Theme buttons
  document.getElementById('btn-dark').addEventListener('click', () => {
    if (!darkMode) toggleTheme();
  });
  document.getElementById('btn-light').addEventListener('click', () => {
    if (darkMode) toggleTheme();
  });

  // Action buttons
  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-clear').addEventListener('click', newDrawing);
  document.getElementById('btn-export').addEventListener('click', exportPNG);
  document.getElementById('btn-save').addEventListener('click', exportJSON);
  document.getElementById('btn-load').addEventListener('click', importJSON);

  // Version label
  let vLabel = document.getElementById('version-label');
  if (vLabel) vLabel.textContent = 'v' + VERSION;

  // Initialize feather icons
  if (typeof feather !== 'undefined') feather.replace();
}

function togglePanel() {
  let panel = document.getElementById('panel');
  if (panel.classList.contains('collapsed')) {
    openPanel();
  } else {
    closePanel();
  }
}

function openPanel() {
  document.getElementById('panel').classList.remove('collapsed');
  document.getElementById('panel-toggle').classList.remove('panel-closed');
}

function closePanel() {
  document.getElementById('panel').classList.add('collapsed');
  document.getElementById('panel-toggle').classList.add('panel-closed');
}

function updateViewButtons() {
  document.querySelectorAll('.cube-face').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === currentView);
  });
}

function updateStatus() {
  let el = document.getElementById('status');
  if (el) {
    let totalPoints = trazos.reduce((sum, t) => sum + t.points.length, 0);
    el.textContent = `Trazos: ${trazos.length} · Puntos: ${totalPoints}`;
  }
}

// Sync UI controls from global state (after keyboard changes)
function syncUIFromState() {
  let weightSlider = document.getElementById('stroke-weight');
  let weightVal = document.getElementById('weight-val');
  let colorInput = document.getElementById('stroke-color');

  if (weightSlider) weightSlider.value = strokeW;
  if (weightVal) weightVal.textContent = strokeW;
  if (colorInput) colorInput.value = strokeColor;
  syncProjectionButtons();
}

function syncProjectionButtons() {
  let btnP = document.getElementById('btn-persp');
  let btnO = document.getElementById('btn-ortho');
  if (btnP) btnP.classList.toggle('active', !useOrtho);
  if (btnO) btnO.classList.toggle('active', useOrtho);
}
