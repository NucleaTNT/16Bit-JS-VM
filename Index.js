const CreateMemory = require("./CreateMemory");
const CPU = require("./CPU");
const MemoryMapper = require("./MemoryMapper");

const MM = new MemoryMapper();

const dataViewMethods = [
    "getUint8",
    "setUint8",
    "getUint16",
    "setUint16"
]

const CreateBankedMemory = (n, bankSize, cpu) => {
    const bankBuffers = Array.from({length: n}, () => new ArrayBuffer(bankSize));
    const banks = bankBuffers.map(ab => new DataView(ab));

    const forwardToDataView = name => (...args) => {
        const bankIndex = cpu.GetRegister("mb") % n;
        const memoryBankToUse = banks[bankIndex];
        return memoryBankToUse[name](...args);
    };

    const interface = dataViewMethods.reduce((dvOut, fnName) => {
        dvOut[fnName] = forwardToDataView(fnName);
        return dvOut;
    }, {});

    return interface;
}

const bankSize = 0xff;
const nBanks = 8;
const cpu = new CPU(MM);

const memoryBankDevice = CreateBankedMemory(nBanks, bankSize, cpu);
MM.map(memoryBankDevice, 0, bankSize);

const regularMemory = CreateMemory(0xff00);
MM.map(regularMemory, bankSize, 0xffff, true);

console.log("Writing value 1 to address 0");
MM.setUint16(0, 1);
console.log("Reading value at address 0:", MM.getUint16(0));

console.log("\n::: Switching memory bank (0 -> 1)");
cpu.SetRegister("mb", 1);
console.log("Reading value at address 0:", MM.getUint16(0));

console.log("Writing value 42 to address 0");
MM.setUint16(0, 42);
console.log("\n::: Switching memory bank (1 -> 2)");
cpu.SetRegister("mb", 2);
console.log("Reading value at address 0:", MM.getUint16(0));

console.log("\n::: Switching memory bank (2 -> 1)");
cpu.SetRegister("mb", 1);
console.log("Reading value at address 0:", MM.getUint16(0));

console.log("\n::: Switching memory bank (1 -> 0)");
cpu.SetRegister("mb", 0);
console.log("Reading value at address 0:", MM.getUint16(0));