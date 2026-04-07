// Filippo 3D - UI panel logic

function setupUI() {
  // Panel is toggled by clicking the reference cube (handled in input.js)

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

  // Grid & Depth buttons
  document.getElementById('btn-grid').addEventListener('click', () => {
    showGrid = !showGrid;
    document.getElementById('btn-grid').classList.toggle('active', showGrid);
  });
  document.getElementById('btn-depth').addEventListener('click', () => {
    depthGuide = !depthGuide;
    document.getElementById('btn-depth').classList.toggle('active', depthGuide);
  });

  // Help button
  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('help-overlay').classList.toggle('hidden');
  });

  // Cerrar modal de atajos al hacer click fuera de la tarjeta
  document.getElementById('help-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.classList.add('hidden');
    }
  });

  // Action buttons
  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-clear').addEventListener('click', newDrawing);
  document.getElementById('btn-export').addEventListener('click', exportPNG);
  document.getElementById('btn-save').addEventListener('click', exportJSON);
  document.getElementById('btn-load').addEventListener('click', importJSON);
  document.getElementById('btn-embed').addEventListener('click', openEmbedModal);

  // Initialize feather icons (antes de setear version, para no interferir con el DOM)
  if (typeof feather !== 'undefined') feather.replace();

  // Version label (después de feather.replace para que no se pierda)
  let vLabel = document.getElementById('version-label');
  if (vLabel) vLabel.textContent = 'v' + VERSION;
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
}

function closePanel() {
  document.getElementById('panel').classList.add('collapsed');
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

// ── Embed (Incrustar) ──

let _embedURL = '';

function _calcEmbedHeight() {
  // Compute projected bounding box aspect ratio to determine ideal height
  // Assumes a typical embed width of ~800px
  let embedWidth = 800;

  if (trazos.length === 0) return 400;

  updateTrigCache();
  let { cosX, sinX, cosY, sinY, cosZ, sinZ } = _trig;

  let sMinX = Infinity, sMaxX = -Infinity, sMinY = Infinity, sMaxY = -Infinity;

  for (let t of trazos) {
    for (let p of t.points) {
      // Forward rotation: Rz, Ry, Rx
      let x1 = cosZ * p.x - sinZ * p.y, y1 = sinZ * p.x + cosZ * p.y, z1 = p.z;
      let x2 = cosY * x1 + sinY * z1, y2 = y1, z2 = -sinY * x1 + cosY * z1;
      let x3 = x2, y3 = cosX * y2 - sinX * z2;
      if (x3 < sMinX) sMinX = x3; if (x3 > sMaxX) sMaxX = x3;
      if (y3 < sMinY) sMinY = y3; if (y3 > sMaxY) sMaxY = y3;
    }
  }

  if (!isFinite(sMinX)) return 400;

  let drawW = sMaxX - sMinX;
  let drawH = sMaxY - sMinY;
  if (drawW < 1) return 400;

  let ratio = drawH / drawW;
  // Height = width * ratio + padding for chrome
  let h = Math.round(embedWidth * ratio * 0.9 + 60);
  // Clamp between 250 and 900
  return Math.max(250, Math.min(900, h));
}

function openEmbedModal() {
  if (trazos.length === 0) return;

  let data = getDrawingData();
  let json = JSON.stringify(data);
  let compressed = LZString.compressToEncodedURIComponent(json);

  // Build embed URL
  let base = location.origin + location.pathname.replace(/\/[^/]*$/, '/');
  _embedURL = base + 'embed.html#d=' + compressed;

  // Calculate ideal height from drawing proportions
  let embedHeight = _calcEmbedHeight();

  // HTML iframe code
  let iframeCode = '<iframe src="' + _embedURL + '" width="100%" height="' + embedHeight + '" frameborder="0" tabindex="0" style="border:1px solid #333; border-radius:8px;" allowfullscreen></iframe>';

  // Casiopea widget code (data goes in URL hash via Widget:F3D template)
  let casiopeaCode = '{{#widget:F3D\n|data=' + compressed + '\n|height=' + embedHeight + '\n}}';

  // Populate textareas
  document.getElementById('embed-html').value = iframeCode;
  document.getElementById('embed-casiopea').value = casiopeaCode;

  // Size warning
  let warning = document.getElementById('embed-warning');
  if (compressed.length > 30000) {
    warning.classList.remove('hidden');
  } else {
    warning.classList.add('hidden');
  }

  // Show modal
  document.getElementById('embed-overlay').classList.remove('hidden');

  // Re-render feather icons in modal
  if (typeof feather !== 'undefined') feather.replace();

  // Setup handlers (idempotent via replaceWith clone trick avoided — just use named functions)
  _setupEmbedHandlers();
}

function _setupEmbedHandlers() {
  let overlay = document.getElementById('embed-overlay');
  let closeBtn = document.getElementById('embed-close');
  let copyHtml = document.getElementById('embed-copy-html');
  let copyCasiopea = document.getElementById('embed-copy-casiopea');
  let previewBtn = document.getElementById('embed-preview');

  // Close
  let closeFn = () => overlay.classList.add('hidden');
  closeBtn.onclick = closeFn;
  overlay.onclick = (e) => { if (e.target === overlay) closeFn(); };

  // Copy buttons
  copyHtml.onclick = () => _copyToClipboard('embed-html', copyHtml);
  copyCasiopea.onclick = () => _copyToClipboard('embed-casiopea', copyCasiopea);

  // Preview
  previewBtn.onclick = () => {
    window.open(_embedURL, '_blank');
  };
}

function _copyToClipboard(textareaId, btn) {
  let textarea = document.getElementById(textareaId);
  navigator.clipboard.writeText(textarea.value).then(() => {
    let orig = btn.textContent;
    btn.textContent = '¡Copiado!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copiar';
      btn.classList.remove('copied');
    }, 1500);
  });
}
