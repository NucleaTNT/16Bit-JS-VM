const readline = require('readline');
const CreateMemory = require("./CreateMemory");
const CPU = require("./CPU");
const INSTRUCTIONS = require("./Instructions");
const { read } = require('fs');

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;

const memory = CreateMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

let i = 0;

const cpu = new CPU(memory);

writableBytes[i++] = INSTRUCTIONS.MOV_MEM_REG;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;
writableBytes[i++] = R1;

writableBytes[i++] = INSTRUCTIONS.MOV_LIT_REG;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x01;
writableBytes[i++] = R2;

writableBytes[i++] = INSTRUCTIONS.ADD_REG_REG;
writableBytes[i++] = R1;
writableBytes[i++] = R2;

writableBytes[i++] = INSTRUCTIONS.MOV_REG_MEM;
writableBytes[i++] = ACC;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00;

writableBytes[i++] = INSTRUCTIONS.JMP_NOT_EQ;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x03;
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x00;

cpu.Debug();
cpu.ViewMemoryAt(cpu.GetRegister("ip"));
cpu.ViewMemoryAt(0x0100);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', () => {
    cpu.Step();
    cpu.Debug();
    cpu.ViewMemoryAt(cpu.GetRegister("ip"));
    cpu.ViewMemoryAt(0x0100);
});