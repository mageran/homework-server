const Terms = require('../term');
const { Term } = Terms;
const { basicEval, _M, _T, numTerm0 } = require('./base');
const { logTerm, logTerms, _d, uminusTerm } = require('../utils');

const getSumTerms = term => {
    const _v = {};
    if (_M('sum(...A)', term, _v)) {
        return _v.A.operands;
    }
    return [term];
}

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
    const _getSummandForXOrY = (xyterm, xy) => {
        const _v0 = {};
         if (_M(`sum(${xy},N#)`, xyterm, _v0)) {
            let nterm = _v0['N#'];
            logTerm(`number term for ${xy}:`, nterm);
            return nterm;
        }
        else if (_M(xy, term)) {
            return numTerm0;
        }
        else {
            throw `not a circle equation (can't find num term for ${xy})`
        }
    }
    const _v0 = {};
    if (_M('equation(sum(power(XTerm,2), power(YTerm,2)), Num#)', term, _v0)) {
        let { XTerm, YTerm } = _v0;
        console.log(_v0);
        logTerm('Xterm:', XTerm);
        logTerm('Yterm:', YTerm);
        logTerm('#Num:', _v0['Num#']);
        const rsquareValue = _v0['Num#'].value;
        const hvalue = _getSummandForXOrY(XTerm, 'x').value.negated();
        const kvalue = _getSummandForXOrY(YTerm, 'y').value.negated();
        console.log(`h = ${hvalue}, k = ${kvalue}, r^2 = ${rsquareValue}, r = ${rsquareValue.sqrt()}`);
        return { h: hvalue, k: kvalue, rSquare: rsquareValue, r: rsquareValue.sqrt() }
    } else {
        throw `not a circle equation: ${term.toTermString()}`
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
        steps.push(rterm.toTermString());
        circleParameters = checkIfCircleEquation(rterm);

    } else {
        throw "input formula is not an equation";
    }
    return { steps, circleParameters }
}

module.exports = {
    circleEquation
}