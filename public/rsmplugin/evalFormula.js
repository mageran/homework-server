
const arithmeticEval = (opfun, ...operands) => {
    return operands
        .reduce((result, elem, index) =>
            index === 0 ? elem : opfun(result, elem),
            0);
}

const _toFraction = a => (a instanceof Fraction) ? a : new Fraction(a, 1);
const _elimFraction = a => {
    if (a instanceof Fraction && a.denominator === 1) {
        return a.numerator;
    }
    return a;
}

const addition = (...operands) => arithmeticEval((a, b) => {
    const af = _toFraction(a);
    const bf = _toFraction(b);
    const resf = af.add(bf);
    return _elimFraction(resf);
}, ...operands);
const subtraction = (...operands) => arithmeticEval((a, b) => {
    const af = _toFraction(a);
    const bf = _toFraction(b);
    const resf = af.subtract(bf);
    return _elimFraction(resf);
}, ...operands);
const multiplication = (...operands) => arithmeticEval((a, b) => {
    const af = _toFraction(a);
    const bf = _toFraction(b);
    const resf = af.multiply(bf);
    return _elimFraction(resf);
}, ...operands);
const division = (...operands) => arithmeticEval((a, b) => {
    const af = _toFraction(a);
    const bf = _toFraction(b);
    const resf = af.divide(b);
    return _elimFraction(resf);
}, ...operands);
const power = (...operands) => arithmeticEval((a, b) => Math.pow(a, b), ...operands);

const operatorFunctions = {
    '+': addition,
    '-': subtraction,
    '*': multiplication,
    "/": division,
    "": multiplication,
    "^": power,
    "uminus": a => subtraction(0, a),
    "reciprocal": a => division(1, a),
    "fraction": (a, b) => new Fraction(a, b),
}

const neutralElement = {
    '+': 0,
    '-': 0,
    '*': 1,
    '/': 1
}

const _negateFormula = formula => {
    if (_isNumeric(formula)) {
        return multiplication(-1, formula);
    }
    if ((typeof formula === 'object') && formula.op === 'uminus') {
        return formula.operands[0];
    }
    return applyUminus({ op: 'uminus', operands: [formula] });
}

const formulaToLatex = formula => printFormula(formula, { latex: true, keepNumerator: false });

