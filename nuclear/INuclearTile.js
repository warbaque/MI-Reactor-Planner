class INuclearTile {
  constructor(component) {
    this.component = component;
  }

  getFuel = () => {
    if (this.component instanceof NuclearFuel) {
      return this.component;
    }
  };
  absorbNeutrons(neutronNumber, type) {
    throw Error("Not implemented!");
  }
  addNeutronsToFlux(neutronNumber, type) {
    throw Error("Not implemented!");
  }
  neutronGenerationTick(efficiencyHistory) {
    throw Error("Not implemented!");
  }
  nuclearTick(efficiencyHistory) {
    throw Error("Not implemented!");
  }
}

class NuclearHatch extends INuclearTile {
  constructor(component) {
    super(component);
    this.isFluid = component instanceof FluidNuclearComponent;

    this.nuclearReactorComponent = this.isFluid
      ? new SteamHeaterComponent(
          NuclearConstant.MAX_TEMPERATURE,
          NuclearConstant.MAX_HATCH_EU_PRODUCTION,
          NuclearConstant.EU_PER_DEGREE,
          true,
          true,
          false
        )
      : new TemperatureComponent(NuclearConstant.MAX_TEMPERATURE);
    this.neutronHistory = new NeutronHistoryComponent();
  }

  tick() {
    if (this.isFluid) {
      this.fluidNeutronProductTick(1, true);
    } else {
      if (this.component instanceof NuclearAbsorbable) {
        const abs = this.component;
        if (abs.getNeutronProduct() != null) {
          // console.log(abs.getNeutronProduct());
          // console.log(abs.getNeutronProductAmount());
        }
      }
    }
  }

  getTemperature() {
    return this.nuclearReactorComponent.getTemperature();
  }

  getHeatTransferCoeff() {
    return Math.max(NuclearConstant.BASE_HEAT_CONDUCTION + (this.component?.getHeatConduction() || 0), 0);
  }

  getMeanNeutronAbsorption(type) {
    return this.neutronHistory.getAverageReceived(type);
  }

  getMeanNeutronFlux(type) {
    return this.neutronHistory.getAverageFlux(type);
  }

  getMeanNeutronGeneration() {
    return this.neutronHistory.getAverageGeneration();
  }

  getMeanEuGeneration() {
    return this.neutronHistory.getAverageEuGeneration();
  }

  setTemperature(temp) {
    this.nuclearReactorComponent.setTemperature(temp);
  }

  putHeat(eu) {
    assert(eu >= 0);
    this.setTemperature(this.getTemperature() + eu / NuclearConstant.EU_PER_DEGREE);
    this.neutronHistory.addValue(NeutronHistoryComponentType.euGeneration, Math.floor(eu));
  }

  neutronGenerationTick(efficiencyHistory) {
    let meanNeutron = this.getMeanNeutronAbsorption(NeutronType.BOTH);
    let neutronsProduced = 0;

    if (this.isFluid) {
      return 0;
    }

    const itemVariant = this.component;

    if (itemVariant instanceof NuclearAbsorbable) {
      const abs = itemVariant;

      if (itemVariant instanceof NuclearFuel) {
        meanNeutron += NuclearConstant.BASE_NEUTRON;
      }

      if (abs instanceof NuclearFuel) {
        const fuel = abs;
        neutronsProduced = fuel.simulateDesintegration(
          meanNeutron,
          this.nuclearReactorComponent.getTemperature(),
          efficiencyHistory
        );
      } else {
        abs.simulateAbsorption(meanNeutron);
      }
    }

    this.neutronHistory.addValue(NeutronHistoryComponentType.neutronGeneration, neutronsProduced);
    return neutronsProduced;
  }

  fluidNeutronProductTick(neutron, simul) {
    if (this.isFluid) {
      const component = this.component;

      if (component == null) {
        return;
      }

      // Divide by 81 because the reactor was balanced back when the base fluid unit was 1/81000, but now it's 1/1000.
      // TODO NEO: maybe reconsider this?
      const fluidConsumption = (neutron * component.getNeutronProductProbability() * 1) / 81.0;
      let actualRecipe = randIntFromDouble(fluidConsumption);

      if (simul) {
        actualRecipe = neutron;
      }

      if (simul || actualRecipe > 0) {
        if (!simul) {
          Simulator.productionHistory.registerConsumption(component.getVariant(), actualRecipe);
          Simulator.productionHistory.registerProduction(
            component.getNeutronProduct(),
            actualRecipe * component.getNeutronProductAmount()
          );
        }
      }
    }
  }

  checkComponentMaxTemperature() {
    if (!this.isFluid) {
      const component = this.component;

      if (component != null) {
        if (component.getMaxTemperature() < this.getTemperature()) {
          //this.inventory.getItemStacks().get(0).empty();
        }
      }
    }
  }

  nuclearTick(efficiencyHistory) {
    this.neutronHistory.tick();
    this.fluidNeutronProductTick(randIntFromDouble(this.neutronHistory.getAverageReceived(NeutronType.BOTH)), false);

    if (this.isFluid) {
      const euProduced = this.nuclearReactorComponent.tick(this.component.getVariant());
      efficiencyHistory.registerEuProduction(euProduced);
    }

    this.checkComponentMaxTemperature();
  }

  absorbNeutrons(neutronNumber, type) {
    assert(type != NeutronType.BOTH);
    if (type === NeutronType.FAST) {
      this.neutronHistory.addValue(NeutronHistoryComponentType.fastNeutronReceived, neutronNumber);
    } else {
      this.neutronHistory.addValue(NeutronHistoryComponentType.thermalNeutronReceived, neutronNumber);
    }
  }

  addNeutronsToFlux(neutronNumber, type) {
    assert(type != NeutronType.BOTH);
    if (type === NeutronType.FAST) {
      this.neutronHistory.addValue(NeutronHistoryComponentType.fastNeutronFlux, neutronNumber);
    } else {
      this.neutronHistory.addValue(NeutronHistoryComponentType.thermalNeutronFlux, neutronNumber);
    }
  }
}
