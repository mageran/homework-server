

const Decimal = require('./decimal');
const assert = require('assert');
const { processTermWithRules } = require('./api');
const { levelIndent, llog } = require('./utils');

class Term {

    constructor(operands) {
        this.operands = operands;
    }

    get className() {
        return this.constructor.name;
    }

    _assertOperandCount(num) {
        assert.ok(this.operands.length === num,
            `${this.className} constructor called with the wrong number of arguments: found ${this.operands.length}, expected: ${num}`);
    }

    _assertOperandCountGreaterEqualThan(num) {
        assert.ok(this.operands.length >= num,
            `${this.className} constructor called with too few arguments: found ${this.operands.length}, expected at least: ${num}`);
    }

    toTermString() {
        const { operands } = this;
        const functor = this.className.toLowerCase();
        return `${functor}(${operands.map(t => t.toTermString()).join(',')})`;
    }

    toJson() {
        const { operands } = this;
        return {
            functor: this.className.toLowerCase(),
            operands: operands.map(t => t.toJson())
        }
    }

    _isVariableMatch(term) {
        return term instanceof Variable;
    }

    _variableMatch(variableTerm) {
        assert.ok(variableTerm instanceof Variable, `_variableMatch called on ${variableTerm.className} instance`);
        if (variableTerm.isInstantiated()) {
            return this.match(variableTerm.getInstantiatedTerm());
        }
        return variableTerm.instantiate(this);
    }

    _functorMatch(term) {
        return this.className !== term.className;
    }

    match(term) {
        //console.log(`{ => try match: ${this.toTermString()} ~ ${term.toTermString()}...`);
        if (this._isVariableMatch(term)) {
            //console.log(`    => match succeeded (isVariableMatch): ${this.toTermString()} ~ ${term.toTermString()}!}`);
            return this._variableMatch(term);
        }
        if (this._functorMatch(term)) {
            //console.log(`    no match: functor names mismatch "${this.className}" != "${term.className}"}`);
            return false;
        }
        if (this.operands.length !== term.operands.length) {
            //console.log(`   no match: different number of operands: "${this.operands.length}" != "${term.operands.length}"}`);
            return false;
        }
        for (let i = 0; i < this.operands.length; i++) {
            let thisTerm = this.operands[i];
            let otherTerm = term.operands[i];
            if (thisTerm.match(otherTerm)) {
                continue;
            }
            //console.log(`    => match failed at operand #${i}: ${this.toTermString()} ~ ${term.toTermString()}}`);
            return false;
        }
        //console.log(`    => match succeeded: ${this.toTermString()} ~ ${term.toTermString()}!}`);
        return true;
    }

    pmatch(term) {
        if (this.match(term)) {
            return true;
        }
        this.reset();
        term.reset();
        for (let i = 0; i < this.operands.length; i++) {
            let t = this.operands[i];
            if (t.pmatch(term)) {
                console.log(`partialMatch succeeded for term ${t.toTermString()}`);
                return true;
            }
            t.reset();
            term.reset();
        }
        return false;
    }

    _applyRule(rule) {
        var matchResult = false;
        var substTerm = this;
        if (!rule.isRule()) {
            throw `trying to call applyRule with a term that's not a rule: ${rule.toTermString()}`;
        }
        rule = rule.clone();
        if (this.match(rule.lhs)) {
            try {
                substTerm = rule.rhs.substituteInstantiatedVariables().clone();
                console.log(`rule match succeeded:
            rule: ${rule.toTermString()}
            term: ${this.toTermString()}
            subst: ${substTerm.toTermString()}`);
                matchResult = true;
            } catch (error) {
                console.log(`rule match failed: ${error}`);
            }
        }
        if (!matchResult) {
            this.reset();
            rule.reset();
            if (this.operands && this.operands.length > 0) {
                let info = this.operands.reduce((substInfo, operandTerm) => {
                    let { matchResult, substTerm } = operandTerm.applyRule(rule);
                    let retValue = {
                        matchResult: substInfo.matchResult || matchResult,
                        substTerms: substInfo.substTerms.concat([substTerm])
                    };
                    return retValue;
                }, { matchResult, substTerms: [] });
                matchResult = matchResult || info.matchResult;
                const Cls = this.constructor;
                substTerm = new Cls(info.substTerms);
            }
        }
        return { matchResult, substTerm };
    }

