const BOUNDARY = '#aaaaaa';
const CASING = '#c6c6c6';
const HATCH = '#8b8b8b';

const Blocks = Object.freeze({
    CASING: Symbol('CASING'),
    HATCH: Symbol('HATCH'),
});

const Simulator = {};

Simulator.init = function(map) {
    const hatchesGrid = new Array(map.size * map.size).fill(null);
    map.tiles.forEach((tile, i) => {
        const materialTile = Game.materialTiles[tile];
        if (materialTile?.component || materialTile?.type === Blocks.HATCH) {
            hatchesGrid[i] = new NuclearHatch(materialTile.component);
        }
    });
    this.nuclearGrid = new NuclearGrid(map.size, map.size, hatchesGrid);
    this.efficiencyHistory = new NuclearEfficiencyHistoryComponent();
    this.productionHistory = new NuclearProductionHistoryComponent();
};

Simulator.update = function() {
    this.nuclearGrid.hatchesGrid.forEach((hatch) => {
        if (hatch != null) {
            hatch.tick();
        }
    })
    NuclearGridHelper.simulate(this.nuclearGrid, this.efficiencyHistory);
    this.efficiencyHistory.tick();
    this.productionHistory.tick();
};

function Material (type) {
    this.type = type;
    this.isFluid = Object.values(Fluids).includes(type);
    this.component = NuclearComponent.get(type);
};

let Tile = Object.freeze({
    CASING: 0,
    HATCH: 1,
});

const Overlay = Object.freeze({
    TEMPERATURE: 1,
    NEUTRON_ABSORPTION: 2,
    NEUTRON_FLUX: 3,
    NEUTRON_GENERATION: 4,
    EU_GENERATION: 5,
});

TileMap = (i, tiles = null) => {
    let length = 5 + 2 * i

    let map = {
        size: length,
        tsize: 64,
        tiles: tiles || new Array(length * length),
        getTile: function (col, row) {
            return this.tiles[row * map.size + col];
        },
        setTile: function (col, row, tile) {
            const oldTile = this.tiles[row * map.size + col];
            if (tile == null || oldTile == null) {
                return;
            }
            const newTile = (oldTile === tile) ? Tile.HATCH : tile;
            if (newTile != oldTile) {
                this.tiles[row * map.size + col] = newTile;
                Simulator.init(map);
                window.history.pushState(null, null, `?i=${i}&state=${btoa(JSON.stringify(this.tiles))}`);
            }
        },
    };

    if (!tiles) {
        for (let x = 0; x < length; x++) {
            let minZ;
            let xAbs = Math.abs(x - 2 - i);
            if (i != 3) {
                minZ = (xAbs == 0) ? 0 : (xAbs - 1);
            } else {
                minZ = (xAbs <= 1) ? 0 : (xAbs - 2);
            }

            let maxZ = 2 * (2 + i) - minZ;
            for (let z = minZ; z <= maxZ; z++) {
                if (!(z == minZ || z == maxZ || xAbs == 2 + i)) {
                    map.tiles[z * length + x] = Tile.HATCH;
                }
            }
        }
        window.history.pushState(null, null, `?i=${i}`);
    }

    Simulator.init(map);
    return map;
}

window.addEventListener("popstate", (event) => {
    Game.init();
});

Game.load = function () {
    const assets = [
        [Blocks.CASING, null],
        [Blocks.HATCH,  null],

        [Fuels.URANIUM_1,    'assets/item/uranium_fuel_rod.png'],
        [Fuels.URANIUM_2,    'assets/item/uranium_fuel_rod_double.png'],
        [Fuels.URANIUM_4,    'assets/item/uranium_fuel_rod_quad.png'],
        [Fuels.LE_MOX_1,     'assets/item/le_mox_fuel_rod.png'],
        [Fuels.LE_MOX_2,     'assets/item/le_mox_fuel_rod_double.png'],
        [Fuels.LE_MOX_4,     'assets/item/le_mox_fuel_rod_quad.png'],
        [Fuels.LE_URANIUM_1, 'assets/item/le_uranium_fuel_rod.png'],
        [Fuels.LE_URANIUM_2, 'assets/item/le_uranium_fuel_rod_double.png'],
        [Fuels.LE_URANIUM_4, 'assets/item/le_uranium_fuel_rod_quad.png'],

        [Items.SMALL_HEAT_EXCHANGER, 'assets/item/small_heat_exchanger.png'],
        [Items.LARGE_HEAT_EXCHANGER, 'assets/item/large_heat_exchanger.png'],
        [Items.INVAR_PLATE,          'assets/item/invar_large_plate.png'],
        [Items.CARBON_PLATE,         'assets/item/carbon_large_plate.png'],

        [Fluids.WATER,                     'assets/fluid/water_still.png'],
        [Fluids.HEAVY_WATER,               'assets/fluid/heavy_water_still.png'],
        [Fluids.HIGH_PRESSURE_WATER,       'assets/fluid/high_pressure_water_still.png'],
        [Fluids.HIGH_PRESSURE_HEAVY_WATER, 'assets/fluid/high_pressure_heavy_water_still.png'],
    ];

    this.materialTiles = assets.map(([type, asset]) => new Material(type));

    return [
        ...assets.map(([type, asset]) => Loader.loadImage(type, asset)),
        Loader.loadImage('colorbar', 'assets/colorbar.png'),
    ];
};

