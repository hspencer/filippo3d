//============================MAKE=DRAWING=SPACE==============================
void drawing(){
  if(drawPlane){
    drawPlaneGrid();
  }
  pushMatrix();
  {
    translate(width*0.5,height*0.5);
    rotateX(ux);
    rotateY(uy);
    rotateZ(uz);
    if (showaxis){
      drawaxis();
    }
    if (exportDXF) {
      beginRaw(DXF, "DXF/f3d-#####.dxf");
      createDXF();
      endRaw();
      exportDXF = false;
    }
    createStrokes();
  }
  popMatrix();

  if (exporting360){
    if(counter > frameNum) {
      counter = 1; 
      exporting360 = false;
    }
    textFont(helv,36);
    fill(200,0,0);
    text("exporting frame "+counter+"/"+frameNum, 150, height-80);
    turn = (TWO_PI/frameNum);

    uy +=turn;
    exportPDF();
    counter += 1;

  }
  if(instructions){
    displayInstructions();
  }
}

//==================================CLASSES====================================

class Point3d {
  float x, y, z;
  Point3d (float a, float b, float c){
    x = a;
    y = b;
    z = c;
  }
}

class Stroke3d {
  color col;
  float strk;
  boolean selected;
  ArrayList pointvec;

  Stroke3d (ArrayList vec, color c, float s){
    pointvec = (ArrayList) vec;
    col = c;
    strk = s;
  }

  void render(){

    if(selected){
      stroke(slct);
      strokeWeight(5);
    }
    else{
      stroke(col);
      strokeWeight(strk);
    }

    //this makes the rendering painfully slow
    /*
    if(fillstrokes){
     fill(200);
     }
     else{
     noFill();
     }
     */

    beginShape();
    for (int i=0; i<pointvec.size(); i++){
      Point3d p = (Point3d) pointvec.get(i);
      curveVertex(p.x,p.y,p.z);
    }
    endShape();
  }
  void pdf(){
    float x2d, y2d;
    stroke(col);
    strokeWeight(strk);
    beginShape();
    for (int i=0; i < pointvec.size(); i++){
      Point3d p = (Point3d) pointvec.get(i);
      x2d = screenX(p.x,p.y,p.z);
      y2d = screenY(p.x,p.y,p.z);
      curveVertex(x2d,y2d);
    }
    endShape();
  }

  // this function is intended for cloning a line, I'm not currently using it
  ArrayList returnPoints(){
    ArrayList newpoints = new ArrayList();
    for (int i=0; i<pointvec.size(); i++){
      Point3d p = (Point3d)pointvec.get(i);

      float bx, by, bz;
      bx = p.x;
      by = p.y+10;
      bz = p.z;

      Point3d newp = new Point3d(bx,by,bz);
      newpoints.add(newp);
    }
    return newpoints;
  }
}



////EXTRUDE}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}failure: never worked

/*
void extrudeY(){
 Stroke3d nstrk = new Stroke3d((ArrayList)trazos.get(1), COLOR, STRK);
 for(int i=0; i<trazos.size(); i++){
 if(((Stroke3d)trazos.get(i)).selected == true){
 Stroke3d strk = (Stroke3d)trazos.get(i);
 strk.selected = false;
 
 ArrayList newpoints = (ArrayList)strk.returnPoints();
 nstrk = new Stroke3d(newpoints, COLOR, STRK);
 nstrk.selected = true;
 }
 }      
 trazos.addElement(nstrk);
 }
 */

//==============================DRAW==METHODS===================================
void addPoint(){
  if ((mouseX > 122) || (mouseY > 540)){
    cx = cos(ux);
    sx = sin(ux);
    cy = cos(uy);
    sy = sin(uy);
    cz = cos(uz);
    sz = sin(uz);

    x = mouseX-width*0.5;
    y = mouseY-height*0.5;
    z = 0;

    // rotation around x
    xy = cx*y + sx*z;
    xz = -sx*y + cx*z;

    // rotation around y
    yz = cy*xz + sy*x;
    yx = -sy*xz + cy*x;

    // rotation around z
    zx = cz*yx + sz*xy;
    zy = -sz*yx + cz*xy;

    Point3d p = new Point3d(zx, zy, yz);
    trazo.add(p);
  }
}