    _getSeqTerms() {
        return [this];
    }

    applyRules(rules, level = 0) {
        const _applySingleRule = rule => {
            var matchTerm;
            var newTerms = null;
            rule = rule.clone();
            if (rule.isRule()) {
                matchTerm = rule.lhs;
                newTerms = rule.rhs._getSeqTerms();
            } else {
                matchTerm = rule;
            }
            matchTerm = matchTerm.substituteInstantiatedVariables();
            llog(level, `matchTerm: ${matchTerm.toTermString()}`);
            if (this.match(matchTerm)) {
                if (newTerms) {
                    const nterms = newTerms.map(t => t.substituteInstantiatedVariables());
                    for (let i = 0; i < nterms.length; i++) {
                        let nterm = nterms[i].substituteInstantiatedVariables();
                        llog(level, `processing level ${level + 1} subterm: ${nterm.toTermString()}...`);
                        let subres = nterm.applyRules(rules, level + 1);
                        if (!subres) {
                            llog(level, `match for term ${this.toTermString()} failed, because match for subterm ${nterm.toTermString()} failed.`);
                            matchTerm.reset();
                            return false;
                        }
                        llog(level, `==> ${this.substituteInstantiatedVariables().toTermString()}`)
                    }
                    llog(level, `matches for all subterms succeeded for ${this.toTermString()}.`);
                }
                return true;
            }
            matchTerm.reset();
            return false;
        };
        llog(level, `processing term ${this.toTermString()}...`);
        var ruleMatchOccurred = false;
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            llog(level, `trying rule ${rule.toTermString()}...`)
            let success = _applySingleRule(rule);
            if (success) {
                llog(level, `rule ${i} is a match.`);
                ruleMatchOccurred = true;
                break;
            } else {
                llog(level, `no match    ${rule.toTermString()}...`)
            }
        }
        return ruleMatchOccurred;
    }

    substituteInstantiatedVariables() {
        const substOperands = this.operands.map(t => t.substituteInstantiatedVariables());
        const Cls = this.constructor;
        return new Cls(substOperands);
    }

    _clone(ctxt) {
        const clonedOperands = this.operands.map(t => t._clone(ctxt));
        const Cls = this.constructor;
        return new Cls(clonedOperands);
    }

    clone() {
        const ParseContext = require('./parse-context');
        const ctxt = new ParseContext(100);
        return this._clone(ctxt);
    }


    getInstantiatedTerm() {
        return this;
    }

    _addVariableSubstitutions(substMap) {
        this.operands.forEach(t => t._addVariableSubstitutions(substMap))
    }

    getVariableSubstitutions(asJson = false) {
        const substMap = {};
        this._addVariableSubstitutions(substMap);
        if (asJson) {
            Object.keys(substMap).forEach(varname => {
                const term = substMap[varname].$eval();
                substMap[varname] = term.toJson();
            });
        }
        return substMap;
    }

    isRule() {
        return false;
    }

    isNum() {
        return false;
    }

    reset() {
        this.operands.forEach(t => t.reset());
    }

    _splitOperands(operands) {
        if (!operands) {
            operands = this.operands;
        }
        if (!Array.isArray(operands)) {
            return null;
        }
        const numOperands = operands.filter(t => t instanceof Num);
        const otherOperands = operands.filter(t => !(t instanceof Num));
        return { numOperands, otherOperands };
    }

    $evalOp(operands) {
        const Cls = this.constructor;
        return new Cls(operands);
    }

    $eval() {
        console.log(`$eval called on ${this.toTermString()}`);
        if (this.operands) {
            const evaledOperands = this.operands.map(t => t.$eval());
            return this.$evalOp(evaledOperands);
        }
        return this;
    }

    $gt(term) {
        //console.log(`$gt called on ${this.className} with argument ${term.className}`);
        const t0 = this.$eval();
        const t1 = term.$eval();
        //console.log(`after eval:   ${t0.value} with argument ${t1.value}`);
        if ((t0 instanceof Num) && (t1 instanceof Num)) {
            console.log(`${t0.value.greaterThan(t1.value)}`);
            return t0.value > t1.value ? TrueTerm : FalseTerm;
        }
        return FalseTerm;
    }

}

