class NuclearGrid {
    constructor(sizeX, sizeY, hatchesGrid) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.hatchesGrid = hatchesGrid;
    }

    getNuclearTile(x, y) {
        return this.hatchesGrid[x + y * this.sizeX];
    }

    registerNeutronFate(neutronNumber, type, escape) {}

    registerNeutronCreation(neutronNumber, type) {}
}
