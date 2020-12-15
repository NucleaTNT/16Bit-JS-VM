const CreateMemory = require("./CreateMemory");
const INSTRUCTIONS = require("./Instructions")

class CPU {
    constructor(memory) {
        this.memory = memory;
    
        this.registerNames = [
            "ip", "acc",                // Instruction Pointer (holds address of current instruction), ACCumulator (stores results of arithmetic calculations)
            "r1", "r2", "r3", "r4",     // General purpose registers
            "r5", "r6", "r7", "r8",     // ^^^
            "sp", "fp"                  // Stack Pointer, Frame Pointer
        ];

        // Each register = 16 bits, create memory that is 2 bytes for every register
        this.registers = CreateMemory(this.registerNames.length * 2);

        this.registerMap = this.registerNames.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});

        this.SetRegister("sp", memory.byteLength - 1 - 1);  // -1 due to 2 bytes needed per address, -1 because it's 0 indexed 
        this.SetRegister("fp", memory.byteLength - 1 - 1);

        this.stackFrameSize = 0;
    }

    Debug() {
        this.registerNames.forEach(name => {
            console.log(`${name}: 0x${this.GetRegister(name).toString(16).padStart(4, '0')}`)
        });
        console.log("");
    }

    ViewMemoryAt(address, n = 8) {
        const nextEightBytes = Array.from({length: n}, (_, i) =>
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

    FetchRegisterIndex() {
        return (this.Fetch() % this.registerNames.length) * 2;
    }

    Push(value) {
        const spAddress = this.GetRegister("sp");
        this.memory.setUint16(spAddress, value);
        this.SetRegister("sp", spAddress - 2);
        this.stackFrameSize += 2;
    }

    PushState() {
        // Push general purpose registers to stack
        this.Push(this.GetRegister("r1"));
        this.Push(this.GetRegister("r2"));
        this.Push(this.GetRegister("r3"));
        this.Push(this.GetRegister("r4"));
        this.Push(this.GetRegister("r5"));
        this.Push(this.GetRegister("r6"));
        this.Push(this.GetRegister("r7"));
        this.Push(this.GetRegister("r8"));

        
        this.Push(this.GetRegister("ip"));  // Push instruction pointer as the return address
        this.Push(this.stackFrameSize + 2); // Push size of stack frame

        this.SetRegister("fp", this.GetRegister("sp")); // Update frame pointer
        this.stackFrameSize = 0;
    }

    Pop() {
        const nextSpAddress = this.GetRegister("sp") + 2;
        this.SetRegister("sp", nextSpAddress);
        this.stackFrameSize -= 2;
        return this.memory.getUint16(nextSpAddress);
    }

    PopState() {
        const framePointerAddress = this.GetRegister("fp");
        this.SetRegister("sp", framePointerAddress);

        this.stackFrameSize = this.Pop();
        const stackFrameSize = this.stackFrameSize;

        this.SetRegister("ip", this.Pop());
        this.SetRegister("r8", this.Pop());
        this.SetRegister("r7", this.Pop());
        this.SetRegister("r6", this.Pop());
        this.SetRegister("r5", this.Pop());
        this.SetRegister("r4", this.Pop());
        this.SetRegister("r3", this.Pop());
        this.SetRegister("r2", this.Pop());
        this.SetRegister("r1", this.Pop());

        const nArgs = this.Pop();
        for (let i = 0; i < nArgs; i++) {
            this.Pop();
        }

        this.SetRegister("fp", framePointerAddress + stackFrameSize);
    }

    Execute(instruction) {
        switch (instruction) {
            case INSTRUCTIONS.MOV_LIT_REG: {    // Move literal into register
                const literal = this.Fetch16();
                const register = this.FetchRegisterIndex();
                this.registers.setUint16(register, literal);
                return;
            }

            case INSTRUCTIONS.MOV_REG_REG: {    // Move register into register
                const src = this.FetchRegisterIndex();
                const dest = this.FetchRegisterIndex();
                const value = this.registers.getUint16(src);
                this.registers.setUint16(dest, value);
                return;
            }

            case INSTRUCTIONS.MOV_REG_MEM: {    // Move register into memory
                const src = this.FetchRegisterIndex();
                const address = this.Fetch16();
                const value = this.registers.getUint16(src);
                this.memory.setUint16(address, value);
                return;
            }

            case INSTRUCTIONS.MOV_MEM_REG: {    // Move memory into register
                const address = this.Fetch16();
                const dest = this.FetchRegisterIndex();
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

            case INSTRUCTIONS.PSH_LIT: {        // Push a literal to the stack
                const value = this.Fetch16();
                this.Push(value);
                return;
            }

            case INSTRUCTIONS.PSH_REG: {        // Push a register to the stack
                const registerIndex = this.FetchRegisterIndex();
                this.Push(this.registers.getUint16(registerIndex));
                return;
            }

            case INSTRUCTIONS.POP: {            // Pop a value from the stack
                const registerIndex = this.FetchRegisterIndex();
                const value = this.Pop();
                this.registers.setUint16(registerIndex, value);
                return;
            }

            case INSTRUCTIONS.CAL_LIT: {        // Call a subroutine using a literal as the address
                const address = this.Fetch16();
                this.PushState();
                this.SetRegister("ip", address);
                return;
            }

            case INSTRUCTIONS.CAL_REG: {        // Call a subroutine using the value in the register as the address
                const registerIndex = this.FetchRegisterIndex();
                const address = this.registers.getUint16(registerIndex);
                this.PushState();
                this.SetRegister("ip", address);
                return;
            }

            case INSTRUCTIONS.RET: {            // Return from a subroutine
                this.PopState();
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