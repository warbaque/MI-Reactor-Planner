const BOUNDARY = '#aaaaaa';
const CASING = '#c6c6c6';
const HATCH = '#8b8b8b';

const Blocks = Object.freeze({
    CASING: Symbol('CASING'),
    HATCH: Symbol('HATCH'),
});

const Simulator = {};
Simulator.speed = 1;
Simulator.steamOutput = true;

Simulator.init = function(map) {
    const hatchesGrid = new Array(map.size * map.size).fill(null);
    map.tiles.forEach((tile, i) => {
        const materialTile = Game.material.tiles[tile];
        if (materialTile?.component || materialTile?.type === Blocks.HATCH) {
            hatchesGrid[i] = new NuclearHatch(materialTile.component);
        }
    });
    this.nuclearGrid = new NuclearGrid(map.size, map.size, hatchesGrid);
    this.efficiencyHistory = new NuclearEfficiencyHistoryComponent();
    this.productionHistory = new NuclearProductionHistoryComponent();
};

Simulator.update = function() {
    for (let i=0; i < this.speed; ++i) {
        this.nuclearGrid.hatchesGrid.forEach((hatch) => {
            if (hatch != null) {
                hatch.tick();
            }
        })
        NuclearGridHelper.simulate(this.nuclearGrid, this.efficiencyHistory);
        this.efficiencyHistory.tick();
        this.productionHistory.tick();
    }
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

        [Fuels.HE_MOX_1,     'assets/item/he_mox_fuel_rod.png'],
        [Fuels.HE_MOX_2,     'assets/item/he_mox_fuel_rod_double.png'],
        [Fuels.HE_MOX_4,     'assets/item/he_mox_fuel_rod_quad.png'],
        [Fuels.HE_URANIUM_1, 'assets/item/he_uranium_fuel_rod.png'],
        [Fuels.HE_URANIUM_2, 'assets/item/he_uranium_fuel_rod_double.png'],
        [Fuels.HE_URANIUM_4, 'assets/item/he_uranium_fuel_rod_quad.png'],

        [Items.CONTROL_ROD, 'assets/item/cadmium_control_rod.png'],
    ];

    const materialPositions = [
        [Blocks.CASING, Blocks.HATCH],
        [],
        [Fuels.URANIUM_1, Fuels.URANIUM_2, Fuels.URANIUM_4],
        [Fuels.LE_MOX_1, Fuels.LE_MOX_2, Fuels.LE_MOX_4],
        [Fuels.LE_URANIUM_1, Fuels.LE_URANIUM_2, Fuels.LE_URANIUM_4],
        [Fuels.HE_MOX_1, Fuels.HE_MOX_2, Fuels.HE_MOX_4],
        [Fuels.HE_URANIUM_1, Fuels.HE_URANIUM_2, Fuels.HE_URANIUM_4],
        [Items.CONTROL_ROD],
        [],
        [Items.SMALL_HEAT_EXCHANGER, Items.LARGE_HEAT_EXCHANGER],
        [],
        [Items.INVAR_PLATE, Items.CARBON_PLATE],
        [],
        [Fluids.WATER, Fluids.HEAVY_WATER],
        [Fluids.HIGH_PRESSURE_WATER, Fluids.HIGH_PRESSURE_HEAVY_WATER],
    ];

    this.material = {
        tiles: assets.map(([type, asset]) => new Material(type)),
        positions: {},
        selected: {
            x: 0,
            y: 0,
            tile: null,
        },
        getTile: function(x, y) {
            return this.tiles.find((material) => material.type === materialPositions?.[y]?.[x]);
        },
        getTileIndex: function(x, y) {
            const tile = materialPositions?.[y]?.[x];
            const i = this.tiles.findIndex((material) => material.type === tile);
            return i < 0 ? null : i;
        },
        getPosition: function(material) {
            return this.positions[material.type];
        },
    };

    materialPositions.forEach((row, y) => {
        row.forEach((tile, x) => {
            this.material.positions[tile] = [x, y];
        });
    });

    return [
        ...assets.map(([type, asset]) => Loader.loadImage(type, asset)),
        Loader.loadImage('colorbar', 'assets/colorbar.png'),
        Loader.loadImage('warning', 'assets/warning.png'),
    ];
};

