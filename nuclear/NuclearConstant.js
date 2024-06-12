const ScatteringType = (fastFraction) => {
    return Object.freeze({
        fastFraction: fastFraction,
        slowFraction: 1 - fastFraction,
    });
}

class IsotopeParams {
    constructor(thermalAbsorbProba, fastAbsorptionProba, thermalScatteringProba, fastScatteringProba) {
        this.thermalAbsorption = INeutronBehaviour.crossSectionFromProba(thermalAbsorbProba);
        this.fastAbsorption = INeutronBehaviour.crossSectionFromProba(fastAbsorptionProba);
        this.thermalScattering = INeutronBehaviour.crossSectionFromProba(thermalScatteringProba);
        this.fastScattering = INeutronBehaviour.crossSectionFromProba(fastScatteringProba);
    }
}

const NuclearConstant = Object.freeze({
    EU_FOR_FAST_NEUTRON: 8,
    DESINTEGRATION_BY_ROD: 10240000,
    BASE_HEAT_CONDUCTION: 0.01,
    BASE_NEUTRON: 0.1,
    MAX_TEMPERATURE: 3250,
    EU_PER_DEGREE: 64,
    MAX_HATCH_EU_PRODUCTION: 8192,

    ScatteringType: Object.freeze({
        ULTRA_LIGHT: ScatteringType(0.05),
        LIGHT: ScatteringType(0.2),
        MEDIUM: ScatteringType(0.5),
        HEAVY: ScatteringType(0.85),
    }),

    HYDROGEN: new IsotopeParams(0.1, 0.05, 0.25, 0.75),
    DEUTERIUM: new IsotopeParams(0.02, 0.01, 0.15, 0.65),
    CADMIUM: new IsotopeParams(0.95, 0.9, 0.05, 0.1),
    CARBON: new IsotopeParams(0.01, 0.005, 0.5, 0.85),
    INVAR: new IsotopeParams(0.002, 0.001, 0.2, 0.5),
});

const NeutronFate = Object.freeze({
    ESCAPE: Symbol('ESCAPE'),
    ABSORBED_IN_FUEL: Symbol('ABSORBED_IN_FUEL'),
    ABSORBED_NOT_IN_FUEL: Symbol('ABSORBED_NOT_IN_FUEL'),
});

const NeutronInteraction = Object.freeze({
    SCATTERING: Symbol('SCATTERING'),
    ABSORPTION: Symbol('ABSORPTION'),
});

const NeutronType = Object.freeze({
    FAST: 0,
    THERMAL: 1,
    BOTH: 2,
});

const Items = Object.freeze({
    INVAR: Symbol('INVAR'),
    CARBON: Symbol('CARBON'),
    SMALL_HEAT_EXCHANGER: Symbol('SMALL_HEAT_EXCHANGER'),
    LARGE_HEAT_EXCHANGER: Symbol('LARGE_HEAT_EXCHANGER'),
});

const Fluids = Object.freeze({
    WATER: Symbol('WATER'),
    HEAVY_WATER: Symbol('HEAVY_WATER'),
    HIGH_PRESSURE_WATER: Symbol('HIGH_PRESSURE_WATER'),
    HIGH_PRESSURE_HEAVY_WATER: Symbol('HIGH_PRESSURE_HEAVY_WATER'),
    STEAM: Symbol('STEAM'),
    HEAVY_WATER_STEAM: Symbol('HEAVY_WATER_STEAM'),
    HIGH_PRESSURE_STEAM: Symbol('HIGH_PRESSURE_STEAM'),
    HIGH_PRESSURE_HEAVY_WATER_STEAM: Symbol('HIGH_PRESSURE_HEAVY_WATER_STEAM'),
    DEUTERIUM: Symbol('DEUTERIUM'),
    TRITIUM: Symbol('TRITIUM'),
});

const FuelConstants = () => {
    const out1 = {}
    const out2 = {}
    const rod = (key, isotope, size) => {
        out1[key] = Object.freeze({key: Symbol(key), isotope: isotope, size: size, depleted: isotope +'_DEPLETED'});
        out2[key] = out1[key].key;
    }
    ['URANIUM', 'LE_MOX', 'LE_URANIUM'].forEach((type) => {
        rod(type + '_1', type, 1);
        rod(type + '_2', type, 2);
        rod(type + '_4', type, 4);
    })
    return [Object.freeze(out1), Object.freeze(out2)];
}

const [FuelType, Fuels] = FuelConstants();
