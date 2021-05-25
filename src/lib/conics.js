const Terms = require('../term');
const { Term } = Terms;
const { basicEval, getSumTerms, _M, _T, numTerm0, completeTheSquare, numTerm1, negateTerm } = require('./base');
const { logTerm, logTerms, _d, uminusTerm } = require('../utils');

// parabola variants
const VERTICAL_UP = 0;
const VERTICAL_DOWN = 1;
const HORIZONTAL_RIGHT = 2;
const HORIZONTAL_LEFT = 3;

// ellipse variants
const MAJOR_AXIS_HORIZONTAL = 0;
const MAJOR_AXIS_VERTICAL = 1;

// hyperbola variants
const TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS = MAJOR_AXIS_HORIZONTAL;
const TRANSVERSE_AXIS_PARALLEL_TO_Y_AXIS = MAJOR_AXIS_VERTICAL;

const bringConstantTermsToRhs = term => {
    const _v = {};
    if (!_M('equation(Lhs, Rhs)', term, _v)) {
        throw "not an equation"
    }
    logTerm('Lhs: ', _v.Lhs);
    const _splitNumTerms = (terms, negateNumTerms) => {
        const numTerms = terms.filter(t => t.isNumTerm)
            .map(t => negateNumTerms ? Term.uminusTerm(t) : t)
            .map(t => basicEval(t));
        const nonNumTerms = terms.filter(t => !t.isNumTerm)
            .map(t => negateNumTerms ? t : Term.uminusTerm(t))
        return [numTerms, nonNumTerms]
    }
    const lterms = getSumTerms(_v.Lhs);
    const rterms = getSumTerms(_v.Rhs);
    const [lhsNumTerms, lhsNonNumTerms] = _splitNumTerms(lterms, true);
    const [rhsNumTerms, rhsNonNumTerms] = _splitNumTerms(rterms, false);
    //logTerms('lhs num terms: ', lhsNumTerms);
    //logTerms('rhs num terms: ', rhsNumTerms);
    const newLhs = basicEval(new Terms.Sum([...lhsNonNumTerms, ...rhsNonNumTerms]));
    const newRhs = basicEval(new Terms.Sum([...rhsNumTerms, ...lhsNumTerms]));
    logTerm('newLhs:', newLhs);
    logTerm('newRhs:', newRhs);
    const rterm = basicEval(new Terms.Equation([newLhs, newRhs]));
    const steps = [{ text: `Bringing constant terms to rhs:`, latex: rterm.latex }];
    return [steps, rterm];
}

const checkIfCircleEquation = (term, _v) => {
    const _getSummandForXOrY = (xyterm, xyHash) => {
        var summand = null;
        const _v0 = {};
        if (_M(`sum(XY,N#)`, xyterm, _v0)) {
            let nterm = _v0['N#'];
            logTerm(`number term for ${_v0.XY.toTermString()}:`, nterm);
            summand = nterm;
        }
        else if (_M('XY', xyterm, _v0)) {
            summand = numTerm0;
        }
        else {
            throw `not a circle equation (can't find num term for ${xy})`
        }
        const xyTerm = _v0.XY;
        const xy = xyTerm.name;
        if (!xyTerm.isIdentifierTerm || !(['x', 'y'].includes(xy))) {
            throw `not a circle equation ("${xyTerm.toTermString()}" should be "x" or "y")`;
        }
        console.log('x or y: %s', xy);
        //return summand;
        xyHash[xy] = summand.value.negated();
    }
    const _v0 = {};
    if (_M('equation(sum(power(Term1,2), power(Term2,2)), Num#)', term, _v0)) {
        let { Term1, Term2 } = _v0;
        console.log(_v0);
        logTerm('Xterm:', Term1);
        logTerm('Yterm:', Term2);
        logTerm('#Num:', _v0['Num#']);
        const xyHash = {};
        const rsquareValue = _v0['Num#'].value;
        _getSummandForXOrY(Term1, xyHash);
        _getSummandForXOrY(Term2, xyHash);
        const hvalue = xyHash.x;
        const kvalue = xyHash.y;

        if (!hvalue) throw `there is no "x" in ${term.toTermString()}`;
        if (!kvalue) throw `there is no "y" in ${term.toTermString()}`;

        console.log(`h = ${hvalue}, k = ${kvalue}, r^2 = ${rsquareValue}, r = ${rsquareValue.sqrt()}`);
        return { h: hvalue, k: kvalue, rSquare: rsquareValue, r: rsquareValue.sqrt() }
    } else {
        throw `not a circle equation: ${term.latex}`
    }
}

