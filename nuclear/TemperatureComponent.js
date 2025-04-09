class TemperatureComponent {
  constructor(temperatureMax) {
    this.temperature = 0;
    this.temperatureMax = temperatureMax;
  }

  setTemperature(temp) {
    assert(temp >= 0);
    this.temperature = Math.min(Math.max(temp, 0), this.temperatureMax);
  }

  increaseTemperature(temp) {
    this.setTemperature(this.getTemperature() + temp);
  }

  decreaseTemperature(temp) {
    this.setTemperature(this.getTemperature() - temp);
  }

  getTemperature() {
    return this.temperature;
  }
}

class SteamHeaterComponent extends TemperatureComponent {
  static STEAM_TO_WATER = 16;
  static INPUT_ENERGY_RATIO_FOR_STARTUP = 0.8;

  constructor(
    temperatureMax,
    maxEuProduction,
    euPerDegree,
    acceptLowPressure,
    acceptHighPressure,
    requiresContinuousOperation
  ) {
    super(temperatureMax);
    this.maxEuProduction = maxEuProduction;
    this.euPerDegree = euPerDegree;
    this.acceptLowPressure = acceptLowPressure;
    this.acceptHighPressure = acceptHighPressure;
    this.requiresContinuousOperation = requiresContinuousOperation;
  }

  tick(fluidInputs) {
    let totalEuProduced = 0;
    switch (fluidInputs) {
      case Fluids.WATER:
        totalEuProduced = this.tryMakeSteam(Fluids.WATER, Fluids.STEAM, 1);
        break;
      case Fluids.HEAVY_WATER:
        totalEuProduced = this.tryMakeSteam(Fluids.HEAVY_WATER, Fluids.HEAVY_WATER_STEAM, 1);
        break;
      case Fluids.HIGH_PRESSURE_WATER:
        totalEuProduced = this.tryMakeSteam(Fluids.HIGH_PRESSURE_WATER, Fluids.HIGH_PRESSURE_STEAM, 8);
        break;
      case Fluids.HIGH_PRESSURE_HEAVY_WATER:
        totalEuProduced = this.tryMakeSteam(
          Fluids.HIGH_PRESSURE_HEAVY_WATER,
          Fluids.HIGH_PRESSURE_HEAVY_WATER_STEAM,
          8
        );
        break;
    }

    if (this.requiresContinuousOperation) {
      this.decreaseTemperature(
        (INPUT_ENERGY_RATIO_FOR_STARTUP * (this.maxEuProduction - totalEuProduced)) / this.euPerDegree
      );
    }

    return totalEuProduced;

    /*
    let euProducedLowPressure = 0;
    if (this.acceptLowPressure) {
        euProducedLowPressure = this.tryMakeSteam(Fluids.WATER, Fluids.STEAM, 1);
        if (euProducedLowPressure == 0) {
            euProducedLowPressure = this.tryMakeSteam(Fluids.HEAVY_WATER, Fluids.HEAVY_WATER_STEAM, 1);
        }
    }

    let euProducedHighPressure = 0;
    if (this.acceptHighPressure) {
        euProducedHighPressure = this.tryMakeSteam(Fluids.HIGH_PRESSURE_WATER, Fluids.HIGH_PRESSURE_STEAM, 8);
        if (euProducedHighPressure == 0) {
            euProducedHighPressure = this.tryMakeSteam(Fluids.HIGH_PRESSURE_HEAVY_WATER, Fluids.HIGH_PRESSURE_HEAVY_WATER_STEAM, 8);
        }
    }

    const totalEuProduced = euProducedLowPressure + euProducedHighPressure;

    if (this.requiresContinuousOperation) {
        this.decreaseTemperature(INPUT_ENERGY_RATIO_FOR_STARTUP * (this.maxEuProduction - totalEuProduced) / this.euPerDegree);
    }
    */

    return totalEuProduced;
  }

  tryMakeSteam(water, steam, euPerSteamMb) {
    if (!Simulator.steamOutput) {
      return 0;
    }

    if (this.getTemperature() > 100) {
      const steamProduction =
        (((this.getTemperature() - 100) / (this.temperatureMax - 100)) * this.maxEuProduction) / euPerSteamMb;
      if (steamProduction > 0) {
        const waterToUse = Math.ceil(steamProduction / SteamHeaterComponent.STEAM_TO_WATER);

        Simulator.productionHistory.registerProduction(steam, steamProduction);
        //Simulator.productionHistory.registerConsumption(water, waterToUse);

        const euProduced = steamProduction * euPerSteamMb;
        this.decreaseTemperature(euProduced / this.euPerDegree);
        return euProduced;
      }
    }
    return 0;
  }
}
