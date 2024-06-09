const clampTemp = (temperature) => 25 * Math.floor(temperature / 25);

class NuclearFuelParams {
    constructor(desintegrationMax, maxTemperature, tempLimitLow, tempLimitHigh, neutronMultiplicationFactor, directEnergyFactor, size) {
        this.desintegrationMax = desintegrationMax;
        this.maxTemperature = maxTemperature;
        this.tempLimitLow = tempLimitLow;
        this.tempLimitHigh = tempLimitHigh;
        this.neutronMultiplicationFactor = neutronMultiplicationFactor;
        this.directEnergyFactor = directEnergyFactor;
        this.size = size;
    }
}

class NuclearFuel extends NuclearAbsorbable {

    constructor(item, desintegrationMax, maxTemperature, tempLimitLow, tempLimitHigh, neutronMultiplicationFactor, directEnergyFactor, neutronBehaviour, size, depletedVersionId) {
        super(item, clampTemp(maxTemperature), 0.8 * NuclearConstant.BASE_HEAT_CONDUCTION, neutronBehaviour, desintegrationMax);

        this.size = size;
        this.directEnergyFactor = directEnergyFactor;
        this.neutronMultiplicationFactor = neutronMultiplicationFactor;
        this.depletedVersionId = depletedVersionId;

        this.tempLimitLow = clampTemp(tempLimitLow);
        this.tempLimitHigh = clampTemp(tempLimitHigh);

        this.directEUbyDesintegration = Math.floor(NuclearConstant.EU_FOR_FAST_NEUTRON * directEnergyFactor * neutronMultiplicationFactor);
        this.totalEUbyDesintegration = Math.floor(NuclearConstant.EU_FOR_FAST_NEUTRON * (1.0 + directEnergyFactor) * neutronMultiplicationFactor);
    }

    static of(item, params, neutronBehaviour, depletedVersionId) {
        return new NuclearFuel(
            item,
            params.desintegrationMax,
            params.maxTemperature,
            params.tempLimitLow,
            params.tempLimitHigh,
            params.neutronMultiplicationFactor,
            params.directEnergyFactor,
            neutronBehaviour,
            params.size,
            depletedVersionId
        );
    }

    getNeutronProduct() {
        return this.depletedVersionId;
    }

    getNeutronProductAmount() {
        return this.size;
    }

    efficiencyFactor(temperature) {
        let factor = 1;
        if (temperature > this.tempLimitLow) {
            factor = Math.max(0, 1 - (temperature - this.tempLimitLow) / (this.tempLimitHigh - this.tempLimitLow));
        }
        return factor;
    }

    simulateDesintegration(neutronsReceived, temperature, efficiencyHistory) {
        const absorption = this.simulateAbsorption(neutronsReceived);
        const fuelEuConsumed = absorption * this.totalEUbyDesintegration;
        efficiencyHistory.registerEuFuelConsumption(fuelEuConsumed);
        return randIntFromDouble(this.efficiencyFactor(temperature) * absorption * this.neutronMultiplicationFactor);
    }
}

Object.values(FuelType).forEach((type) => {
    const params = FuelIsotopes[type.isotope];
    const fuelParams = new NuclearFuelParams(
        NuclearConstant.DESINTEGRATION_BY_ROD * type.size,
        params.maxTemp,
        params.tempLimitLow,
        params.tempLimitHigh,
        params.neutronsMultiplication,
        params.directEnergyFactor,
        type.size
    );
    const neutronBehaviour = INeutronBehaviour.ofParams(NuclearConstant.ScatteringType.HEAVY, params, type.size)

    NuclearComponent.register(NuclearFuel.of(
        type.key,
        fuelParams,
        neutronBehaviour,
        type.depleted
    ));
});
