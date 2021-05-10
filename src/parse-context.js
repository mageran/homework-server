const Terms = require('./term');

/**
 * context used during parsing a term
 */
class ParseContext {

    constructor(variableCounter = 0) {
        this.variableMap = {};
        this.variableCounter = variableCounter;
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

}

module.exports = ParseContext;