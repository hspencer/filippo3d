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
}

function draw() {
  drawScene();
}
