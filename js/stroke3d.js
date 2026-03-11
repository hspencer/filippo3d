// Filippo 3D - Stroke3D class
//
// Rotation convention (p5.js WEBGL):
//   rotateX(ux); rotateY(uy); rotateZ(uz);
//   M = Rx * Ry * Rz  (vertex is transformed as Rx(Ry(Rz(v))))
//   Forward:  apply Rz first, then Ry, then Rx
//   Inverse:  apply Rx⁻¹ first, then Ry⁻¹, then Rz⁻¹

// Trig cache — updated once per frame in drawScene()
let _trig = { cosX: 1, sinX: 0, cosY: 1, sinY: 0, cosZ: 1, sinZ: 0, frame: -1 };

function updateTrigCache() {
  _trig.cosX = Math.cos(ux); _trig.sinX = Math.sin(ux);
  _trig.cosY = Math.cos(uy); _trig.sinY = Math.sin(uy);
  _trig.cosZ = Math.cos(uz); _trig.sinZ = Math.sin(uz);
}

class Stroke3D {
  constructor(col, weight) {
    this.points = [];
    this.col = col || '#ffffff';
    this.weight = weight || 2;
    this.selected = false;
  }

  addPoint(x, y, z, pressure) {
    let p = this._screenToModel(x, y);
    p.pressure = pressure || 0.5;

    // Skip if too close to last point (avoid duplicate vertices)
    if (this.points.length > 0) {
      let last = this.points[this.points.length - 1];
      let dx = p.x - last.x, dy = p.y - last.y, dz = p.z - last.z;
      if (dx * dx + dy * dy + dz * dz < 4) return; // ~2px minimum distance
    }

    this.points.push(p);
  }

  _screenToModel(sx, sy) {
    // With ortho: screen = R * model + pan
    // Inverse:    model = R⁻¹ * (screen - pan)
    // R⁻¹ = Rz⁻¹ * Ry⁻¹ * Rx⁻¹
    // Applied step by step: first Rx⁻¹, then Ry⁻¹, then Rz⁻¹

    let vx = sx - panX;
    let vy = sy - panY;
    let vz = -panZ;

    let cosX = Math.cos(ux), sinX = Math.sin(ux);
    let cosY = Math.cos(uy), sinY = Math.sin(uy);
    let cosZ = Math.cos(uz), sinZ = Math.sin(uz);

    // Step 1: Rx⁻¹ (inverse X rotation)
    let x1 = vx;
    let y1 =  cosX * vy + sinX * vz;
    let z1 = -sinX * vy + cosX * vz;

    // Step 2: Ry⁻¹ (inverse Y rotation)
    let x2 =  cosY * x1 - sinY * z1;
    let y2 = y1;
    let z2 =  sinY * x1 + cosY * z1;

    // Step 3: Rz⁻¹ (inverse Z rotation)
    let x3 =  cosZ * x2 + sinZ * y2;
    let y3 = -sinZ * x2 + cosZ * y2;
    let z3 = z2;

    return createVector(x3, y3, z3);
  }

  _modelToScreen(p) {
    // Forward: screen = R * model + pan
    // R = Rx * Ry * Rz → apply Rz first, then Ry, then Rx

    let { cosX, sinX, cosY, sinY, cosZ, sinZ } = _trig;

    // Step 1: Rz
    let x1 = cosZ * p.x - sinZ * p.y;
    let y1 = sinZ * p.x + cosZ * p.y;
    let z1 = p.z;

    // Step 2: Ry
    let x2 =  cosY * x1 + sinY * z1;
    let y2 = y1;
    let z2 = -sinY * x1 + cosY * z1;

    // Step 3: Rx
    let x3 = x2;
    let y3 = cosX * y2 - sinX * z2;
    let z3 = sinX * y2 + cosX * z2;
    return {
      x: x3 + panX + width / 2,
      y: y3 + panY + height / 2,
      z: z3 + panZ
    };
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

    let usePressure = this.points.some(p => p.pressure !== undefined && p.pressure !== 0.5);

    if (usePressure) {
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
      strokeWeight(this.weight);
      beginShape();
      let first = this.points[0];
      curveVertex(first.x, first.y, first.z);
      for (let p of this.points) {
        curveVertex(p.x, p.y, p.z);
      }
      let last = this.points[this.points.length - 1];
      curveVertex(last.x, last.y, last.z);
      endShape();
    }
  }

