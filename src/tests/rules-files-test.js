const { parseFile, parseTerm } = require('../api');
const { simplify } = require('../solver');

const termString = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}


try {
    const term = parseTerm(termString());
    parseFile('rules/test.rules', rules => {
        simplify(term, rules);
    });
} catch (e) {
    console.error(e);
}