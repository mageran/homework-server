const { parse } = require('../parser/term-parser');
const Terms = require('../term');
const ParseContext = require('../parse-context');
const { _d } = require('../utils');
const { flattenOperands, evalArithmetic, sortProductTerms, getSumTerms, getVarNames, substitute, basicEval } = require('../lib/base.js');

const termString = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}

try {
    //const s = 'power(fraction(6,product(sum(0,uminus(power(n,sum(0,uminus(4))))),power(n,sum(0,fraction(uminus(1),3))))),abs(sum(0,uminus(2))))';
    //var s = 'power(fraction(6,product(sum(0,uminus(power(n,sum(0,X)))),power(X,sum(_,fraction(uminus(1),3))))),abs(sum(0,uminus(2))))';
    const s = termString();
    console.log(s);
    const context = new ParseContext();
    var term = null;
    try {
        term = context.parseTerm(s);
    } catch(err) {

    }
    if (!term) {
        try {
            term = context.parseLatexTerm(s);
        } catch (err) {

        }
    }
    if (!term) {
        console.error(`input string could not be parsed as latex or term`);
    }
    console.log(term.toTermString())
    console.log(term.latex);

    /*
    term.traverse(t => {
        console.log(`term: ${t.toTermString()},
        parentTerm: ${t.parentTerm && t.parentTerm.toTermString()},
        position in parent term: ${t.positionInParentTerm}`);
    })
    */


    const cterm = term
    ._(flattenOperands)
    ._(evalArithmetic)
    ._(sortProductTerms)

    //console.log(`resulting term: ${cterm.toTermString()}`);
    console.log(`resulting term: ${cterm.toTermString()}, latex: ${cterm.latex}`);

    const sumTerms = getSumTerms(cterm);
    sumTerms.forEach(t => {
        const varnames = getVarNames(t);
        console.log(`${t}: ${varnames}`);
    })

    const numx = _d(1);
    var sterm = substitute(cterm, 'x', new Terms.Num(numx));
    console.log(`substitute 'x' with ${numx}: ${sterm}`);
    console.log(`evaluated: ${basicEval(sterm)}`);

    const numy = _d(1);
    sterm = substitute(sterm, 'y', new Terms.Num(numy));
    console.log(`substitute 'y' with ${numy}: ${sterm}`);
    console.log(`evaluated: ${basicEval(sterm)}`);


} catch (e) {
    console.error(e);
}