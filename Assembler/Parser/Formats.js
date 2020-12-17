const A = require("arcsecond");
const T = require("./Types");
const {
    register,
    address,
    hexLiteral,
    upperOrLowerStr,
} = require("./Common");
const {squareBracketExpr} = require("./Expressions");

const litReg = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const lit = yield A.choice([
        hexLiteral,
        squareBracketExpr,
    ]);

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const r1 = yield register;

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [lit, r1]
    });
});

const regLit = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const r1 = yield register;

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const lit = yield A.choice([
        hexLiteral,
        squareBracketExpr,
    ]);

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [r1, lit]
    });
});

const regReg = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const r1 = yield register;

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const r2 = yield register;

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [r1, r2]
    });
});

const regMem = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const r1 = yield register;

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const addr = yield A.choice([
        address,
        A.char("&").chain(() => squareBracketExpr)
    ]);

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [r1, addr]
    });
});

const memReg = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const addr = yield A.choice([
        address,
        A.char("&").chain(() => squareBracketExpr)
    ]);

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const r1 = yield register;

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [addr, r1]
    });
});

const litMem = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const lit = yield A.choice([
        hexLiteral,
        squareBracketExpr,
    ]);

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const addr = yield A.choice([
        address,
        A.char("&").chain(() => squareBracketExpr)
    ]);

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [lit, addr]
    });
});

const regPtrReg = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const r1 = yield A.char("&").chain(() => register);

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const r2 = yield register;

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [r1, r2]
    });
});

const litOffReg = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const lit = yield A.choice([
        hexLiteral,
        squareBracketExpr,
    ]);

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const r1 = yield A.char("&").chain(() => register);

    yield A.optionalWhitespace;
    yield A.char(",");
    yield A.optionalWhitespace;

    const r2 = yield register;

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [lit, r1, r2]
    });
});

const noArgs = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.optionalWhitespace;

    return T.instruction ({
        instruction: type,
        args: []
    });
});

const singleReg = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const r1 = yield register;

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [r1]
    });
});

const singleLit = (mnemonic, type) => A.coroutine(function* () {
    yield upperOrLowerStr(mnemonic);
    yield A.whitespace;

    const lit = yield A.choice([
        hexLiteral,
        squareBracketExpr,
    ]);

    yield A.optionalWhitespace;
    return T.instruction ({
        instruction: type,
        args: [lit]
    });
});

module.exports = {
    litReg,
    regLit,
    regReg,
    regMem,
    memReg,
    litMem,
    regPtrReg,
    litOffReg,
    noArgs,
    singleReg,
    singleLit
}