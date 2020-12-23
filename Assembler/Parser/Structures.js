const A = require("arcsecond");
const {
    validIdentifier,
    commaSeparated,
    keyValuePair
} = require("./Common");
const T = require("./Types");

const structureParser = A.coroutine(function* () {
    const isExport = Boolean(yield A.possibly(A.char("+")));

    yield A.str("structure");
    yield A.whitespace;
    const name = yield validIdentifier;
    yield A.whitespace;
    yield A.char("{");
    yield A.whitespace;

    const members = yield commaSeparated(keyValuePair);

    yield A.optionalWhitespace;
    yield A.char("}");
    yield A.optionalWhitespace;

    return T.structure({
        isExport,
        name,
        members
    });
});

module.exports = structureParser;