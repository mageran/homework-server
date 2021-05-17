
const { circleEquation } = require('../lib/conics');

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
    ]
}]