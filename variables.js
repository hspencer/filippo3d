/* filippo3d - by hspencer (cc) */

let ux, uy, uz; // 3d rotations
let nx, ny, nz; 
let drawing;
let freeRotate;
let trazo, trazos;

function init(){
  ux = 0;
  uy = 0;
  uz = 0;
  nx = 0;
  ny = 0;
  nz = 0;
  drawing = false;
  freeRotate = false;
  trazos = [];
}