const readline = require('readline');
const CreateMemory = require("./CreateMemory");
const CPU = require("./CPU");
const INSTRUCTIONS = require("./Instructions");
const MemoryMapper = require("./MemoryMapper");
const CreateScreenOutput = require("./ScreenOutput");
const SCREENCOMMANDS = require("./ScreenOutputCommands");

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

const MM = new MemoryMapper();

const memory = CreateMemory(256 * 256);
MM.Map(memory, 0, 0xffff);

// Map 0xff bytes to output device
MM.Map(CreateScreenOutput(), 0x1000, 0x10ff, true);

const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(MM);
let i = 0;

const PrintChar = (char, position, command = 0x00) => {
    writableBytes[i++] = INSTRUCTIONS.MOV_LIT_REG;
    writableBytes[i++] = command;
    writableBytes[i++] = char.charCodeAt(0);
    writableBytes[i++] = R1;

    writableBytes[i++] = INSTRUCTIONS.MOV_REG_MEM;
    writableBytes[i++] = R1;
    writableBytes[i++] = 0x10;
    writableBytes[i++] = position;
};

PrintChar(" ", 0, SCREENCOMMANDS.CLRSCR);

for (let index = 0; index <= 0xff; index++) {
    const command = index % 2 === 0 ? SCREENCOMMANDS.BKGCYA : SCREENCOMMANDS.BKGBGR;
    PrintChar("*", index, command);
}

writableBytes[i++] = INSTRUCTIONS.HLT;
cpu.Run();