Game.init = function () {
    this.material.tiles.forEach((tile) => {
        tile.image = Loader.getImage(tile.type)
    });

    const urlParams = new URLSearchParams(window.location.search);
    const sizeIndexParam = urlParams.get('i');
    const stateParam = urlParams.get('state');

    const sizeIndex = sizeIndexParam ? JSON.parse(sizeIndexParam) : 0;
    const state = stateParam ? JSON.parse(atob(stateParam)) : null;

    this.map = TileMap(sizeIndex, state);

    this.colorbar = Loader.getImage('colorbar');
    this.warning = Loader.getImage('warning');

    const selectSize = document.getElementById("reactor-size-select");
    selectSize.selectedIndex = sizeIndex;
    selectSize.addEventListener("change", () => {
        const value = parseInt(selectSize.value);
        if (5 + 2 * value !== this.map.size) {
            this.map = TileMap(value);
        }
    });

    const selectOverlay = document.getElementById("reactor-overlay-select");
    this.overlay = Overlay.TEMPERATURE;
    selectOverlay.addEventListener("change", () => {
        this.overlay = parseInt(selectOverlay.value);
    });

    const simulatorSpeed = document.getElementById("simulator-speed-select");
    simulatorSpeed.addEventListener("change", () => {
        Simulator.speed = parseInt(simulatorSpeed.value);
    });

    const steamOutput = document.getElementById("simulator-steam-output-toggle");
    steamOutput.onclick = (event) => {
        steamOutput.classList.toggle('off');
        Simulator.steamOutput = !steamOutput.classList.contains('off');
    };

    this.clickMaterials = function (event) {
        let x = Math.floor(event.offsetX / 34);
        let y = Math.floor(event.offsetY / 34);
        const tile = this.material.getTileIndex(x, y);
        this.material.selected = {x: x, y: y, tile: (tile !== this.material.selected.tile) ? tile : null};
    };

    this.clickReactor = function (event) {
        let x = Math.floor(event.offsetX / this.map.tsize);
        let y = Math.floor(event.offsetY / this.map.tsize);
        this.map.setTile(x, y, this.material.selected.tile);
    };

    const clamp = (temp) => {
        return (temp < 2147483647) ? temp : '∞';
    }

    this.hoverOut = function (event) {
        this.tooltipCanvas.style.left = "-2000px";
        this._drawTooltip = () => {};
    }

    const reactorTileInfo = (tile) => {
        this.tooltipCtx.clearRect(0, 0, this.tooltipCanvas.width, this.tooltipCanvas.height);
        const tooltipLine = new textWriter(this.tooltipCtx);

        tooltipLine(`Temperature         ${tile.getTemperature().toFixed(1)}`, '#ffffff');
        tooltipLine(`    Max Temperature ${tile.component ? clamp(tile.component.getMaxTemperature()) : NuclearConstant.MAX_TEMPERATURE}`, '#fcfc54');
        tooltipLine(`Neutron Absorbtion  ${tile.getMeanNeutronAbsorption(NeutronType.BOTH).toFixed(1)}`, '#ffffff');
        tooltipLine(`    Fast Neutron    ${tile.getMeanNeutronAbsorption(NeutronType.FAST).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`    Thermal Neutron ${tile.getMeanNeutronAbsorption(NeutronType.THERMAL).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`Neutron Flux        ${tile.getMeanNeutronFlux(NeutronType.BOTH).toFixed(1)}`, '#ffffff');
        tooltipLine(`    Fast Neutron    ${tile.getMeanNeutronFlux(NeutronType.FAST).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`    Thermal Neutron ${tile.getMeanNeutronFlux(NeutronType.THERMAL).toFixed(1)}`, '#a7a7a7');
        tooltipLine(`Neutron Generation  ${tile.getMeanNeutronGeneration().toFixed(1)}`, '#ffffff');
        tooltipLine(`EU Generation       ${tile.getMeanEuGeneration().toFixed(0)}`, '#fcdb7c');
    };

    this.hoverReactor = function (event) {
        const tile = Simulator.nuclearGrid.getNuclearTile(
            Math.floor(event.offsetX / this.map.tsize),
            Math.floor(event.offsetY / this.map.tsize)
        );

        if (tile != null) {
            this.tooltipCanvas.style.left = (event.offsetX + 20) + "px";
            this.tooltipCanvas.style.top = (event.offsetY - 20) + "px";
            this.tooltipCanvas.width = 250;
            this.tooltipCanvas.height = 210;
            this.tooltipCtx.font = "10pt Source Code Pro, Courier, monospace";
            this._drawTooltip = () => {
                reactorTileInfo(tile);
            };
        } else {
            this.hoverOut();
        }
    };

    const materialTileInfo = (tile) => {
        this.tooltipCtx.clearRect(0, 0, this.tooltipCanvas.width, this.tooltipCanvas.height);
        const tooltipLine = new textWriter(this.tooltipCtx);

        const name = (() => {
            switch (tile.type) {
                case Blocks.CASING: return "Nuclear Casing";
                case Blocks.HATCH: return "Empty Hatch";
                case Fuels.URANIUM_1: return "Uranium Single Rod";
                case Fuels.URANIUM_2: return "Uranium Double Rod";
                case Fuels.URANIUM_4: return "Uranium Quad Rod";
                case Fuels.LE_MOX_1: return "LE Mox Single Rod";
                case Fuels.LE_MOX_2: return "LE Mox Double Rod";
                case Fuels.LE_MOX_4: return "LE Mox Quad Rod";
                case Fuels.LE_URANIUM_1: return "LE Uranium Single Rod";
                case Fuels.LE_URANIUM_2: return "LE Uranium Double Rod";
                case Fuels.LE_URANIUM_4: return "LE Uranium Quad Rod";
                case Items.SMALL_HEAT_EXCHANGER: return "Small Heat Exchanger";
                case Items.LARGE_HEAT_EXCHANGER: return "Large Heat Exchanger";
                case Items.INVAR_PLATE: return "Invar Plate";
                case Items.CARBON_PLATE: return "Carbon Plate";
                case Fluids.WATER: return "Water";
                case Fluids.HEAVY_WATER: return "Heavy Water";
                case Fluids.HIGH_PRESSURE_WATER: return "High Pressure Water";
                case Fluids.HIGH_PRESSURE_HEAVY_WATER: return "High Pressure Heavy Water";
                case Fuels.HE_MOX_1: return "HE Mox Single Rod";
                case Fuels.HE_MOX_2: return "HE Mox Double Rod";
                case Fuels.HE_MOX_4: return "HE Mox Quad Rod";
                case Fuels.HE_URANIUM_1: return "HE Uranium Single Rod";
                case Fuels.HE_URANIUM_2: return "HE Uranium Double Rod";
                case Fuels.HE_URANIUM_4: return "HE Uranium Quad Rod";
                case Items.CONTROL_ROD: return "Control Rod";
            }
        })();

        tooltipLine(name, '#aaffaa');

        const thermalInteraction = (heatConduction, maxTemperature) => {
            tooltipLine('Thermal Interaction', '#fcdb7c');
            tooltipLine(`  Heat Conduction        ${(heatConduction * 1000).toFixed(0)}/°kCt`, '#ffffff');
            tooltipLine(`  Max Temperature        ${clamp(maxTemperature)} °C`, '#ffffff');
        }
        if (tile.component instanceof INuclearComponent) {
            thermalInteraction(tile.component.heatConduction, tile.component.getMaxTemperature());
        } else if (tile.type === Blocks.HATCH) {
            thermalInteraction(NuclearConstant.BASE_HEAT_CONDUCTION, NuclearConstant.MAX_TEMPERATURE);
        }

        const neutronInfo = (neutronType) => {
            const interactionProb = tile.component.getNeutronBehaviour().interactionTotalProbability(neutronType);
            const scattering = tile.component.getNeutronBehaviour().interactionRelativeProbability(neutronType, NeutronInteraction.SCATTERING);
            const absorption = tile.component.getNeutronBehaviour().interactionRelativeProbability(neutronType, NeutronInteraction.ABSORPTION);
            const slowingProba = tile.component.getNeutronBehaviour().neutronSlowingProbability();
            tooltipLine(`  Scattering Probability ${(100 * interactionProb * scattering).toFixed(1)} %`, '#ffffff');
            if (neutronType === NeutronType.FAST) {
                tooltipLine(`    Thermal Neutron      ${(100 * slowingProba).toFixed(1)} %`, '#a7a7a7')
                tooltipLine(`    Fast Neutron         ${(100 * (1 - slowingProba)).toFixed(1)} %`, '#a7a7a7')
            }
            tooltipLine(`  Absorbtion Probability ${(100 * interactionProb * absorption).toFixed(1)} %`, '#ffffff');
        }

        if (tile.component instanceof NuclearAbsorbable || tile.component instanceof FluidNuclearComponent) {
            tooltipLine('Fast Neutron', '#fcdb7c');
            neutronInfo(NeutronType.FAST);
            tooltipLine('Thermal Neutron', '#fcdb7c');
            neutronInfo(NeutronType.THERMAL);
        }

        if (tile.component instanceof NuclearFuel) {
            tooltipLine('Single Neutron Capture', '#fcdb7c');
            tooltipLine(`  Max neutrons emitted   ${(tile.component.neutronMultiplicationFactor).toFixed(1)}`, '#ffffff');
            tooltipLine(`    Temperature Low      ${tile.component.tempLimitLow} °C`, '#a7a7a7');
            tooltipLine(`    Temperature High     ${tile.component.tempLimitHigh} °C`, '#a7a7a7');
            tooltipLine(`  Fast Neutron Energy    ${NuclearConstant.EU_FOR_FAST_NEUTRON} EU`, '#ffffff');
            tooltipLine(`  Energy per capture     ${tile.component.directEUbyDesintegration} EU`, '#ffffff');
            tooltipLine(`  Heat per capture       ${(tile.component.directEUbyDesintegration / NuclearConstant.EU_PER_DEGREE).toFixed(2)} °C`, '#ffffff');
        }

    }

    this.hoverMaterials = function (event) {
        const tile = this.material.getTile(
            Math.floor(event.offsetX / 34),
            Math.floor(event.offsetY / 34)
        );
        if (tile != null) {
            this.tooltipCanvas.style.left = (event.offsetX + 20 + 720) + "px";
            this.tooltipCanvas.style.top = (event.offsetY - 20) + "px";
            this.tooltipCanvas.width = 350;
            this.tooltipCanvas.height = 400;
            if (tile.component instanceof NuclearFuel) {
                this.tooltipCanvas.height = 10 + 19 * 20;
            } else if (tile.component instanceof NuclearAbsorbable || tile.component instanceof FluidNuclearComponent) {
                this.tooltipCanvas.height = 10 + 12 * 20;
            } else {
                this.tooltipCanvas.height = 10 + 4 * 20;
            }

            this.tooltipCtx.font = "10pt Source Code Pro, Courier, monospace";
            this._drawTooltip = () => {
                materialTileInfo(tile);
            };
        } else {
            this.hoverOut();
        }
    }

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

const overlayColor = (tileData) => {
    let neutronRate = 0;

    switch (Game.overlay) {
    case Overlay.TEMPERATURE:
        return [Math.floor(299 * tileData.getTemperature() / NuclearConstant.MAX_TEMPERATURE), 30];
    case Overlay.EU_GENERATION:
        return [Math.floor(299 * Math.min(1.0, tileData.getMeanEuGeneration() / (2 * NuclearConstant.MAX_HATCH_EU_PRODUCTION))), 30];
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

const textWriter = function (ctx, offsetX = 0, offsetY = 0) {
    this.lineIndex = 0;
    this.call = function() {
        assert(arguments.length % 2 === 0);
        let length = 0;
        for (let i = 0; i < arguments.length; i += 2) {
            const [text, color] = [arguments[i], arguments[i + 1]];
            ctx.fillStyle = color;
            ctx.fillText(
                text,
                10 + length + offsetX,
                20 + this.lineIndex * 20 + offsetY,
            );
            length += ctx.measureText(text).width;
        }
        ++this.lineIndex;
    };
    return this.call.bind(this);
};

const UI = {};

UI.format = (x, suffix='') => {
  const lookup = [
    [ 1, ""],
    [ 1e3, "k"],
    [ 1e6, "M"],
    [ 1e9, "G"],
    [ 1e12, "T"],
    [ 1e15, "P"],
    [ 1e18, "E"],
  ];
  const [value, symbol] = lookup.findLast(([value]) => x >= value) || lookup[0];
  const v = x / value;
  const digits = 3 - Math.floor(Math.log10(Math.max(1, v)));
  return `${(v).toFixed(digits)}${symbol}${suffix}`;
};

Game._drawReactor = function (fluidFrame) {
    this.ctx.fillStyle = BOUNDARY;
    this.ctx.fillRect(0, 0, Game.reactorCanvas.width, Game.reactorCanvas.height);

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

            let material = this.material.tiles[tile];

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
                const tileData = Simulator.nuclearGrid.getNuclearTile(c, r);

                const [u, v] = overlayColor(tileData);
                this.ctx.drawImage(
                    this.colorbar,
                    u, v, 1, 1,
                    c * this.map.tsize,
                    r * this.map.tsize,
                    this.map.tsize,
                    this.map.tsize
                );

                if (tileData.component && tileData.getTemperature() > tileData.component.getMaxTemperature()) {
                    this.ctx.drawImage(
                        this.warning,
                        c * this.map.tsize,
                        r * this.map.tsize,
                        this.map.tsize,
                        this.map.tsize
                    );
                };
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

    const euProduction = Simulator.efficiencyHistory.getAverage(NuclearEfficiencyHistoryComponentType.euProduction);
    const euFuelConsumption = Simulator.efficiencyHistory.getAverage(NuclearEfficiencyHistoryComponentType.euFuelConsumption);

    const infoLine = new textWriter(this.ctx);
    infoLine(UI.format(euProduction, ' EU/t '), '#fcdb7c', 'produced for', '#ffffff');
    infoLine(UI.format(euFuelConsumption, ' EU/t '), '#fcdb7c', 'of fuel consumed', '#ffffff');
    infoLine(`Efficiency ${(100 * euProduction / euFuelConsumption).toFixed(1)} %`, '#fc5454');
};

Game._drawTooltip = function () {
};

Game._drawTileSelector = function (fluidFrame) {
    this.materials.clearRect(0, 0, Game.materialsCanvas.width, Game.materialsCanvas.height);

    this.material.tiles.forEach((material) => {
        const [x, y] = this.material.getPosition(material);
        switch (material.type) {
        case Blocks.HATCH:
            this.materials.fillStyle = HATCH;
            break;
        default:
            this.materials.fillStyle = CASING;
        }
        this.materials.fillRect(2 + x * 34, 2 + y * 34, 32, 32);

        if (material.image != null){
            let fluidAnimation = material.isFluid
                ? [0, 16 * fluidFrame, 16, 16]
                : []
            this.materials.drawImage(
                material.image,
                ...fluidAnimation,
                2 + x * 34,
                2 + y * 34,
                32,
                32
            );
        }
    });

    if (this.material.selected.tile != null) {
        this.materials.strokeStyle = '#f00';
        this.materials.beginPath();
        const x = this.material.selected.x;
        const y = this.material.selected.y;
        this.materials.moveTo(2 + x * 34 +  0, 2 + y * 34 +  0);
        this.materials.lineTo(2 + x * 34 + 32, 2 + y * 34 +  0);
        this.materials.lineTo(2 + x * 34 + 32, 2 + y * 34 + 32);
        this.materials.lineTo(2 + x * 34 +  0, 2 + y * 34 + 32);
        this.materials.lineTo(2 + x * 34 +  0, 2 + y * 34 +  0);
        this.materials.stroke();

        this.materials.fillStyle = '#fff4';
        this.materials.fillRect(2 + x * 34, 2 + y * 34, 32, 32);
    }
};

Game._drawReactorStatistics = function (fluidFrame) {
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

    const uraniumRodConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.uraniumRodConsumption);
    const leMoxRodConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.leMoxRodConsumption);
    const leUraniumRodConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.leUraniumRodConsumption);
    const heMoxRodConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.heMoxRodConsumption);
    const heUraniumRodConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.heUraniumRodConsumption);

    const invarPlateConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.invarPlateConsumption);
    const carbonPlateConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.carbonPlateConsumption);
    const controlRodConsumption = Simulator.productionHistory.getAverage(NuclearProductionHistoryComponentType.controlRodConsumption);

    this.statistics.clearRect(0, 0, this.statisticsCanvas.width, this.statisticsCanvas.height);

    const fluids = new textWriter(this.statistics);
    const addFluid = (prefix, value)  => {
        if (value > 0) {
            fluids(`${prefix}${UI.format(value, ' mb/t')}`, '#fff');
        }
    };

    const rods = new textWriter(this.statistics, this.statisticsCanvas.width / 2);
    const addRod = (prefix, value)  => {
        if (value !== 0) {
            let suffix = 't';
            [
                [20, 's'],
                [60, 'min'],
                [60, 'h'],
                [24, 'day'],
            ].forEach(([mul, suf]) => {
                if (Math.abs(value) < 1) {
                    value *= mul;
                    suffix = suf;
                }
            });
            rods(`${prefix}${value<0?'':' '}${value.toFixed(1)} / ${suffix}`, '#fff');
        }
    };

    fluids('INPUT', '#fcfc54');
    addFluid('  Water                ', waterConsumption);
    addFluid('  Heavy Water          ', heavyWaterConsumption);
    addFluid('  HP Water             ', highPressureWaterConsumption);
    addFluid('  HP Heavy Water       ', highPressureHeavyWaterConsumption);

    fluids('OUTPUT', '#fcfc54');
    addFluid('  Steam                ', steamProduction);
    addFluid('  Heavy Water Steam    ', heavyWaterSteamProduction);
    addFluid('  HP Water Steam       ', highPressureSteamProduction);
    addFluid('  HP Heavy Water Steam ', highPressureHeavyWaterSteamProduction);
    addFluid('  Deuterium            ', deuteriumProduction);
    addFluid('  Tritium              ', tritiumProduction);

    const isotopeNet = (fromUranium, fromLeMox, fromLeUranium, fromHeMox, fromHeUranium) => {
        return (
            uraniumRodConsumption * fromUranium +
            leMoxRodConsumption * fromLeMox +
            leUraniumRodConsumption * fromLeUranium +
            heMoxRodConsumption * fromHeMox +
            heUraniumRodConsumption * fromHeUranium
            ) / 9;
    }

    rods('ITEM DEPLETION', '#fcfc54');
    addRod('  Uranium Rod            ', uraniumRodConsumption);
    addRod('  LE Mox Rod             ', leMoxRodConsumption);
    addRod('  LE Uranium Rod         ', leUraniumRodConsumption);
    addRod('  HE Mox Rod             ', heMoxRodConsumption);
    addRod('  HE Uranium Rod         ', heUraniumRodConsumption);
    addRod('  Control Rod            ', controlRodConsumption);
    addRod('  Invar Plate            ', invarPlateConsumption);
    addRod('  Carbon Plate           ', carbonPlateConsumption);
    rods('ISOTOPE NET', '#fcfc54');
    addRod('  Uranium 235            ', isotopeNet(1, 0, -3, 0, -9));
    addRod('  Uranium 238            ', isotopeNet(53, -24, -24, -18, -18));
    addRod('  Plutonium              ', isotopeNet(27, 21, 24, 9, 18));
};

Game.render = function () {
    let fluidFrame = Math.floor(Date.now() / 200) % 32
    this._drawReactor(fluidFrame);
    this._drawTileSelector(fluidFrame);
    this._drawReactorStatistics(fluidFrame);
    this._drawTooltip();
};