void addStroke3d(){
  Stroke3d strk = new Stroke3d(trazo, COLOR, STRK);
  trazos.add(strk);
}
//==============================MAKELINES=====================================
void createDXF(){
  strokeWeight(1);
  stroke(0);

  // draw all strokes but current
  for (int i=0; i < trazos.size(); i++){
    Stroke3d strk = (Stroke3d) trazos.get(i);
    ArrayList vec = strk.pointvec;
    stroke(0);
    beginShape();
    for (int j=0; j < vec.size(); j++){
      Point3d p = (Point3d) vec.get(j);
      vertex(p.x, p.y, p.z);
    }
    endShape();
  }
}
//===============================CREATE=STROKES=================================
void createStrokes(){
  noFill();

  // draw all strokes but current
  for (int i=0; i < trazos.size(); i++){
    Stroke3d strk = (Stroke3d) trazos.get(i);
    color c = strk.col;
    if(strk.selected){
      stroke(0,0,255);
    }
    else{
      stroke(c);
    }
    strk.render();
  }
  // draw current stroke
  strokeWeight(STRK);
  stroke(COLOR);
  beginShape();
  for (int i=0; i< trazo.size(); i++){
    Point3d p = (Point3d) trazo.get(i);
    curveVertex(p.x, p.y, p.z);
  }
  endShape();
}

//===================================TRANSLATE========================================
void translateX(){
  freerotate = false;
  {
    drawattention(0,height-70,width,30);
    textFont(loxica,16);
    fill(200,0,0);
    text("Translating in X dimention, move the MOUSE HORIZONTALLY to adjust translation",
    int((width*0.5)-220),height-52);
  }
  if(drawmode){
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j < vec.size(); j++){
        Point3d p3d = (Point3d) vec.get(j);
        p3d.x += (mouseX-width*0.5)*0.03;
      }
    }
    for (int i=0; i< trazo.size(); i++){
      Point3d p3d = (Point3d) trazo.get(i);
      p3d.x += (mouseX-width*0.5)*0.03;
    }
  }
  else{
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      if(strk.selected){
        ArrayList vec = strk.pointvec;
        for (int j=0; j < vec.size(); j++){
          Point3d p3d = (Point3d) vec.get(j);
          p3d.x += (mouseX-width*0.5)*0.03;
        }
      }
    }
  }
}

void translateY(){
  freerotate = false;
  {
    drawattention(0,height-70,width,30);
    textFont(loxica,16);
    fill(200,0,0);
    text("Translating in Y dimention, move the MOUSE HORIZONTALLY to adjust translation",
    int((width*0.5)-220),height-52);
  }
  if(drawmode){
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j < vec.size(); j++){
        Point3d p3d = (Point3d) vec.get(j);
        p3d.y += (mouseX-width*0.5)*0.03;
      }
    }
    for (int i=0; i< trazo.size(); i++){
      Point3d p3d = (Point3d) trazo.get(i);
      p3d.y += (mouseX-width*0.5)*0.03;
    }
  }
  else{
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      if(strk.selected){
        ArrayList vec = strk.pointvec;
        for (int j=0; j < vec.size(); j++){
          Point3d p3d = (Point3d) vec.get(j);
          p3d.y += (mouseX-width*0.5)*0.03;
        }
      }
    }
  }
}

void translateZ(){
  freerotate = false;
  {
    drawattention(0,height-70,width,30);
    textFont(loxica,16);
    fill(200,0,0);
    text("Translating in Z dimention, move the MOUSE HORIZONTALLY to adjust translation",
    int((width*0.5)-220),height-52);
  }
  if(drawmode){
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j < vec.size(); j++){
        Point3d p3d = (Point3d) vec.get(j);
        p3d.z += (mouseX-width*0.5)*0.03;
      }
    }
    for (int i=0; i< trazo.size(); i++){
      Point3d p3d = (Point3d) trazo.get(i);
      p3d.z += (mouseX-width*0.5)*0.03;
    }
  }
  else{
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      if(strk.selected){
        ArrayList vec = strk.pointvec;
        for (int j=0; j < vec.size(); j++){
          Point3d p3d = (Point3d) vec.get(j);
          p3d.z += (mouseX-width*0.5)*0.03;
        }
      }
    }
  }
}