const getFactorOfSquareTerm = (equation, x) => {
    if (!(equation instanceof Terms.Equation)) {
        throw `getFactorOfSquareTerm must be called on an equation, not ${equation.getTermString()}`;
    }
    const sumTerms = [...getSumTerms(equation.lhs), ...getSumTerms(equation.rhs)];
    for (let t of sumTerms) {
        const _v = {};
        if (_M(`power(${x},2)`, t)) {
            return numTerm1;
        }
        if (_M(`product(A#,power(${x}, 2))`, t, _v)) {
            return _v['A#'];
        }
    }
    return null;
}

const divideEquation = (equation, decimal, options = {}) => {
    if (!(equation instanceof Terms.Equation)) {
        throw `divideEquation must be called on an equation, not ${equation.getTermString()}`;
    }
    const { useFractions } = options;
    const _createTerm = t => {
        var t0;
        if (useFractions) {
            const quotientTerm = new Terms.Num(decimal);
            t0 = new Terms.Fraction([t, quotientTerm]);
        } else {
            const factor = _d(1).div(decimal);
            const factorTerm = new Terms.Num(factor);
            t0 = new Terms.Product([factorTerm.clone(), t]);
        }
        return basicEval(t0);
    }
    const lterms = getSumTerms(equation.lhs);
    const rterms = getSumTerms(equation.rhs);
    //const factor = _d(1).div(decimal);
    //const factorTerm = new Terms.Num(factor);
    //const newLterms = lterms.map(t => basicEval(new Terms.Product([factorTerm.clone(), t])));
    //const newRterms = rterms.map(t => basicEval(new Terms.Product([factorTerm.clone(), t])));
    const newLterms = lterms.map(_createTerm);
    const newRterms = rterms.map(_createTerm);
    const newLhs = newLterms.length === 1 ? newLterms[0] : new Terms.Sum(newLterms);
    const newRhs = newRterms.length === 1 ? newRterms[0] : new Terms.Sum(newRterms);
    return basicEval(new Terms.Equation([newLhs, newRhs]));
}

const eliminateSquareFactors = equation => {
    const xSquareFactor = getFactorOfSquareTerm(equation, 'x');
    xSquareFactor && logTerm('factor of x^2:', xSquareFactor);
    const ySquareFactor = getFactorOfSquareTerm(equation, 'y');
    ySquareFactor && logTerm('factor of y^2:', ySquareFactor);
    var eliminationDone = false;
    var term = null;
    var factor = null;
    if (xSquareFactor && ySquareFactor) {
        if (xSquareFactor.value.toNumber() === ySquareFactor.value.toNumber()) {
            eliminationDone = true;
            factor = xSquareFactor.value;
            term = divideEquation(equation, factor);
            logTerm(`equation after dividing by ${factor}:`, term);
        }
    }
    else if (xSquareFactor || ySquareFactor) {
        let squareFactor = xSquareFactor || ySquareFactor;
        factor = squareFactor.value;
        term = divideEquation(equation, factor);
        eliminationDone = true;
    }
    return { eliminationDone, term, factor };
}

