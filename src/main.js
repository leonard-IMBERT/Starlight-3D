import {
  InitContext,
  InitShaders,
} from './init';

import Info from './tools/info';
import Map3D from './map3D';
import Extractor from './extractor/exctrator';
import { Clear } from './draw';
import Skybox from './shapes/Skybox';

const LOADER = document.getElementById('loading');
const CANVAS = document.getElementById('drawer');

if (!(CANVAS instanceof HTMLCanvasElement)) {
  throw new Error('Cannot found the canvas');
}

CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;

const CTX = CANVAS.getContext('webgl');

if (CTX == null || !(CTX instanceof WebGLRenderingContext)) {
  throw new Error('Cannot retrieve context. Maybe your browser is not compatible');
}

InitContext(CTX);

const program = InitShaders(CTX);

const map = new Map3D(CTX);
const skybox = new Skybox(CTX);

const programInfo = new Info(CTX, program);


const image = new Image();
image.src = '/map.png';
image.decode().then(() => {
  const extractor = new Extractor(image);
  map.initTexture(extractor)
    .then(() => {
      LOADER.style.display = 'none';
      /* CANVAS.addEventListener('mousemove', (ev) => {
        if (ev.buttons === 1) {
          map.rotate(ev.movementY, ev.movementX);
          Clear(CTX);
          map.draw(programInfo);
        }
      }); */
/*
      Clear(CTX);
      skybox.draw(0);
      map.draw(programInfo);
*/
       let then = 0;

      // Draw the scene repeatedly
      function render(now) {
        const Now = now * 0.001; // convert to seconds
        const deltaTime = Now - then;
        then = Now;

        Clear(CTX);
        skybox.draw(then);
        map.draw(programInfo, -then);

        requestAnimationFrame(render);
      }
      requestAnimationFrame(render);
    });
});
