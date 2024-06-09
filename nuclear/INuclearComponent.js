class INuclearComponent {
    getHeatConduction   () { throw Error("Not implemented!"); }
    getNeutronBehaviour () { throw Error("Not implemented!"); }
    getVariant          () { throw Error("Not implemented!"); }

    getNeutronProduct            () { return null;       }
    getNeutronProductAmount      () { return 0;          }
    getNeutronProductProbability () { return 1;          }
    getMaxTemperature            () { return 2147483647; }
}

class NuclearComponent {
    static registry = {};

    static register(component) {
        const variant = component.getVariant();
        if (variant in NuclearComponent.registry) {
            throw new Error("Already registered neutron interaction for " + variant);
        }
        NuclearComponent.registry[variant] = component;
    }

    static get(key) {
        return NuclearComponent.registry[key];
    }
}