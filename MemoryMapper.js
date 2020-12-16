class MemoryMapper {
    constructor() {
        this.regions = [];
    }

    Map(device, start, end, remap = true) {
        const region = {
            device,
            start,
            end,
            remap
        };
        this.regions.unshift(region);

        return () => {
            this.regions = this.regions.filter(x => x !== region);
        };
    }

    FindRegion(address) {
        let region = this.regions.find(r => address >= r.start && address <= r.end);
        if (!region) {
            throw new Error(`No memory region found for address ${address}`);
        }
        return region;
    }

    getUint8(address) {
        const region = this.FindRegion(address);
        const finalAdress = region.remap ? address - region.start : address;
        return region.device.getUint8(finalAdress);
    }

    setUint8(address, value) {
        const region = this.FindRegion(address);
        const finalAdress = region.remap ? address - region.start : address;
        return region.device.setUint8(finalAdress, value);
    }

    getUint16(address) {
        const region = this.FindRegion(address);
        const finalAdress = region.remap ? address - region.start : address;
        return region.device.getUint16(finalAdress);
    }

    setUint16(address, value) {
        const region = this.FindRegion(address);
        const finalAdress = region.remap ? address - region.start : address;
        return region.device.setUint16(finalAdress, value);
    }
}

module.exports = MemoryMapper;