const circleEquation = term => {
    const latex0 = term.latex;
    const cterm = basicEval(term);
    const steps = [];
    steps.push({ text: `input term:`, latex: term.latex })
    steps.push({ text: `input term simplified:`, latex: cterm.latex });
    const _v = {};
    var circleParameters = null;
    if (_M('equation(Lhs,Rhs)', cterm, _v)) {
        let [steps0, rterm] = bringConstantTermsToRhs(cterm);
        steps.push(...steps0);
        //steps.push(rterm.toTermString());
        var circleEquation = rterm;
        const info0 = eliminateSquareFactors(circleEquation);
        if (info0.eliminationDone) {
            circleEquation = info0.term;
            steps.push(`Dividing both sides of the equation by ${info0.factor}:`);
            steps.push({ latex: circleEquation.latex });
        }
        const info1 = completeTheSquare(circleEquation, 'y');
        if (info1.completedSquareDone) {
            circleEquation = info1.term;
            console.log('complete the square for "y":' + circleEquation.toTermString());
            //steps.push('complete the square for "y":');
            steps.push(...info1.steps);
            steps.push({ latex: circleEquation.latex })
        }
        const info2 = completeTheSquare(circleEquation, 'x');
        if (info2.completedSquareDone) {
            circleEquation = info2.term;
            console.log('complete the square for "x":' + circleEquation.toTermString());
            //steps.push('complete the square for "x":');
            steps.push(...info2.steps);
            steps.push({ latex: circleEquation.latex })
        }
        if (info1.completedSquareDone || info2.completedSquareDone) {
            circleEquation = basicEval(circleEquation);
            steps.push({
                text: 'Simplified:',
                latex: circleEquation.latex
            });
        }
        try {
            circleParameters = checkIfCircleEquation(circleEquation);
        } catch (err) {
            //steps.push(String(err));
            throw err
        }

    } else {
        throw "input formula is not an equation";
    }
    return { steps, circleParameters }
}

// ------------------------------ Parabola -------------------------------------

const checkParabolaEquation = equation => {
    if (!(equation instanceof Terms.Equation)) {
        throw `checkParabolaEquation must be called on an equation, not ${equation.getTermString()}`;
    }
    const lterms = getSumTerms(equation.lhs);
    const rterms = getSumTerms(equation.rhs);
    if (lterms.length !== 1) {
        throw `not a parabola equation: too many terms on lhs`;
    }
    if (rterms.length !== 1) {
        throw `not a parabola equation: too many terms on rhs`;
    }
    const [lterm] = lterms;
    var [rterm] = rterms;
    // ensure rterm is a product to simplify matching
    if (!_M('product(_,_)', rterm)) {
        rterm = new Terms.Product([numTerm0.clone(), rterm]);
    }
    const _v = {};
    if (!_M('power(BaseTerm,2)', lterm, _v)) {
        throw `Term on lhs must be squared`
    }
    const { BaseTerm } = _v;
    var lhsVarTerm, rhsVarTerm, lhsValue, rhsValue, rhsFactor;
    if (_M('sum(XY, HK#)', BaseTerm, _v)) {
        lhsVarTerm = _v.XY;
        lhsValue = _v['HK#'].value;
    } else {
        lhsVarTerm = BaseTerm;
        lhsValue = _d(0);
    }
    if (!lhsVarTerm.isIdentifierTerm) {
        throw `lhs term doesn't have the right format; can't find "x" or "y"`;
    }
    if (_M('product(RhsFactor#,sum(XY,HK#))', rterm, _v)) {
        rhsVarTerm = _v.XY;
        rhsFactor = _v['RhsFactor#'].value;
        rhsValue = _v['HK#'].value;
    }
    else if (_M('product(RhsFactor#,XY)', rterm, _v)) {
        rhsVarTerm = _v.XY;
        rhsFactor = _v['RhsFactor#'].value;
        rhsValue = _d(0);
    }
    else {
        throw `rhs term doesn't have the right format`;
    }
    if (!rhsVarTerm.isIdentifierTerm) {
        throw `rhs term doesn't have the right format; can't find "x" or "y"`;
    }
    const lhsVar = lhsVarTerm.name;
    const rhsVar = rhsVarTerm.name;
    console.log(`lhsVar: ${lhsVar}, lhsValue: ${lhsValue}`);
    console.log(`rhsVar: ${rhsVar}, rhsValue: ${rhsValue}`);
    console.log(`rhsFactor: ${rhsFactor}`);
    const xyHash = {};
    xyHash[lhsVar] = lhsValue;
    xyHash[rhsVar] = rhsValue;
    if (!xyHash.x || !xyHash.y) {
        var just = "";
        if (Object.keys(xyHash).length === 1) {
            just = " just";
        }
        throw `please use "x" and "y" as variable names, not${just} "${Object.keys(xyHash).join("\" and \"")}"`;
    }
    const h = xyHash.x.negated();
    const k = xyHash.y.negated();
    const isNegative = rhsFactor.isNegative();
    const a = rhsFactor.abs().div(_d(4));
    const pvariant = isNegative
        ? ((lhsVar === 'x') ? VERTICAL_DOWN : HORIZONTAL_LEFT)
        : ((lhsVar === 'x') ? VERTICAL_UP : HORIZONTAL_RIGHT);
    const resObj = { h, k, a, pvariant };
    console.log(`parabola parameters from equation: ${JSON.stringify(resObj)}`);
    return resObj;
}

