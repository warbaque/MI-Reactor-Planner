class IntegerHistoryComponent {

    constructor(keys, tickHistorySize) {
        this.keys = keys;
        this.tickHistorySize = tickHistorySize;

        this.histories = {}
        this.updatingValues = new Array(keys.length).fill(0);
        this.averages = new Array(keys.length).fill(0);

        keys.forEach((key) => {
            this.histories[key] = new Array(tickHistorySize).fill(0);
        });
    }

    getAverage(key) {
        const ret = this.averages[key];
        // Round to zero if very small - negative values might lead to problems.
        return Math.abs(ret) < 1e-9 ? 0 : ret;
    }

    /*
    public void clear() {
        for (var array : histories.values()) {
            Arrays.fill(array, 0);
        }
        Arrays.fill(updatingValues, 0);
        Arrays.fill(averages, 0);
    }
    */

    tick() {
        this.keys.forEach((key, i) => {
            const valuesArray = this.histories[key];
            this.averages[i] += (this.updatingValues[i] - valuesArray[this.tickHistorySize - 1]) / this.tickHistorySize;
            this.histories[key] = [this.updatingValues[i], ...valuesArray.slice(0, -1)];
            this.updatingValues[i] = 0;
        });
    }

    addValue(key, delta) {
        this.updatingValues[key] += delta;
    }
}


const NeutronHistoryComponentType = Object.freeze({
    fastNeutronReceived: 0,
    fastNeutronFlux: 1,
    thermalNeutronReceived: 2,
    thermalNeutronFlux: 3,
    neutronGeneration: 4,
    euGeneration: 5,
})

class NeutronHistoryComponent extends IntegerHistoryComponent {
    constructor() {
        super(Object.keys(NeutronHistoryComponentType), 100);
    }

    getAverageReceived(type) {
        switch(type) {
        case NeutronType.FAST:
            return this.getAverage(NeutronHistoryComponentType.fastNeutronReceived);
        case NeutronType.THERMAL:
            return this.getAverage(NeutronHistoryComponentType.thermalNeutronReceived);
        case NeutronType.BOTH:
            return this.getAverageReceived(NeutronType.FAST) + this.getAverageReceived(NeutronType.THERMAL);
        default:
            return 0;
        }
    }

    getAverageFlux(type) {
        switch(type) {
        case NeutronType.FAST:
            return this.getAverage(NeutronHistoryComponentType.fastNeutronFlux);
        case NeutronType.THERMAL:
            return this.getAverage(NeutronHistoryComponentType.thermalNeutronFlux);
        case NeutronType.BOTH:
            return this.getAverageFlux(NeutronType.FAST) + this.getAverageFlux(NeutronType.THERMAL);
        default:
            return 0;
        }
    }

    getAverageGeneration() {
        return this.getAverage(NeutronHistoryComponentType.neutronGeneration);
    }

    getAverageEuGeneration() {
        return this.getAverage(NeutronHistoryComponentType.euGeneration);
    }

}

const NuclearEfficiencyHistoryComponentType = Object.freeze({
    euProduction: 0,
    euFuelConsumption: 1,
})

class NuclearEfficiencyHistoryComponent extends IntegerHistoryComponent {
    constructor() {
        super(Object.keys(NuclearEfficiencyHistoryComponentType), 300);
    }

    registerEuFuelConsumption(eu) {
        this.addValue(NuclearEfficiencyHistoryComponentType.euFuelConsumption, eu);
    }

    registerEuProduction(eu) {
        this.addValue(NuclearEfficiencyHistoryComponentType.euProduction, eu);
    }
}

const NuclearProductionHistoryComponentType = Object.freeze({
    waterConsumption: 0,
    heavyWaterConsumption: 1,
    highPressureWaterConsumption: 2,
    highPressureHeavyWaterConsumption: 3,
    steamProduction: 4,
    heavyWaterSteamProduction: 5,
    highPressureSteamProduction: 6,
    highPressureHeavyWaterSteamProduction: 7,
    deuteriumProduction: 8,
    tritiumProduction: 9,
})

class NuclearProductionHistoryComponent extends IntegerHistoryComponent {
    constructor() {
        super(Object.keys(NuclearProductionHistoryComponentType), 300);
    }

    registerConsumption(type, mb) {
        switch(type) {
        case Fluids.WATER:
            this.addValue(NuclearProductionHistoryComponentType.waterConsumption, mb);
            break;
        case Fluids.HEAVY_WATER:
            this.addValue(NuclearProductionHistoryComponentType.heavyWaterConsumption, mb);
            break;
        case Fluids.HIGH_PRESSURE_WATER:
            this.addValue(NuclearProductionHistoryComponentType.highPressureWaterConsumption, mb);
            break;
        case Fluids.HIGH_PRESSURE_HEAVY_WATER:
            this.addValue(NuclearProductionHistoryComponentType.highPressureHeavyWaterConsumption, mb);
            break;
        }
    }

    registerProduction(type, mb) {
        switch(type) {
        case Fluids.STEAM:
            this.addValue(NuclearProductionHistoryComponentType.steamProduction, mb);
            break;
        case Fluids.HEAVY_WATER_STEAM:
            this.addValue(NuclearProductionHistoryComponentType.heavyWaterSteamProduction, mb);
            break;
        case Fluids.HIGH_PRESSURE_STEAM:
            this.addValue(NuclearProductionHistoryComponentType.highPressureSteamProduction, mb);
            break;
        case Fluids.HIGH_PRESSURE_HEAVY_WATER_STEAM:
            this.addValue(NuclearProductionHistoryComponentType.highPressureHeavyWaterSteamProduction, mb);
            break;
        case Fluids.DEUTERIUM:
            this.addValue(NuclearProductionHistoryComponentType.deuteriumProduction, mb);
            break;
        case Fluids.TRITIUM:
            this.addValue(NuclearProductionHistoryComponentType.tritiumProduction, mb);
            break;
        }
    }
}
