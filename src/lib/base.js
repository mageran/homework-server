const Terms = require('../term');
const ParseContext = require('../parse-context');
const { _d, isNumeric, logTerm } = require('../utils');

const termCache = {};

const numTerm0 = new Terms.Num(_d(0));
const numTerm1 = new Terms.Num(_d(1));
const numTermMinus1 = new Terms.Num(_d(-1));

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
    if (_M('fraction(product(...A), Q#)', t, _v)) {
        let [numTerm, ...restProductTerms] = _v.A.operands;
        if (numTerm.isNumTerm) {
            let qvalue = _v['Q#'].value.div(numTerm.value);
            let pterm = new Terms.Product(restProductTerms);
            return new Terms.Fraction([pterm, Terms.Term.numTerm(qvalue)]);
        }
    }
    if (_M('product(F#, fraction(D, Q#))', t, _v)) {
        console.log(`matched product of fraction...${t}`);
        let fvalue = _v['F#'].value;
        let qvalue = _v['Q#'].value.div(fvalue);
        const res = new Terms.Fraction([_v.D, Terms.Term.numTerm(qvalue)]);
        logTerm('product of fraction simplified: ', res);
        return res;
    }
    if (_M('fraction(fraction(D,Q1#),Q2#)', t, _v)) {
        let q1value = _v['Q1#'].value;
        let q2value = _v['Q2#'].value;
        console.log(`found double fraction ${q1value}, ${q2value}`);
        let qvalue = q1value.mul(q2value);
        let qterm = new Terms.Num(qvalue);
        let res = new Terms.Fraction([_v.D, qterm]);
        return res;
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

const identityTransform = t => t;

const fractionsToProducts = t => {
    const _v = {};
    if (_M('fraction(N, D#)', t, _v)) {
        let quotient = _v['D#'].value;
        let factor = _d(1).div(quotient);
        let factorTerm = Terms.Term.numTerm(factor);
        let productTerm = new Terms.Product([factorTerm, _v.N]);
        return productTerm;
    }
    return t;
}

const basicEval = (t, options = {}) => {
    fractionToProductsFunction = options.fractionsToProducts ? fractionsToProducts : identityTransform;
    return t
        .clone()
        ._(fractionToProductsFunction)
        ._(flattenOperands)
        ._(evalArithmetic)
        ._(sortProductTerms)
        ._(combinePolynomialTerms)
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
    const resultString = xsquareFactor == 1 ? '' : ` = ${xsquareFactor.mul(cvalueSquared)}`
    steps.push(`Completing the square for ${x} by adding ${factorTimesStr}${cvalueSquared}${resultString}:`)
    steps.push({ latex: `${completedTerm.latex} = ${squaredTerm.latex}` });
    return {
        term: newTerm,
        completedTerm,
        addedTerm,
        completedSquareDone: true,
        steps: [{
            collapsibleSection: {
                title: `Completing the square for ${x}...`,
                steps
            }
        }]
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

const kindVariableTerm = 0;
const kindOtherTerm = 1;

const combinePolynomialTerms_ = term => {
    const ptermInfos = [];
    const _insert = (variable, exponent, factor) => {
        const index = ptermInfos.findIndex(info => {
            return info.kind === kindVariableTerm
                && info.variable === variable
                && info.exponent.equals(exponent);
        });
        if (index < 0) {
            let kind = kindVariableTerm;
            ptermInfos.push({ kind, variable, exponent, factor });
        } else {
            let info = ptermInfos[index];
            info.factor = info.factor.add(factor);
        }
    }
    const _insertTerm = term => {
        const kind = kindOtherTerm;
        ptermInfos.push({ kind, term });
    }
    getSumTerms(term).forEach(t => {
        const _v = {};
        var exp, factor, variable;
        if (t.isIdentifierTerm) {
            _insert(t.name, _d(1), _d(1));
        }
        else if (_M('product(Num#,X)', t, _v) && _v.X.isIdentifierTerm) {
            _insert(_v.X.name, _d(1), _v['Num#'].value);
        }
        else if (_M('power(X, Exp#)', t, _v) && _v.X.isIdentifierTerm) {
            _insert(_v.X.name, _v['Exp#'].value, _d(1));
        }
        else if (_M('product(Num#, power(X, Exp#))', t, _v) && _v.X.isIdentifierTerm) {
            _insert(_v.X.name, _v['Exp#'].value, _v['Num#'].value);
        }
        else {
            _insertTerm(t);
        }
    })
    //console.log(ptermInfos);
    return ptermInfos;
}

const combinePolynomialTerms = term => {
    const constructTerm = ptermInfos => {
        const sumTerms = ptermInfos.map(info => {
            if (info.kind === kindVariableTerm) {
                let _id = t => t;
                let _createPowerTerm = _id;
                let _createProductTerm = _id;
                let { variable, exponent, factor } = info;
                if (exponent != 1) _createPowerTerm = t => new Terms.Power([t, new Terms.Num(exponent)]);
                if (factor != 1) _createProductTerm = t => new Terms.Product([new Terms.Num(factor), t]);
                return _createProductTerm(_createPowerTerm(new Terms.Identifier(variable)));
            } else {
                return info.term;
            }
        })
        return sumTerms.length === 1 ? sumTerms[0] : new Terms.Sum(sumTerms);
    }
    if (term instanceof Terms.Equation) {
        let lhsInfos = combinePolynomialTerms_(term.lhs);
        let rhsInfos = combinePolynomialTerms_(term.rhs);
        lhsInfos.forEach(lhsInfo => {
            if (lhsInfo.kind === kindVariableTerm) {
                // look for same variable/exponent combination on rhs
                let rhsIndex = rhsInfos.findIndex(rhsInfo => {
                    return rhsInfo.kind === kindVariableTerm
                        && rhsInfo.variable === lhsInfo.variable
                        && rhsInfo.exponent.equals(lhsInfo.exponent);
                });
                if (rhsIndex >= 0) {
                    let [rhsInfo] = rhsInfos.splice(rhsIndex, 1);
                    lhsInfo.factor = lhsInfo.factor.minus(rhsInfo.factor);
                }
            }
        });
        let newLhs = constructTerm(lhsInfos);
        let newRhs = rhsInfos.length === 0 ? numTerm0.clone() : constructTerm(rhsInfos);
        return new Terms.Equation([newLhs, newRhs]);
    } else {
        return constructTerm(combinePolynomialTerms_(term));
    }
}

const getSumTerms = term => {
    const _v = {};
    if (_M('sum(...A)', term, _v)) {
        return _v.A.operands;
    }
    return [term];
}

const getSumTermsEquation = equation => {
    if (!(equation instanceof Terms.Equation)) {
        throw `getSumTermsEquation called with a term that is not an equation: ${equation}`
    }
    return { lterms: getSumTerms(equation.lhs), rterms: getSumTerms(equation.rhs) };
}

const getVarNames = term => {
    const varnames = {};
    term.traverse(t => {
        if (t.isIdentifierTerm) {
            let vname = t.name;
            if (typeof varnames[vname] === 'number') {
                varnames[vname]++;
            } else {
                varnames[vname] = 1;
            }
        }
    });
    return varnames;
}

const getVarNamesList = term => Object.keys(getVarNames(term));

const substitute = (term, varname, substTerm) => {
    return term.
        _(t => {
            if (t.isIdentifierTerm && t.name === varname) {
                return substTerm.clone();
            }
            return t;
        })
}

function *solveForIterator(equation, x, steps = [], options = {}) {
    if (!(equation instanceof Terms.Equation)) {
        throw `solveFor only works on equations`
    }
    const { onlyPositiveRoots } = options;
    const equationSimplified = basicEval(equation, { fractionsToProducts: false });
    steps.push('Simplified:');
    steps.push({ latex: equationSimplified.latex });
    const allVars = getVarNames(equationSimplified);
    if (!x) {
        if (Object.keys(allVars).length !== 1) {
            throw `please specify the variable to solve for`;
        }
        x = Object.keys(allVars)[0];
    }
    const vcnt = allVars[x];
    if (typeof vcnt !== 'number') {
        throw `can't solve for "${x}", because it's not part of ${equationSimplified.latex}`;
    }
    if (vcnt > 1) {
        throw `can't solve for "${x}": more than one occurence found (not supported yet)`;
    }
    const lhsVars = getVarNames(equationSimplified.lhs);
    const lhsContainsX = !!lhsVars[x];

    const lhsTerms = getSumTerms(equationSimplified.lhs);
    const rhsTerms = getSumTerms(equationSimplified.rhs);
    const xSideTerms = lhsContainsX ? lhsTerms : rhsTerms;
    const otherSideTerms = lhsContainsX ? rhsTerms : lhsTerms;

    const xindex = xSideTerms.findIndex(t => getVarNames(t)[x]);
    if (xindex < 0) {
        throw `something went wrong; xindex can't be < 0`;
    }
    const [xterm] = xSideTerms.splice(xindex, 1);
    otherSideTerms.push(...xSideTerms.map(t => new Terms.Product([numTermMinus1.clone(), t])));

    const newRhs = otherSideTerms.length === 1 ? otherSideTerms[0] : new Terms.Sum(otherSideTerms);

    steps.push(`Isolating term containing ${x}:`);
    steps.push({ latex: new Terms.Equation([xterm, newRhs]).latex });

    if (xterm.isIdentifierTerm) {
        let newEquation = new Terms.Equation([xterm, newRhs]);
        steps.push('Result:');
        let res = basicEval(newEquation);
        steps.push({ latex: res.latex });
        yield res;
        return;
    }
    const _v = {};
    if (_M('product(Num#,T)', xterm, _v)) {
        let newLhs = _v.T;
        let nterm = _v['Num#'];
        let rhs1 = new Terms.Fraction([newRhs, nterm]);
        let eq = new Terms.Equation([newLhs, rhs1]);
        steps.push(`Dividing both sides by ${nterm.value}:`);
        steps.push({ latex: eq.latex });
        for(let res of solveForIterator(eq, x, steps, options)) yield res;
        return;
    }
    if (_M('product(...Factors)', xterm, _v)) {
        let factorTerms = _v.Factors.operands;
        let xindex = factorTerms.findIndex(t => getVarNames(t)[x]);
        console.log(`term containing ${x} is at index ${xindex} in ${xterm}`)
        if (xindex < 0) {
            throw `something went wrong ${xterm} should contain ${x}, but it doesn't`;
        }
        let [newXterm] = factorTerms.splice(xindex, 1);
        let denominatorTerm = factorTerms.length === 1 ? factorTerms[0] : new Terms.Product(factorTerms);
        let rhs1 = new Terms.Fraction([newRhs, denominatorTerm]);
        let eq = new Terms.Equation([newXterm, rhs1]);
        steps.push({ latex: `\\text{Dividing both sides by&nbsp;} ${denominatorTerm.latex}\\text{:}` });
        steps.push({ latex: eq.latex });
        for(let res of solveForIterator(eq, x, steps, options)) yield res;
        return;
    }
    if (_M('fraction(...Ops)', xterm, _v)) {
        let operandTerms = _v.Ops.operands;
        if (operandTerms.length !== 2) {
            throw `something went wrong: fraction term with ${operandTerms.length} operands found; expected 2: ${xterm}`;
        }
        let xindex = operandTerms.findIndex(t => getVarNames(t)[x]);
        console.log(`term containing ${x} is at index ${xindex} in ${xterm}`)
        if (xindex < 0) {
            throw `something went wrong ${xterm} should contain ${x}, but it doesn't`;
        }
        if (xindex !== 0) {
            throw `variable ${x} found in denominator; this is not yet supported`;
        }
        let [newXterm] = operandTerms.splice(xindex, 1);
        let factorTerm = operandTerms.length === 1 ? operandTerms[0] : new Terms.Product(operandTerms);
        let rhs1 = new Terms.Product([newRhs, factorTerm]);
        let eq = new Terms.Equation([newXterm, rhs1]);
        steps.push({ latex: `\\text{Multiplying both sides with&nbsp;} ${factorTerm.latex}\\text{:}` });
        steps.push({ latex: eq.latex });
        for(let res of solveForIterator(eq, x, steps, options)) yield res;
        return;
    }
    if (_M('power(T, Exp#)', xterm, _v)) {
        let newLhs = _v.T;
        let eterm = _v['Exp#'];
        let exp = eterm.value;
        let rhs1 = new Terms.Sqrt([eterm, newRhs])
        let eq1 = new Terms.Equation([newLhs, rhs1]);
        let includeNegativeRoot = !onlyPositiveRoots && (exp.modulo(2) == 0);
        let rootNameString = exp == 2 ? "square" : exp == 3 ? "cubic" : `${exp}th`;
        let rootPrefixString = includeNegativeRoot ? "\\pm " : "";
        steps.push(`Taking ${rootNameString} root on both sides: `)
        steps.push({ latex: `${newLhs.latex} = ${rootPrefixString}${rhs1.latex}` });
        let steps1 = steps;
        if (includeNegativeRoot) {
            steps1 = [];
            steps.push({ section: { title: 'Positive root', steps: steps1, collapsible: true }});
        }
        for(let res of solveForIterator(eq1, x, steps1, options)) yield res;
        if (includeNegativeRoot) {
            let rhs2 = new Terms.Product([numTermMinus1.clone(), rhs1]);
            let eq2 = new Terms.Equation([newLhs, rhs2]);
            let steps2 = [];
            steps.push({ section: { title: 'Negative root', steps: steps2, collapsible: true }});
            for(let res of solveForIterator(eq2, x, steps2, options)) yield res;
        }
        return;
    }
    let eq3 = new Terms.Equation([xterm, newRhs]);
    console.log(`can't simplify any further: ${eq3}`);
    yield eq3;
}

const solveFor = (equation, x, steps = [], options = {}) => {
    const results = [];
    for(let res of solveForIterator(equation, x, steps, options)) {
        results.push(res);
    }
    console.log(`found ${results.length} results for solving ${equation} for "${x}"`);
    return results;
    //throw `couldn't solve for ${x}`;
}

module.exports = {
    flattenOperands,
    evalArithmetic,
    sortProductTerms,
    basicEval,
    negateTerm,
    getSumTerms,
    getSumTermsEquation,
    completeTheSquare,
    getVarNames,
    getVarNamesList,
    substitute,
    combinePolynomialTerms,
    solveFor,
    solveForIterator,
    _M,
    _T,
    numTerm0,
    numTerm1,
    numTermMinus1
}