const _extractFactorOfX = (term, x) => {
    const terms = getSumTerms(basicEval(term));
    logTerms(`input terms for getting factor of ${x}:`, terms);
    const xFactorTerms = terms.map(t => {
        const _v = {};
        if (_M(`product(F#,${x})`, t, _v)) {
            return _v['F#'];
        }
        if (t.isIdentifierTerm && t.name === x) {
            return numTerm1.clone();
        }
        return null;
    }).filter(t => !!t);
    logTerms(`xFactorTerms for ${x}:`, xFactorTerms);
    if (xFactorTerms.length !== 1) {
        throw `factor for ${x} term not found`
    }
    const factorTerm = xFactorTerms[0];
    logTerm('factor term:', factorTerm);
    const factor = _d(1).div(factorTerm.value);
    const newSumTerms = terms.map(t => {
        const qterm = new Terms.Num(factor);
        logTerm('qterm:', qterm);
        return basicEval(new Terms.Product([qterm, t]));
    })
    var res = basicEval(new Terms.Product([factorTerm, new Terms.Sum(newSumTerms)]));
    if (!(res instanceof Terms.Product)) {
        res = new Terms.Product([numTerm1.clone(), res]);
    }
    logTerm('extractFactorOfX result:', res);
    return res;
}

const checkGeneralParabolaEquation = equation => {
    if (!(equation instanceof Terms.Equation)) {
        throw `checkGeneralParabolaEquation must be called on an equation, not ${equation.getTermString()}`;
    }
    const steps = [];
    const _getSquaredVar = (terms, isLhs) => {
        const sterms = terms.map(t => {
            const _v = {};
            if (_M('power(XY,2)', t, _v)) {
                return _v.XY;
            }
            return null
        }).filter(t => !!t);
        if (sterms.length > 1) {
            throw `format not supported: more than one squared term found.`
        }
        if (sterms.length === 0) {
            return null;
        }
        const sterm = sterms[0];
        if (!sterm.isIdentifierTerm) {
            throw `squared term must be either x^2 or y^2`;
        }
        return sterm.name;
    }
    const _filterTermsForSquaredVariable = (terms, squaredVar) => {
        const termsContainingSquaredVar = [];
        const otherTerms = [];
        for (let t of terms) {
            let _v = {};
            if (_M('power(_,_)', t)) {
                termsContainingSquaredVar.push(t);
                continue;
            }
            else if (_M('product(_,XY)', t, _v)) {
                if (_v.XY.isIdentifierTerm && _v.XY.name === squaredVar) {
                    termsContainingSquaredVar.push(t);
                    continue;
                }
            }
            else if (t.isIdentifierTerm && t.name === squaredVar) {
                termsContainingSquaredVar.push(t);
                continue;
            }
            otherTerms.push(t);
        }
        return [termsContainingSquaredVar, otherTerms];
    }
    var lterms = getSumTerms(equation.lhs);
    var rterms = getSumTerms(equation.rhs);
    const lhsSquaredVar = _getSquaredVar(lterms);
    const rhsSquaredVar = _getSquaredVar(rterms);
    console.log(`lhsSquaredVar: ${lhsSquaredVar}`);
    console.log(`rhsSquaredVar: ${rhsSquaredVar}`);
    if (lhsSquaredVar && rhsSquaredVar) {
        throw `only one of x^2 or y^2 can occur in the equation`;
    }
    if (rhsSquaredVar) {
        // swap lhs and rhs
        equation = new Terms.Equation([equation.rhs, equation.lhs]);
        logTerm('rhs and lhs swapped in equation, so that squared term is in lhs: ', equation);
    }
    const squaredVar = lhsSquaredVar ? lhsSquaredVar : rhsSquaredVar;
    if (!squaredVar) {
        throw `couldn't find x^2 or y^2 in equation`;
    }
    if (squaredVar !== 'x' && squaredVar !== 'y') {
        throw `please use only "x" or "y" in equation`;
    }
    const otherVar = squaredVar === 'x' ? 'y' : 'x';
    lterms = getSumTerms(equation.lhs);
    rterms = getSumTerms(equation.rhs);
    const [lhsTermsContainingSquaredVar, lhsOtherTerms] = _filterTermsForSquaredVariable(lterms, squaredVar);
    const [rhsTermsContainingSquaredVar, rhsOtherTerms] = _filterTermsForSquaredVariable(rterms, squaredVar);
    logTerms(`lhs terms containing ${squaredVar}:`, lhsTermsContainingSquaredVar);
    logTerms(`lhs other terms:`, lhsOtherTerms);
    logTerms(`rhs terms containing ${squaredVar}:`, rhsTermsContainingSquaredVar);
    logTerms(`rhs other terms:`, rhsOtherTerms);
    const newLhsTerms = [...lhsTermsContainingSquaredVar, ...rhsTermsContainingSquaredVar.map(t => negateTerm(t))];
    const newRhsTerms = [...rhsOtherTerms, ...lhsOtherTerms.map(t => negateTerm(t))];
    equation = basicEval(new Terms.Equation([new Terms.Sum(newLhsTerms), new Terms.Sum(newRhsTerms)]));
    logTerm(`new equation after putting all terms containing ${squaredVar} to lhs: `, equation);
    steps.push(`rearranged equation:`);
    steps.push({ latex: equation.latex });
    const cinfo = completeTheSquare(equation, squaredVar);
    if (cinfo.completedSquareDone) {
        equation = cinfo.term;
        //steps.push(`complete the square for "${squaredVar}":`);
        steps.push(...cinfo.steps);
        steps.push({ latex: equation.latex })
    }
    const newRhs = _extractFactorOfX(equation.rhs, otherVar);
    equation = new Terms.Equation([equation.lhs, newRhs]);
    return { steps, term: equation };
}

