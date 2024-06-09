/*
// INuclearTileData

    getTemperature();
    getHeatTransferCoeff();
    getMeanNeutronAbsorption(NeutronType type);
    getMeanNeutronFlux(NeutronType type);
    getMeanNeutronGeneration();
    getMeanEuGeneration();
    TransferVariant getVariant();
    long getVariantAmount();
    boolean isFluid();

    getComponent = () => {
        const variant = getVariant();

        if (variant instanceof ItemVariant resource) {
            if (!variant.isBlank() && getVariantAmount() > 0 && resource.getItem() instanceof INuclearComponent<?>comp) {
                return comp;
            }

        } else if (variant instanceof FluidVariant resource) {
            if (!resource.isBlank() && getVariantAmount() > 0) {
                return FluidNuclearComponent.get(resource.getFluid());
            }
        }

        return null;
    }

    write = (Optional<INuclearTileData> maybeData, RegistryFriendlyByteBuf buf) {

        if (maybeData.isPresent()) {
            INuclearTileData tile = maybeData.get();
            buf.writeBoolean(true);

            buf.writeDouble(tile.getTemperature());

            buf.writeDouble(tile.getMeanNeutronAbsorption(NeutronType.FAST));
            buf.writeDouble(tile.getMeanNeutronAbsorption(NeutronType.THERMAL));

            buf.writeDouble(tile.getMeanNeutronFlux(NeutronType.FAST));
            buf.writeDouble(tile.getMeanNeutronFlux(NeutronType.THERMAL));

            buf.writeDouble(tile.getMeanNeutronGeneration());

            buf.writeDouble(tile.getHeatTransferCoeff());
            buf.writeDouble(tile.getMeanEuGeneration());

            buf.writeBoolean(!tile.isFluid());
            tile.getVariant().toPacket(buf);
            buf.writeLong(tile.getVariantAmount());

        } else {
            buf.writeBoolean(false);
        }

    }

    static Optional<INuclearTileData> read(RegistryFriendlyByteBuf buf) {
        boolean isPresent = buf.readBoolean();
        if (isPresent) {

            final double temperature = buf.readDouble();

            final double meanFastNeutronAbsorption = buf.readDouble();
            final double meanThermalNeutronAbsorption = buf.readDouble();

            final double meanFastNeutronFlux = buf.readDouble();
            final double meanThermalNeutronFlux = buf.readDouble();

            final double meanNeutronGeneration = buf.readDouble();

            final double heatTransferCoeff = buf.readDouble();
            final double euGeneration = buf.readDouble();

            final boolean isItem = buf.readBoolean();
            final TransferVariant variant = isItem ? ItemVariant.fromPacket(buf) : FluidVariant.fromPacket(buf);
            final long amount = buf.readLong();

            return Optional.of(new INuclearTileData() {

                @Override
                public double getTemperature() {
                    return temperature;
                }

                @Override
                public double getHeatTransferCoeff() {
                    return heatTransferCoeff;
                }

                @Override
                public double getMeanNeutronAbsorption(NeutronType type) {
                    if (type == NeutronType.FAST)
                        return meanFastNeutronAbsorption;
                    else if (type == NeutronType.THERMAL)
                        return meanThermalNeutronAbsorption;

                    return meanThermalNeutronAbsorption + meanFastNeutronAbsorption;
                }

                @Override
                public double getMeanNeutronFlux(NeutronType type) {
                    if (type == NeutronType.FAST)
                        return meanFastNeutronFlux;
                    else if (type == NeutronType.THERMAL)
                        return meanThermalNeutronFlux;

                    return meanFastNeutronFlux + meanThermalNeutronFlux;
                }

                @Override
                public double getMeanNeutronGeneration() {
                    return meanNeutronGeneration;
                }

                @Override
                public double getMeanEuGeneration() {
                    return euGeneration;
                }

                @Override
                public TransferVariant getVariant() {
                    return variant;
                }

                @Override
                public long getVariantAmount() {
                    return amount;
                }

                @Override
                public boolean isFluid() {
                    return !isItem;
                }

            });

        } else {
            return Optional.empty();
        }
    }

    static boolean areEquals(Optional<INuclearTileData> a, Optional<INuclearTileData> b) {
        if (a.isPresent() != b.isPresent()) {
            return false;
        } else if (a.isPresent()) {
            INuclearTileData A = a.get();
            INuclearTileData B = b.get();
            for (NeutronType type : NeutronType.TYPES) {
                if (A.getMeanNeutronAbsorption(type) != B.getMeanNeutronAbsorption(type)) {
                    return false;
                }
                if (A.getMeanNeutronFlux(type) != B.getMeanNeutronFlux(type)) {
                    return false;
                }
            }
            return A.getTemperature() == B.getTemperature() && A.getHeatTransferCoeff() == B.getTemperature()
                    && A.getVariantAmount() == B.getVariantAmount() && A.getMeanNeutronGeneration() == B.getMeanNeutronGeneration()
                    && A.getVariant().equals(B.getVariant()) && A.getMeanEuGeneration() == B.getMeanEuGeneration();
        } else {
            return true;
        }

    }

}
*/