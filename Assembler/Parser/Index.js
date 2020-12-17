const instructionParser = require("./Instructions");
const A = require("arcsecond");
const {label} = require("./Common")

module.exports = A.many(A.choice([
    instructionParser,
    label
]));