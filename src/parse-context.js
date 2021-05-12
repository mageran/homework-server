const Terms = require('./term');
const { parse } = require('./parser/term-parser');
const { parseLatexTerm } = require('./api');
/**
 * context used during parsing of a term
 */
class ParseContext {

    constructor(variableCounter = 0) {
        this.variableMap = {};
        this.variableCounter = variableCounter;
        this.useSingleCharacterIdentifiers = true;
    }

    getNextVariableId() {
        const cnt = this.variableCounter;
        this.variableCounter++;
        return cnt;
    }

    findVariableInContext(id, asNumberVariable, asListVariable) {
        var varObj = this.variableMap[id];
        if (!varObj) {
            let Cls = asNumberVariable ? Terms.NumberVariable
                : asListVariable ? Terms.ListVariable : Terms.Variable;
            varObj = new Cls(id, this.getNextVariableId());
            this.variableMap[id] = varObj;
        }
        return varObj;
    }

    getVariables() {
        return Object.values(this.variableMap);
    }

    hasVariables() {
        return Object.keys(this.variableMap).length > 0;
    }

    showVariables() {
        this.getVariables().forEach(varObj => {
            console.log(`${varObj.name} => ${varObj.getInstantiatedTerm().toTermString()}`);
        })

    }

    static parseTerm(inputString) {
        return new ParseContext().parseTerm(inputString);
    }

    parseTerm(inputString) {
        const term = parse(inputString, this);
        return term;
    }

    parseLatexTerm(inputString) {
        const term = parseLatexTerm(inputString, this);
        return term;
    }

}

module.exports = ParseContext;