class Rule extends Term {

    constructor(operands) {
        super(operands);
        this._assertOperandCount(2);
    }

    get lhs() {
        return this.operands[0];
    }

    get rhs() {
        return this.operands[1];
    }

    isRule() {
        return true;
    }

    toTermString() {
        const { lhs, rhs } = this;
        return `${lhs.toTermString()} => ${rhs.toTermString()}`;
    }

}

class Functor extends Term {

    constructor(operands) {
        super(operands);
        this._assertOperandCountGreaterEqualThan(1);
        const [functorNameTerm, ...restOperands] = operands;
        assert.ok(functorNameTerm instanceof Identifier,
            `first argument to Functor term must be an Identifier`);
    }

    get functor() {
        return operands[0];
    }

    _functorMatch(term) {

    }

    toTermString() {
        const [functor, ...operands] = this.operands;
        return `${functor.toTermString()}(${operands.map(t => t.toTermString()).join(',')})`;
    }

    toJson() {
        const [functor, ...operands] = this.operands;
        return {
            functor: functor.name,
            operands: operands.map(t => t.toJson())
        }
    }

}

class Equation extends Term {

    constructor(operands) {
        super(operands);
        this._assertOperandCount(2);
    }

    get lhs() {
        return this.operands[0];
    }

    get rhs() {
        return this.operands[1];
    }

}

class Sum extends Term {

    constructor(operands) {
        super(operands);
        assert.ok(operands.length > 1, 'Sum constructor called with fewer than 1 arguments');
        this.operands = operands;
    }

    $evalOp(operands) {
        const { numOperands } = this._splitOperands(operands);
        const numObj = numOperands.reduce((res, elem) => {
            //console.log(`${JSON.stringify(res)} is an instance of Num: ${res instanceof Num}`);
            res.value = res.value.add(elem.value);
            return res;
        }, new Num(new Decimal(0)));
        const newOperands = [];
        var numObjectAdded = false;
        operands.forEach(t => {
            if (t.isNum()) {
                if (!numObjectAdded) {
                    numObjectAdded = true;
                    newOperands.push(numObj);
                }
            } else {
                newOperands.push(t);
            }
        })
        if (newOperands.length === 1) {
            return newOperands[0];
        }
        return new Sum(newOperands);
    }

}

class Product extends Term {

    constructor(operands) {
        super(operands);
        assert.ok(operands.length > 1, 'Product constructor called with fewer than 1 arguments');
        this.operands = operands;
    }

    $evalOp(operands) {
        const { numOperands } = this._splitOperands(operands);
        const numObj = numOperands.reduce((res, elem) => {
            //console.log(`${JSON.stringify(res)} is an instance of Num: ${res instanceof Num}`);
            res.value = res.value.times(elem.value);
            return res;
        }, new Num(new Decimal(1)));
        const newOperands = [];
        var numObjectAdded = false;
        operands.forEach(t => {
            if (t.isNum()) {
                if (!numObjectAdded) {
                    numObjectAdded = true;
                    newOperands.push(numObj);
                }
            } else {
                newOperands.push(t);
            }
        })
        if (newOperands.length === 1) {
            return newOperands[0];
        }
        return new Product(newOperands);
    }


}

class UMinus extends Product {

    constructor(operands) {
        super([new Num(new Decimal(-1)), ...operands]);
        this._assertOperandCount(2);
    }

    /*
    _$evalOp(operands) {
        const { numOperands, otherOperands } = this._splitOperands(operands);
        if (numOperands.length === 1 && otherOperands.length === 0) {
            const numOperand = numOperands[0];
            return new Num(numOperand.value.negated());
        }
        return new UMinus([...numOperands, ...otherOperands]);
    }
    */

}

class Power extends Term {

    constructor(operands) {
        super(operands);
        this._assertOperandCount(2);
    }

    $evalOp(operands) {
        const base = operands[0];
        const exponent = operands[1];
        if (base.isNum() && (exponent.isNum())) {
            const value = base.value.pow(exponent.value);
            if (value.isInteger()) {
                return new Num(value);
            }
        }
        return new Power([base, exponent]);
    }

}

