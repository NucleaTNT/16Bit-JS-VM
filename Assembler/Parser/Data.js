const A = require("arcsecond");
const {
    validIdentifier,
    hexLiteral,
    commaSeparated
} = require("./Common");
const T = require("./Types");

const dataParser = size => A.coroutine(function* () {
    const isExport = Boolean(yield A.possibly(A.char("+")));
    yield A.str(`data${size}`);

    yield A.whitespace;
    const name = yield validIdentifier;
    yield A.whitespace;
    yield A.char("=");
    yield A.whitespace;
    yield A.char("{");
    yield A.optionalWhitespace;

    const values = yield commaSeparated(hexLiteral);

    yield A.optionalWhitespace;
    yield A.char("}");
    yield A.optionalWhitespace;
    
    return T.data({
        size,
        isExport,
        name,
        values
    });
});

module.exports = {
    data8: dataParser(8),
    data16: dataParser(16),
}