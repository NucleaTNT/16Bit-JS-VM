const colors = [
    [0x00, 0x00, 0x00, 0],
    [0xff, 0x00, 0x00, 1],
    [0xff, 0x80, 0x00, 1],
    [0xff, 0xff, 0x00, 1],
    [0x80, 0xff, 0x00, 1],
    [0x00, 0xff, 0x00, 1],
    [0x00, 0xff, 0x80, 1],
    [0x00, 0xff, 0xff, 1],
    [0x00, 0x80, 0xff, 1],
    [0x00, 0x00, 0xff, 1],
    [0x7f, 0x00, 0xff, 1],
    [0xff, 0x00, 0xff, 1],
    [0xff, 0x00, 0x7f, 1],
    [0x80, 0x80, 0x80, 1],
    [0xff, 0xff, 0xff, 1],
    [0x00, 0x00, 0x00, 1],
];

const TILE_WIDTH = 30;
const TILE_HEIGHT = 14;
const PIXELS_PER_TILE = 8;
const SCALE_FACTOR = 6;

const CANVAS_WIDTH = TILE_WIDTH * PIXELS_PER_TILE * SCALE_FACTOR;
const CANVAS_HEIGHT = TILE_HEIGHT * PIXELS_PER_TILE * SCALE_FACTOR;
const CANVAS = document.getElementById("screen");

CANVAS.width = CANVAS_WIDTH;
CANVAS.height = CANVAS_HEIGHT;

const CTX = CANVAS.getContext("2d");

const color = ([r, g, b, a]) => CTX.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
const drawPixel = (x, y, c) => {
    color(c);
    CTX.fillRect(x * SCALE_FACTOR, y * SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
}

// for (let y = 0; y < TILE_HEIGHT * PIXELS_PER_TILE; y++) {
//     for (let x = 0; x < TILE_WIDTH * PIXELS_PER_TILE; x++) {
//         const index = x / y ** 0.5 & 0xf;
//         drawPixel(x, y, colors[index]);
//     }
// }

const tile = [
    0x00, 0x11, 0x22, 0x33,
    0x00, 0x11, 0x22, 0x33,
    0x44, 0x55, 0x66, 0x77,
    0x44, 0x55, 0x66, 0x77,
    0x88, 0x99, 0xaa, 0xbb,
    0x88, 0x99, 0xaa, 0xbb,
    0xcc, 0xdd, 0xee, 0xff,
    0xcc, 0xdd, 0xee, 0xff,
];

const drawTile = (x, y, tileData) => {
    for (let yOff = 0; yOff < PIXELS_PER_TILE; yOff++) {
        for (let xOff = 0; xOff < PIXELS_PER_TILE; xOff += 2) {
            const index = (yOff * PIXELS_PER_TILE + xOff) / 2
            const byte = tileData[index];

            const c1 = colors[byte >> 4];
            const c2 = colors[byte & 0xf];

            drawPixel(x + xOff, y + yOff, c1);
            drawPixel(x + xOff + 1, y + yOff, c2);
        }
    }
}

// drawTile(0, 0, tile);

const blackTile = Array.from({length: 32}, () => 0xff);
const yellowTile = Array.from({length: 32}, () => 0x33);

const position = {x: 0, y: 0};

const draw = () => {
    color([255, 255, 255, 1]);
    CTX.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let y = 0; y < TILE_HEIGHT; y++) {
        for (let x = 0; x < TILE_WIDTH; x++) {
            if ((x + y) % 2 === 0) {
                drawTile(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, blackTile);
            } else {
                drawTile(x * PIXELS_PER_TILE, y * PIXELS_PER_TILE, yellowTile);
            }
        }
    }

    position.x = (position.x + 1) % (TILE_WIDTH * PIXELS_PER_TILE);
    position.y = (position.y + 1) % (TILE_HEIGHT * PIXELS_PER_TILE);
    drawTile(position.x, position.y, tile);

    requestAnimationFrame(draw);
}

draw();