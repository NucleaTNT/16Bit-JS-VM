const MOV_LIT_REG   = 0x10;     // Move literal to register
const MOV_REG_REG   = 0x11;     // Move register to register
const MOV_REG_MEM   = 0x12;     // Move register to memory
const MOV_MEM_REG   = 0x13;     // Move memory to register
const ADD_REG_REG   = 0x14;     // Add register to register
const JMP_NOT_EQ    = 0x15;     // Jump if not equal
const PSH_LIT       = 0x17;     // Push a literal to the stack
const PSH_REG       = 0x18;     // Push a register to the stack
const POP           = 0x1a;     // Pop a value from the stack
const CAL_LIT       = 0x5E;     // Call a subroutine using a literal as the address
const CAL_REG       = 0x5F;     // Call a subroutine using the value in the register as the address
const RET           = 0x60;     // Return from a subroutine

module.exports = {
    MOV_LIT_REG,
    MOV_REG_REG,
    MOV_REG_MEM,
    MOV_MEM_REG,
    ADD_REG_REG,
    JMP_NOT_EQ,
    PSH_LIT,
    PSH_REG,
    POP,
    CAL_LIT,
    CAL_REG,
    RET,
};