const printFormula = (formula, options = {}) => {
    const { latex, keepNumerator } = options;
    if (typeof formula === 'number') {
        return formula;
    }
    if (formula instanceof Fraction) {
        return latex ? formula.toLatex(keepNumerator) : formula.toString();
    }
    if (typeof formula !== 'object') {
        return formula;
    }
    const _removeMinus = term => {
        if (typeof term === 'number') {
            return Math.abs(term);
        }
        if (term.op === 'uminus') {
            return term.operands[0];
        }
        return term;
    }
    const _removeReiprocal = term => {
        if (typeof term === 'number' && Math.abs(term) < 1) {
            return 1 / term;
        }
        if (term.op === 'reciprocal') {
            return term.operands[0];
        }
        return term;
    }
    const _isNegativeSummand = term => {
        if (typeof term === 'number') {
            return term < 0
        }
        return term.op === 'uminus';
    }
    const _isReciprocalFactor = term => {
        if (typeof term === 'number') {
            return Math.abs(term) < 1;
        }
        return term.op === 'reciprocal';
    }
    const printSum = operands => {
        var s = "";
        for (let i = 0; i < operands.length; i++) {
            let operand = operands[i];
            if (_isNegativeSummand(operand)) {
                s += '-';
            } else {
                if (i > 0) {
                    s += '+';
                }
            }
            let xoperand = _removeMinus(operand);
            let needsParenthesis = _operandNeedsParenthesis('+', xoperand);
            if (needsParenthesis) s += '(';
            s += printFormula(xoperand, options);
            if (needsParenthesis) s += ')';
        }
        return s;
    }
    const _operandNeedsParenthesis = (outerOp, operand) => {
        if (typeof operand != 'object') {
            return false;
        }
        //return true;
        if (operand.op === '+') {
            return true;//outerOp === '*' || outerOp === '^' || outerOp === '$fraction';
        }
    }
    const printProduct = operands => {
        var s = "";
        for (let i = 0; i < operands.length; i++) {
            let operand = operands[i];
            if (_isReciprocalFactor(operand)) {
                s += '\u00F7';
            } else {
                if (i > 0) {
                    s += latex ? ' \\cdot ' : '*';
                }
            }
            let xoperand = _removeReiprocal(operand, options);
            let needsParenthesis = _operandNeedsParenthesis('*', xoperand);
            if (needsParenthesis) s += "(";
            s += printFormula(xoperand, options);
            if (needsParenthesis) s += ")";
        }
        return s;
    }
    const printEquation = operands => {
        const printedOperands = operands.map(t => printFormula(t, options));
        return printedOperands.join(' = ');
    }
    const printFraction = ({ wholeNumber, numerator, denominator }) => {
        if (typeof numerator === 'number' && typeof denominator === 'number') {
            var f = new Fraction(numerator, denominator);
            if (typeof wholeNumber === 'number') {
                f = f.add(wholeNumber);
            }
            return printFormula(f, options);
        }
        var s = "";
        if (typeof wholeNumber === 'number') {
            s += `${wholeNumber} `
        }
        s += `${printFormula(numerator, options)}/${printFormula(denominator, options)}`;
        return s;
    }
    switch (formula.op) {
        case '+':
            return printSum(formula.operands);
        case '*':
            return printProduct(formula.operands);
        case '^':
            return `(${printFormula(formula.operands[0], options)})^${printFormula(formula.operands[1], options)}`;
        case 'equation':
            return printEquation(formula.operands);
        case 'fraction':
            return printFraction(formula);
        case 'reciprocal':
            return printFraction({ numerator: 1, denominator: formula.operands[0] });
        case 'uminus':
            return `-(${printFormula(formula.operands[0])})`;
        case 'BUILTIN':
            let operandsString = formula.operands.map(o => printFormula(o, options)).join(', ');
            let fname = formula.functionName;
            return `${fname}(${operandsString})`;
        default:
            return `(${JSON.stringify(formula)})`;
    }
}

const _isNumeric = term => {
    return (typeof term === 'number') || (term instanceof Fraction);
}

const applyUminus = formula => {
    if (typeof formula === 'object' && formula.op === 'uminus') {
        const t = formula.operands[0];
        if (t.op === '*') {
            const nindex = t.operands.findIndex(_isNumeric);
            if (nindex < 0) {
                return formula;
            }
            const value = t.operands[nindex];
            const negValue = multiplication(-1, value);
            t.operands[nindex] = negValue;
            return t;
        }
        else if (t.op === '+') {
            t.operands = t.operands.map(_negateFormula);
            return t;
        }
    }
    return formula;
}

const flattenOperands = formula => {
    if (formula.op === '+') {
        const newOperands = [];
        formula.operands.forEach(t => {
            if (t.op === '+') {
                newOperands.push(...t.operands);
            } else {
                newOperands.push(t);
            }
        })
        return { op: formula.op, operands: newOperands };
    }
    else if (formula.op === '*') {
        const newOperands = [];
        formula.operands.forEach(t => {
            if (t.op === '*') {
                newOperands.push(...t.operands);
            } else {
                newOperands.push(t);
            }
        })
        return { op: formula.op, operands: newOperands };
    }
    else {
        return formula;
    }
}

const _sumOrSingleton = terms => {
    return terms.length === 1 ? terms[0] : { op: '+', operands: terms };
}

const _isIdentifier = term => typeof term === 'string';

const _getVariableTerm = term => {
    var variable = '';
    var exponent = 1;
    const _getVariableWithWholeExponent = term => {
        if (term.op !== '^') return null;
        if (term.operands.length !== 2) return null;
        const base = term.operands[0];
        const exponent = term.operands[1];
        if (_isIdentifier(base) && (typeof exponent === 'number')) {
            return { variable: base, exponent: exponent };
        }
        return null;
    }
    if (_isIdentifier(term)) {
        variable = term;
    } else {
        const termInfo = _getVariableWithWholeExponent(term);
        if (!termInfo) {
            return null;
        }
        variable = termInfo.variable;
        exponent = termInfo.exponent;
    }
    return { variable, exponent }
}