  // ── Transformations (operate on model-space points) ──

  translate(dx, dy, dz) {
    for (let p of this.points) {
      p.x += dx;
      p.y += dy;
      p.z += dz;
    }
  }

  rotateAroundAxis(axis, angle) {
    let c = this._centroid();
    let cos = Math.cos(angle), sin = Math.sin(angle);

    for (let p of this.points) {
      let x = p.x - c.x, y = p.y - c.y, z = p.z - c.z;
      let nx, ny, nz;

      if (axis === 'x') {
        nx = x;
        ny = cos * y - sin * z;
        nz = sin * y + cos * z;
      } else if (axis === 'y') {
        nx = cos * x + sin * z;
        ny = y;
        nz = -sin * x + cos * z;
      } else {
        nx = cos * x - sin * y;
        ny = sin * x + cos * y;
        nz = z;
      }

      p.x = nx + c.x;
      p.y = ny + c.y;
      p.z = nz + c.z;
    }
  }

  scaleAxis(axis, factor) {
    let c = this._centroid();
    for (let p of this.points) {
      if (axis === 'x') p.x = c.x + (p.x - c.x) * factor;
      if (axis === 'y') p.y = c.y + (p.y - c.y) * factor;
      if (axis === 'z') p.z = c.z + (p.z - c.z) * factor;
    }
  }

  _centroid() {
    let sx = 0, sy = 0, sz = 0;
    for (let p of this.points) {
      sx += p.x; sy += p.y; sz += p.z;
    }
    let n = this.points.length;
    return { x: sx / n, y: sy / n, z: sz / n };
  }

  hitTest(sx, sy, threshold) {
    threshold = threshold || 12;
    for (let p of this.points) {
      let sp = this._modelToScreen(p);
      let d = Math.sqrt((sx - sp.x) ** 2 + (sy - sp.y) ** 2);
      if (d < threshold) return true;
    }
    return false;
  }

  // Check if any point of this stroke falls inside a screen rectangle
  hitTestRect(x0, y0, x1, y1) {
    for (let p of this.points) {
      let sp = this._modelToScreen(p);
      if (sp.x >= x0 && sp.x <= x1 && sp.y >= y0 && sp.y <= y1) {
        return true;
      }
    }
    return false;
  }

  // Simplify stroke using Ramer-Douglas-Peucker algorithm
  simplify(epsilon) {
    if (this.points.length < 3) return;
    this.points = Stroke3D._rdp(this.points, epsilon);
  }

  static _rdp(pts, epsilon) {
    if (pts.length < 3) return pts;

    let first = pts[0], last = pts[pts.length - 1];
    let maxDist = 0, maxIdx = 0;

    for (let i = 1; i < pts.length - 1; i++) {
      let d = Stroke3D._pointLineDistance(pts[i], first, last);
      if (d > maxDist) {
        maxDist = d;
        maxIdx = i;
      }
    }

    if (maxDist > epsilon) {
      let left = Stroke3D._rdp(pts.slice(0, maxIdx + 1), epsilon);
      let right = Stroke3D._rdp(pts.slice(maxIdx), epsilon);
      return left.slice(0, -1).concat(right);
    } else {
      // Keep endpoints, interpolate pressure from original midpoint
      return [first, last];
    }
  }

  static _pointLineDistance(p, a, b) {
    let dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    let lenSq = dx * dx + dy * dy + dz * dz;
    if (lenSq === 0) {
      let ex = p.x - a.x, ey = p.y - a.y, ez = p.z - a.z;
      return Math.sqrt(ex * ex + ey * ey + ez * ez);
    }
    let t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy + (p.z - a.z) * dz) / lenSq));
    let ex = p.x - (a.x + t * dx);
    let ey = p.y - (a.y + t * dy);
    let ez = p.z - (a.z + t * dz);
    return Math.sqrt(ex * ex + ey * ey + ez * ez);
  }
}
