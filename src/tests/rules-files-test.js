const { parseRulesFile, parseTerm } = require('../api');
const { simplify } = require('../solver');

const termString = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}


try {
    const term = parseTerm(termString());
    parseRulesFile('rules/test.rules', rules => {
        simplify(term, rules);
    });
} catch (e) {
    console.error(e);
}