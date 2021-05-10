const { parseRulesFile, parseLatexTerm, parseTerm, processTermWithRules } = require('../api');
const { simplify, processTerm } = require('../solver');

const termString = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}


try {
    //const s = '\\left(\\frac{4 n^{\\frac{2}{3}}}{\\left(-n^{-4}\\right)\\left(n^{-\\frac{1}{3}}\\right)}\\right)^{-2}';
    //const s = 'y\\ =3\\left(\\frac{1}{2}\\right)^{x\\ }+\\ 4'
    //const s = 'y\\ =3\\left(\\frac{1}{2}\\right)^{x\\ }-\\ 4'
    //const s = 'y\\ =-3\\cdot\\left(\\frac{1}{2}\\right)^{x\\ }'
    const s = 'y\\ =\\ -\\frac{1}{2}\\cdot6^{x+9}\\ -\\ 5'
    const term = parseLatexTerm(s);
    console.log(term.toTermString());
} catch (e) {
    console.error(e);
}

