const { parse } = require('../parser/term-parser');
const Terms = require('../term');
const ParseContext = require('../parse-context');

const termString = () => {
    if (process.argv.length > 2) {
        return process.argv[2];
    }
    throw 'no command line term given'
}

const ruleString = () => {
    if (process.argv.length > 3) {
        return process.argv[3];
    }
    throw 'no second command line term given'
}

try {
    const termContext = new ParseContext();
    const ruleContext = new ParseContext();
    const term = parse(termString(), termContext);
    if (term.isRule()) {
        console.error("first term should be a regular term (not a rule)");
        return;
    }
    const rule = parse(ruleString(), ruleContext);
    if (!rule.isRule()) {
        console.error('second term should be a rule of the form "term => term"');
        return;
    }
    const { matchResult, substTerm } = term.applyRule(rule);
    console.log(`match result: ${matchResult}`);
    if (matchResult) {
        console.log(`substTerm: ${substTerm.toTermString()}`);
    }
} catch (e) {
    console.error(e);
}