const instructionParser = require("./Instructions");
const A = require("arcsecond");
const {data8, data16} = require("./Data");
const constantParser = require("./Constant");
const {label} = require("./Common");
const structureParser = require("./Structures");

module.exports = A.many(A.choice([
    data8,
    data16,
    structureParser,
    constantParser,
    instructionParser,
    label
])).chain(res => A.endOfInput.map(() => res));