const _getPolynomialTerm = term => {
    const _getNumericOperandIndex = operands => {
        var index = -1;
        for (let i = 0; i < operands.length; i++) {
            let operand = operands[i];
            if (_isNumeric(operand)) {
                return i;
            }
        }
        return -1;
    }
    var factor = 1;
    var variable = '';
    var exponent = 1;
    if (_isIdentifier(term)) {
        variable = term;
        let res = { variable, factor, exponent }
        console.log(`${JSON.stringify(term)} ==> ${JSON.stringify(res)}`);
        return res;
    }
    else if (term.op === '*' && term.operands.length === 2) {
        const opindex = _getNumericOperandIndex(term.operands);
        if (opindex < 0) {
            return null;
        }
        const vindex = opindex === 0 ? 1 : 0;
        factor = term.operands[opindex];
        const vterm = term.operands[vindex];
        const termInfo = _getVariableTerm(vterm);
        if (!termInfo) {
            return null;
        }
        variable = termInfo.variable;
        exponent = termInfo.exponent;
        let res = { variable, factor, exponent }
        console.log(`${JSON.stringify(term)} ==> ${JSON.stringify(res)}`);
        return res;
    }
    else if (term.op === 'uminus' && term.operands.length === 1) {
        const termInfo = _getVariableTerm(term.operands[0]);
        if (!termInfo) {
            return null;
        }
        variable = termInfo.variable;
        exponent = termInfo.exponent;
        let res = { variable, factor: -factor, exponent }
        console.log(`${JSON.stringify(term)} ==> ${JSON.stringify(res)}`);
        return res;
    }
    return null;
}

const _extractPolynomialTerms = (formula) => {
    const _ptermKey = ({ variable, exponent }) => `${variable}_${exponent}`;
    var operands;
    if (formula.op === '+') {
        operands = formula.operands;
    } else {
        operands = [formula];
    }
    const pterms = {};
    const otherOperands = [];
    operands.forEach(t => {
        const pterm = _getPolynomialTerm(t);
        if (!pterm) {
            otherOperands.push(t);
            return;
        }
        const key = _ptermKey(pterm);
        if (pterms[key]) {
            const factor0 = pterms[key].factor;
            const factor1 = pterm.factor;
            const factor = addition(factor0, factor1);
            pterms[key].factor = factor;
        } else {
            pterms[key] = pterm;
        }
    })
    return { pterms, otherOperands };
}

const _ptermToFormula = ({ factor, variable, exponent }) => {
    if (exponent === 0) {
        return factor;
    }
    const factorOperands = [];
    if (factor != 1) {
        factorOperands.push(factor);
    }
    if (exponent === 1) {
        factorOperands.push(variable);
    } else {
        factorOperands.push({ op: '^', operands: [variable, exponent] });
    }
    if (factorOperands.length === 1) {
        return factorOperands[0];
    }
    return { op: '*', operands: factorOperands };
}

const combinePolynomialTerms = formula => {
    console.log(`combinePolynomialTerm(${JSON.stringify(formula)})...`);
    const _ptermKey = ({ variable, exponent }) => `${variable}_${exponent}`;
    if (formula.op !== '+') {
        return formula;
    }
    const { pterms, otherOperands } = _extractPolynomialTerms(formula);
    const ptermValues = Object.values(pterms);
    if (ptermValues.length === 0) {
        return formula;
    }
    const newOperands = ptermValues.map(pterm => {
        const _toPower = pterm => {
            if (pterm.exponent === 1) {
                return pterm.variable;
            }
            return { op: '^', operands: [pterm.variable, pterm.exponent] };
        }
        const vterm = _toPower(pterm);
        if (pterm.factor === 1) {
            return vterm;
        }
        if (pterm.factor === 0) {
            return 0;
        }
        return { op: '*', operands: [pterm.factor, vterm] };
    });
    newOperands.push(...otherOperands);
    console.log(pterms);
    return { op: '+', operands: newOperands };
}

