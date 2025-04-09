class IsotopeFuelParams extends IsotopeParams {
  constructor(
    thermalAbsorbProba,
    thermalScatterings,
    maxTemp,
    tempLimitLow,
    tempLimitHigh,
    neutronsMultiplication,
    directEnergyFactor
  ) {
    super(
      thermalAbsorbProba,
      INeutronBehaviour.reduceCrossProba(thermalAbsorbProba, 0.1),
      thermalScatterings,
      INeutronBehaviour.reduceCrossProba(thermalScatterings, 0.5)
    );
    this.maxTemp = maxTemp;
    this.neutronsMultiplication = neutronsMultiplication;
    this.directEnergyFactor = directEnergyFactor;
    this.tempLimitLow = tempLimitLow;
    this.tempLimitHigh = tempLimitHigh;
  }

  static mix(a, b, factor) {
    factor = 1 - factor;
    const mix = (a, b, r) => r * a + (1 - r) * b;

    const newThermalAbsorptionProba = INeutronBehaviour.probaFromCrossSection(
      mix(a.thermalAbsorption, b.thermalAbsorption, factor)
    );
    const newScatteringProba = INeutronBehaviour.probaFromCrossSection(
      mix(a.thermalScattering, b.thermalScattering, factor)
    );
    const newNeutronMultiplicationFactor = mix(a.neutronsMultiplication, b.neutronsMultiplication, factor);

    const totalEnergy = mix(
      a.neutronsMultiplication * (1 + a.directEnergyFactor),
      b.neutronsMultiplication * (1 + b.directEnergyFactor),
      factor
    );

    const newMaxTemp = Math.floor(mix(a.maxTemp, b.maxTemp, factor));
    const newTempLimitLow = Math.floor(mix(a.tempLimitLow, b.tempLimitLow, factor));
    const newTempLimitHigh = Math.floor(mix(a.tempLimitHigh, b.tempLimitHigh, factor));

    const newDirectEnergyFactor = totalEnergy / newNeutronMultiplicationFactor - 1;

    return new IsotopeFuelParams(
      newThermalAbsorptionProba,
      newScatteringProba,
      newMaxTemp,
      newTempLimitLow,
      newTempLimitHigh,
      newNeutronMultiplicationFactor,
      newDirectEnergyFactor
    );
  }
}

const Isotopes = Object.freeze({
  URANIUM_235: new IsotopeFuelParams(0.6, 0.35, 2400, 900, 2300, 8, 0.5),
  URANIUM_238: new IsotopeFuelParams(0.6, 0.3, 3200, 1000, 3000, 6, 0.3),
  PLUTONIUM: new IsotopeFuelParams(0.9, 0.25, 2100, 600, 2000, 9, 0.25),
});

const FuelIsotopes = Object.freeze({
  URANIUM: IsotopeFuelParams.mix(Isotopes.URANIUM_238, Isotopes.URANIUM_235, 1.0 / 81),
  LE_URANIUM: IsotopeFuelParams.mix(Isotopes.URANIUM_238, Isotopes.URANIUM_235, 1.0 / 9),
  HE_URANIUM: IsotopeFuelParams.mix(Isotopes.URANIUM_238, Isotopes.URANIUM_235, 1.0 / 3),
  LE_MOX: IsotopeFuelParams.mix(Isotopes.URANIUM_238, Isotopes.PLUTONIUM, 1.0 / 9),
  HE_MOX: IsotopeFuelParams.mix(Isotopes.URANIUM_238, Isotopes.PLUTONIUM, 1.0 / 3),
});
