class NuclearComponentItem extends INuclearComponent {
  constructor(item, maxTemperature, heatConduction, neutronBehaviour) {
    super();
    this.variant = item;
    this.maxTemperature = maxTemperature;
    this.heatConduction = heatConduction;
    this.neutronBehaviour = neutronBehaviour;
  }

  getVariant() {
    return this.variant;
  }

  getMaxTemperature() {
    return this.maxTemperature;
  }

  getHeatConduction() {
    return this.heatConduction;
  }

  getNeutronBehaviour() {
    return this.neutronBehaviour;
  }
}

NuclearComponent.register(
  new NuclearComponentItem(
    Items.SMALL_HEAT_EXCHANGER,
    2500,
    15 * NuclearConstant.BASE_HEAT_CONDUCTION,
    INeutronBehaviour.NO_INTERACTION
  )
);

NuclearComponent.register(
  new NuclearComponentItem(
    Items.LARGE_HEAT_EXCHANGER,
    1800,
    30 * NuclearConstant.BASE_HEAT_CONDUCTION,
    INeutronBehaviour.NO_INTERACTION
  )
);
