const { parse } = require('../parser/term-parser');
const Terms = require('../term');
const ParseContext = require('../parse-context');

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
    const term = parse(s, context );
    console.log(`original: ${term.toTermString()}`);
    console.log(`cloned:   ${term.clone().toTermString()}`);
} catch (e) {
    console.error(e);
}