const expandFactors = formula => {
    console.log(`expandFactors(${JSON.stringify(formula)})...`);
    if (formula.op !== '*') {
        return formula;
    }
    const sumOperandsIndex = formula.operands.findIndex(t => t.op === '+');
    if (sumOperandsIndex < 0) {
        return formula;
    }
    const otherOperands = [...formula.operands];
    const sumOperand = (otherOperands.splice(sumOperandsIndex, 1))[0];
    console.log(`    sumOperand: ${JSON.stringify(sumOperand)}`);
    console.log(`    otherOperands: ${JSON.stringify(otherOperands)}`);
    const newOperands = sumOperand.operands.map(t => {
        const op = '*';
        const operands = [t, ...otherOperands];
        return { op, operands };
    })
    return { op: '+', operands: newOperands };
}

const solveLinearEquation = formula => {
    const _checkOtherOperandsNumeric = ({ pterms, otherOperands }) => {
        return otherOperands.every(term => _isNumeric(term));
    };
    if (formula.op !== 'equation') {
        return formula;
    }
    const termInfosList = formula.operands.map(term => _extractPolynomialTerms(term, true));
    if (termInfosList.length !== 2) {
        return formula;
    }
    console.log(`solveLinearEquation: termInfos: ${JSON.stringify(termInfosList, null, 2)}`);
    if (!termInfosList.every(_checkOtherOperandsNumeric)) {
        console.log('not all "otherOperands" in the terms are numeric, can\'t solveLinearEquation');
        return formula;
    } else {
        console.log('all "otherOperands in equation are numeric.');
    }
    if (!termInfosList.every(termInfo => termInfo.otherOperands.length <= 1)) {
        console.log('can\'t solve linear equation: more than 1 "otherOperands" found on either side');
    } else {
        console.log('found at most one "otherOperand" on either side of equation.');
    }
    const lhsTermInfos = termInfosList[0];
    const rhsTermInfos = termInfosList[1];
    var lhsNumber = lhsTermInfos.otherOperands.length > 0 ? lhsTermInfos.otherOperands[0] : 0;
    var rhsNumber = rhsTermInfos.otherOperands.length > 0 ? rhsTermInfos.otherOperands[0] : 0;
    // move constant to the rhs
    rhsNumber = subtraction(rhsNumber, lhsNumber);
    console.log(`rhsNumber: ${rhsNumber}`);
    // move pterms to the lhs
    const lhsPterms = lhsTermInfos.pterms;
    const rhsPterms = rhsTermInfos.pterms;
    Object.keys(rhsPterms).forEach(key => {
        const rhsPterm = rhsPterms[key];
        console.log(`moving rhsPterm ${JSON.stringify(rhsPterm)} to lhs...`)
        const lhsPterm = lhsPterms[key]
        if (lhsPterm) {
            console.log(`- combining with lhsPterm ${JSON.stringify(lhsPterm)}...`);
            lhsPterm.factor = subtraction(lhsPterm.factor, rhsPterm.factor);
        } else {
            console.log(` - moving to lhs as new term`);
            lhsPterms[key] = {
                factor: subtraction(0, rhsPterm.factor),
                variable: rhsPterm.variable,
                exponent: rhsPterm.exponent
            };
        }
    });
    console.log(`lhsPterms after moving pterms from rhs: ${JSON.stringify(lhsPterms, null, 2)}`);
    const lhsPtermsValues = Object.values(lhsPterms);
    var newLhs;
    if (lhsPtermsValues.length === 1 && lhsPtermsValues[0].exponent === 1) {
        const { factor, variable } = lhsPtermsValues[0];
        rhsNumber = division(rhsNumber, factor);
        newLhs = variable;
    } else {
        console.log('can\'t full solve linear equation.');
        newLhs = _sumOrSingleton(Object.values(lhsPterms).map(_ptermToFormula));
    }
    return { op: 'equation', operands: [newLhs, rhsNumber] };
}

const _formulaHasChangedForOutput = (previous, current) => {
    if (!previous) {
        return true;
    }
    return printFormula(previous) !== printFormula(current);
}

