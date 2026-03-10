// Filippo 3D - Main sketch (p5.js)

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  // Orthographic projection: no perspective distortion.
  // Screen coords map directly to view coords.
  ortho(-width / 2, width / 2, -height / 2, height / 2, -10000, 10000);
  cursor(CROSS);
  smooth();

  // Setup pointer events for stylus pressure
  setupPointerEvents();

  // Setup UI panel
  setupUI();

  // Set initial stroke color based on theme
  strokeColor = darkMode ? '#ffffff' : '#000000';
  syncUIFromState();
}

function draw() {
  drawScene();
}
