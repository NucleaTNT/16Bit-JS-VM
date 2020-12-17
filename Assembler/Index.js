const parser = require("./Parser");
const instructions = require("../Instructions");
const {instructionTypes: I} = require("../Instructions/Meta");
const registers = require("../Registers");

const registerMap = registers.reduce((map, regName, index) => {
    map[regName] = index;
    return map;
}, {});

const exampleProgram = [
    "start:",
    "   mov $be, &007a",
    "loop:",
    "   mov &007a, acc",
    "   dec acc",
    "   mov acc, &007a",
    "   inc r2",
    "   inc r2",
    "   inc r2",
    "   jne $00, &[!loop]",
    "end:",
    "   hlt"
].join("\n");

const parsedOutput = parser.run(exampleProgram);

const machineCode = [];
const labels = {};
let currentAddress = 0;

parsedOutput.result.forEach(instructionOrLabel => {
    if (instructionOrLabel.type === "LABEL") {
        labels[instructionOrLabel.value] = currentAddress;
    } else {
        const metadata = instructions[instructionOrLabel.value.instruction];
        currentAddress += metadata.size;
    }
});

const encodeLitOrMem = val => {
    let hexVal;
    if (val.type === "VARIABLE") {
        if (!(val.value in labels)) {
            throw new Error(`Label "${val.value}" wasn't resolved.`);
        }
        hexVal = labels[val.value];
    } else {
        hexVal = parseInt(val.value, 16);
    }

    const highByte = (hexVal & 0xff00) >> 8;
    const lowByte = hexVal & 0x00ff;
    machineCode.push(highByte, lowByte);
};

const encodeLit8 = lit => {
    let hexVal;
    if (lit.type === "VARIABLE") {
        if (!(lit.value in labels)) {
            throw new Error(`Label "${lit.value}" wasn't resolved.`);
        }
        hexVal = labels[lit.value];
    } else {
        hexVal = parseInt(lit.value, 16);
    }

    const lowByte = hexVal & 0x00ff;
    machineCode.push(lowByte);
};

const encodeReg = reg => {
    const mappedReg = registerMap[reg.value];
    machineCode.push(mappedReg);
};

parsedOutput.result.forEach(instruction => {
    if (instruction.type !== "INSTRUCTION") return;

    const metadata = instructions[instruction.value.instruction];
    machineCode.push(metadata.opcode);

    if ([I.litReg, I.memReg].includes(metadata.type)) {
        encodeLitOrMem(instruction.value.args[0]);
        encodeReg(instruction.value.args[1]);
    }
    if ([I.regLit, I.regMem].includes(metadata.type)) {
        encodeReg(instruction.value.args[0]);
        encodeLitOrMem(instruction.value.args[1]);
    }
    if (I.regLit8 === metadata.type) {
        encodeReg(instruction.value.args[0]);
        encodeLit8(instruction.value.args[1]);
    }
    if ([I.regReg, I.regPtrReg].includes(metadata.type)) {
        encodeReg(instruction.value.args[0]);
        encodeReg(instruction.value.args[1]);
    }
    if (I.litMem === metadata.type) {
        encodeLitOrMem(instruction.value.args[0]);
        encodeLitOrMem(instruction.value.args[1]);
    }
    if (I.litOffReg === metadata.type) {
        encodeLitOrMem(instruction.value.args[0]);
        encodeReg(instruction.value.args[1]);
        encodeReg(instruction.value.args[2]);
    }
    if (I.singleReg === metadata.type) {
        encodeReg(instruction.value.args[0]);
    }
    if (I.singleLit === metadata.type) {
        encodeLitOrMem(instruction.value.args[1]);
    }
});

console.log(machineCode.join(" "));