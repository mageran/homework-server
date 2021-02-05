const { parse } = require('../parser/term-parser');
const Terms = require('../term');
const ParseContext = require('../parse-context');

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

try {
    //const s = 'power(fraction(6,product(sum(0,uminus(power(n,sum(0,uminus(4))))),power(n,sum(0,fraction(uminus(1),3))))),sum(0,uminus(2)))';
    //const s = 'sum(x,y)';
    const s = termString1();
    //const t = 'power(fraction(X,Y),Z)';
    const t = termString2();
    const context_s = new ParseContext();
    const context_t = new ParseContext();
    const term_s = parse(s, context_s );
    const term_t = parse(t, context_t );
    const m = term_s.pmatch(term_t);
    console.log(`match result: ${m}`)
    if (context_t.hasVariables()) {
        context_t.showVariables();
        //term_t.reset();
    }
} catch (e) {
    console.error(e);
}