void controls(){
  strokeWeight(1);
  textFont(filippo,8);
  fill(255,100,100);
  text("3D",20,26);
  fill(255);
  text("FILIPPO",40,36);
  stroke(255);
  noFill();

  // rotation controls
  rect(0,0,122,height);
  for(int i=1; i<4; i++){
    stroke(255,40);
    noFill();
    rect(20, 30+25*i, 80, 15);
    stroke(255,150);
    rect(20, 30+25*i, 15, 15);
    rect(85, 30+25*i, 15, 15);
  }
  textFont(standard,8);
  fill(255);
  textAlign(CENTER);
  text(nfc(degrees(ux),2), 60, 66);
  text(nfc(degrees(uy),2), 60, 92);
  text(nfc(degrees(uz),2), 60, 116);
  textAlign(LEFT);
  fill(255,150);
  text("-                   +",25,67);
  text("-                   +",25,92);
  text("-                   +",25,116);
  fill(200,0,0,200);
  text("X", 105,66);
  fill(0,200,0,200);
  text("Y", 105,91);
  fill(0,0,200,200);
  text("Z", 105,116);

  noFill();
  stroke(255);
  // squares of the unfolded cube
  rect(43,240,20,20);
  rect(23,240,20,20);
  rect(43,220,20,20);
  rect(43,260,20,20);
  rect(63,240,20,20);
  rect(83,240,20,20);
  // keys
  fill(255);
  text("T",50,235);
  text("L",30,254);
  text("R",70,254);
  text("K",90,254);
  text("B",50,274);

  // draw sample color box
  fill(COLOR);
  noStroke();
  rect(20,300,80,25);

  // color controls
  for(int i=1; i<5; i++){
    stroke(255);
    noFill();
    rect(20, 320+25*i, 80, 15);
    stroke(255,150);
    rect(20, 320+25*i, 15, 15);
    rect(85, 320+25*i, 15, 15);
  }
  textFont(standard,8);
  fill(255);
  textAlign(CENTER);
  text(RED, 60, 356);
  text(GREEN, 60, 381);
  text(BLUE, 60, 406);
  text(nfc(STRK,2), 60, 432);
  textAlign(LEFT);
  fill(255,150);
  text("-                   +",25,357);
  text("-                   +",25,382);
  text("-                   +",25,406);
  text("-                   +",25,432);
  fill(200,0,0,200);
  text("R", 105,356);
  fill(0,200,0,200);
  text("G", 105,381);
  fill(0,0,200,200);
  text("B", 105,406);
  fill(255);
  text("ST", 105,432);

  // draw sample line
  strokeWeight(STRK);
  stroke(COLOR);
  line(20,470,100,470);

  //draw current mode
  stroke(sel);
  strokeWeight(1);
  noFill();
  rect(16,500,87,24);
  if(drawmode){
    image(pencil, 20, 503);
    text("DRAW", 45,516);
  }
  else{
    image(select, 20, 503);
    text("SELECT", 45,516);
  }
  // toggle mode
  if((mouseX>16)&&(mouseX<87)&&(mouseY>500)&&(mouseY<524)){
    sel = color(255, 0, 0, 200);
  }
  else{
    sel = color(0,40);
  }

  textFont(loxica,16);
  stroke(0);
  strokeWeight(1);
  pushMatrix();
  { 
    translate(0,height-100);
    text("STROKE # " + trazos.size(),20, 0);
    text("POINT # " + trazo.size(),20, 15);

    text("X = " + mouseX,20, 30);
    text("Y = " + mouseY,20, 45);

    fill(255,0,0);
    text("press (I) por INFO",20,75);
  }
  popMatrix();
  fill(255,10,10,150);
  text("F",50,254);

  if (mousePressed == true) {
    noStroke();
    fill(255,10,10,150);
    // color buttons
    if ((mouseX >= 20) && (mouseX <=35) && (mouseY >=345) && (mouseY <=360)){
      RED -= 1;
      rect(20,345,15,15);
    }
    if ((mouseX >= 85) && (mouseX <=100) && (mouseY >=345) && (mouseY <=360)){
      RED += 1;
      rect(85,345,15,15);
    } 
    if ((mouseX >= 20) && (mouseX <=35) && (mouseY >=370) && (mouseY <=385)){
      GREEN -= 1;
      rect(20,370,15,15);
    } 
    if ((mouseX >= 85) && (mouseX <=100) && (mouseY >=370) && (mouseY <=385)){
      GREEN += 1;
      rect(85,370,15,15);
    }     
    if ((mouseX >= 20) && (mouseX <=35) && (mouseY >=395) && (mouseY <=410)){
      BLUE -= 1;
      rect(20,395,15,15);
    }     
    if ((mouseX >= 85) && (mouseX <=100) && (mouseY >=395) && (mouseY <=410)){
      BLUE += 1;
      rect(85,395,15,15);
    }
    //stroke
    if ((mouseX >= 20) && (mouseX <=35) && (mouseY >=420) && (mouseY <=435)){
      STRK -= 0.1;
      rect(20,420,15,15);
    }     
    if ((mouseX >= 85) && (mouseX <=100) && (mouseY >=420) && (mouseY <=435)){
      STRK += 0.1;
      rect(85,420,15,15);
    }
    // rotation buttons
    if ((mouseX >= 20) && (mouseX <=35) && (mouseY >=55) && (mouseY <=70)){
      ux -= 0.01 % TWO_PI;
      rect(20,55,15,15);
    }
    if ((mouseX >= 85) && (mouseX <=100) && (mouseY >=55) && (mouseY <=70)){
      ux += 0.01 % TWO_PI;
      rect(85,55,15,15);
    } 
    if ((mouseX >= 20) && (mouseX <=35) && (mouseY >=80) && (mouseY <=95)){
      uy -= 0.01 % TWO_PI;
      rect(20,80,15,15);
    } 
    if ((mouseX >= 85) && (mouseX <=100) && (mouseY >=80) && (mouseY <=95)){
      uy += 0.01 % TWO_PI;
      rect(85,80,15,15);
    }     
    if ((mouseX >= 20) && (mouseX <=35) && (mouseY >=105) && (mouseY <=120)){
      uz -= 0.01 % TWO_PI;
      rect(20,105,15,15);
    }     
    if ((mouseX >= 85) && (mouseX <=100) && (mouseY >=105) && (mouseY <=120)){
      uz += 0.01 % TWO_PI;
      rect(85,105,15,15);
    }
  }
}

