class NuclearGrid {
    constructor(sizeX, sizeY, hatchesGrid) {
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.hatchesGrid = hatchesGrid;
    }

    getNuclearTile(x, y) {
        if (x >= this.sizeX || y >= this.sizeY) {
            return null;
        }
        return this.hatchesGrid[x + y * this.sizeX];
    }

    registerNeutronFate(neutronNumber, type, escape) {}

    registerNeutronCreation(neutronNumber, type) {}
}