Game.init = function () {
    this.materialTiles.forEach((tile) => {
        tile.image = Loader.getImage(tile.type)
    });

    const urlParams = new URLSearchParams(window.location.search);
    const sizeIndexParam = urlParams.get('i');
    const stateParam = urlParams.get('state');

    const sizeIndex = sizeIndexParam ? JSON.parse(sizeIndexParam) : 0;
    const state = stateParam ? JSON.parse(atob(stateParam)) : null;

    this.map = TileMap(sizeIndex, state);

    this.colorbar = Loader.getImage('colorbar');

    let selectSize = document.getElementById("reactor-size-select");
    selectSize.selectedIndex = sizeIndex;
    selectSize.addEventListener("change", () => {
        const value = parseInt(selectSize.value);
        if (5 + 2 * value !== this.map.size) {
            this.map = TileMap(value);
        }
    });

    let selectOverlay = document.getElementById("reactor-overlay-select");
    this.overlay = Overlay.TEMPERATURE;
    selectOverlay.addEventListener("change", () => {
        this.overlay = parseInt(selectOverlay.value);
    });

    this.selectedMaterial = null;
    this.clickMaterials = function (event) {
        let i = Math.floor(event.offsetX / 34);
        this.selectedMaterial = (i < Game.materialTiles.length && i !== Game.selectedMaterial) ? i : null;
    };

    this.clickReactor = function (event) {
        let x = Math.floor(event.offsetX / this.map.tsize);
        let y = Math.floor(event.offsetY / this.map.tsize);
        this.map.setTile(x, y, this.selectedMaterial);
    };

    this.reactorTooltip = { tile: null };
    this.hoverReactor = function (event) {
        const tile = Simulator.nuclearGrid.getNuclearTile(
            Math.floor(event.offsetX / this.map.tsize),
            Math.floor(event.offsetY / this.map.tsize)
        );
        if (tile != null) {
            this.tooltipCanvas.style.left = (event.clientX + 20) + "px";
            this.tooltipCanvas.style.top = (event.clientY - 20) + "px";
            this.reactorTooltip = { tile: tile };
        } else {
            this.tooltipCanvas.style.left = "-2000px"
        }
    };

    Simulator.init(this.map);
};

Game.update = function (delta) {
    Simulator.update();
};

const neutronColorScheme = (neutronNumber) => {
    const neutronsMax = NuclearConstant.MAX_HATCH_EU_PRODUCTION;
    neutronNumber = Math.min(neutronNumber, neutronsMax);
    return Math.log(1 + 10 * neutronNumber) / Math.log(1 + 10 * neutronsMax);
};

const overlayColor = (x, y) => {
    const tileData = Simulator.nuclearGrid.getNuclearTile(x, y);
    let neutronRate = 0;

    switch (Game.overlay) {
    case Overlay.TEMPERATURE:
        return [Math.floor(299 * tileData.getTemperature() / NuclearConstant.MAX_TEMPERATURE), 30];
    case Overlay.EU_GENERATION:
        return [Math.floor(299 * tileData.getMeanEuGeneration() / (2 * NuclearConstant.MAX_HATCH_EU_PRODUCTION)), 30];
    case Overlay.NEUTRON_ABSORPTION:
        neutronRate = 5 * tileData.getMeanNeutronAbsorption(NeutronType.BOTH);
        return [Math.floor(299 * neutronColorScheme(2 * neutronRate)), 0];
    case Overlay.NEUTRON_FLUX:
        neutronRate = tileData.getMeanNeutronFlux(NeutronType.BOTH);
        return [Math.floor(299 * neutronColorScheme(2 * neutronRate)), 0];
    case Overlay.NEUTRON_GENERATION:
        neutronRate = tileData.getMeanNeutronGeneration()
        return [Math.floor(299 * neutronColorScheme(1 * neutronRate)), 0];
    }

    return [0, 0];
};

