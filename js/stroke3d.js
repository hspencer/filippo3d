// Filippo 3D - Stroke3D class

class Stroke3D {
  constructor(col, weight) {
    this.points = [];
    this.col = col || '#ffffff';
    this.weight = weight || 2;
    this.selected = false;
  }

  addPoint(x, y, z, pressure) {
    // Transform screen coordinates to model space
    // by applying inverse of current view rotation.
    // z is always 0 (we draw on the screen plane).
    let p = this._screenToModel(x, y);
    p.pressure = pressure || 0.5;
    this.points.push(p);
  }

  _screenToModel(sx, sy) {
    // The screen is always z=0 in view space.
    // p5 applies: rotateX(ux) → rotateY(uy) → rotateZ(uz)
    // Forward: R = Rz · Ry · Rx
    // Inverse: R⁻¹ = Rx⁻¹ · Ry⁻¹ · Rz⁻¹
    // So we apply: inverse Z, then inverse Y, then inverse X.

    let cosX = Math.cos(ux), sinX = Math.sin(ux);
    let cosY = Math.cos(uy), sinY = Math.sin(uy);
    let cosZ = Math.cos(uz), sinZ = Math.sin(uz);

    // Step 1: Inverse Z rotation (screen → after-Y space)
    let x1 =  cosZ * sx + sinZ * sy;
    let y1 = -sinZ * sx + cosZ * sy;
    let z1 = 0; // screen plane

    // Step 2: Inverse Y rotation
    let x2 = cosY * x1 - sinY * z1;
    let y2 = y1;
    let z2 = sinY * x1 + cosY * z1;

    // Step 3: Inverse X rotation
    let x3 = x2;
    let y3 =  cosX * y2 + sinX * z2;
    let z3 = -sinX * y2 + cosX * z2;

    return createVector(x3, y3, z3);
  }

  draw(highlight) {
    if (this.points.length < 2) return;

    let c = color(this.col);
    if (this.selected || highlight) {
      stroke(0, 210, 255);
    } else {
      stroke(c);
    }

    noFill();

    // Draw with variable weight if pressure data exists
    let usePressure = this.points.some(p => p.pressure !== undefined && p.pressure !== 0.5);

    if (usePressure) {
      // Segment-based drawing for variable width
      for (let i = 0; i < this.points.length - 1; i++) {
        let p0 = this.points[i];
        let p1 = this.points[i + 1];
        let w = this.weight * (p0.pressure || 0.5) * 2;
        strokeWeight(w);
        beginShape();
        vertex(p0.x, p0.y, p0.z);
        vertex(p1.x, p1.y, p1.z);
        endShape();
      }
    } else {
      // Smooth curve for uniform width
      strokeWeight(this.weight);
      beginShape();
      // Double first point for curveVertex
      let first = this.points[0];
      curveVertex(first.x, first.y, first.z);
      for (let p of this.points) {
        curveVertex(p.x, p.y, p.z);
      }
      // Double last point
      let last = this.points[this.points.length - 1];
      curveVertex(last.x, last.y, last.z);
      endShape();
    }
  }

  // Project a model-space point to screen using current rotation + pan
  _modelToScreen(p) {
    let cx = Math.cos(ux), sx2 = Math.sin(ux);
    let cy = Math.cos(uy), sy = Math.sin(uy);
    let cz = Math.cos(uz), sz = Math.sin(uz);

    // Apply X rotation
    let xy = cx * p.y - sx2 * p.z;
    let xz = sx2 * p.y + cx * p.z;

    // Apply Y rotation
    let yx = cy * p.x + sy * xz;
    let yz = -sy * p.x + cy * xz;

    // Apply Z rotation
    let zx = cz * yx - sz * xy;
    let zy = sz * yx + cz * xy;

    return {
      x: zx + panX + width / 2,
      y: zy + panY + height / 2
    };
  }

  // Check if a screen point is near this stroke
  hitTest(sx, sy, threshold) {
    threshold = threshold || 12;
    for (let p of this.points) {
      let sp = this._modelToScreen(p);
      let d = Math.sqrt((sx - sp.x) ** 2 + (sy - sp.y) ** 2);
      if (d < threshold) return true;
    }
    return false;
  }
}
