import {
  InitContext,
  InitShaders,
} from './init';

import Info from './tools/info';
import Map3D from './map3D';
import { Clear } from './draw';
import Skybox from './shapes/Skybox';
import Mover from './tools/mover';

const LOADER = document.getElementById('loading');
const CANVAS = document.getElementById('drawer');

if (!(CANVAS instanceof HTMLCanvasElement)) {
  LOADER.children[0].textContent = 'There was a problem while loading the map. (canvas is missing)';
  throw new Error('Cannot found the canvas');
}

CANVAS.width = CANVAS.clientWidth;
CANVAS.height = CANVAS.clientHeight;

const CTX = CANVAS.getContext('webgl');

if (CTX == null || !(CTX instanceof WebGLRenderingContext)) {
  LOADER.children[0].textContent = 'It seems your browser is not compatible with WEBGL. (CTX does not exist)';
  throw new Error('Cannot retrieve context. Maybe your browser is not compatible');
}

const mover = new Mover(CANVAS);

InitContext(CTX);

const program = InitShaders(CTX);

const map = new Map3D(CTX);
const skybox = new Skybox(CTX);

const programInfo = new Info(CTX, program);


const image = new Image();
image.src = '/map.png';
image.decode().then(() => {
  map.initTexture((percent) => {
    LOADER.children.item(0).textContent = `Loading, please wait... ${Math.round(percent * 100)} %`;
  }).then(() => {
    LOADER.style.display = 'none';

    function render() {
      Clear(CTX);
      skybox.draw(mover.getMove());
      map.draw(programInfo, mover.getMove());

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  });
});