const textWriter = function (ctx) {
    this.lineIndex = 0;
    this.call = function() {
        assert(arguments.length % 2 === 0);
        let length = 0;
        for (let i = 0; i < arguments.length; i += 2) {
            const [text, color] = [arguments[i], arguments[i + 1]];
            ctx.fillStyle = color;
            ctx.fillText(
                text,
                10 + length,
                20 + this.lineIndex * 20,
            );
            length += ctx.measureText(text).width;
        }
        ++this.lineIndex;
    };
    return this.call.bind(this);
};

Game._drawReactor = function (fluidFrame) {
    this.ctx.fillStyle = BOUNDARY;
    this.ctx.fillRect(0, 0, 11 * this.map.tsize, 11 * this.map.tsize);

    for (let c = 0; c < this.map.size; c++) {
        for (let r = 0; r < this.map.size; r++) {
            let tile = this.map.getTile(c, r);

            if (tile == null) {
                continue;
            }

            switch (tile) {
            case Tile.CASING:
                this.ctx.fillStyle = CASING;
                break;
            default:
                this.ctx.fillStyle = HATCH;
            }

            this.ctx.fillRect(c * this.map.tsize, r * this.map.tsize, this.map.tsize, this.map.tsize);

            let material = this.materialTiles[tile];

            if (material?.image != null){
                let fluidAnimation = material.isFluid
                    ? [0, 16 * fluidFrame, 16, 16]
                    : []
                this.ctx.drawImage(
                    material.image,
                    ...fluidAnimation,
                    c * this.map.tsize,
                    r * this.map.tsize,
                    this.map.tsize,
                    this.map.tsize
                );
            }

            if (material && tile != Tile.CASING) {
                const [u, v] = overlayColor(c, r);
                this.ctx.drawImage(
                    this.colorbar,
                    u, v, 1, 1,
                    c * this.map.tsize,
                    r * this.map.tsize,
                    this.map.tsize,
                    this.map.tsize
                );
            }
        }
    }

    let length = this.map.size * this.map.tsize;

    this.ctx.strokeStyle = BOUNDARY;
    for (let r = 0; r <= this.map.size; r++) {
        // horizontal
        this.ctx.beginPath();
        this.ctx.moveTo(0, r * this.map.tsize);
        this.ctx.lineTo(length, r * this.map.tsize);
        this.ctx.stroke();
        // vertical
        this.ctx.beginPath();
        this.ctx.moveTo(r * this.map.tsize, 0);
        this.ctx.lineTo(r * this.map.tsize, length);
        this.ctx.stroke();
    }

    const tooltipTile = this.reactorTooltip.tile;
    if (tooltipTile) {
        this.tooltipCtx.clearRect(0, 0, this.tooltipCanvas.width, this.tooltipCanvas.height);
        const tooltipLine = new textWriter(this.tooltipCtx);

        const clamp = (temp)  => {
            return (temp < 2147483647) ? temp : '∞';
        }

        tooltipLine(`Temperature         ${tooltipTile.getTemperature().toFixed(1)}`, '#ffffff');
        tooltipLine(`    Max Temperature ${clamp(tooltipTile.getMaxTemperature())}`, '#fcfc54');
        tooltipLine(`Neutron Absorbtion  ${tooltipTile.getMeanNeutronAbsorption(NeutronType.BOTH).toFixed(1)}`, '#ffffff');
        tooltipLine(`    Fast Neutron    ${tooltipTile.getMeanNeutronAbsorption(NeutronType.FAST).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`    Thermal Neutron ${tooltipTile.getMeanNeutronAbsorption(NeutronType.THERMAL).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`Neutron Flux        ${tooltipTile.getMeanNeutronFlux(NeutronType.BOTH).toFixed(1)}`, '#ffffff');
        tooltipLine(`    Fast Neutron    ${tooltipTile.getMeanNeutronFlux(NeutronType.FAST).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`    Thermal Neutron ${tooltipTile.getMeanNeutronFlux(NeutronType.THERMAL).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`Neutron Generation  ${tooltipTile.getMeanNeutronGeneration().toFixed(1)}`, '#ffffff');
        tooltipLine(`EU Generation       ${tooltipTile.getMeanEuGeneration().toFixed(0)}`, '#fcdb7c');
    };

    const euProduction = Simulator.efficiencyHistory.getAverage(NuclearEfficiencyHistoryComponentType.euProduction);
    const euFuelConsumption = Simulator.efficiencyHistory.getAverage(NuclearEfficiencyHistoryComponentType.euFuelConsumption);

    const format = (eu) => {
      const lookup = [
        [ 1, ""],
        [ 1e3, "k"],
        [ 1e6, "M"],
        [ 1e9, "G"],
        [ 1e12, "T"],
        [ 1e15, "P"],
        [ 1e18, "E"],
      ];
      const [value, symbol] = lookup.findLast(([value]) => eu >= value) || lookup[0];
      const v = eu / value;
      const digits = 3 - Math.floor(Math.log10(Math.max(1, v)));
      return `${(v).toFixed(digits)}${symbol} EU/t `;
    };

    const infoLine = new textWriter(this.ctx);
    infoLine(format(euProduction), '#fcdb7c', 'produced for', '#ffffff');
    infoLine(format(euFuelConsumption), '#fcdb7c', 'of fuel consumed', '#ffffff');
    infoLine(`Efficiency ${(100 * euProduction / euFuelConsumption).toFixed(1)} %`, '#fc5454');
};

Game._drawTileSelector = function (fluidFrame) {
    this.materials.fillStyle = '#ffffff';
    this.materials.fillRect(0, 0, 22 * 36, 1 * 36);

    this.materialTiles.forEach((material, i) => {
        switch (material.type) {
        case Blocks.HATCH:
            this.materials.fillStyle = HATCH;
            break;
        default:
            this.materials.fillStyle = CASING;
        }
        this.materials.fillRect(2 + i * 34, 2, 32, 32);

        if (material.image != null){
            let fluidAnimation = material.isFluid
                ? [0, 16 * fluidFrame, 16, 16]
                : []
            this.materials.drawImage(
                material.image,
                ...fluidAnimation,
                2 + i * 34,
                2,
                32,
                32
            );
        }
    });

    if (this.selectedMaterial !== null) {
        this.materials.strokeStyle = '#f00';
        this.materials.beginPath();
        this.materials.moveTo(2 + this.selectedMaterial * 34 +  0, 2);
        this.materials.lineTo(2 + this.selectedMaterial * 34 + 32, 2);
        this.materials.lineTo(2 + this.selectedMaterial * 34 + 32, 2 + 32);
        this.materials.lineTo(2 + this.selectedMaterial * 34 +  0, 2 + 32);
        this.materials.lineTo(2 + this.selectedMaterial * 34 +  0, 2);
        this.materials.stroke();

        this.materials.fillStyle = '#fff4';
        this.materials.fillRect(2 + this.selectedMaterial * 34, 2, 32, 32);
    }
};

Game._drawReactorStatistics = function (fluidFrame) {
    this.statistics.clearRect(0, 0, this.statisticsCanvas.width, this.statisticsCanvas.height);
    const infoLine = new textWriter(this.statistics);

    const waterConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.waterConsumption);
    const heavyWaterConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.heavyWaterConsumption);
    const highPressureWaterConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.highPressureWaterConsumption);
    const highPressureHeavyWaterConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.highPressureHeavyWaterConsumption);

    const steamProduction = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.steamProduction);
    const heavyWaterSteamProduction = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.heavyWaterSteamProduction);
    const highPressureSteamProduction = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.highPressureSteamProduction);
    const highPressureHeavyWaterSteamProduction = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.highPressureHeavyWaterSteamProduction);
    const deuteriumProduction = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.deuteriumProduction);
    const tritiumProduction = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.tritiumProduction);

    const insertNonZero = (prefix, value)  => {
        if (value > 0) {
            infoLine(`${prefix}${value.toFixed(1)}`, '#fff');
        }
    };

    infoLine('INPUT', '#fcfc54');
    insertNonZero('    Water                 ', waterConsumption, '#fff');
    insertNonZero('    Heavy Water           ', heavyWaterConsumption, '#fff');
    insertNonZero('    HP Water              ', highPressureWaterConsumption, '#fff');
    insertNonZero('    HP Heavy Water        ', highPressureHeavyWaterConsumption, '#fff');

    infoLine('OUTPUT', '#fcfc54');
    insertNonZero('    Steam                 ', steamProduction, '#fff');
    insertNonZero('    Heavy Water Steam     ', heavyWaterSteamProduction, '#fff');
    insertNonZero('    HP Water Steam        ', highPressureSteamProduction, '#fff');
    insertNonZero('    HP Heavy Water Steam  ', highPressureHeavyWaterSteamProduction, '#fff');
    insertNonZero('    Deuterium             ', deuteriumProduction, '#fff');
    insertNonZero('    Tritium               ', tritiumProduction, '#fff');
};

Game.render = function () {
    let fluidFrame = Math.floor(Date.now() / 200) % 32
    this._drawReactor(fluidFrame);
    this._drawTileSelector(fluidFrame);
    this._drawReactorStatistics(fluidFrame);
};
