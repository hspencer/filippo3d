// data structure
ArrayList trazo;        // 1 stroke
ArrayList trazos;       // all strokes
ArrayList clon;         // a clone stroke, I don't remeber for what purpose...

// 'u' for UNIVERSAL, l for LOCAL and 'n' for NEXT
float ux, uy, uz, lx, ly, lz, nx, ny, nz;
float cx, sx, cy, sy, cz, sz;
float x, y, z, xy, xz, yz, yx, zx, zy;

// float dbp = 10.0;
int a = 1; // for pos. or neg. angle rotation

//fonts
PFont helv;
PFont loxica;
PFont filippo;
PFont standard;

//colors
color COLOR;
int RED, GREEN, BLUE;
float STRK;
color slct = color(0,210,255);
color sel = color(0,40);

//switches
boolean running = false;
boolean showaxis = false;
boolean freerotate = false;
boolean exportDXF = false;
boolean fillstrokes = false;
boolean instructions = false;
boolean rightdistance = true;
boolean drawmode = true;
boolean showcontrols = false;
boolean click = false;
boolean exporting360 = false;
boolean drawPlane = false;

int CURRENTSTROKE;
int CURRENTPOINT;
int frameNum = 36; //frames for the pdf 360
int counter;
float turn;

//images
PImage select;
PImage pencil;
PImage quit;
PImage instr;
PImage instr_mask;
PImage grid;
PImage gridMask;

void keepVariablesInBounds(){
  if (RED < 0){RED = 255;}
  if (GREEN < 0){GREEN = 255;}
  if (BLUE < 0){BLUE = 255;}
  if (RED > 255){RED = 0;}
  if (GREEN > 255){GREEN = 0;}
  if (BLUE > 255){BLUE = 0;}
  if (STRK < 0.1){STRK = 20.0;}
  if (STRK > 20.0){STRK = 0.1;}
}

