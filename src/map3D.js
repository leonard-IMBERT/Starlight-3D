import Tile from './shapes/Tile';
import Draw from './draw';
import Extractor from './extractor/extractor.worker';

const metadata = require('./metadata.json');

export default class Map3D {
  /**
   * @param {WebGLRenderingContext} ctx The webgl context of the map
   */
  constructor(ctx) {
    this.metadata = metadata;
    this.ctx = ctx;
    this.tiles = [];
    this.textures = null;

    const basey = 20;
    for (let row = 0; row < this.metadata['row-number']; row += 1) {
      this.tiles.push([]);
      const basex = (this.metadata['left-offset'][1] - this.metadata['left-offset'][row + 1]) / 26;
      for (let column = 0; column < this.metadata['row-length'][row + 1]; column += 1) {
        const x = -basex + column;
        const y = row * 0.7 - basey;

        const rowLength = this.metadata['row-length'][row + 1];

        const distanceFromStar = Math.sqrt((row - 71) ** 2 + (column - rowLength / 2) ** 2);

        this.tiles[row].push(new Tile(ctx, x, y, 25 - (distanceFromStar / 3), 1, 0.55));
      }
    }

    this.extractor = new Extractor();
  }

  initTexture(loadingCallback) {
    return new Promise((res) => {
      this.textures = [];

      this.extractor.onmessage = (message) => {
        const {
          x, y, data, width, height,
        } = message.data;

        const imageData = new ImageData(new Uint8ClampedArray(data), width, height);

        const texture = this.ctx.createTexture();
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
        this.ctx.texImage2D(
          this.ctx.TEXTURE_2D,
          0,
          this.ctx.RGBA,
          this.ctx.RGBA,
          this.ctx.UNSIGNED_BYTE,
          imageData,
        );

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (imageData.width % 2 === 0 && imageData.height % 2 === 0) {
          // Yes, it's a power of 2. Generate mips.
          this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        } else {
          // No, it's not a power of 2. Turn off mips and set
          // wrapping to clamp to edge
          this.ctx.texParameteri(
            this.ctx.TEXTURE_2D,
            this.ctx.TEXTURE_WRAP_S,
            this.ctx.CLAMP_TO_EDGE,
          );
          this.ctx.texParameteri(
            this.ctx.TEXTURE_2D,
            this.ctx.TEXTURE_WRAP_T,
            this.ctx.CLAMP_TO_EDGE,
          );
          this.ctx.texParameteri(
            this.ctx.TEXTURE_2D,
            this.ctx.TEXTURE_MIN_FILTER,
            this.ctx.LINEAR,
          );
        }

        this.textures[y][x] = texture;
      };

      for (let y = 0; y < this.tiles.length; y += 1) {
        this.textures.push([]);
        for (let x = 0; x < this.tiles[y].length; x += 1) {
          this.extractor.postMessage({ x, y });
          this.textures[y].push(null);
        }
      }

      const check = () => {
        if (!(this.textures.every((arr) => arr.every((val) => val != null)))) {
          const tot = this.textures.map((arr) => arr.length).reduce((a, b) => a + b);
          const loaded = this.textures.reduce(
            (acc, arr) => acc + arr.reduce((count, image) => count + (image == null ? 0 : 1), 0), 0,
          );

          loadingCallback(loaded / tot);
          setTimeout(check, 100);
        } else {
          res();
        }
      };

      setTimeout(check, 1000);
    });
  }

  draw(infos, rotation) {
    for (let y = 0; y < this.tiles.length; y += 1) {
      for (let x = 0; x < this.tiles[y].length; x += 1) {
        Draw(this.ctx, infos, this.tiles[y][x], this.textures[y][x], rotation);
      }
    }
  }

  rotate(dz, dx) {
    this.rotation.z += dz;
    this.rotation.y += dx * Math.cos(dz);
    this.rotation.x += dx * Math.sin(dz);
  }
}
