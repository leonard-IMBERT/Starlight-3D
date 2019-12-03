const metadata = require('../metadata.json');
/*
const RED = [255, 0, 0];
const BLACK = [0, 0, 0];
const WHITE = [255, 255, 255];
const RBH = [RED, BLACK, WHITE];
*/

const TEMPLATE = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

/**
 * @param {ImageData} data1
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {number} error
 */
function like(data1, r, g, b, error) {
  return data1.data[0] < r + error && data1.data[0] > r - error
    && data1.data[1] < g + error && data1.data[1] > g - error
    && data1.data[2] < b + error && data1.data[2] > b - error;
}

export function likeMultiple(data1, rgbs, error) {
  return rgbs.reduce((acc, rgb) => acc || like(data1, rgb[0], rgb[1], rgb[2], error), false);
}

export function line(x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;
  const ret = [];

  while (!((x === x1) && (y === y1))) {
    ret.push({ x, y });

    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }

  return ret;
}

export default class Extractor {
  /**
   * @param {HTMLImageElement} image The image to extract from
   */
  constructor(image) {
    this.image = image;

    // this.canvas = new OffscreenCanvas(this.image.width, this.image.height);
    this.canvas = document.createElement('canvas');
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.context = this.canvas.getContext('2d');
    this.context.drawImage(this.image, 0, 0);
  }

  extract(x, y) {
    if (y < 0 || y > 70 || x < 0 || x > metadata['row-length'][x + 1]) {
      throw new Error('coordinate out of bound');
    }


    const pixy = metadata['bottom-offset'] + y * metadata['vertical-step'];
    const pixx = metadata['left-offset'][y + 1] + x * metadata['horizontal-step'];


    /**
     * search around the center for 15x15 and select them
     */

    const imageData = new Array(15);
    for (let i = 0; i < 15; i += 1) {
      imageData[i] = [];
    }

    for (let sx = -13; sx <= 13; sx += 1) {
      for (let sy = -7; sy <= 7; sy += 1) {
        const pointToDetermine = {
          x: pixx + sx,
          y: pixy + sy,
        };

        if (TEMPLATE[sy + 7][sx + 13] === 1) {
          imageData[sy + 7][sx + 13] = Array.from(
            this.context.getImageData(pointToDetermine.x, pointToDetermine.y, 1, 1).data,
          );
        } else {
          imageData[sy + 7][sx + 13] = [20, 20, 20, 255];
        }

        /* Nice try but no
        // Check for the line
        const lineToCheck = line(pointToDetermine.x, pointToDetermine.y, pixx, pixy);
        // Check for pixel around the line
        const dx = Math.sign(pointToDetermine.x - pixx);
        const dy = Math.sign(pointToDetermine.y - pixy);


        const keep = lineToCheck.reduce((prev, point) => {
          const data = this.context.getImageData(point.x, point.y, 1, 1);
          const datadx = this.context.getImageData(point.x + dx, point.y, 1, 1);
          const datady = this.context.getImageData(point.x, point.y + dy, 1, 1);
          return prev
            && !likeMultiple(data, RBH, 1)
            && !(likeMultiple(datady, RBH, 1)
            && likeMultiple(datadx, RBH, 1));
        }, true);

        if (keep) {
          imageData[sy + 15][sx + 15] = Array.from(this.context.getImageData(
            pointToDetermine.x,
            pointToDetermine.y,
            1, 1,
          ).data);
        } else {
          imageData[sy + 15][sx + 15] = [0, 0, 0, 0];
        } */
      }
    }

    const extractedImage = new ImageData(
      new Uint8ClampedArray(imageData.map((arr) => arr.reduce((acc, ar) => acc.concat(ar)))
        .reduce((acc, arr) => acc.concat(arr))),
      27,
      15,
    );

    return extractedImage;
  }
}
