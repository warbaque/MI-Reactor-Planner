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

const NuclearProductionHistoryComponentType = Object.freeze(Object.fromEntries([
    'waterConsumption',
    'heavyWaterConsumption',
    'highPressureWaterConsumption',
    'highPressureHeavyWaterConsumption',
    'steamProduction',
    'heavyWaterSteamProduction',
    'highPressureSteamProduction',
    'highPressureHeavyWaterSteamProduction',
    'deuteriumProduction',
    'tritiumProduction',
    'uraniumRodConsumption',
    'leMoxRodConsumption',
    'leUraniumRodConsumption',
    'heMoxRodConsumption',
    'heUraniumRodConsumption',
    'invarPlateConsumption',
    'carbonPlateConsumption',
    'controlRodConsumption',
].map((type, i) => [type, i])));

class NuclearProductionHistoryComponent extends IntegerHistoryComponent {
    constructor() {
        super(Object.keys(NuclearProductionHistoryComponentType), 20 * 60);
    }

    registerConsumption(type, amount) {
        const historyComponent = (() => {
            switch(type) {
                case Fluids.WATER: return NuclearProductionHistoryComponentType.waterConsumption;
                case Fluids.HEAVY_WATER: return NuclearProductionHistoryComponentType.heavyWaterConsumption;
                case Fluids.HIGH_PRESSURE_WATER: return NuclearProductionHistoryComponentType.highPressureWaterConsumption;
                case Fluids.HIGH_PRESSURE_HEAVY_WATER: return NuclearProductionHistoryComponentType.highPressureHeavyWaterConsumption;
                case Fuels.URANIUM_1:
                case Fuels.URANIUM_2:
                case Fuels.URANIUM_4: return NuclearProductionHistoryComponentType.uraniumRodConsumption;
                case Fuels.LE_MOX_1:
                case Fuels.LE_MOX_2:
                case Fuels.LE_MOX_4: return NuclearProductionHistoryComponentType.leMoxRodConsumption;
                case Fuels.LE_URANIUM_1:
                case Fuels.LE_URANIUM_2:
                case Fuels.LE_URANIUM_4: return NuclearProductionHistoryComponentType.leUraniumRodConsumption;
                case Fuels.HE_MOX_1:
                case Fuels.HE_MOX_2:
                case Fuels.HE_MOX_4: return NuclearProductionHistoryComponentType.heMoxRodConsumption;
                case Fuels.HE_URANIUM_1:
                case Fuels.HE_URANIUM_2:
                case Fuels.HE_URANIUM_4: return NuclearProductionHistoryComponentType.heUraniumRodConsumption;
                case Items.INVAR_PLATE: return NuclearProductionHistoryComponentType.invarPlateConsumption;
                case Items.CARBON_PLATE: return NuclearProductionHistoryComponentType.carbonPlateConsumption;
                case Items.CONTROL_ROD: return NuclearProductionHistoryComponentType.controlRodConsumption;
            }
        })();

        this.addValue(historyComponent, amount);
    }

    registerProduction(type, amount) {
        const historyComponent = (() => {
            switch(type) {
                case Fluids.STEAM: return NuclearProductionHistoryComponentType.steamProduction;
                case Fluids.HEAVY_WATER_STEAM: return NuclearProductionHistoryComponentType.heavyWaterSteamProduction;
                case Fluids.HIGH_PRESSURE_STEAM: return NuclearProductionHistoryComponentType.highPressureSteamProduction;
                case Fluids.HIGH_PRESSURE_HEAVY_WATER_STEAM: return NuclearProductionHistoryComponentType.highPressureHeavyWaterSteamProduction;
                case Fluids.DEUTERIUM: return NuclearProductionHistoryComponentType.deuteriumProduction;
                case Fluids.TRITIUM: return NuclearProductionHistoryComponentType.tritiumProduction;
            }
        })();

        this.addValue(historyComponent, amount);
    }
}
