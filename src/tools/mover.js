export default class Mover {
  constructor(div) {
    if (!(div instanceof HTMLElement)) {
      throw new Error('Cannot initialize the moover, the main element is not an element');
    }

    this.element = div;

    /**
     * Specifically coded for a div containing the following element
     * [ <empty>, <arrow up>, <empty>, <zoom>,
     *   <arrow left>, <empty>, <arrow right>, <empty>,
     *   <empty>, <arrow down>, <empty>, <dezoom>
     * ]
     */

    this.speed = 0.01;

    this.mov = {
      up: 0,
      right: 0,
      zoom: 1,
    };

    this.element.addEventListener('mousemove', (ev) => {
      if (ev.buttons === 1) {
        this.mov.right = this.mov.right - ev.movementX * this.speed * 10;
        this.mov.up = this.mov.up + ev.movementY * this.speed;
      }
    });

    this.element.addEventListener('wheel', (ev) => {
      this.mov.zoom = this.mov.zoom + ev.deltaY;
    });
  }

  getMove() {
    return {
      up: this.mov.up,
      right: this.mov.right,
      zoom: Math.exp(this.mov.zoom / 4000),
    };
  }
}
