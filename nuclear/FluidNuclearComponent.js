class FluidNuclearComponent extends INuclearComponent {

    constructor(
        fluid,
        heatConduction,
        density,
        type,
        params,
        neutronProduct,
        neutronProductAmount,
        neutronProductProbability
    ) {
        super()
        this.variant                   = fluid;
        this.heatConduction            = heatConduction * density;
        this.neutronBehaviour          = INeutronBehaviour.ofParams(type, params, density);
        this.neutronProduct            = neutronProduct;
        this.neutronProductAmount      = neutronProductAmount;
        this.neutronProductProbability = neutronProductProbability;

    }

    getVariant() {
        return this.variant;
    }

    getHeatConduction() {
        return this.heatConduction;
    }

    getNeutronBehaviour() {
        return this.neutronBehaviour;
    }

    getNeutronProduct() {
        return this.neutronProduct;
    }

    getNeutronProductAmount() {
        return this.neutronProductAmount;
    }

    getNeutronProductProbability() {
        return this.neutronProductProbability;
    }
}

NuclearComponent.register(new FluidNuclearComponent(
    Fluids.WATER,
    NuclearConstant.BASE_HEAT_CONDUCTION * 5,
    1,
    NuclearConstant.ScatteringType.ULTRA_LIGHT,
    NuclearConstant.HYDROGEN,
    Fluids.DEUTERIUM,
    1,
    1
));
NuclearComponent.register(new FluidNuclearComponent(
    Fluids.HEAVY_WATER,
    NuclearConstant.BASE_HEAT_CONDUCTION * 6,
    1,
    NuclearConstant.ScatteringType.LIGHT,
    NuclearConstant.DEUTERIUM,
    Fluids.TRITIUM,
    1,
    1
));
NuclearComponent.register(new FluidNuclearComponent(
    Fluids.HIGH_PRESSURE_WATER,
    NuclearConstant.BASE_HEAT_CONDUCTION * 5,
    4,
    NuclearConstant.ScatteringType.ULTRA_LIGHT,
    NuclearConstant.HYDROGEN,
    Fluids.DEUTERIUM,
    8,
    0.125
));
NuclearComponent.register(new FluidNuclearComponent(
    Fluids.HIGH_PRESSURE_HEAVY_WATER,
    NuclearConstant.BASE_HEAT_CONDUCTION * 6,
    4,
    NuclearConstant.ScatteringType.LIGHT,
    NuclearConstant.DEUTERIUM,
    Fluids.TRITIUM,
    8,
    0.125
));