const parabolaEquation = term => {
    const steps = [];
    var parabolaParameters = null;
    const cterm = basicEval(term);
    steps.push({ text: `input term:`, latex: term.latex })
    steps.push({ text: `input term simplified:`, latex: cterm.latex });
    var parabolaEquation = cterm;
    const info0 = eliminateSquareFactors(parabolaEquation);
    if (info0.eliminationDone) {
        parabolaEquation = info0.term;
        steps.push(`Dividing both sides of the equation by ${info0.factor}:`);
        steps.push({ latex: parabolaEquation.latex });
    }
    try {
        const info = checkGeneralParabolaEquation(parabolaEquation);
        console.log(info);
        steps.push(...info.steps);
        parabolaEquation = info.term;
    } catch (err) {
        console.error(`not in general form: ${err}`)
    }
    try {
        parabolaParameters = checkParabolaEquation(parabolaEquation);
    } catch (err) {
        //steps.push(String(err));
        throw err;
    }
    return { steps, parabolaParameters }
}

// ------------------------------ Ellipse -------------------------------------

const checkEllipseEquation = (equation, isHyperbola = false) => {
    const _getXYHK = (t, xyHash) => {
        const _v = {};
        var xyterm;
        var hkvalue;
        if (_M('sum(XY, HK#)', t, _v)) {
            xyterm = _v.XY;
            hkvalue = _v['HK#'].value;
        } else {
            xyterm = t;
            hkvalue = _d(0);
        }
        const xy = xyterm.name;
        if (!xyterm.isIdentifierTerm || !['x', 'y'].includes(xy)) {
            throw `not an ellipse equation; expected "x" or "y", but found ${xyterm}`;
        }
        xyHash[xy] = { hkvalue };
        return xy;
    }
    if (!(equation instanceof Terms.Equation)) {
        throw `checkParabolaEquation must be called on an equation, not ${equation.getTermString()}`;
    }
    const steps = [];
    var isValidEquation = true;
    const [steps0, term0] = bringConstantTermsToRhs(equation);
    steps.push(...steps0);
    equation = term0;
    if (!equation.rhs.value.equals(_d(1))) {
        const dvalue = equation.rhs.value;
        console.log(`rhs of equation is not 1 but ${dvalue}`);
        steps.push(`Dividing both side by ${dvalue}:`);
        equation = divideEquation(equation, dvalue, { useFractions: true });
        logTerm(`Equation after division by ${dvalue}: `, equation);
        steps.push({ latex: equation.latex });
    }
    const lterms = getSumTerms(equation.lhs);
    logTerms('lterms: ', lterms);
    const xyHash = {};
    lterms.forEach(t => {
        const _v = {};
        let quotientValue = null;
        let xy = null;
        if (_M('fraction(power(XTerm,2),Quotient#)', t, _v)) {
            quotientValue = _v['Quotient#'].value;
            xy = _getXYHK(_v.XTerm, xyHash);
        }
        else if (_M('product(Factor#,power(XTerm,2))', t, _v)) {
            let factorValue = _v['Factor#'].value;
            quotientValue = _d(1).div(factorValue);
            xy = _getXYHK(_v.XTerm, xyHash);
        }
        else if (_M('power(XTerm,2)', t, _v)) {
            quotientValue = _d(1);
            xy = _getXYHK(_v.XTerm, xyHash);
        }
        else {
            isValidEquation = false;
            throw `This isn't an ellipse equation, found unrecognized term "${t}"`;
        }
        xyHash[xy].quotientValue = quotientValue;
        console.log(`quotientValue for ${t}: ${quotientValue}`);
    })
    console.log('xyHash: %o', xyHash);
    if (!(xyHash.x && xyHash.y)) {
        throw `please use "x" and "y" in ellipse formula; found "${Object.keys(xyHash).join('" and "')}"`;
    }
    if (isHyperbola) {
        // hyperbola:
        let xquotientIsNegative = xyHash.x.quotientValue.lessThanOrEqualTo(0);
        let yquotientIsNegative = xyHash.y.quotientValue.lessThanOrEqualTo(0);
        if ((xquotientIsNegative && yquotientIsNegative) || (!xquotientIsNegative && !yquotientIsNegative)) {
            throw `This is not a hyperbola equation; term containing "x" and "y" can't both be positive or both be negative.`
        }
    } else {
        // ellipse:
        if (xyHash.x.quotientValue.lessThanOrEqualTo(0) || xyHash.y.quotientValue.lessThanOrEqualTo(0)) {
            throw `This isn't an ellipse equation, found a negative denominator`;
        }
    }
    const majorAxis = xyHash.x.quotientValue.gt(xyHash.y.quotientValue) ? MAJOR_AXIS_HORIZONTAL : MAJOR_AXIS_VERTICAL;
    const h = Number(xyHash.x.hkvalue.negated());
    const k = Number(xyHash.y.hkvalue.negated());
    const a = Number((xyHash.x.quotientValue.gt(xyHash.y.quotientValue) ? xyHash.x.quotientValue : xyHash.y.quotientValue).abs().sqrt());
    const b = Number((xyHash.x.quotientValue.gt(xyHash.y.quotientValue) ? xyHash.y.quotientValue : xyHash.x.quotientValue).abs().sqrt());
    const parameters = { majorAxis, h, k, a, b }
    console.log(`parameters: %o`, parameters);
    return { steps, term: equation, isValidEquation, parameters };
}

