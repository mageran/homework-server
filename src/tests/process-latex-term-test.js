const { parseFile, parseLatexTerm } = require('../api');
const { simplify } = require('../solver');

const termString = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}


try {
    //const s = '\\left(\\frac{4 n^{\\frac{2}{3}}}{\\left(-n^{-4}\\right)\\left(n^{-\\frac{1}{3}}\\right)}\\right)^{-2}';
    const s = '\\left(4 n^{\\frac{2}{3}}\\right)^{-2}'
    const term = parseLatexTerm(s);
    console.log(term.toTermString());
    parseFile('rules/exponent.rules', rules => {
        simplify(term, rules);
    });
} catch (e) {
    console.error(e);
}