const A = require("arcsecond");
const {
    validIdentifier,
    hexLiteral
} = require("./Common");
const T = require("./Types");

const constantParser = A.coroutine(function* () {
    const isExport = Boolean(yield A.possibly(A.char("+")));
    yield A.str("constant");
    yield A.whitespace;
    const name = yield validIdentifier;
    yield A.whitespace;
    yield A.char("=");
    yield A.whitespace;
    const value = yield hexLiteral;
    yield A.optionalWhitespace;

    return T.constant({
        isExport,
        name,
        value
    });
});

module.exports = constantParser;