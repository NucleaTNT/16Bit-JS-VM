const CreateMemory = require("./CreateMemory");
const INSTRUCTIONS = require("./Instructions");
const registers = require("./Registers");

class CPU {
    constructor(memory) {
        this.memory = memory;

        // Each register = 16 bits, create memory that is 2 bytes for every register
        this.registers = CreateMemory(registers.length * 2);

        this.registerMap = registers.reduce((map, name, i) => {
            map[name] = i * 2;
            return map;
        }, {});

        this.SetRegister("sp", 0xffff - 1);
        this.SetRegister("fp", 0xffff - 1);

        this.stackFrameSize = 0;
    }

    Debug() {
        registers.forEach(name => {
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
        return (this.Fetch() % registers.length) * 2;
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
            case INSTRUCTIONS.MOV_LIT_REG.opcode: {         // Move literal into register
                const literal = this.Fetch16();
                const register = this.FetchRegisterIndex();
                this.registers.setUint16(register, literal);
                return;
            }

            case INSTRUCTIONS.MOV_REG_REG.opcode: {         // Move register into register
                const src = this.FetchRegisterIndex();
                const dest = this.FetchRegisterIndex();
                const value = this.registers.getUint16(src);
                this.registers.setUint16(dest, value);
                return;
            }

            case INSTRUCTIONS.MOV_REG_MEM.opcode: {         // Move register into memory
                const src = this.FetchRegisterIndex();
                const address = this.Fetch16();
                const value = this.registers.getUint16(src);
                this.memory.setUint16(address, value);
                return;
            }

            case INSTRUCTIONS.MOV_MEM_REG.opcode: {         // Move memory into register
                const address = this.Fetch16();
                const dest = this.FetchRegisterIndex();
                const value = this.memory.getUint16(address);
                this.registers.setUint16(dest, value);
                return;
            }

            case INSTRUCTIONS.MOV_LIT_MEM.opcode: {         // Move literal to memory
                const value = this.Fetch16();
                const address = this.Fetch16();
                this.memory.setUint16(address, value);
                return;
            }

            case INSTRUCTIONS.MOV_REG_PTR_REG.opcode: {     // Move register pointer to register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const ptr = this.registers.getUint16(r1);
                const value = this.memory.getUint16(ptr);
                this.registerMap.setUint16(r2, value);
                return;
            }

            case INSTRUCTIONS.MOV_LIT_OFF_REG.opcode: {     // Move value at [literal + register] to register
                const baseAddress = this.Fetch16();
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const offset = this.registers.getUint16(r1);
                
                const value = this.memory.getUint16(baseAddress + offset);
                this.registerMap.setUint16(r2, value);
                return;
            }

            case INSTRUCTIONS.ADD_REG_REG.opcode: {         // Add register to register
                const r1 = this.Fetch();
                const r2 = this.Fetch();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);
                this.SetRegister("acc", registerValue1 + registerValue2);
                return;
            }

            case INSTRUCTIONS.ADD_LIT_REG.opcode: {         // Add register to register
                const literal = this.Fetch16();
                const r1 = this.FetchRegisterIndex();
                const registerValue = this.registers.getUint16(r1);
                this.SetRegister("acc", literal + registerValue);
                return;
            }

            case INSTRUCTIONS.SUB_LIT_REG.opcode: {         // Subtract literal from register
                const literal = this.Fetch16();
                const r1 = this.FetchRegisterIndex();
                const registerValue = this.registerMap.getUint16(r1);
                this.SetRegister("acc", registerValue - literal);
                return;
            }

            case INSTRUCTIONS.SUB_REG_LIT.opcode: {         // Subtract register from literal
                const r1 = this.FetchRegisterIndex();
                const literal = this.Fetch16();
                const registerValue = this.registerMap.getUint16(r1);
                this.SetRegister("acc", literal - registerValue);
                return;
            }

            case INSTRUCTIONS.SUB_REG_REG.opcode: {         // Subtract register from register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const registerValue1 = this.registerMap.getUint16(r1);
                const registerValue2 = this.registerMap.getUint16(r2);
                this.SetRegister("acc", registerValue1 - registerValue2);
                return;
            }

            case INSTRUCTIONS.MUL_LIT_REG.opcode: {         // Multiply literal by register
                const literal = this.Fetch16();
                const r1 = this.FetchRegisterIndex();
                const registerValue = this.registers.getUint16(r1);
                this.SetRegister("acc", literal * registerValue);
                return;
            }

            case INSTRUCTIONS.MUL_REG_REG.opcode: {         // Multiply register by register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const registerValue1 = this.registerMap.getUint16(r1);
                const registerValue2 = this.registerMap.getUint16(r2);
                this.SetRegister("acc", registerValue1 * registerValue2);
                return;
            }

            case INSTRUCTIONS.INC_REG.opcode: {             // Increment register
                r1 = this.FetchRegisterIndex();
                registerValue = this.memory.getUint16(r1);
                this.registers.setUint16(r1, registerValue + 1);
                return;
            }

            case INSTRUCTIONS.INC_REG.opcode: {             // Decrement register
                r1 = this.FetchRegisterIndex();
                registerValue = this.memory.getUint16(r1);
                this.registers.setUint16(r1, registerValue - 1);
                return;
            }

            case INSTRUCTIONS.LSF_REG_LIT.opcode: {         // Left shift register by literal
                const r1 = this.FetchRegisterIndex();
                const literal = this.Fetch();
                const registerValue = this.registers.getUint16(r1);
                this.registers.setUint16(r1, registerValue << literal);
                return;
            }

            case INSTRUCTIONS.LSF_REG_REG.opcode: {         // Left shift register by register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);
                this.registers.setUint16(r1, registerValue1 << registerValue2);
                return;
            }

            case INSTRUCTIONS.RSF_REG_LIT.opcode: {         // Right shift register by literal
                const r1 = this.FetchRegisterIndex();
                const literal = this.Fetch();
                const registerValue = this.registers.getUint16(r1);
                this.registers.setUint16(r1, registerValue >> literal);
                return;
            }

            case INSTRUCTIONS.RSF_REG_REG.opcode: {         // Right shift register by register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);
                this.registers.setUint16(r1, registerValue1 >> registerValue2);
                return;
            }

            case INSTRUCTIONS.AND_REG_LIT.opcode: {         // Bitwise AND register with literal
                const r1 = this.FetchRegisterIndex();
                const literal = this.Fetch();
                const registerValue = this.registers.getUint16(r1);

                this.SetRegister("acc", registerValue & literal);
                return;
            }

            case INSTRUCTIONS.AND_REG_REG.opcode: {         // Bitwise AND register with register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);

                this.SetRegister("acc", registerValue1 & registerValue2);
                return;
            }

            case INSTRUCTIONS.OR_REG_LIT.opcode: {          // Bitwise OR register with literal
                const r1 = this.FetchRegisterIndex();
                const literal = this.Fetch();
                const registerValue = this.registers.getUint16(r1);

                this.SetRegister("acc", registerValue | literal);
                return;
            }

            case INSTRUCTIONS.OR_REG_REG.opcode: {          // Bitwise OR register with register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);

                this.SetRegister("acc", registerValue1 | registerValue2);
                return;
            }

            case INSTRUCTIONS.XOR_REG_LIT.opcode: {         // Bitwise XOR register with literal
                const r1 = this.FetchRegisterIndex();
                const literal = this.Fetch();
                const registerValue = this.registers.getUint16(r1);

                this.SetRegister("acc", registerValue ^ literal);
                return;
            }

            case INSTRUCTIONS.OR_REG_REG.opcode: {          // Bitwise XOR register with register
                const r1 = this.FetchRegisterIndex();
                const r2 = this.FetchRegisterIndex();
                const registerValue1 = this.registers.getUint16(r1);
                const registerValue2 = this.registers.getUint16(r2);

                this.SetRegister("acc", registerValue1 ^ registerValue2);
                return;
            }

            case INSTRUCTIONS.NOT.opcode: {                 // Bitwise NOT with register 
                const r1 = this.FetchRegisterIndex();
                const registerValue = this.registers.getUint16(r1);
                this.SetRegister("acc", (~registerValue) & 0xffff);
                return;
            }

            /*** Compared against acc ***/
            case INSTRUCTIONS.JNE_LIT_MEM.opcode: {         // Jump if not equal
                const value = this.Fetch16();
                const address = this.Fetch16();

                if (value !== this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JNE_REG_MEM.opcode: {
                const r1 = this.FetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.Fetch16();

                if (value !== this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JEQ_LIT_MEM.opcode: {         // Jump if equal to
                const value = this.Fetch16();
                const address = this.Fetch16();

                if (value === this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JEQ_REG_MEM.opcode: {
                const r1 = this.FetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.Fetch16();

                if (value === this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JLT_LIT_MEM.opcode: {         // Jump if less than
                const value = this.Fetch16();
                const address = this.Fetch16();

                if (value < this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JLT_REG_MEM.opcode: {
                const r1 = this.FetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.Fetch16();

                if (value < this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JGT_LIT_MEM.opcode: {         // Jump if greater than
                const value = this.Fetch16();
                const address = this.Fetch16();

                if (value > this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JGT_REG_MEM.opcode: {
                const r1 = this.FetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.Fetch16();

                if (value > this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JLE_LIT_MEM.opcode: {         // Jump if less than/equal to
                const value = this.Fetch16();
                const address = this.Fetch16();

                if (value <= this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JLE_REG_MEM.opcode: {
                const r1 = this.FetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.Fetch16();

                if (value <= this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JGE_LIT_MEM.opcode: {         // Jump if greater than/equal to
                const value = this.Fetch16();
                const address = this.Fetch16();

                if (value >= this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }

            case INSTRUCTIONS.JGE_REG_MEM.opcode: {
                const r1 = this.FetchRegisterIndex();
                const value = this.registers.getUint16(r1);
                const address = this.Fetch16();

                if (value >= this.GetRegister("acc")) {
                    this.SetRegister("ip", address);
                }
                return;
            }
            /*** ================== ***/

            case INSTRUCTIONS.PSH_LIT.opcode: {             // Push a literal to the stack
                const value = this.Fetch16();
                this.Push(value);
                return;
            }

            case INSTRUCTIONS.PSH_REG.opcode: {             // Push a register to the stack
                const registerIndex = this.FetchRegisterIndex();
                this.Push(this.registers.getUint16(registerIndex));
                return;
            }

            case INSTRUCTIONS.POP.opcode: {                 // Pop a value from the stack
                const registerIndex = this.FetchRegisterIndex();
                const value = this.Pop();
                this.registers.setUint16(registerIndex, value);
                return;
            }

            case INSTRUCTIONS.CAL_LIT.opcode: {             // Call a subroutine using a literal as the address
                const address = this.Fetch16();
                this.PushState();
                this.SetRegister("ip", address);
                return;
            }

            case INSTRUCTIONS.CAL_REG.opcode: {             // Call a subroutine using the value in the register as the address
                const registerIndex = this.FetchRegisterIndex();
                const address = this.registers.getUint16(registerIndex);
                this.PushState();
                this.SetRegister("ip", address);
                return;
            }

            case INSTRUCTIONS.RET.opcode: {                 // Return from a subroutine
                this.PopState();
                return;
            }

            case INSTRUCTIONS.HLT.opcode: {                 // Halt the VM
                return true;
            }
        }
    }

    Step() {
        const instruction = this.Fetch();
        return this.Execute(instruction);
    }

    Run() {
        const halt = this.Step();
        if (!halt) {
            setImmediate(() => this.Run());
        }
    }
};

module.exports = CPU;