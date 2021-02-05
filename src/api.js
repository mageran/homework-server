const Terms = require('./term');
const ParseContext = require('./parse-context');
const readline = require('readline');
const fs = require('fs');
const TermParser = require('./parser/term-parser');
const LatexParser = require('./parser/latex-formula-grammar');
const { processAst } = require('./ast');


const parseRulesAndTerms = termsString => {
    const { parse } = TermParser;
    return _parseInternal(termsString, parse);
}

const parseLatexTerm = latexTerm => {
    const { parse } = LatexParser;
    const lterm = latexTerm
        .replace(/\\ /g, ' ')
        .replace(/\\left/g, '')
        .replace(/\\right/g, '');
    console.log(lterm);
    const ast = _parseInternal(lterm, parse);
    return processAst(ast);
}

const _parseInternal = (string, parse) => {
    try {
        const context = new ParseContext();
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

const parseFile = (fileName, cb) => {
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
            //console.log(`rule: ${rule.toTermString()}`);
        })
        if (typeof cb === 'function') {
            cb(rules);
        }
    })
}

module.exports = {
    parseRulesAndTerms,
    parseTerm,
    parseRule,
    parseRules,
    parseFile,
    parseLatexTerm
}