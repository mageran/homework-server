
const { circleEquation, parabolaEquation, ellipseEquation, hyperbolaEquation, conicsEquation } = require('../lib/conics');

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
}]