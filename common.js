//
// Asset loader
//

let Loader = {
    images: {}
};

Loader.loadImage = function (key, src) {
    if (src == null) {
        return;
    }
    let img = new Image();

    let d = new Promise(function (resolve, reject) {
        img.onload = function () {
            this.images[key] = img;
            resolve(img);
        }.bind(this);

        img.onerror = function () {
            reject('Could not load image: ' + src);
        };
    }.bind(this));

    img.src = src;
    return d;
};

Loader.getImage = function (key) {
    return (key in this.images) ? this.images[key] : null;
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
    window.addEventListener('keydown', this._onKeyDown.bind(this));
    window.addEventListener('keyup', this._onKeyUp.bind(this));

    keys.forEach(function (key) {
        this._keys[key] = false;
    }.bind(this));
}

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
    if (!keyCode in this._keys) {
        throw new Error('Keycode ' + keyCode + ' is not being listened to');
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
    Promise.all(p).then(function (loaded) {
        this.init();
        window.requestAnimationFrame(this.tick);
    }.bind(this));
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
Game.clickReactor = function (event)    { };
Game.clickMaterials = function (event)  { };
Game.hoverReactor = function (event)    { };
Game.hoverMaterials = function (event)  { };

//
// start up function
//

window.onload = function () {
    let reactorCanvas = document.getElementById('reactor');
    reactorCanvas.addEventListener('click', (event) => Game.clickReactor(event));
    Game.ctx = reactorCanvas.getContext('2d');
    Game.ctx.imageSmoothingEnabled = false;

    Game.tooltipCanvas = document.getElementById('reactorTooltip');
    reactorCanvas.addEventListener('mousemove', (event) => Game.hoverReactor(event));
    Game.tooltipCtx = Game.tooltipCanvas.getContext('2d');

    Game.tooltipCanvas.width = 250;
    Game.tooltipCanvas.height = 210;
    Game.tooltipCtx.font = "10pt Source Code Pro, Courier, monospace";
    Game.tooltipCtx.imageSmoothingEnabled = false;

    let materialsCanvas = document.getElementById('materials');
    materialsCanvas.addEventListener('click', (event) => Game.clickMaterials(event));
    Game.materials = materialsCanvas.getContext('2d');
    Game.materials.imageSmoothingEnabled = false;

    Game.run();
};