void axisCube(){
  ux = ux%TWO_PI;
  uy = uy%TWO_PI;
  uz = uz%TWO_PI;
  noFill();
  stroke(255);
  pushMatrix();
  {
    translate(61, 170);
    rotateX(ux);
    rotateY(uy);
    rotateZ(uz);
    box(40);
    noStroke();
    fill(255,10,10,150);
    // draw the 'F'
    beginShape();
    vertex(5,-10,20);
    vertex(5,-15,20);
    vertex(-15,-15,20);
    vertex(-15,15,20);
    vertex(-10,15,20);
    vertex(-10,5,20);
    vertex(0,5,20);
    vertex(0,0,20);
    vertex(-10,0,20);
    vertex(-10,-10,20);
    endShape(CLOSE);
  }
  popMatrix();
}

void checkview(){
  float difx, dify, difz, dif;
  dif = 5.0;
  if (running) {

    difx = abs(nx - ux);
    dify = abs(ny - uy);
    difz = abs(nz - uz);

    ux = ux + ((nx - ux) / dif);
    uy = uy + ((ny - uy) / dif);
    uz = uz + ((nz - uz) / dif);

    if ((difx <= 0.0001)&&(dify <= 0.0001)&&(difz <= 0.0001)){
      ux = nx;
      uy = ny;
      uz = nz;
      running = false;
    }
  }
}

//================================DRAW=AXIS======================================
void drawaxis() {
  int EXTENT = 1000;
  strokeWeight(1);
  for (int i = -EXTENT; i <= EXTENT; i+=10){
    stroke(200,0,0,200);
    line(i,0,0,i+5,0,0);
    stroke(0,200,0,200);
    line(0,i,0,0,i+5,0);
    stroke(0,0,200,200);
    line(0,0,i,0,0,i+5);
  }
}

//==========================RED===RECTANGLE=======================================
void drawattention(float x, float y, float w, float h){
  color poing = color(200,0,0,((sin(millis()*0.01)*120)+130));
  fill(poing);
  noStroke();
  rect(x,y,w,h);
}

//===============================INSTRUCTIONS======================================
void displayInstructions(){
  int ww = instr.width;
  int wh = instr.height;
  pushMatrix();
  {
    translate(int(width/2-(ww/2)),int(height/2-(wh/2)));
    image(instr,0,0);
    /*
    strokeWeight(1);
     stroke(200,0,0,200);
     fill(255,220);
     rect(0,0,ww,wh);
     textFont(filippo,8);
     fill(200,0,0);
     text("3D FILIPPO",20,20);
     textFont(standard,8);
     text("Note that some commands are case sensitive \nPress (I) again to close this window                                                              by Herbert Spencer",20,470);
     fill(0);
     text("VIEWS\n\n+ (F)ront\n+ (T)op\n+ (L)eft\n+ (R)ight\n+ (B)ottom\n+ bac(K)\n+ SPACEBAR switches to\n    Free Rotation Mode",20,60);
     text("MODEL TRANSLATION*\n\n+ (1) Translation in X\n+ (2) Translation in Y\n+ (3) Translation in Z\n\n*relative to mouseX\nand screen.width/2)",360,60);
     text("VIEW ROTATION\n\n+ (X) Positive rotation in X\n+ (x) Negative rotation in X\n+ (Y) Positive rotation in Y\n+ (y) Negative rotation in Y\n+ (Z) Positive rotation in Z\n+ (z) Negative rotation in Z",180,60);
     text("EXPORT\n\n+ (p) exports a PDF of the current view\n+ (P) exports 36 PDFs of the model rotating\n         in the Y axis\n+ (D) exports a DXF of the 3D model",20,250);
     text("OTHER\n\n+ (A)xis turn ON/OFF\n+ (E)rase the drawing\n+ (O)pacity control, strokes are turnes into\n     surfaces through the 'fill' method\n+ (U) Undo\n+ (d) delete selected", 260,250);
     */
  }
  popMatrix();
}
//============================[X]=QUIT=BUTTON==================================
void drawquit(){
  image(quit, width-20,3);
  if((mouseX>(width-20))&&(mouseY<20)){
    noStroke();
    fill(255,10,10,150);
    rect(width-19,4,15,15);
    if(mousePressed){
      exit();
    }
  }
}

void drawPlaneGrid(){
  int ww = grid.width;
  int wh = grid.height;
  pushMatrix();
  {
    translate(int(width/2-(ww/2)),int(height/2-(wh/2)), 0);
    image(grid,0,0);
  }
  popMatrix();
}


void cross(int x, int y){
  stroke(255);
  int s = 100;
  line(-s,0,s,s,0,s);
  line(0,-s,s,0,s,s);
}

