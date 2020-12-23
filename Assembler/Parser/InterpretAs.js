const A = require("arcsecond");
const {validIdentifier} = require("./Common");
const T = require("./Types");

const interpretAs = A.coroutine(function* () {
    yield A.char("<");
    const structure = yield validIdentifier;
    yield A.char(">");

    yield A.optionalWhitespace;
    const symbol = yield validIdentifier;
    yield A.char(".");
    const property = yield validIdentifier;
    yield A.optionalWhitespace;

    return T.interpretAs({
        structure,
        symbol,
        property
    });
});

module.exports = interpretAs;