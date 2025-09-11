//
// Asset loader
//

let Loader = {
  images: {},
};

Loader.loadImage = function (key, src) {
  if (src == null) {
    return;
  }
  let img = new Image();

  let d = new Promise(
    function (resolve, reject) {
      img.onload = function () {
        this.images[key] = img;
        resolve(img);
      }.bind(this);

      img.onerror = function () {
        reject("Could not load image: " + src);
      };
    }.bind(this)
  );

  img.src = src;
  return d;
};

Loader.getImage = function (key) {
  return key in this.images ? this.images[key] : null;
};

//
// Keyboard handler
//

let Keyboard = {};

Keyboard.LEFT = 37;
Keyboard.RIGHT = 39;
Keyboard.UP = 38;
Keyboard.DOWN = 40;

Keyboard._keys = {};

Keyboard.listenForEvents = function (keys) {
  window.addEventListener("keydown", this._onKeyDown.bind(this));
  window.addEventListener("keyup", this._onKeyUp.bind(this));

  keys.forEach(
    function (key) {
      this._keys[key] = false;
    }.bind(this)
  );
};

Keyboard._onKeyDown = function (event) {
  let keyCode = event.keyCode;
  if (keyCode in this._keys) {
    event.preventDefault();
    this._keys[keyCode] = true;
  }
};

Keyboard._onKeyUp = function (event) {
  let keyCode = event.keyCode;
  if (keyCode in this._keys) {
    event.preventDefault();
    this._keys[keyCode] = false;
  }
};

Keyboard.isDown = function (keyCode) {
  if ((!keyCode) in this._keys) {
    throw new Error("Keycode " + keyCode + " is not being listened to");
  }
  return this._keys[keyCode];
};

//
// Game object
//

let Game = {};

Game.run = function () {
  this._previousElapsed = 0;
  let p = this.load();
  Promise.all(p).then(async () => {
    await this.init();
    window.requestAnimationFrame(this.tick);
  });
};

Game.tick = function (elapsed) {
  window.requestAnimationFrame(this.tick);

  let delta = (elapsed - this._previousElapsed) / 1000.0;
  delta = Math.min(delta, 0.25);
  this._previousElapsed = elapsed;

  this.update(delta);
  this.render();
}.bind(Game);

// override these
Game.init = function () {};
Game.update = function (delta) {};
Game.render = function () {};
Game.clickReactor = function (event) {};
Game.clickMaterials = function (event) {};
Game.hoverReactor = function (event) {};
Game.hoverMaterials = function (event) {};
Game.hoverOut = function (event) {};

//
// start up function
//

let PIXEL_RATIO = 1;
let CANVAS_COLOR = "#1c1c1f";

const HiDPICanvas = function (canvas, w, h, ratio = 1) {
  canvas.width = w * ratio;
  canvas.height = h * ratio;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.style.backgroundColor = CANVAS_COLOR;
  canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
};

window.onload = function () {
  Game.reactorCanvas = document.getElementById("reactor");
  HiDPICanvas(Game.reactorCanvas, 704, 704, PIXEL_RATIO);
  Game.reactorCanvas.addEventListener("click", (event) => Game.clickReactor(event));
  Game.reactorCanvas.addEventListener("mousemove", (event) => Game.hoverReactor(event));
  Game.reactorCanvas.addEventListener("mouseout", (event) => Game.hoverOut(event));
  Game.ctx = Game.reactorCanvas.getContext("2d");
  Game.ctx.font = "10pt Source Code Pro, Courier, monospace";
  Game.ctx.imageSmoothingEnabled = false;

  Game.materialsCanvas = document.getElementById("materials");
  HiDPICanvas(Game.materialsCanvas, 104, 704);
  Game.materialsCanvas.addEventListener("click", (event) => Game.clickMaterials(event));
  Game.materialsCanvas.addEventListener("mousemove", (event) => Game.hoverMaterials(event));
  Game.materialsCanvas.addEventListener("mouseout", (event) => Game.hoverOut(event));
  Game.materials = Game.materialsCanvas.getContext("2d");
  Game.materials.imageSmoothingEnabled = false;

  Game.statisticsCanvas = document.getElementById("reactorStatistics");
  HiDPICanvas(Game.statisticsCanvas, 824, 200, PIXEL_RATIO);
  Game.statistics = Game.statisticsCanvas.getContext("2d");
  Game.statistics.font = "10pt Source Code Pro, Courier, monospace";
  Game.statistics.imageSmoothingEnabled = false;

  Game.tooltipCanvas = document.getElementById("reactorTooltip");
  Game.tooltipCtx = Game.tooltipCanvas.getContext("2d");

  Game.run();
};