class Seq extends Term {

    constructor(operands) {
        super(operands);
    }

    _getSeqTerms() {
        return this.operands;
    }

    substituteInstantiatedVariables() {
        const { operands } = this;
        const oplen = operands.length;
        assert.ok(oplen >= 1, 'internal error: seq term must have at least 1 operands');
        var cterm = null;
        for (let i = 0; i < oplen; i++) {
            let term = operands[i];
            cterm = term.substituteInstantiatedVariables();
            const atLastTerm = i === oplen - 1;
            if (!atLastTerm) {
                if (cterm instanceof False) {
                    throw `${term.toTermString()} evaluated to False`;
                }
            }
        }
        return cterm;
    }

}

class Fraction extends Term {

    constructor(operands) {
        super(operands);
        this._assertOperandCount(2);
    }

    get numerator() {
        return this.operands[0];
    }

    get denominator() {
        return this.operator[1];
    }

}

class Sqrt extends Term {

    constructor(operands) {
        super(operands);
        this._assertOperandCount(2);
    }

    get degree() {
        return this.operands[0];
    }

    get radicand() {
        return this.operands[1];
    }

}

class Abs extends Term {

    constructor(operands) {
        super(operands);
        this._assertOperandCount(1);
    }

}

class Num extends Term {

    constructor(value) {
        super(null);
        assert.ok(value instanceof Decimal, `number value ${value} is not an instance of class "Decimal"`);
        this.value = value;
    }

    toTermString() {
        return String(this.value);
    }

    toJson() {
        return this.value;
    }

    match(term) {
        if (this._isVariableMatch(term)) {
            return this._variableMatch(term);
        }
        if (!(term instanceof Num)) {
            //console.log(`match failed: Number ${this.value} matched against term ${term.toTermString()}`);
            return false;
        }
        const retValue = this.value.equals(term.value);
        if (!retValue) {
            //console.log(`match failed, because number values are different: ${this.value} != ${term.value}`);
        }
        return retValue;
    }

    pmatch(term) {
        return this.match(term);
    }

    substituteInstantiatedVariables() {
        return new Num(this.value);
    }

    _addVariableSubstitutions(substMap) {
    }

    _clone(ctxt) {
        return new Num(this.value);
    }

    isNum() {
        return true;
    }

    reset() {
    }
}

class Symbol extends Term {

    constructor(name) {
        super(null);
        assert.ok(typeof name === 'string', `${this.className} name ${name} is not a string`);
        this.name = name;
    }

    toTermString() {
        return String(this.name);
    }

    toJson() {
        return String(this.name);
    }

    pmatch(term) {
        return this.match(term);
    }

    _addVariableSubstitutions(substMap) {

    }

}

class Identifier extends Symbol {

    constructor(name) {
        super(name);
    }

    get id() {
        return this.name;
    }

    match(term) {
        if (this._isVariableMatch(term)) {
            return this._variableMatch(term);
        }
        if (!(term instanceof Identifier)) {
            //console.log(`match failed: Identifier ${this.name} matched against term ${term.toTermString()}`);
            return false;
        }
        const retValue = this.name === term.name;
        if (!retValue) {
            console.log(`match failed, because identifiers are different: ${this.name} != ${term.name}`);
        }
        return retValue;
    }

    reset() {
    }

    substituteInstantiatedVariables() {
        return new Identifier(this.name);
    }

    _clone(ctxt) {
        return new Identifier(this.name);
    }

}

class Variable extends Symbol {

    constructor(name, uniqueId = -1) {
        super(name);
        this.uniqueId = uniqueId;
        this.instantiatedTerm = null;
    }

    get varname() {
        return this.name;
    }

    isInstantiated() {
        return !!this.instantiatedTerm;
    }

    getInstantiatedTerm() {
        return this.getInstantiatedTermOrThis();
    }

    getInstantiatedTermOrThis() {
        const { instantiatedTerm } = this;
        if (instantiatedTerm) {
            return instantiatedTerm.getInstantiatedTerm();
        }
        return this;
    }

    instantiate(term) {
        const iterm = term.getInstantiatedTerm();
        console.log(`instantiating variable ${this.toTermString()} with ${iterm.toTermString()}...`);
        this.instantiatedTerm = iterm;
        return true;
    }