const _evalGCF = formula => {
    if (formula.operands.length === 0) {
        throw "GCF needs at least one argument, none given";
    }
    const terms = formula.operands.concat([]);
    if (!terms.every(_isInteger)) {
        throw "GCF is only supported on number terms as arguments";
    }
    var term0 = terms.shift();
    const gcf = terms.reduce((gcfSoFar, num) => gcd(gcfSoFar, num), term0);
    return gcf;
}

const _isInteger = term => {
    if (typeof term !== 'number') {
        return false;
    }
    return Math.trunc(term) === term;
}

const simplifyFormula = (formula, level = 0, logStepFun) => {
    const indent = Array(level).fill('  ').join('');
    if (typeof logStepFun !== 'function') {
        logStepFun = (title, formula, previousFormula) => {
            console.log(
                `%c${title}: ${printFormula(previousFormula)} ==> ${printFormula(formula)}`,
                'color: black; padding: 10pt; border: 1pt solid green'
            );
        }
        logStepFun = (title, formula, previousFormula) => {
            if (level > 0) {
                return;
            }
            const latexString0 = printFormula(previousFormula, { latex: true });
            const latexString1 = printFormula(formula, { latex: true });
            const latexString = `${latexString0}\\ \\Rightarrow ${latexString1}`;
            addMathResult(({ mathField, previousMathField, textDiv }) => {
                previousMathField.latex(latexString0);
                mathField.latex(latexString1);
                textDiv.innerHTML = `${title}:`;
            });
        }
    }
    const removeNeutralElement = (op, operands) => {
        const ne = neutralElement[op];
        if ((typeof ne !== 'number') || operands.length < 2) {
            return operands;
        }
        return operands.filter(operand => operand !== ne);
    }
    const evalNumericPart = (op, opfun, ...operands) => {
        console.log(`evalNumericPart ${JSON.stringify(operands)}`);
        const numberOperands = [];
        const otherOperands = [];
        const numberOperandsIndexes = [];
        for (let i = 0; i < operands.length; i++) {
            let operand = operands[i];
            if (_isNumeric(operand)) {
                numberOperands.push(operand);
                numberOperandsIndexes.push(i);
            } else {
                otherOperands.push(operand);
            }
        }
        if (numberOperands.length < 1) {
            return null;
        }
        console.log(`numberOperands to eval: ${numberOperands}`);
        try {
            const evalue = opfun.call(null, ...numberOperands);
            console.log(`   = ${evalue}`);
            if (otherOperands.length === 0) {
                return evalue;
            }
            let index0 = numberOperandsIndexes.shift();
            operands[index0] = evalue;
            numberOperandsIndexes.forEach(index => operands.splice(index, 1));
            let newOperands = removeNeutralElement(op, operands);
            if (newOperands.length === 1) {
                return newOperands[0];
            }
            return { op: op, operands: newOperands };
        } catch (err) {
            console.error(err);
        }
        return null;
    }
    if (_isNumeric(formula) || (typeof formula === 'string')) {
        console.log(`%c${indent}${JSON.stringify(formula)} is numeric or a string`, 'font-style: italics');
        return formula;
    }
    const basicEval = formula => {
        console.log(`basicEval(${JSON.stringify(formula)})...`);
        if (_isNumeric(formula) || (typeof formula === 'string')) {
            return formula;
        }
        if (typeof formula === 'object') {
            //console.log(`simpliyFormula ${JSON.stringify(formula)}`);
            var op = formula.op;
            switch (op) {
                case '':
                    op = '*'
                case 'equation':
                case 'uminus':
                case 'reciprocal':
                case '+':
                case '-':
                case '*':
                case '/':
                case '^':
                    let opfun = operatorFunctions[op];
                    let operands = formula.operands.map(t => simplifyFormula(t, level + 1));
                    if (typeof opfun === 'function') {
                        console.log(`calling evalNumericPart for op ${op}...`);
                        let res = evalNumericPart(op, opfun, ...operands);
                        if (_isNumeric(res) || res) return res;
                    }
                    return { op, operands }
                case 'fraction':
                    let num = simplifyFormula(formula.numerator, level + 1);
                    let denom = simplifyFormula(formula.denominator, level + 1);
                    let res = new Fraction(num, denom);
                    //let opfun1 = operatorFunctions['fraction'];
                    //let res = evalNumericPart('fraction', opfun1, num, denom);
                    if (!isNaN(res.decimalValue()) && (_isNumeric(res) || res)) {
                        if (typeof formula.wholeNumber === 'number') {
                            //res += formula.wholeNumber;
                            res = res.add(formula.wholeNumber);
                        }
                        return res;
                    } else {
                        return { wholeNumber: formula.wholeNumber, op: formula.op, numerator: num, denominator: denom };
                    }
                case 'BUILTIN':
                    let fname = formula.functionName;
                    if (fname === 'GCF') {
                        return _evalGCF(formula);
                    }
                default:
                    let msg = `unknown operator: "${formula.op}"`;
                    console.error(msg);
                    throw msg
            }
        }
    }
    const toDecimal = formula => {
        console.log(`toDecimal(${JSON.stringify(formula)})...`);
        if (_isNumeric(formula) || (typeof formula === 'string')) {
            return formula;
        }
        if (typeof formula === 'object') {
            var { op } = formula;
            switch (op) {
                case '':
                    op = '*'
                case 'equation':
                case 'uminus':
                case 'reciprocal':
                case '+':
                case '-':
                case '*':
                case '/':
                case '^':
                    let operands = formula.operands.map(t => toDecimal(t));
                    return { op, operands }
                case 'fraction':
                    let num = simplifyFormula(formula.numerator, level + 1);
                    let denom = simplifyFormula(formula.denominator, level + 1);
                    let res = new Fraction(num, denom);
                    //let opfun1 = operatorFunctions['fraction'];
                    //let res = evalNumericPart('fraction', opfun1, num, denom);
                    if (!isNaN(res.decimalValue()) && (_isNumeric(res) || res)) {
                        if (typeof formula.wholeNumber === 'number') {
                            //res += formula.wholeNumber;
                            res = res.add(formula.wholeNumber);
                        }
                        return res;
                    } else {
                        return { wholeNumber: formula.wholeNumber, op: formula.op, numerator: num, denominator: denom };
                    }
                case 'BUILTIN':
                    let fname = formula.functionName;
                    if (fname === 'GCF') {
                        return _evalGCF(formula);
                    }
                default:
                    let msg = `unknown operator: "${formula.op}"`;
                    console.error(msg);
                    throw msg
            }
        }
    }
    var res = formula;
    var previousResult = null;
    const operations = [
        { func: basicEval, title: 'simplify', debugTitle: 'basicEval' },
        { func: applyUminus, title: 'evaluating unary minus', hidden: true },
        { func: flattenOperands, title: 'flatten terms', hidden: false },
        { func: combinePolynomialTerms, title: 'combine variable terms' },
        { func: expandFactors, title: 'multiply out/ausmultiplizieren' },
        { func: solveLinearEquation, title: 'solve linear equation' }
    ]
    for (let i = 0; i < 2; i++) {
        operations.forEach(({ func, title, debugTitle, hidden }) => {
            const res0 = func(res);
            console.log(`%c${indent}${debugTitle || title}: ${JSON.stringify(res)} = ${JSON.stringify(res0)}`, 'font-weight:bold;font-size:10pt;');
            if (!hidden) {
                if (_formulaHasChangedForOutput(previousResult, res0)) {
                    logStepFun(title, res0, res);
                }
                previousResult = res0;
            }
            res = res0;
        })
        /*
        res = basicEval(res);
        if (level === 0)
            console.hlog(`after basicEval: ${printFormula(res)}`);
        res = applyUminus(res);
        if (level === 0)
            console.hlog(`after applyUminus: ${printFormula(res)}`);
        res = flattenOperands(res);
        if (level === 0)
            console.hlog(`after flattenOperands: ${printFormula(res)}`);
        res = combinePolynomialTerms(res);
        if (level === 0)
            console.hlog(`after combinePolynomialTerms: ${printFormula(res)}`);
        res = expandFactors(res);
        if (level === 0)
            console.hlog(`after expandFactors: ${JSON.stringify(res)}`);
        res = solveLinearEquation(res);
        */
    }
    logStepFun('final result', res, formula);
    return res;
}