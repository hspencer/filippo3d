/* filippo3d - by hspencer (cc) */

class Stroke3D {
  constructor() {
    this.selected = false;
    this.col = color(0);
    this.strk = 1;
    this.p = [];
  }
  draw(){
    stroke(this.col);
    strokeWeight(this.strk);
    noFill();
    beginShape();
    for(let i = 0; i < this.p.length; i++){
      vertex(this.p[i].x, this.p[i].y, this.p[i].z);
    }
    endShape();
  }
  newPoint(x, y, z){
    let cx = cos(ux);
    let sx = sin(ux);
    let cy = cos(uy);
    let sy = sin(uy);
    let cz = cos(uz);
    let sz = sin(uz);

    // rotation around x
    let xy = cx*y + sx*z;
    let xz = -sx*y + cx*z;

    // rotation around y
    let yz = cy*xz + sy*x;
    let yx = -sy*xz + cy*x;

    // rotation around z
    let zx = cz*yx + sz*xy;
    let zy = -sz*yx + cz*xy;

    let newp = createVector(zx, zy, yz);
    this.p.push(newp);
  }
}
