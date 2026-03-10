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
    // by applying inverse of current view rotation
    let p = this._screenToModel(x, y, z);
    p.pressure = pressure || 0.5;
    this.points.push(p);
  }

  _screenToModel(x, y, z) {
    // Inverse rotation: Z → Y → X (reverse order, negative angles)
    let cx = Math.cos(-ux), sx = Math.sin(-ux);
    let cy = Math.cos(-uy), sy = Math.sin(-uy);
    let cz = Math.cos(-uz), sz = Math.sin(-uz);

    // Inverse Z rotation
    let zx = cz * x + sz * y;
    let zy = -sz * x + cz * y;

    // Inverse Y rotation
    let yx = cy * zx + sy * z;
    let yz = -sy * zx + cy * z;

    // Inverse X rotation
    let xy = cx * zy + sx * yz;
    let xz = -sx * zy + cx * yz;

    return createVector(yx, xy, xz);
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

  // Check if a screen point is near this stroke (for selection)
  hitTest(sx, sy, threshold) {
    threshold = threshold || 10;
    for (let p of this.points) {
      let sp = screenPosition(p.x, p.y, p.z);
      if (sp && dist(sx, sy, sp.x, sp.y) < threshold) {
        return true;
      }
    }
    return false;
  }
}

// Helper: get screen position of a 3D point
function screenPosition(x, y, z) {
  // Use p5's screenX/screenY within the current transformation matrix
  let sx = screenX(x, y, z);
  let sy = screenY(x, y, z);
  return { x: sx, y: sy };
}
