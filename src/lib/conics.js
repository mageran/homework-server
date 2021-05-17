const Terms = require('../term');
const { Term } = Terms;
const { basicEval, getSumTerms, _M, _T, numTerm0, completeTheSquare } = require('./base');
const { logTerm, logTerms, _d, uminusTerm } = require('../utils');


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
    const steps = [ { text: `Bringing constant terms to rhs:`, latex: rterm.latex }];
    return [ steps, rterm ];
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
        if (!xyTerm.isIdentifierTerm || !(['x','y'].includes(xy))) {
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

const circleEquation = term => {
    const latex0 = term.latex;
    const cterm = basicEval(term.clone());
    const steps = [];
    steps.push({ text: `input term:`, latex: term.latex })
    steps.push({ text: `input term simplified:`, latex: cterm.latex });
    const _v = {};
    var circleParameters = null;
    if (_M('equation(Lhs,Rhs)', cterm, _v)) {
        let [steps0, rterm ] = bringConstantTermsToRhs(cterm);
        steps.push(...steps0);
        //steps.push(rterm.toTermString());
        var circleEquation = rterm;
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
            steps.push( {
                text: 'Simplified:',
                latex: circleEquation.latex
            });
        }
        try {
        circleParameters = checkIfCircleEquation(circleEquation);
        } catch(err) {
            steps.push(String(err));
        }

    } else {
        throw "input formula is not an equation";
    }
    return { steps, circleParameters }
}

module.exports = {
    circleEquation
}