//===================================EXPORT=PDF==================================
void exportPDF(){
  pushMatrix();
  {
    translate(width*0.5,height*0.5);
    rotateX(ux);
    rotateY(uy);
    rotateZ(uz);
    if(exporting360){
      beginRecord(PDF, "PDF/f3d_rot"+counter+".pdf");
    }
    else{
      beginRecord(PDF, "PDF/f3d_####.pdf");
    }
    background(0);
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      noFill();
      strk.pdf();
    }
    // draw current stroke
    strokeWeight(STRK);
    stroke(COLOR);
    noFill();
    beginShape();
    for (int i=0; i< trazo.size(); i++){
      Point3d p = (Point3d) trazo.get(i);
      curveVertex(screenX(p.x, p.y, p.z),screenY(p.x, p.y, p.z));
    }
    endShape();
    strokeWeight(1);
    endRecord();
    popMatrix();
  }
}
//==================================NOISE=====================================
void addNoise(){
  for (int i=0; i<trazos.size();i++){
    Stroke3d strk = (Stroke3d) trazos.get(i);
    ArrayList vec = strk.pointvec;
    for (int j=0; j<vec.size();j++){
      Point3d p3d = (Point3d)vec.get(j);
      p3d.x += random(2)-1;
      p3d.y += random(2)-1;
      p3d.z += random(2)-1;
    }
  }
}
void addNoiseSelected(){
  for (int i=0; i<trazos.size();i++){
    Stroke3d strk = (Stroke3d) trazos.get(i);
    if (strk.selected == true){
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        p3d.x += random(2)-1;
        p3d.y += random(2)-1;
        p3d.z += random(2)-1;
      }
    }
  }
}
//==================================ROTATE3D=X=================================
void rotate3dX(){
  for (int i=0; i<trazos.size();i++){
    Stroke3d strk = (Stroke3d) trazos.get(i);
    if (strk.selected == true){
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        float angle = 0.03*a % TWO_PI;
        p3d.y = (cos(angle)*p3d.y) - (sin(angle)*p3d.z);
        p3d.z = (sin(angle)*p3d.y) + (cos(angle)*p3d.z);
      }
    }
  }
}
//==================================ROTATE3D=Y=================================
void rotate3dY(){
  for (int i=0; i<trazos.size();i++){
    Stroke3d strk = (Stroke3d) trazos.get(i);
    if (strk.selected == true){
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        float angle = 0.03*a % TWO_PI;
        p3d.x = (cos(angle)*p3d.x) + (sin(angle)*p3d.z);
        p3d.z = -(sin(angle)*p3d.x) + (cos(angle)*p3d.z);
      }
    }
  }
}
//==================================ROTATE3D=Z=================================
void rotate3dZ(){
  for (int i=0; i<trazos.size();i++){
    Stroke3d strk = (Stroke3d) trazos.get(i);
    if (strk.selected == true){
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        float angle = 0.03*a % TWO_PI;
        p3d.x = (cos(angle)*p3d.x) - (sin(angle)*p3d.y);
        p3d.y = (sin(angle)*p3d.x) + (cos(angle)*p3d.y);
      }
    }
  }
}
//=================================SELECT=STROKES==============================
void selectstrokes(){
  int tolerance = 10;
  pushMatrix();
  {
    translate(width*0.5,height*0.5);
    rotateX(ux);
    rotateY(uy);
    rotateZ(uz);
    strokeWeight(1);
    float pointX, pointY, difX, difY;
    for (int i=0; i < trazos.size(); i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j < vec.size(); j++){
        Point3d p = (Point3d) vec.get(j);
        pointX = screenX(p.x, p.y, p.z);
        pointY = screenY(p.x, p.y, p.z);
        difX = abs(mouseX-pointX);
        difY = abs(mouseY-pointY);
        if ((difX<tolerance)&&(difY<tolerance)){
          strokeWeight(5);
          stroke(slct);
          beginShape();
          for (int k=0; k < vec.size(); k++){
            Point3d q = (Point3d) vec.get(k);
            curveVertex(q.x,q.y,q.z);
          }
          endShape();
          if (click){
            ((Stroke3d)trazos.get(i)).selected = !((Stroke3d)trazos.get(i)).selected;
            click = false;
          }
          strokeWeight(1);
        }
      }
    }    
  }
  popMatrix();
}

