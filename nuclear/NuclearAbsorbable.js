class NuclearAbsorbable extends NuclearComponentItem {
  constructor(item, maxTemperature, heatConduction, neutronBehaviour, desintegrationMax) {
    super(item, maxTemperature, heatConduction, neutronBehaviour);
    this.desintegrationMax = desintegrationMax;
    this.size = 1;
  }

  simulateAbsorption(neutronsReceived) {
    const absorption = randIntFromDouble(neutronsReceived);
    Simulator.productionHistory.registerConsumption(
      this.getVariant(),
      (this.size * absorption) / this.desintegrationMax
    );
    return absorption;
  }
}

NuclearComponent.register(
  new NuclearAbsorbable(
    Items.INVAR_PLATE,
    3200,
    -0.9 * NuclearConstant.BASE_HEAT_CONDUCTION,
    INeutronBehaviour.ofParams(NuclearConstant.ScatteringType.MEDIUM, NuclearConstant.INVAR, 2),
    NuclearConstant.DESINTEGRATION_BY_ROD * 2
  )
);

NuclearComponent.register(
  new NuclearAbsorbable(
    Items.CARBON_PLATE,
    2500,
    2 * NuclearConstant.BASE_HEAT_CONDUCTION,
    INeutronBehaviour.ofParams(NuclearConstant.ScatteringType.MEDIUM, NuclearConstant.CARBON, 2),
    NuclearConstant.DESINTEGRATION_BY_ROD * 2
  )
);

NuclearComponent.register(
  new NuclearAbsorbable(
    Items.CONTROL_ROD,
    1900,
    0.5 * NuclearConstant.BASE_HEAT_CONDUCTION,
    INeutronBehaviour.ofParams(NuclearConstant.ScatteringType.HEAVY, NuclearConstant.CADMIUM, 1),
    NuclearConstant.DESINTEGRATION_BY_ROD
  )
);
