const COMMANDS = require("./ScreenOutputCommands");

const MoveTo = (x, y) => {
    process.stdout.write(`\x1b[${y};${x}H`);
};

const EvaluateCommand = (command) => {
    switch (command) {
        case COMMANDS.CLRSCR:
            process.stdout.write("\x1b[2J");
            break;
    
        case COMMANDS.TXTDEF:
            process.stdout.write("\x1b[0m");
            break;

        case COMMANDS.TXTBLD:
            process.stdout.write("\x1b[1m");
            break;

        case COMMANDS.TXTITC:
            process.stdout.write("\x1b[3m");
            break;
        
        case COMMANDS.TXTUNL:
            process.stdout.write("\x1b[4m");
            break;

        case COMMANDS.FNTDEF:
            process.stdout.write("\x1b[10m");
            break;

        case COMMANDS.FNTTWO:
            process.stdout.write("\x1b[11m");
            break;
        
        case COMMANDS.FNTTHR:
            process.stdout.write("\x1b[12m");
            break;
        
        case COMMANDS.FNTFOR:
            process.stdout.write("\x1b[13m");
            break;

        case COMMANDS.FNTFIV:
            process.stdout.write("\x1b[14m");
            break;

        case COMMANDS.FNTSIX:
            process.stdout.write("\x1b[15m");
            break;

        case COMMANDS.FRGBLK:
            process.stdout.write("\x1b[30m");
            break;

        case COMMANDS.FRGRED:
            process.stdout.write("\x1b[31m");
            break;

        case COMMANDS.FRGGRN:
            process.stdout.write("\x1b[32m");
            break;
        
        case COMMANDS.FRGYEL:
            process.stdout.write("\x1b[33m");
            break;
        
        case COMMANDS.FRGBLU:
            process.stdout.write("\x1b[34m");
            break;

        case COMMANDS.FRGMAG:
            process.stdout.write("\x1b[35m");
            break;

        case COMMANDS.FRGCYA:
            process.stdout.write("\x1b[36m");
            break;

        case COMMANDS.FRGWHI:
            process.stdout.write("\x1b[37m");
            break;

        case COMMANDS.FRGGRY:
            process.stdout.write("\x1b[90m");
            break;
            
        case COMMANDS.FRGBRD:
            process.stdout.write("\x1b[91m");
            break;

        case COMMANDS.FRGBGR:
            process.stdout.write("\x1b[92m");
            break;

        case COMMANDS.FRGBYE:
            process.stdout.write("\x1b[93m");
            break;

        case COMMANDS.FRGBBL:
            process.stdout.write("\x1b[94m");
            break;
        
        case COMMANDS.FRGBMA:
            process.stdout.write("\x1b[95m");
            break;

        case COMMANDS.FRGBCY:
            process.stdout.write("\x1b[96m");
            break;

        case COMMANDS.FRGBWH:
            process.stdout.write("\x1b[97m");
            break;

        case COMMANDS.BKGBLK:
            process.stdout.write("\x1b[40m");
            break;

        case COMMANDS.BKGRED:
            process.stdout.write("\x1b[41m");
            break;

        case COMMANDS.BKGGRN:
            process.stdout.write("\x1b[42m");
            break;
        
        case COMMANDS.BKGYEL:
            process.stdout.write("\x1b[43m");
            break;
        
        case COMMANDS.BKGBLU:
            process.stdout.write("\x1b[44m");
            break;

        case COMMANDS.BKGMAG:
            process.stdout.write("\x1b[45m");
            break;

        case COMMANDS.BKGCYA:
            process.stdout.write("\x1b[46m");
            break;

        case COMMANDS.BKGWHI:
            process.stdout.write("\x1b[47m");
            break;

        case COMMANDS.BKGGRY:
            process.stdout.write("\x1b[100m");
            break;

        case COMMANDS.BKGBRD:
            process.stdout.write("\x1b[101m");
            break;

        case COMMANDS.BKGBGR:
            process.stdout.write("\x1b[102m");
            break;

        case COMMANDS.BKGBYE:
            process.stdout.write("\x1b[103m");
            break;

        case COMMANDS.BKGBBL:
            process.stdout.write("\x1b[104m");
            break;
        
        case COMMANDS.BKGBMA:
            process.stdout.write("\x1b[105m");
            break;

        case COMMANDS.BKGBCY:
            process.stdout.write("\x1b[106m");
            break;

        case COMMANDS.BKGBWH:
            process.stdout.write("\x1b[107m");
            break;

        default:
            break;
    }
};

const CreateScreenOutput = () => {
    return {
        getUint8: () => 0,
        getUint16: () => 0,
        setUint16: (address, data) => {
            const command = (data & 0xff00) >> 8;
            const characterValue = data & 0x00ff;

            if (command !== 0x00) {
                EvaluateCommand(command);
            }

            const x = (address % 16) + 1;
            const y = Math.floor(address / 16) + 1;
            MoveTo(x * 2, y);

            const character = String.fromCharCode(characterValue);
            process.stdout.write(character);
        }
    }
};

module.exports = CreateScreenOutput;