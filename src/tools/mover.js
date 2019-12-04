export default class Mover {
  constructor(div) {
    if (!(div instanceof HTMLElement)) {
      throw new Error('Cannot initialize the moover, the main element is not an element');
    }

    this.element = div;

    this.speed = 0.01;

    this.mov = {
      up: 0,
      right: 0,
      zoom: 1,
    };

    this.touch = null;

    this.element.addEventListener('mousemove', (ev) => {
      if (ev.buttons === 1) {
        this.mov.right = this.mov.right - ev.movementX * this.speed * 10;
        this.mov.up = this.mov.up + ev.movementY * this.speed;
      }
    });

    this.element.addEventListener('touchstart', (ev) => {
      if (ev.touches.length === 1) {
        this.touch = ev.touches.item(0);
      }
    });

    this.element.addEventListener('touchmove', (ev) => {
      if (this.touch != null && ev.touches.length === 1) {
        const newTouch = ev.touches.item(0);

        const dx = newTouch.screenX - this.touch.screenX;
        const dy = newTouch.screenY - this.touch.screenY;

        this.mov.right = this.mov.right + dx * this.speed * 10;
        this.mov.up = this.mov.up + dy * this.speed;

        this.touch = newTouch;
      }
    });

    this.element.addEventListener('touchend', () => {
      this.touch = null;
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
