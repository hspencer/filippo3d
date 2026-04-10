// Filippo 3D - Main sketch (p5.js)

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  cursor(CROSS);
  smooth();

  // Setup pointer events for stylus pressure
  setupPointerEvents();

  // Setup keyboard events (direct window listeners for iPad compatibility)
  setupKeyboardEvents();

  // Setup UI panel
  setupUI();

  // Set initial stroke color based on theme
  strokeColor = darkMode ? '#ffffff' : '#000000';
  syncUIFromState();

  // Load drawing from URL hash (#d=COMPRESSED) if present
  let hash = location.hash.slice(1);
  if (hash.startsWith('d=')) {
    try {
      let compressed = decodeURIComponent(hash.slice(2));
      let json = LZString.decompressFromEncodedURIComponent(compressed);
      if (json) {
        let data = JSON.parse(json);
        loadFromJSON(data);
        syncUIFromState();
      }
    } catch (e) {
      console.error('Error loading from URL:', e);
    }
    // Clear hash so it doesn't reload on refresh after editing
    history.replaceState(null, '', location.pathname);
  }

  noLoop();
}

function draw() {
  drawScene();
}
