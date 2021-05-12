const Terms = require('../term');
const ParseContext = require('../parse-context');
const { _d, isNumeric } = require('../utils');

const termCache = {};

const numTerm0 = new Terms.Num(_d(0));
const numTerm1 = new Terms.Num(_d(1));

const _T = termString => {
    const cachedTerm = termCache[termString];
    //if (cachedTerm instanceof Terms.Term) {
    //    cachedTerm.reset();
    //    return cachedTerm;
    //}
    const term = ParseContext.parseTerm(termString);
    termCache[termString] = term;
    return term;
}

const _M = (termString, term, substMap) => {
    if (typeof substMap === 'object') {
        Object.keys(substMap).forEach(key => {
            substMap[key] = null;
        });
    }
    const { subst, success } = _T(termString).matchWith(term);
    if (success && (typeof substMap === 'object')) {
        Object.keys(subst).forEach(key => {
            substMap[key] = subst[key];
        });
    }
    return success;
}

const flattenOperands = t => {
    const flatten = (term, cls) => {
        const { operands } = term;
        let i = 0;
        while (i < operands.length) {
            let t = operands[i];
            if (t instanceof cls) {
                let subOperands = t.operands;
                let slen = subOperands.length;
                operands.splice(i, 1, ...subOperands);
                i += slen;
            } else {
                i++;
            }
        }
    }
    if ((t instanceof Terms.Sum) || (t instanceof Terms.Product)) {
        flatten(t, t.constructor)
    }
    return t;
}

const evalArithmetic = t => {
    const applyArithmetics = (term, operatorFun, neutralElement) => {
        //console.log(`applyArithmetics(${term.toTermString()})`);
        const operands = term.operands;
        const inPlaceDeleteNeutralElement = () => {
            let i = 0;
            while (i < operands.length) {
                let t = operands[i];
                if ((t instanceof Terms.Num) && t.value.equals(neutralElement)) {
                    operands.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
        if (isNumeric(neutralElement)) {
            inPlaceDeleteNeutralElement();
        }
        const numOperands = operands.filter(t => t instanceof Terms.Num);
        const otherOperands = operands.filter(t => !(t instanceof Terms.Num));
        if (numOperands.length < 2) {
            return term;
        }
        const inPlaceDeleteNums = (startIndex) => {
            let i = startIndex;
            while (i < operands.length) {
                let t = operands[i];
                if (t instanceof Terms.Num) {
                    operands.splice(i, 1);
                } else {
                    i++;
                }
            }
        }
        const firstNumberPosition = operands.findIndex(t => (t instanceof Terms.Num));
        const [t1, t2] = numOperands.splice(0, 2);
        const initialValue = operatorFun(t1.value, t2.value);
        const numValue = numOperands.reduce((val, numTerm) => operatorFun(val, numTerm.value), initialValue);
        t1.value = numValue;
        if (otherOperands.length === 0) {
            return t1;
        }
        inPlaceDeleteNums(firstNumberPosition + 1);
        return term;
    }
    const _v = {};
    if (_M('power(A,0)', t, _v)) {
        return numTerm1;
    }
    if (_M('power(A,1)', t, _v)) {
        return _v.A;
    }
    if (_M('product(...A)', t, _v)) {
        if (_v.A.findTerm(t => (t.isNumTerm && t.value.equals(numTerm0.value)))) {
            return numTerm0;
        }
    }
    if ((t instanceof Terms.Sum)) {
        return applyArithmetics(t, (a, b) => a.add(b), _d(0));
    }
    if ((t instanceof Terms.Product)) {
        return applyArithmetics(t, (a, b) => a.mul(b), _d(1));
    }
    if ((t instanceof Terms.Power)) {
        return applyArithmetics(t, (a, b) => a.pow(b));
    }
    if ((t instanceof Terms.Quotient) || (t instanceof Terms.Fraction)) {
        return applyArithmetics(t, (a, b) => a.div(b));
    }
    return t;
};

const sortProductTerms = t => {
    const sortFunction = (t1, t2) => {
        if (t1 instanceof Terms.Num) {
            return -1
        }
        if (t2 instanceof Terms.Num) {
            return 1;
        }
        if ((t1 instanceof Terms.Identifier) && (t2 instanceof Terms.Identifier)) {
            return t1.id < t2.id ? -1 : t1.id > t2.id ? 1 : 0;
        }
        return 0;
    }
    if (t instanceof Terms.Product) {
        t.operands.sort(sortFunction);
    }
    return t;
}

module.exports = {
    flattenOperands,
    evalArithmetic,
    sortProductTerms
}