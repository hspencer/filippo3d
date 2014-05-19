void mousePressed() {
  if (mouseButton == RIGHT) {
    freerotate = true;
  }
  else if ((mouseX>16)&&(mouseX<87)&&(mouseY>500)&&(mouseY<524)) {
    drawmode = !drawmode;
    click = true;
  }
}

void mouseReleased() {
  if (mouseButton == RIGHT) {
    freerotate = false;
  }
  else {
    addStroke3d(); 
    trazo = new ArrayList();
    click = false;
  }
}

void keyboardinput(){
  if (keyPressed){
    if(key == 'x'){
      a = -1;
      if(drawmode){
        ux -= 0.02;
      }
      else{
        rotate3dX();
      }
    }
    if(key == 'y'){
      a = -1;
      if(drawmode){
        uy -= 0.02;
      }
      else{
        rotate3dY();
      }
    }
    if(key == 'z'){
      a = -1;
      if(drawmode){
        uz -= 0.02;
      }
      else{
        rotate3dZ();
      }
    }
    if(key == 'X'){
      a = 1;
      if(drawmode){
        ux += 0.02;
      }
      else{
        rotate3dX();
      }
    }
    if(key == 'Y'){
      a = 1;
      if(drawmode){
        uy += 0.02;
      }
      else{
        rotate3dY();
      }
    }
    if(key == 'Z'){
      a = 1;
      if(drawmode){
        uz += 0.02;
      }
      else{
        rotate3dZ();
      }
    }
    if(key == '0'){
      FX();
    }
    if(key == '1'){
      translateX();
    }
    if(key == '2'){
      translateY();
    }
    if(key == '3'){
      translateZ();
    }
    if(key == '4'){
      scaleX();
    }
    if(key == '5'){
      scaleY();
    }
    if(key == '6'){
      scaleZ();
    }
    /*
    if(key == '7'){
     extrudeY();
     }
     */
    if(key == ','){
      STRK -= 0.1;
    }
    if(key == '.'){
      STRK += 0.1;
    }
    if(key == 'n'){
      if(drawmode){
        addNoise();
      }
      else{
        addNoiseSelected();
      }
    }
  }
}

void keyPressed() {
  if((key == 'f') || (key == 'F')){
    running = true;
    freerotate = false;
    nx = 0;
    ny = 0;
    nz = 0;
  }
  if((key == 'r') || (key == 'R')){
    running = true;
    freerotate = false;
    nx = 0;
    ny = -HALF_PI;
    nz = 0;
  }
  if((key == 'l') || (key == 'L')){
    running = true;
    freerotate = false;
    nx = 0;
    ny = HALF_PI;
    nz = 0;
  }
  if((key == 't') || (key == 'T')){
    running = true;
    freerotate = false;
    nx = -HALF_PI;
    ny = 0;
    nz = 0;
  }
  if((key == 'b') || (key == 'B')){
    running = true;
    freerotate = false;
    nx = HALF_PI;
    ny = 0;
    nz = 0;
  }
  if((key == 'k') || (key == 'K')){
    running = true;
    freerotate = false;
    nx = 0;
    ny = PI;
    nz = 0;
  }
  if ( key == ' ') {
    //drawPlane = !drawPlane;
    freerotate = !freerotate;
  }
  if (key =='p'){
    exportPDF();
  }
  if (key =='P'){
    exporting360 = true;
    counter = 1;
  }
  if ((key == 'e')){
    eraseStrokes();
  }
  if ((key == 'D')){
    exportDXF = !exportDXF;
  }

  if (key =='N'){
    freerotate = false;
    clearstrokes();
    setup();
  }
  
  if ((key =='a') || (key == 'A')){
    showaxis = !showaxis;
  }
  if ((key =='o') || (key == 'O')){
    fillstrokes = !fillstrokes;
  }
  if ((key =='i') || (key == 'I')){
    instructions = !instructions;
  }
  if ((key =='c') || (key == 'C')){
    showcontrols = !showcontrols;
  }
  if ((key =='m') || (key == 'M')){
    drawmode =!drawmode;
  }
  if ((key =='u') || (key == 'U')){
    undo();
  }
  if((key == 'w')||(key == 'W')){
    unselectAll();
  }
  if((key == 's')||(key == 'S')){
    selectAll();
  }
  if ((key =='q') || (key == 'Q')){
    exit();
  }
}
