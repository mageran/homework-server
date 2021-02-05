

const simplify = (term, rules) => {
    //console.log(`rules: ${JSON.stringify(rules)}`);
    const _applyRules = (t0, rules) => {
        const info = rules.reduce(({ matchResult, term }, rule) => {
            const info = term.applyRule(rule);
            const mres = matchResult || info.matchResult;
            return { matchResult: mres, term: info.substTerm };
        }, { matchResult: false, term: t0 });
        return info;
    }
    const info = _applyRules(term, rules);
    console.log(`matchResult after applying all rules: ${info.matchResult}`);
    console.log(`resulting term: ${info.term.toTermString()}`);
    if (info.matchResult) {
        return simplify(info.term.$eval(), rules);
    }
    return info.term.$eval();
}

module.exports = {
    simplify
}