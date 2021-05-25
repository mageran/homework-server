const { parse } = require('../parser/term-parser');
const Terms = require('../term');
const ParseContext = require('../parse-context');

const { _M } = require('../lib/base');


const termString1 = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}

const termString2 = () => {
    if (process.argv.length > 3) {
        return process.argv[3];
    }
    throw 'no second command line term given'
}

const _parseTermOrLatex = s => {
    const context = new ParseContext();
    var term = null;
    try {
        term = context.parseTerm(s);
    } catch (err) {

    }
    if (!term) {
        try {
            term = context.parseLatexTerm(s);
        } catch (err) {

        }
    }
    if (!term) {
        throw `can't parse ${s}`;
    }
    return term;
}

try {
    const inputTerm = _parseTermOrLatex(termString1());
    const patternTerm = _parseTermOrLatex(termString2());
    const _v = {};
    console.log(`matching ${patternTerm} with ${inputTerm}...`)
    const success = _M(patternTerm.toTermString(), inputTerm, _v);
    console.log(`match success: ${success}`);
    if (success) {
        Object.keys(_v).forEach(vname => {
            const t = _v[vname];
            console.log(`${vname}: ${t}`);
        })
    }
} catch (e) {
    console.error(e);
}