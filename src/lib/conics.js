const Terms = require('../term');
const { Term } = Terms;
const { basicEval, getSumTerms, _M, _T, numTerm0, completeTheSquare, numTerm1 } = require('./base');
const { logTerm, logTerms, _d, uminusTerm } = require('../utils');

// parabola variants
const VERTICAL_UP = 0;
const VERTICAL_DOWN = 1;
const HORIZONTAL_RIGHT = 2;
const HORIZONTAL_LEFT = 3;

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

const divideEquation = (equation, decimal) => {
    if (!(equation instanceof Terms.Equation)) {
        throw `divideEquation must be called on an equation, not ${equation.getTermString()}`;
    }
    const lterms = getSumTerms(equation.lhs);
    const rterms = getSumTerms(equation.rhs);
    const factor = _d(1).div(decimal);
    const factorTerm = new Terms.Num(factor);
    const newLterms = lterms.map(t => basicEval(new Terms.Product([factorTerm.clone(), t])));
    const newRterms = rterms.map(t => basicEval(new Terms.Product([factorTerm.clone(), t])));
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
            steps.push('complete the square for "y":');
            steps.push({ latex: circleEquation.latex })
        }
        const info2 = completeTheSquare(circleEquation, 'x');
        if (info2.completedSquareDone) {
            circleEquation = info2.term;
            console.log('complete the square for "x":' + circleEquation.toTermString());
            steps.push('complete the square for "x":');
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
            steps.push(String(err));
        }

    } else {
        throw "input formula is not an equation";
    }
    return { steps, circleParameters }
}

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

const parabolaEquation = term => {
    const steps = [];
    var parabolaParameters = null;
    const cterm = basicEval(term);
    steps.push({ text: `input term:`, latex: term.latex })
    steps.push({ text: `input term simplified:`, latex: cterm.latex });
    try {
        parabolaParameters = checkParabolaEquation(cterm);
    } catch (err) {
        steps.push(String(err));
    }
    return { steps, parabolaParameters }
}

module.exports = {
    circleEquation,
    parabolaEquation
}