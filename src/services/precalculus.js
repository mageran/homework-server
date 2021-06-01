
const { circleEquation, parabolaEquation, ellipseEquation, hyperbolaEquation, conicsEquation } = require('../lib/conics');
const { basicEval, solveFor, getVarNamesList, substitute } = require('../lib/base');
const Terms = require('../term');

/*
module.exports = [{
    service: "extractParametersExponentialFunction",
    rules: "extract-exponential-transformation-parameters",
    functor: "get_params",
    resultVariable: 'RESULT'
}
]
*/


module.exports = [{
    service: 'circleEquation',
    func: circleEquation,
    parameters: [
        { name: 'equation', parseIntoTerm: true }
    ],
},{
    service: 'parabolaEquation',
    func: parabolaEquation,
    parameters: [
        { name: 'equation', parseIntoTerm: true }
    ],
},{
    service: 'ellipseEquation',
    func: ellipseEquation,
    parameters: [
        { name: 'equation', parseIntoTerm: true }
    ],
},{
    service: 'hyperbolaEquation',
    func: hyperbolaEquation,
    parameters: [
        { name: 'equation', parseIntoTerm: true }
    ],
},{
    service: 'conicsEquation',
    func: conicsEquation,
    parameters: [
        { name: 'equation', parseIntoTerm: true }
    ],
},{
    service: 'simplifyTerm',
    func: term => basicEval(term, { fractionsToProducts: true }).latex,
    parameters: [
        { name: 'term', parseIntoTerm: true }
    ],
},{
    service: 'getVarNames',
    func: getVarNamesList,
    parameters: [
        { name: 'term', parseIntoTerm: true }
    ],
},{
    service: 'solveFor',
    func: (term, x) => {
        const steps = [];
        const resultEquations = solveFor(term, x, steps, { onlyPositiveRoots: false });
        const terms = resultEquations.map(t => t.latex);
        const solutions = [];
        resultEquations.forEach(term => {
            if (term instanceof Terms.Equation) {
                const { lhs, rhs } = term;
                if (lhs.isIdentifierTerm && lhs.name === x) {
                    solutions.push(rhs.latex);
                }
            }
        })
        return { terms, solutions, steps };
    },
    parameters: [
        { name: 'equation', parseIntoTerm: true },
        { name: 'variable' }
    ],
},{
    service: 'substitute',
    func: (t, x, substTerm) => {
        const steps = [];
        const sterm = substitute(t, x, substTerm);
        steps.push({ latex: ` \\text{Substitute&nbsp;}${x}\\text{&nbsp;with&nbsp}${substTerm.latex}:` });
        steps.push({ latex: sterm.latex });
        const term = basicEval(sterm);
        steps.push('Simplified/evaluated:');
        steps.push({ latex: term.latex })
        return { term: term.latex, steps };
    },
    parameters: [
        { name: 'term', parseIntoTerm: true },
        { name: 'variable' },
        { name: 'substTerm', parseIntoTerm: true }
    ],
}]