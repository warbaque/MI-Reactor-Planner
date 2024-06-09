class NuclearGridHelper {

    static dX = [1, 0, -1, 0];
    static dY = [0, 1, 0, -1];
    static MAX_SPLIT = 30;

    static simulate(grid, efficiencyHistory) {

        const sizeX = grid.sizeX;
        const sizeY = grid.sizeY;
        let hasFuel = false;

        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {

                const x = i;
                const y = j;

                const tile = grid.getNuclearTile(i, j);
                if (tile == null) {
                    continue;
                }

                const maybeFuel = tile.getFuel();
                const neutronNumberPrime = tile.neutronGenerationTick(efficiencyHistory);
                if (neutronNumberPrime == 0) {
                    continue;
                }

                hasFuel = true;
                const fuel = maybeFuel;
                if (fuel == null) {
                    throw Error("Neutron generated without fuel");
                }

                tile.putHeat(neutronNumberPrime * fuel.directEUbyDesintegration / fuel.neutronMultiplicationFactor);

                const split = Math.min(neutronNumberPrime, NuclearGridHelper.MAX_SPLIT);
                const neutronNumberPerSplit = neutronNumberPrime / split;

                for (let k = 0; k < split + 1; k++) {
                    const neutronNumber = (k < split) ? neutronNumberPerSplit : neutronNumberPrime % split;

                    if (neutronNumber > 0) {
                        let type = NeutronType.FAST;
                        grid.registerNeutronCreation(neutronNumber, type);

                        let dir = Math.floor(Math.random() * 4);
                        let posX = x;
                        let posY = y;

                        while (true) {
                            const secondTile = grid.getNuclearTile(posX, posY);

                            if (secondTile == null) {
                                grid.registerNeutronFate(neutronNumber, type, NeutronFate.ESCAPE);
                                break;
                            }

                            secondTile.addNeutronsToFlux(neutronNumber, type);

                            const component = secondTile.component;
                            if (component != null) {
                                const interactionProba = component.getNeutronBehaviour().interactionTotalProbability(type);

                                if (Math.random() < interactionProba) {

                                    const interactionSelector = Math.random();

                                    const probaAbsorption = component.getNeutronBehaviour().interactionRelativeProbability(type, NeutronInteraction.ABSORPTION);

                                    if (interactionSelector <= probaAbsorption) {
                                        secondTile.absorbNeutrons(neutronNumber, type);

                                        if (type == NeutronType.FAST) {
                                            secondTile.putHeat(neutronNumber * NuclearConstant.EU_FOR_FAST_NEUTRON);
                                        }

                                        if (secondTile.getFuel() != null) {
                                            grid.registerNeutronFate(neutronNumber, type, NeutronFate.ABSORBED_IN_FUEL);
                                        } else {
                                            grid.registerNeutronFate(neutronNumber, type, NeutronFate.ABSORBED_NOT_IN_FUEL);
                                        }

                                        break;
                                    } else {
                                        dir = Math.floor(Math.random() * 4);

                                        if (type == NeutronType.FAST && Math.random() < component.getNeutronBehaviour().neutronSlowingProbability()) {
                                            type = NeutronType.THERMAL;
                                            secondTile.putHeat(neutronNumber * NuclearConstant.EU_FOR_FAST_NEUTRON);
                                        }
                                    }
                                }
                            }

                            posX += NuclearGridHelper.dX[dir];
                            posY += NuclearGridHelper.dY[dir];
                        }
                    }
                }
            }
        }

        // HEAT

        // Cache heat transfer coefficients
        const heatTransferCoeff = new Array(sizeX * sizeY).fill(0.0);
        for (let i = 0; i < sizeX; ++i) {
            for (let j = 0; j < sizeY; ++j) {
                const tile = grid.getNuclearTile(i, j);
                if (tile != null) {
                    heatTransferCoeff[i + j * sizeX] = tile.getHeatTransferCoeff();
                }
            }
        }

        const NUMERICAL_SUBSTEP = 10;

        for (let substep = 0; substep < NUMERICAL_SUBSTEP; substep++) {
            const temperatureOut = new Array(sizeX * sizeY).fill(0.0);
            const temperatureDelta = new Array(sizeX * sizeY).fill(0.0);

            for (let step = 0; step < 3; step++) {
                // step 0: compute temperatureOut = dT * coeff
                // step 1: compute temperatureDelta, clamping as necessary
                // step 2: set temperature
                for (let i = 0; i < sizeX; i++) {
                    for (let j = 0; j < sizeY; j++) {
                        const tile = grid.getNuclearTile(i, j);
                        if (tile == null) {
                            continue;
                        }

                        const temperatureA = tile.getTemperature();
                        if (step == 2) {
                            tile.setTemperature(temperatureA + temperatureDelta[i + j * sizeX]);
                        } else {
                            const coeffA = heatTransferCoeff[i + j * sizeX];

                            if (step == 1) {
                                // clamp to avoid reaching < 0 temperatures
                                temperatureDelta[i + j * sizeX] -= Math.min(temperatureA, temperatureOut[i + j * sizeX]);
                            }
                            for (let k = 0; k < 4; k++) {
                                const i2 = i + NuclearGridHelper.dX[k];
                                const j2 = j + NuclearGridHelper.dY[k];

                                const secondTile = grid.getNuclearTile(i2, j2);

                                if (secondTile != null) {
                                    const temperatureB = secondTile.getTemperature();
                                    const coeffB = heatTransferCoeff[i2 + j2 * sizeX];
                                    const coeffTransfer = 0.5 * (coeffA + coeffB) / NUMERICAL_SUBSTEP;
                                    if (temperatureA > temperatureB) {
                                        if (step == 0) {
                                            temperatureOut[i + j * sizeX] += (temperatureA - temperatureB) * coeffTransfer;
                                        } else {
                                            const frac = Math.min(1, temperatureA / temperatureOut[i + j * sizeX]);
                                            temperatureDelta[i2 + j2 * sizeX] += frac * (temperatureA - temperatureB) * coeffTransfer;
                                        }
                                    }
                                } else {
                                    const temperatureB = 0;
                                    const coeffTransfer = 0.5 * coeffA / NUMERICAL_SUBSTEP;
                                    if (step == 0) {
                                        temperatureOut[i + j * sizeX] += (temperatureA - temperatureB) * coeffTransfer;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < sizeX; i++) {
            for (let j = 0; j < sizeY; j++) {
                const maybeTile = grid.getNuclearTile(i, j);

                if (maybeTile != null) {
                    maybeTile.nuclearTick(efficiencyHistory);
                }
            }
        }

        return hasFuel;
    }
}