const checkEllispeEquationGeneralForm = equation => {
    const steps = [];
    const [steps0, term0] = bringConstantTermsToRhs(equation);
    steps.push(...steps0);
    equation = term0;
    var done = false;
    var xinfo = completeTheSquare(equation, 'x');
    if (xinfo.completedSquareDone) {
        steps.push(...xinfo.steps);
        logTerm('equation after completing the square for "x":', xinfo.term);
        console.log(xinfo.term.latex);
        equation = xinfo.term;
        done = true;
    }
    var yinfo = completeTheSquare(equation, 'y');
    if (yinfo.completedSquareDone) {
        steps.push(...yinfo.steps);
        logTerm('equation after completing the square for "y":', yinfo.term);
        console.log(yinfo.term.latex);
        equation = yinfo.term;
        done = true;
    }
    return { steps, done, term: equation };
}

const ellipseEquation = (term, isHyperbola = false) => {
    const steps = [];
    var parameters = null;
    const cterm = basicEval(term, { fractionsToProducts: false });
    steps.push({ text: `input term:`, latex: term.latex })
    steps.push({ text: `input term simplified:`, latex: cterm.latex });
    var ellipseEquation = cterm;
    var info = checkEllispeEquationGeneralForm(ellipseEquation, isHyperbola);
    if (info.steps) steps.push(...info.steps);
    if (info.done) {
        ellipseEquation = info.term;
    }
    info = checkEllipseEquation(ellipseEquation, isHyperbola);
    if (info.steps) steps.push(...info.steps);
    if (info.isValidEquation) {
        ({ parameters } = info);
    }
    return { steps, parameters };
}

