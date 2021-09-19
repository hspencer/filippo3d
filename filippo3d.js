/* filippo3d - by hspencer (cc) */

function setup() {
  createCanvas(windowWidth, windowHeight - 25, WEBGL);
  cursor(CROSS);
  init();
}

function draw() {
  clear();
  if (freeRotate) {
    let difx = mouseX - pmouseX;
    let dify = mouseY - pmouseY;
    uy -= difx * 0.0045;
    ux -= dify * 0.0045;
  }
  push();
  rotateX(ux);
  rotateY(uy);
  rotateZ(uz);
  if (drawing) {
    trazo.draw();
  }
  for (t of trazos) {
    t.draw();
  }
  pop();
}

function mousePressed() {
  trazo = new Stroke3D();
  trazo.newPoint(mouseX - width/2, mouseY - height/2, 0);
  drawing = true;
}

function mouseDragged() {
  trazo.newPoint(mouseX - width/2, mouseY - height/2, 0);
}

function mouseReleased() {
  trazos.push(trazo);
  drawing = false;
}

function keyTyped() {
  freeRotate = !freeRotate;
}
