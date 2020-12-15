const readline = require('readline');
const CreateMemory = require("./CreateMemory");
const CPU = require("./CPU");
const INSTRUCTIONS = require("./Instructions");
const { read } = require('fs');

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;
const R3 = 4;
const R4 = 5;
const R5 = 6;
const R6 = 7;
const R7 = 8;
const R8 = 9;

const memory = CreateMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

const subroutineAddress = 0x559a;
let i = 0;

const cpu = new CPU(memory);

writableBytes[i++] = INSTRUCTIONS.PSH_LIT;
writableBytes[i++] = 0x11;
writableBytes[i++] = 0x22;

writableBytes[i++] = INSTRUCTIONS.PSH_LIT;
writableBytes[i++] = 0x33;
writableBytes[i++] = 0x44;

writableBytes[i++] = INSTRUCTIONS.PSH_LIT;
writableBytes[i++] = 0xab;
writableBytes[i++] = 0xef;

writableBytes[i++] = INSTRUCTIONS.MOV_LIT_REG;
writableBytes[i++] = 0xde;
writableBytes[i++] = 0xed;
writableBytes[i++] = R7;

writableBytes[i++] = INSTRUCTIONS.MOV_LIT_REG;
writableBytes[i++] = 0xbe;
writableBytes[i++] = 0xef;
writableBytes[i++] = R5;

writableBytes[i++] = INSTRUCTIONS.PSH_LIT;  // Number of args
writableBytes[i++] = 0x00;
writableBytes[i++] = 0x00;

writableBytes[i++] = INSTRUCTIONS.CAL_LIT;
writableBytes[i++] = (subroutineAddress & 0xff00) >> 8; // Isolate first two bytes of address
writableBytes[i++] = (subroutineAddress & 0x00ff);      // Isolate last two bytes of address

writableBytes[i++] = INSTRUCTIONS.PSH_LIT;
writableBytes[i++] = 0x44;
writableBytes[i++] = 0x44;

// Subroutine
i = subroutineAddress;

writableBytes[i++] = INSTRUCTIONS.PSH_LIT;
writableBytes[i++] = 0x89;
writableBytes[i++] = 0xab;

writableBytes[i++] = INSTRUCTIONS.PSH_LIT;
writableBytes[i++] = 0xcd;
writableBytes[i++] = 0xef;

writableBytes[i++] = INSTRUCTIONS.MOV_LIT_REG;
writableBytes[i++] = 0x11;
writableBytes[i++] = 0x00;
writableBytes[i++] = R7;

writableBytes[i++] = INSTRUCTIONS.MOV_LIT_REG;
writableBytes[i++] = 0xab;
writableBytes[i++] = 0xef;
writableBytes[i++] = R3;

writableBytes[i++] = INSTRUCTIONS.RET;


cpu.Debug();
cpu.ViewMemoryAt(cpu.GetRegister("ip"));
cpu.ViewMemoryAt(0xffff - 1 - 42, 44);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', () => {
    cpu.Step();
    cpu.Debug();
    cpu.ViewMemoryAt(cpu.GetRegister("ip"));
    cpu.ViewMemoryAt(0xffff - 1 - 42, 44);
});