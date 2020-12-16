const MOV_LIT_REG       = 0x10;     // Move literal to register
const MOV_REG_REG       = 0x11;     // Move register to register
const MOV_REG_MEM       = 0x12;     // Move register to memory
const MOV_MEM_REG       = 0x13;     // Move memory to register
const MOV_LIT_MEM       = 0x1b;     // Move literal to memory
const MOV_REG_PTR_REG   = 0x1c;     // Move register pointer to register
const MOV_LIT_OFF_REG   = 0x1d;     // Move value at [literal + register] to register

const ADD_REG_REG       = 0x14;     // Add register to register
const ADD_LIT_REG       = 0x3f;     // Add literal to register
const SUB_REG_REG       = 0x1f;     // Subtract register from register
const SUB_LIT_REG       = 0x16;     // Subtract literal from register
const SUB_REG_LIT       = 0x1e;     // Subtract register from literal
const INC_REG           = 0x35;     // Increment register
const DEC_REG           = 0x36;     // Decrement register
const MUL_LIT_REG       = 0x20;     // Multiply literal with register
const MUL_REG_REG       = 0x21;     // Multiply register with register

const LSF_REG_LIT       = 0x26;     // Left shift register by literal
const LSF_REG_REG       = 0x27;     // Left shift register by register
const RSF_REG_LIT       = 0x2a;     // Right shift register by literal
const RSF_REG_REG       = 0x2b;     // Right shift register by register
const AND_REG_LIT       = 0x2e;     // Bitwise AND register with literal
const AND_REG_REG       = 0x2f;     // Bitwise AND register with register
const OR_REG_LIT        = 0x30;     // Bitwise OR register with literal
const OR_REG_REG        = 0x31;     // Bitwise OR register with register
const XOR_REG_LIT       = 0x32;     // Bitwise XOR register with literal
const XOR_REG_REG       = 0x33;     // Bitwise XOR register with register
const NOT               = 0x34;     // Bitwise NOT

// All of these compare against the accumulator register
const JNE_LIT           = 0x15;     // Jump if not equal 
const JNE_REG           = 0x40;     
const JEQ_REG           = 0x3e;     // Jump if equal to 
const JEQ_LIT           = 0x41;     
const JLT_REG           = 0x42;     // Jump if less than 
const JLT_LIT           = 0x43;     
const JGT_REG           = 0x44;     // Jump if greater than
const JGT_LIT           = 0x45;
const JLE_REG           = 0x46;     // Jump if less than/equal to
const JLE_LIT           = 0x47;
const JGE_REG           = 0x48;     // Jump if greater than/equal to
const JGE_LIT           = 0x49;

const PSH_LIT           = 0x17;     // Push a literal to the stack
const PSH_REG           = 0x18;     // Push a register to the stack
const POP               = 0x1a;     // Pop a value from the stack
const CAL_LIT           = 0x5E;     // Call a subroutine using a literal as the address
const CAL_REG           = 0x5F;     // Call a subroutine using the value in the register as the address
const RET               = 0x60;     // Return from a subroutine
const HLT               = 0xff;     // Halt the VM

module.exports = {
    MOV_LIT_REG,
    MOV_REG_REG,
    MOV_REG_MEM,
    MOV_MEM_REG,
    MOV_LIT_MEM,
    MOV_REG_PTR_REG,
    MOV_LIT_OFF_REG,
    ADD_LIT_REG,
    SUB_REG_REG,
    SUB_LIT_REG,
    SUB_REG_LIT,
    INC_REG,
    DEC_REG,
    MUL_LIT_REG,
    MUL_REG_REG,
    ADD_REG_REG,
    LSF_REG_LIT,
    LSF_REG_REG,
    RSF_REG_LIT,
    RSF_REG_REG,
    AND_REG_LIT,
    AND_REG_REG,
    OR_REG_LIT,
    OR_REG_REG,
    XOR_REG_LIT,
    XOR_REG_REG,
    NOT,
    JNE_LIT,
    JNE_REG,
    JEQ_REG,
    JEQ_LIT,
    JLT_REG,
    JLT_LIT,
    JGT_REG,
    JGT_LIT,
    JLE_REG,
    JLE_LIT,
    JGE_REG,
    JGE_LIT,
    PSH_LIT,
    PSH_REG,
    POP,
    CAL_LIT,
    CAL_REG,
    RET,
    HLT,
};