// ------------------------------ Hyperbola -------------------------------------

const hyperbolaEquation = term => {
    return ellipseEquation(term, true);
}

// ------------------------------ Common -------------------------------------

const conicsEquation = term => {
    const resultSteps = [];
    const errorSteps = [];
    const hilight = text => {
        return `<div style="color:white;background:blue;padding:10px;font-size:18pt;margin:20px;display:inline-block">${text}</div>`;
    }
    try {
        const { steps, circleParameters } = circleEquation(term);
        resultSteps.push(hilight(`This is a circle equation!`));
        resultSteps.push(...steps);
        return { steps: resultSteps, circleParameters }
    } catch (err) {
        errorSteps.push(`not a circle equation: ${err}`)
    }

    try {
        const { steps, parabolaParameters } = parabolaEquation(term);
        resultSteps.push(hilight(`This is a parabola equation!`));
        resultSteps.push(...steps);
        return { steps: resultSteps, parabolaParameters };
    } catch (err) {
        errorSteps.push(`not a parabola equation: ${err}`);
    }

    try {
        const { steps, parameters } = ellipseEquation(term);
        resultSteps.push(hilight(`This is an ellipse equation!`));
        resultSteps.push(...steps);
        return { steps: resultSteps, ellipseParameters: parameters }
    } catch (err) {
        errorSteps.push(`not an ellipse equation: ${err}`);
    }

    try {
        const { steps, parameters } = hyperbolaEquation(term);
        resultSteps.push(hilight(`This is a hyperbola equation!`));
        resultSteps.push(...steps);
        return { steps: resultSteps, hyperbolaParameters: parameters }
    } catch (err) {
        errorSteps.push(`not a hyperbola equation: ${err}`);
    }
    return { steps: errorSteps };
}

module.exports = {
    circleEquation,
    parabolaEquation,
    ellipseEquation,
    hyperbolaEquation,
    conicsEquation
}