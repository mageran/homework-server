
var roundCounter = 0

const _simplify = (term, rules, applyEval = true) => {
    //console.log(`rules: ${JSON.stringify(rules)}`);
    console.log(`====================================`);
    console.log(`           Round ${++roundCounter}`);
    console.log(`====================================`);
    const _applyRules = (t0, rules) => {
        console.log(`term: ${t0.toTermString()}`)
        const info = rules.reduce(({ matchResult, term }, rule) => {
            const info = term.applyRule(rule);
            const mres = matchResult || info.matchResult;
            if (info.matchResult) {
                console.log(`input term: ${term.toTermString()}`)
                console.log(`--> rule match: ${rule.toTermString()}`);
                console.log(`--> new term: ${info.substTerm.toTermString()}`);
            }
            return { matchResult: mres, term: info.substTerm };
        }, { matchResult: false, term: t0 });
        return info;
    }
    const info = _applyRules(term, rules);
    console.log(`matchResult after applying all rules: ${info.matchResult}`);
    console.log(`resulting term: ${info.term.toTermString()}`);
    if (info.matchResult) {
        const t = applyEval ? info.term.$eval() : info.term;
        return _simplify(t, rules);
    }
    return applyEval ? info.term.$eval() : info.term;
}

const simplify = (term, rules, applyEval = true) => {
    const resultingTerm = _simplify(term, rules, applyEval);
    console.log(`================== RESULT ===============`);
    console.log(resultingTerm.toTermString());
    console.log(JSON.stringify(term.getVariableSubstitutions(true), null, 2));
    return resultingTerm;
}

const processTerm = (term, rules, applyEval = true, asJson = true) => {
    const t = applyEval ? term.$eval() : term;
    const res = t.applyRules(rules);
    const substMap = term.getVariableSubstitutions(asJson);
    //console.log(JSON.stringify(substMap, null, 2));
    return substMap;
}

module.exports = {
    simplify,
    processTerm
}