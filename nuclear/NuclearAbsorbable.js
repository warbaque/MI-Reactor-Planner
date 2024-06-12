class NuclearAbsorbable extends NuclearComponentItem {

    constructor(item, maxTemperature, heatConduction, neutronBehaviour, desintegrationMax) {
        super(item, maxTemperature, heatConduction, neutronBehaviour);
        this.desintegrationMax = desintegrationMax;
    }

    /*
    setRemainingDesintegrations(stack, value) {
        if (value < 0 || value > this.desintegrationMax) {
            throw new Error(`Remaining desintegration ${value} must be between 0 and max desintegration = ${this.desintegrationMax}`);
        }
        stack.set(MIComponents.REMAINING_DISINTEGRATIONS, value);
    }

    getDurabilityBarProgress(stack) {
        return getRemainingDesintegrations(stack) / this.desintegrationMax;

    }

    getBarColor(stack) {
        const f = getRemainingDesintegrations(stack) / this.desintegrationMax;
        //return Mth.hsvToRgb(f / 3.0F, 1.0F, 1.0F);
    }

    isBarVisible(ItemStack stack) {
        return getRemainingDesintegrations(stack) != this.desintegrationMax;
    }

    getBarWidth(ItemStack stack) {
        return (int) Math.round(getDurabilityBarProgress(stack) * 13);
    }
    */

    // getRemainingDesintegrations(stack)

    simulateAbsorption(neutronsReceived) {
        return randIntFromDouble(neutronsReceived);
    }
}


NuclearComponent.register(new NuclearAbsorbable(
    Items.INVAR,
    3200,
    -0.9 * NuclearConstant.BASE_HEAT_CONDUCTION,
    INeutronBehaviour.ofParams(NuclearConstant.ScatteringType.MEDIUM, NuclearConstant.INVAR, 2),
    NuclearConstant.DESINTEGRATION_BY_ROD * 2
));
NuclearComponent.register(new NuclearAbsorbable(
    Items.CARBON,
    2500,
    2 * NuclearConstant.BASE_HEAT_CONDUCTION,
    INeutronBehaviour.ofParams(NuclearConstant.ScatteringType.MEDIUM, NuclearConstant.CARBON, 2),
    NuclearConstant.DESINTEGRATION_BY_ROD * 2
));
