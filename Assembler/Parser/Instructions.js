const A = require("arcsecond");
const {
    litReg,
    regLit,
    regReg,
    regMem,
    memReg,
    litMem,
    regPtrReg,
    litOffReg,
    noArgs,
    singleReg,
    singleLit
} = require("./Formats");

const mov = A.choice([
    litReg("mov", "MOV_LIT_REG"),
    regReg("mov", "MOV_REG_REG"),
    memReg("mov", "MOV_MEM_REG"),
    regMem("mov", "MOV_REG_MEM"),
    litMem("mov", "MOV_LIT_MEM"),
    regPtrReg("mov", "MOV_REG_PTR_REG"),
    litOffReg("mov", "MOV_LIT_OFF_REG"),
]);

const add = A.choice([
    litReg("add", "ADD_LIT_REG"),
    regReg("add", "ADD_REG_REG"),
]);

const sub = A.choice([
    litReg("sub", "SUB_LIT_REG"),
    regReg("sub", "SUB_REG_REG"),
    regLit("sub", "SUB_REG_LIT"),
]);

const mul = A.choice([
    litReg("mul", "MUL_LIT_REG"),
    regReg("mul", "MUL_REG_REG"),
]);

const lsf = A.choice([
    litReg("lsf", "LSF_LIT_REG"),
    regReg("lsf", "LSF_REG_REG"),
    regLit("lsf", "LSF_REG_LIT"),
]);

const rsf = A.choice([
    litReg("rsf", "RSF_LIT_REG"),
    regReg("rsf", "RSF_REG_REG"),
    regLit("rsf", "RSF_REG_LIT"),
]);

const and = A.choice([
    litReg("and", "AND_LIT_REG"),
    regReg("and", "AND_REG_REG"),
]);

const or = A.choice([
    litReg("or", "OR_LIT_REG"),
    regReg("or", "OR_REG_REG"),
]);

const xor = A.choice([
    litReg("xor", "XOR_LIT_REG"),
    regReg("xor", "XOR_REG_REG"),
]);

const inc = singleReg("inc", "INC_REG");
const dec = singleReg("dec", "DEC_REG");
const not = singleReg("not", "NOT");

const jeq = A.choice([
    regMem("jeq", "JEQ_REG_MEM"),
    litMem("jeq", "JEQ_LIT_MEM"),
]);

const jne = A.choice([
    regMem("jne", "JNE_REG_MEM"),
    litMem("jne", "JNE_LIT_MEM"),
]);

const jlt = A.choice([
    regMem("jlt", "JLT_REG_MEM"),
    litMem("jlt", "JLT_LIT_MEM"),
]);

const jgt = A.choice([
    regMem("jgt", "JGT_REG_MEM"),
    litMem("jgt", "JGT_LIT_MEM"),
]);

const jle = A.choice([
    regMem("jle", "JLE_REG_MEM"),
    litMem("jle", "JLE_LIT_MEM"),
]);

const jge = A.choice([
    regMem("jge", "JGE_REG_MEM"),
    litMem("jge", "JGE_LIT_MEM"),
]);

const psh = A.choice([
    singleLit("psh", "PSH_LIT"),
    singleReg("psh", "PSH_REG"),
]);

const pop = singleReg("pop", "POP_REG");

const cal = A.choice([
    singleLit("cal", "CAL_LIT"),
    singleReg("cal", "CAL_REG"),
]);

const ret = noArgs("ret", "RET");
const hlt = noArgs("hlt", "HLT");

module.exports = A.choice([
    mov,
    add,
    sub,
    mul,
    lsf,
    rsf,
    and,
    or,
    xor,
    inc,
    dec,
    not,
    jeq,
    jne,
    jlt,
    jgt,
    jle,
    jge,
    psh,
    pop,
    cal,
    ret,
    hlt,
]);