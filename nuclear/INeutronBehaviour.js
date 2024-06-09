class INeutronBehaviour {

    static of(scatteringType, thermalNeutronAbsorptionBarn, fastNeutronAbsorptionBarn, thermalNeutronScatteringBarn, fastNeutronScatteringBarn, size) {
        const thermalProbability = INeutronBehaviour.probaFromCrossSection((thermalNeutronAbsorptionBarn + thermalNeutronScatteringBarn) * Math.sqrt(size));
        const fastProbability = INeutronBehaviour.probaFromCrossSection((fastNeutronAbsorptionBarn + fastNeutronScatteringBarn) * Math.sqrt(size));

        assert(thermalProbability > 0 && thermalProbability <= 1)
        assert(fastProbability > 0 && fastProbability <= 1)

        return Object.freeze({
            neutronSlowingProbability: () => scatteringType.slowFraction,

            interactionTotalProbability: (type) => {
                assert(type != NeutronType.BOTH);
                if (type == NeutronType.FAST) {
                    return fastProbability;
                } else if (type == NeutronType.THERMAL) {
                    return thermalProbability;
                }
                return 0;
            },

            interactionRelativeProbability: (type, interaction) => {
                assert(type != NeutronType.BOTH);
                if (type == NeutronType.THERMAL) {
                    if (interaction == NeutronInteraction.SCATTERING) {
                        return thermalNeutronScatteringBarn / (thermalNeutronAbsorptionBarn + thermalNeutronScatteringBarn);
                    } else if (interaction == NeutronInteraction.ABSORPTION) {
                        return thermalNeutronAbsorptionBarn / (thermalNeutronAbsorptionBarn + thermalNeutronScatteringBarn);
                    }
                } else if (type == NeutronType.FAST) {
                    if (interaction == NeutronInteraction.SCATTERING) {
                        return fastNeutronScatteringBarn / (fastNeutronAbsorptionBarn + fastNeutronScatteringBarn);
                    } else if (interaction == NeutronInteraction.ABSORPTION) {
                        return fastNeutronAbsorptionBarn / (fastNeutronAbsorptionBarn + fastNeutronScatteringBarn);
                    }
                }
                return 0;
            }
        });
    }

    static crossSectionFromProba = (proba) => -Math.log(1 - proba);
    static probaFromCrossSection = (crossSection) => 1 - Math.exp(-crossSection);
    static reduceCrossProba = (proba, crossSectionFactor) => INeutronBehaviour.probaFromCrossSection(INeutronBehaviour.crossSectionFromProba(proba) * crossSectionFactor);

    static ofParams(scatteringType, params, size) {
        return INeutronBehaviour.of(scatteringType, params.thermalAbsorption, params.fastAbsorption, params.thermalScattering, params.fastScattering, size);
    }

    static NO_INTERACTION = Object.freeze({
        neutronSlowingProbability: () => 0.5,
        interactionTotalProbability: (type) => 0,
        interactionRelativeProbability: (type, interaction) =>  0.5,
    });

}
