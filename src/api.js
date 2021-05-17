const Terms = require('./term');
const readline = require('readline');
const fs = require('fs');
const TermParser = require('./parser/term-parser');
const LatexParser = require('./parser/latex-formula-grammar');
const { processAst } = require('./ast');
const { processTerm } = require('./solver');


const parseRulesAndTerms = (termsString, context) => {
    const { parse } = TermParser;
    return _parseInternal(termsString, parse, context);
}

const parseLatexTerm = (latexTerm, context) => {
    const { parse } = LatexParser;
    const lterm = latexTerm
        .replace(/\\ /g, ' ')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '')
        .replace(/\\cdot/g,'*');
    console.log(lterm);
    const ast = _parseInternal(lterm, parse, context);
    return processAst(ast);
}

const _parseInternal = (string, parse, contextIn) => {
    try {
        const context = contextIn;
        const termsAndRules = parse(string, context);
        return termsAndRules;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

const parseTerm = parseRulesAndTerms;
const parseRule = parseRulesAndTerms;
const parseRules = rulesString => {
    const rules = parseRulesAndTerms(rulesString);
    if (!Array.isArray(rules)) {
        return [rules];
    }
    return rules;
}

const parseRulesFile = (fileName, cb) => {
    const lines = [];
    const readInterface = readline.createInterface({
        input: fs.createReadStream(fileName),
        output: null,
        console: false
    });
    readInterface.on('line', line => {
        if (!line.match(/^\s*\/\//)) {
            //console.log(line);
            lines.push(line);
        }
    })
    readInterface.on('close', () => {
        const content = lines.join('\n');
        const rules = parseRules(content);
        rules.forEach(rule => {
            console.log(`rule: ${rule.toTermString()}`);
        })
        if (typeof cb === 'function') {
            cb(rules);
        }
    })
}

const findFunctorClass = functor => {
    const fclass = Object.keys(Terms).filter(
        className => className.toLowerCase() === functor 
                    && (typeof Terms[className] === 'function')
        ).map(className => Terms[className])[0];
    if (!fclass) {
        //throw `no functor class found for ${functor}`;
        return null;
    }
    return fclass;
}

const constructFunctorTerm = (functor, allTerms) => {
    var fclass = findFunctorClass(functor);
    if (fclass) {
        return new fclass(allTerms);
    }
    const functorId = new Terms.Identifier(functor);
    return new Terms.Functor([functorId, ...allTerms]);
}

/**
 * reads the rules in rulesFile and processes the term
 * @param {*} rulesFile 
 * @param {*} term 
 */
const processTermWithRules = (term, rulesFile, functor = null, resultVariable = null, resultCallback) => {
    const rfile = `rules/${rulesFile}.rules`;
    const opterms = [term];
    if (resultVariable) {
        opterms.push(new Terms.Variable(resultVariable));
    }
    const inputTerm = functor ? constructFunctorTerm(functor, opterms) : term;
    parseRulesFile(rfile, rules => {
        const substMap = processTerm(inputTerm, rules, true, false);
        if (typeof resultCallback === 'function') {
            resultCallback(substMap);
        }
    });
}

const processTermWithRulesString = (term, rulesString, functor = null, resultVariable = null) => {
    const opterms = [term];
    if (resultVariable) {
        opterms.push(new Terms.Variable(resultVariable));
    }
    const inputTerm = functor ? constructFunctorTerm(functor, opterms) : term;
    const rules = parseRules(rulesString);
    const substMap = processTerm(inputTerm, rules, true, false);
    return substMap;
}

const processLatexWithRules = (latex, rulesFile, functor = null, resultVariable = null, resultCallback) => {
    const term = parseLatexTerm(latex);
    processTermWithRules(term, rulesFile, functor, resultVariable, resultCallback);
}

module.exports = {
    parseRulesAndTerms,
    parseTerm,
    parseRule,
    parseRules,
    parseRulesFile,
    parseLatexTerm,
    processTermWithRules,
    processTermWithRulesString,
    processLatexWithRules
}