const CreateMemory = require("./CreateMemory");
const CPU = require("./CPU");
const INSTRUCTIONS = require("./Instructions");

const memory = CreateMemory(256);
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

writableBytes[0] = INSTRUCTIONS.MOVL_R1;
writableBytes[1] = 0x11;    // 0x1122
writableBytes[2] = 0x22;

writableBytes[3] = INSTRUCTIONS.MOVL_R2;
writableBytes[4] = 0x33;    // 0x3344
writableBytes[5] = 0x44;

writableBytes[6] = INSTRUCTIONS.ADDRR;
writableBytes[7] = 2;       // r1 index 
writableBytes[8] = 3;       // r2 index

cpu.Debug();

cpu.Step();     // Move literal 0x1122 into r1
cpu.Debug();

cpu.Step();     // Move literal 0x3344 into r2
cpu.Debug();

cpu.Step();     // Add r1 and r2
cpu.Debug();