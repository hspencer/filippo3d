/**
 *                   + + + Filippo 3D + + + 
 **/

// import processing.opengl.*;
import processing.pdf.*;
import processing.dxf.*;

void setup() {
  fullScreen(OPENGL);
  pixelDensity(2);
  //size(displayWidth, displayHeight, OPENGL);
  helv     = loadFont("helv.vlw");
  loxica   = loadFont("loxica.vlw");
  filippo  = loadFont("filippo.vlw");
  standard = loadFont("standard.vlw");
  pencil   = loadImage("draw.gif");
  select   = loadImage("select.gif");

  //bitmaps instrucciones (i)
  instr = loadImage("instructions.gif");
  instr_mask = loadImage("instructions_mask.gif");
  instr.mask(instr_mask);

  //bitmaps grilla (SPACE)
  grid     = loadImage("grid.gif");
  gridMask = loadImage("grid_mask.gif");
  quit     = loadImage("quit.gif");
  grid.mask(gridMask);

  trazo = new ArrayList();
  trazos = new ArrayList();
  clon = new ArrayList();

  ux = 0;
  uy = 0;
  uz = 0;
  nx = 0;
  ny = 0;
  nz = 0;
  
  RED = 255;
  GREEN = 255;
  BLUE = 255;
  STRK = 1;
  
  cursor(CROSS);
  smooth();
}


void draw() {
  COLOR = color(RED, GREEN, BLUE);
  keepVariablesInBounds();
  
  background(0);
  drawquit();
  if (showcontrols) {
    controls();
    axisCube();
  }
  if (freerotate) {
    int difx = mouseX - pmouseX;
    int dify = mouseY - pmouseY;
    uy -= difx*0.0045;
    ux -= dify*0.0045;
    drawattention(0, height-70, width, 30);
    textFont(loxica, 16);
    fill(200, 0, 0);
    text("Free Rotate ON, press SPACE to fix viewport", int((width*0.5)-100), height-52);
  }
  drawing();
  checkview();
  if (!drawmode) {
    selectstrokes();
  }
  if (mousePressed && (mouseButton == LEFT)) {
    if (drawmode) {
      addPoint();
    }
    click = true;
  }
  keyboardinput();
}
