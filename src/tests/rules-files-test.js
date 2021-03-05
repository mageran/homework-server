const { parseRulesFile, parseTerm } = require('../api');
const { processTerm } = require('../solver');

const termString = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}


try {
    const term = parseTerm(termString());
    parseRulesFile('rules/test.rules', rules => {
        processTerm(term, rules);
    });
} catch (e) {
    console.error(e);
}