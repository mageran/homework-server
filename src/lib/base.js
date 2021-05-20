const Terms = require('../term');
const ParseContext = require('../parse-context');
const { _d, isNumeric, logTerm } = require('../utils');

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
        if (operands.length === 1) {
            return operands[0];
        }
        if (operands.length === 0) {
            return new Terms.Num(neutralElement);
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
        if (operands.length === 1) {
            return operands[0];
        }
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
    if (t instanceof Terms.Fraction) {
        return applyArithmetics(t, (a, b) => a.div(b));
    }
    if (t instanceof Terms.Sqrt) {
        return applyArithmetics(t, (a, b) => {
            return (a == 2) ? b.sqrt() : (a == 3) ? b.cubeRoot() : b.pow(numTerm1.div(a));
        })
    }
    return t;
};

const basicEval = t => {
    return t
        .clone()
        ._(flattenOperands)
        ._(evalArithmetic)
        ._(sortProductTerms);
}

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

const negateTerm = t => {
    const minusOne = new Terms.Num(_d(-1));
    return new Terms.Product([minusOne, t]);
}

/**
 * Runs complete the square for the given term and the given variable. The factor for the squared term must be 1.
 * Returns update (sum) term and the number term added for completing the square.
 * @param {Term} term
 * @param {String} x
 */
const _completeTheSquare = (term, x) => {
    console.log(`completing the square for "${x}" in ${term.toTermString()}...`);
    const steps = [];
    const sumTerms = getSumTerms(term);
    var xsquareTerm = null;
    var bvalue = _d(0);
    var restTerms = [];
    var xsquareFactor = _d(1);
    const _v = {};
    for (let i = 0; i < sumTerms.length; i++) {
        let t = sumTerms[i];
        if (_M(`power(${x},2)`, t)) {
            if (xsquareTerm) {
                // another x^2 term found, not supported
                return { term, addedTerm: numTerm0, completedSquareDone: false };
            }
            xsquareTerm = t;
        }
        else if (_M(`product(XF#,power(${x},2))`, t, _v)) {
            xsquareTerm = t.operands[1];
            xsquareFactor = _v['XF#'].value;
        }
        else if (_M(`product(B#,${x})`, t, _v)) {
            let nterm = _v['B#'];
            bvalue = bvalue.add(nterm.value);
        }
        else {
            restTerms.push(t);
        }
    }
    if (bvalue == 0) {
        console.log('bvalue is 0');
        return { term, addedTerm: numTerm0, completedSquareDone: false };
    }
    if (!xsquareTerm) {
        console.log('no xsquareTerm found');
        return { term, addedTerm: numTerm0, completedSquareDone: false };
    }
    // divide b by xsquareFactor in cases you have something like this: 4x^2 + 12x; we then
    // complete the square for (x^2 + 3x)
    bvalue = bvalue.div(xsquareFactor);
    // calculate the value to complete the square:
    const cvalue = bvalue.div(_d(2));
    const cvalueSquared = cvalue.pow(_d(2));
    const cterm = new Terms.Num(cvalueSquared);
    const xsquareFactorTerm = t => basicEval(new Terms.Product([new Terms.Num(xsquareFactor), t]));
    const completedTerm = xsquareFactorTerm(new Terms.Sum([xsquareTerm,
        new Terms.Product([new Terms.Num(bvalue), new Terms.Identifier(x)]),
        cterm
    ]));
    //const addedTerm = cterm;
    const addedTerm = xsquareFactorTerm(cterm);
    console.log(`completeTheSquare: factor with ${x}^2: ${xsquareFactor}`);
    const termString = `power(sum(${x},${cvalue}),2)`;
    //console.log(`termString: ${termString}`);
    const squaredTerm = xsquareFactorTerm(_T(termString));
    const newTerm = (restTerms.length === 0) ? squaredTerm : new Terms.Sum([squaredTerm, ...restTerms]);
    const factorTimesStr = xsquareFactor == 1 ? '' : `${xsquareFactor}*`;
    steps.push(`Completing the square for ${x} by adding ${factorTimesStr}${cvalueSquared}:`)
    steps.push({ latex: `${completedTerm.latex} = ${squaredTerm.latex}`});
    return { 
        term: newTerm,
        completedTerm,
        addedTerm,
        completedSquareDone: true,
        steps: [ { collapsibleSection: {
            title: `Completing the square for ${x}...`,
            steps
        }}]
    };
}

const completeTheSquare = (term, x) => {
    const _v = {};
    if (_M('equation(Lhs,Rhs)', term, _v)) {
        const cinfo = _completeTheSquare(_v.Lhs, x);
        logTerm('equation lhs:', _v.Lhs);
        const { term, completedTerm, addedTerm, steps, completedSquareDone } = cinfo;
        if (!completedSquareDone) {
            return cinfo;
        }
        console.log(`square completed for ${x}`);
        const lhs = term;
        const rhs = new Terms.Sum([_v.Rhs, addedTerm]);
        const newTerm = new Terms.Equation([lhs, rhs]);
        return { term: newTerm, completedTerm, addedTerm, steps, completedSquareDone };
    }
    return _completeTheSquare(term, x);
}

const getSumTerms = term => {
    const _v = {};
    if (_M('sum(...A)', term, _v)) {
        return _v.A.operands;
    }
    return [term];
}

module.exports = {
    flattenOperands,
    evalArithmetic,
    sortProductTerms,
    basicEval,
    negateTerm,
    getSumTerms,
    completeTheSquare,
    _M,
    _T,
    numTerm0,
    numTerm1
}