//==========================TOGGLE=SELECTION===================================
void selectAll(){
  for(int i=0; i<trazos.size();i++){
    ((Stroke3d)trazos.get(i)).selected = true; 
  }
}
void unselectAll(){
  for(int i=0; i<trazos.size();i++){
    ((Stroke3d)trazos.get(i)).selected = false; 
  }
}
//==============================DELETE=STROKES=================================
void eraseStrokes(){
  for(int i=0; i<trazos.size(); i++){
    if(((Stroke3d)trazos.get(i)).selected == true){
      trazos.remove(i);
    }
  }
}
//=============================CLEAR=EVERYTHING================================
void clearstrokes(){
  trazo.clear();
  trazos.clear();
}
//===================================UNDO======================================
void undo(){
  int curr = trazos.size() - 1;
  trazos.remove(curr);
}
//======================================FX=====================================
void FX(){
  float am = 0.01;
  if(drawmode){
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        am += 0.0003*a % TWO_PI;
        p3d.y = (cos(am)*p3d.y) - (sin(am)*p3d.z);
        p3d.z = (sin(am)*p3d.y) + (cos(am)*p3d.z);
      }
    }
  }
  else{
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      if (strk.selected == true){
        ArrayList vec = strk.pointvec;
        for (int j=0; j<vec.size();j++){
          Point3d p3d = (Point3d)vec.get(j);
          am += 0.0003*a % TWO_PI;
          p3d.y = (cos(am)*p3d.y) - (sin(am)*p3d.z);
          p3d.z = (sin(am)*p3d.y) + (cos(am)*p3d.z);
        }
      }
    }
  }
}
//==================================SCALE======================================
void scaleX(){
  if(drawmode){
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        if(mouseX>width*0.5){
          p3d.x *= 1.01;
        }
        else
        {
          p3d.x *= 0.99;
        }
      }
    }
  }
  else{
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      if(strk.selected){
        ArrayList vec = strk.pointvec;
        for (int j=0; j<vec.size();j++){
          Point3d p3d = (Point3d)vec.get(j);
          if(mouseX>width*0.5){
            p3d.x *= 1.01;
          }
          else
          {
            p3d.x *= 0.99;
          }
        }
      }
    }
  }
}

void scaleY(){
  if(drawmode){
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        if(mouseX>width*0.5){
          p3d.y *= 1.01;
        }
        else
        {
          p3d.y *= 0.99;
        }
      }
    }
  }
  else{
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      if(strk.selected){
        ArrayList vec = strk.pointvec;
        for (int j=0; j<vec.size();j++){
          Point3d p3d = (Point3d)vec.get(j);
          if(mouseX>width*0.5){
            p3d.y *= 1.01;
          }
          else
          {
            p3d.y *= 0.99;
          }
        }
      }
    }
  }
}

void scaleZ(){
  if(drawmode){
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      ArrayList vec = strk.pointvec;
      for (int j=0; j<vec.size();j++){
        Point3d p3d = (Point3d)vec.get(j);
        if(mouseX>width*0.5){
          p3d.z *= 1.01;
        }
        else
        {
          p3d.z *= 0.99;
        }
      }
    }
  }
  else{
    for (int i=0; i<trazos.size();i++){
      Stroke3d strk = (Stroke3d) trazos.get(i);
      if(strk.selected){
        ArrayList vec = strk.pointvec;
        for (int j=0; j<vec.size();j++){
          Point3d p3d = (Point3d)vec.get(j);
          if(mouseX>width*0.5){
            p3d.z *= 1.01;
          }
          else
          {
            p3d.z *= 0.99;
          }
        }
      }
    }
  }
}

