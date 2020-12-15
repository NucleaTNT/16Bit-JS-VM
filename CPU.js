const CreateMemory = require("./CreateMemory");
const INSTRUCTIONS = require("./Instructions")

class CPU {
    constructor(memory) {
        this.memory = memory;
    
        this.registerNames = [
            "ip", "acc",                // Instruction Pointer (holds address of current instruction), ACCumulator (stores results of arithmetic calculations)
            "r1", "r2", "r3", "r4",     // General purpose registers
            "r5", "r6", "r7", "r8",     // ^^^
        ];

        // Each register = 16 bits, create memory that is 2 bytes for every register
        this.registers = CreateMemory(this.registerNames.length * 2);

        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});
    }

    Debug() {
        this.registerNames.forEach(name => {
            console.log(`${name}: 0x${this.GetRegister(name).toString(16).padStart(4, '0')}`)
        });
        console.log("");
    }

    ViewMemoryAt(address) {
        const nextEightBytes = Array.from({length: 8}, (_, i) =>
            this.memory.getUint8(address + i)
        ).map(v => `0x${v.toString(16).padStart(2, '0')}`);
    
        console.log(`0x${address.toString(16).padStart(4, '0')}: ${nextEightBytes.join(' ')}`)
    }

    GetRegister(name) {
        if (!(name in this.registerMap)) {
            throw new Error(`GetRegister: No such register '${name}'`);
        }
        return this.registers.getUint16(this.registerMap[name]);
    }

    SetRegister(name, value) {
        if (!(name in this.registerMap)) {
            throw new Error(`GetRegister: No such register '${name}'`);
        }
        return this.registers.setUint16(this.registerMap[name], value);
    }

    Fetch() {
        const nextInstructionAddress = this.GetRegister("ip");
        const instruction = this.memory.getUint8(nextInstructionAddress);
        this.SetRegister("ip", nextInstructionAddress + 1);
        return instruction;
    }

    Fetch16() {
        const nextInstructionAddress = this.GetRegister("ip");
        const instruction = this.memory.getUint16(nextInstructionAddress);
        this.SetRegister("ip", nextInstructionAddress + 2);
        return instruction;
    }

    Execute(instruction) {
        switch (instruction) {
            case INSTRUCTIONS.MOV_LIT_REG: {    // Move literal into register
                const literal = this.Fetch16();
                const register = (this.Fetch() % this.registerNames.length) * 2;
                this.registers.setUint16(register, literal);
                return;
            }

            case INSTRUCTIONS.MOV_REG_REG: {    // Move register into register
                const src = (this.Fetch() % this.registerNames.length) * 2;
                const dest = (this.Fetch() % this.registerNames.length) * 2;
                const value = this.registers.getUint16(src);
                this.registers.setUint16(dest, value);
                return;
            }

            case INSTRUCTIONS.MOV_REG_MEM: {    // Move register into memory
                const src = (this.Fetch() % this.registerNames.length) * 2;
                const address = this.Fetch16();
                const value = this.registers.getUint16(src);
                this.memory.setUint16(address, value);
                return;
            }

            case INSTRUCTIONS.MOV_MEM_REG: {    // Move memory into register
                const address = this.Fetch16();
                const dest = (this.Fetch() % this.registerNames.length) * 2;
                const value = this.memory.getUint16(address);
                this.registers.setUint16(dest, value);
                return;
            }

            case INSTRUCTIONS.ADD_REG_REG: {    // Add register to register
                const r1 = this.Fetch();
                const r2 = this.Fetch();
                const registerValue1 = this.registers.getUint16(r1 * 2);
                const registerValue2 = this.registers.getUint16(r2 * 2);
                this.SetRegister("acc", registerValue1 + registerValue2);
                return;
            }

            case INSTRUCTIONS.JMP_NOT_EQ: {     // Jump if not equal
                const value = this.Fetch16();
                const address = this.Fetch16();

                if (value !== this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }
        }
    }

    Step() {
        const instruction = this.Fetch();
        return this.Execute(instruction);
    }
};

module.exports = CPU;