    match(term) {
        if (this.instantiatedTerm) {
            console.log(`variable ${this.toTermString()} is instantiated with ${this.instantiatedTerm.toTermString()}`);
            console.log(`   matching it with ${term.toTermString()}...`);
            return this.instantiatedTerm.match(term);
        }
        this.instantiate(term);
        return true;
    }

    reset() {
        this.instantiatedTerm = null;
    }

    substituteInstantiatedVariables() {
        if (this.isInstantiated()) {
            return this.getInstantiatedTerm().substituteInstantiatedVariables();
        }
        return this;
    }

    _addVariableSubstitutions(substMap) {
        if (this.isInstantiated) {
            substMap[this.varname] = this.getInstantiatedTerm().substituteInstantiatedVariables();
        }
    }

    _clone(ctxt) {
        return ctxt.findVariableInContext(this.name);
    }

    toTermString() {
        const { name, uniqueId } = this;
        const istr = this.isInstantiated() ? '!' : '';
        return `${name}${uniqueId >= 0 ? `$${uniqueId}` : ''}${istr}`;
        //return name;
    }

}

/**
 * a number variable can only be instantiated with a number (syntax: X#)
 */
class NumberVariable extends Variable {

    constructor(id, uniqueId = -1) {
        super(id, uniqueId);
    }

    instantiate(term) {
        const iterm = term.getInstantiatedTerm();
        if (!(term instanceof Num)) {
            //console.log(`match failed: number variable ${this.name} cannot be instantiated with ${iterm.toTermString()}`);
            return false;
        }
        return super.instantiate(term);
    }

    _clone(ctxt) {
        return ctxt.findVariableInContext(this.name, true);
    }

}

class AnyVariable extends Variable {

    constructor(uniqueId) {
        super('_');
        assert.ok(typeof uniqueId === 'number', 'AnyVariable must be instantiated with a unique id');
        this.uniqueId = uniqueId;
    }

    _clone(ctxt) {
        const uid = ctxt.getNextVariableId();
        return new AnyVariable(uid);
    }

    _addVariableSubstitutions(substMap) {
        // do not include AnyVariable instantiations to the substMap
    }

    toTermString() {
        return `_${this.uniqueId}`;
    }

}

class Apply extends Term {

    constructor(operands) {
        super(operands);
        assert.ok(this.operands.length >= 2, `apply needs at least 2 arguments`);
        assert.ok(this.methodId instanceof Identifier, `First operand of Apply must be the method name (e.g. $eval)`);
    }

    get methodId() {
        return this.operands[0];
    }

    substituteInstantiatedVariables() {
        const [methodId, ...operands] = this.operands;
        const newOperands = operands.map(t => t.substituteInstantiatedVariables());
        const [obj, ...args] = newOperands;
        const methodName = methodId.name;
        const method = obj[methodName];
        if (typeof method !== 'function') {
            throw `no such executable functor: ${methodName}; must be defined as method of the Term class`;
        }
        return method.call(obj, ...args);
    }

}

class Boolean extends Term {

    constructor(booleanValue) {
        super();
        this.booleanValue = !!booleanValue;
    }

    substituteInstantiatedVariables() {
        return this;
    }

    _addVariableSubstitutions(substMap) {
    }

    reset() {
    }

    _clone(ctxt) {
        return this;
    }

    toTermString() {
        return String(this.booleanValue);
    }

    toJson() {
        return String(this.booleanValue);
    }

}

class True extends Boolean {

    constructor() {
        super(true);
    }

}

class False extends Boolean {

    constructor() {
        super(false);
    }

}

const TrueTerm = new True();
Object.freeze(True.instance);

const FalseTerm = new False();
Object.freeze(False.instance);

const BoolTerm = booleanValue => booleanValue ? TrueTerm : FalseTerm;

module.exports = {
    Term,
    Rule,
    Functor,
    Equation,
    Sum,
    Product,
    UMinus,
    Power,
    Seq,
    Fraction,
    Sqrt,
    Abs,
    Num,
    Identifier,
    Variable,
    NumberVariable,
    AnyVariable,
    Apply,
    Boolean,
    True,
    False,
    BoolTerm,
    TrueTerm,
    FalseTerm
}
