
const _describeTransformations = {
    title: "Describe function transformations",
    description: `Describes the function transformation for a parent function f(x) for
        a f(b(x-h)) + k
        `,
    parameters: [
        { name: 'a', value: 1 },
        { name: 'b', value: 1 },
        { name: 'h', value: 0 },
        { name: 'k', value: 0 },
    ],
    func: describeTransformation
}

const _whatPoint = {
    title: "What point is on transformed graph?",
    description: "If point p is on f(x) what point is on <p>a * f(b(x-h)) + k</p>?",
    parameters: [
        { name: 'point(s) in list notation', value: "[0,0]" },
        { name: 'a', value: 1 },
        { name: 'b', value: 1 },
        { name: 'h', value: 0 },
        { name: 'k', value: 0 },
    ],
    func: whatPointIsOnGraph
}

const _polynomial = {
    title: 'Polynomial Graph',
    description: 'Polynomial graph upto degree 5',
    parameters: [
        { name: 'a<sub>5</sub>', value: 0, size: 3 },
        { name: 'a<sub>4</sub>', value: 0, size: 3 },
        { name: 'a<sub>3</sub>', value: 0, size: 3 },
        { name: 'a<sub>2</sub>', value: 0, size: 3 },
        { name: 'a<sub>1</sub>', value: 0, size: 3 },
        { name: 'a<sub>0</sub>', value: 0, size: 3 },
        { separator: true },
        //{ name: 'divided by (enter a number)', value: '', size: 3 },
    ],
    func: polynomialGraph
}

const _factorQuadratic = {
    title: 'Factor quadratic equation',
    description: `Try to factor the quadratic polynomial ax^2 + bx + c.
    You can either enter the coefficients a, b, c as numbers or enter the quadratic term directly.
    `,
    parameters: [
        { name: 'a', value: 0 },
        { name: 'b', value: 0 },
        { name: 'c', value: 0 },
        //{ separator: true },
        //{ name: 'Quadratic polynomials term', type: 'formula' }
    ],
    func: factorQuadraticEquation
}

const _describeFunctionBasedOnParentFunctions = {
    title: 'Describe function based on parent functions 1/x and 1/x^2',
    description: 'Identify parent function and describes transformations',
    parameters: [
        { name: 'function', type: 'formula' },
        { separator: true }
    ],
    func: describeFunctionBasedOnParentFunction
}

const _abcFormula = {
    title: 'abc formula',
    description: 'Show steps to solve quadratic equation using abc formula',
    parameters: [
        { name: 'a', value: 1 },
        { name: 'b', value: 1 },
        { name: 'c', value: 1 }
    ],
    func: abcFormula
}

const _pqFormula = {
    title: 'pq formula',
    description: 'Show steps to solve quadratic equation using pq formula',
    parameters: [
        { name: 'p', value: 1 },
        { name: 'q', value: 1 }
    ],
    func: pqFormula
}

const _angleInfo = {
    title: "Angle conversion and drawing",
    description: "Enter angle in either degrees, radians, or radians in terms of a factor of PI. (ENTER ONLY ONE FIELD)",
    parameters: [
        { name: 'degrees', value: '', type: 'formula' },
        { name: 'factor of PI', value: '', type: 'formula' },
        { name: 'radians', value: '', type: 'formula' },
        { separator: true }
    ],
    func: angleInfo
}

const _trigFunctions = {
    title: 'Trigonomic Function Values',
    description: `Given x, y, and r determine the value of the 6 trig functions.
    One of the values can be left empty, in which case it's calculated using Pythagoras.`,
    parameters: [
        { name: 'x', value: '' },
        { name: 'y', value: '' },
        { name: 'r', value: '' },
        { separator: true },
        {
            name: 'missing parameter (x or y) is...',
            type: 'select',
            options: [
                { label: ' > 0', value: 1 },
                { label: ' < 0', value: -1 }
            ]
        }
    ],
    func: trigFunctions
}

const _circleSectorAndArea = {
    title: 'Circle Sector and Area (Formulas)',
    description: '',
    parameters: [],
    func: circleSectorAndArea
}

const _standardToVertex = {
    title: 'Quadratic function: standard to vertex form',
    description: '',
    parameters: [
        { name: 'a', value: 1 },
        { name: 'b', value: 1 },
        { name: 'c', value: 1 }
    ],
    func: standardFormToVertexForm
}

const _fenceMaxArea = {
    title: 'Fence',
    description: 'Max rectangular area for fence of given length',
    parameters: [
        { name: 'length of fence', value: 0 }
    ],
    func: fenceMaxArea,
}

const _sinusodialTransformationsFromEquation = {
    title: 'Sinusodial Transformations (from equation)',
    description: 'Analyze function transformations for sin/cos functions of the form y = A sin[B(x-h)] + k',
    parameters: [
        { name: 'Function term of the form "y = A sin/cos (B(x-h)) + k"', type: 'formula' }
    ],
    func: sinusodialTransformations
}

const _sinusodialTransformationsFromParameters = {
    title: 'Sinusodial Transformations (from parameters)',
    description: 'Analyze function transformations for sin/cos functions from parameters A, B or P, h, k ',
    parameters: [
        { name: 'A', type: 'formula' },
        { separator: true },
        { name: 'B', type: 'formula' },
        { name: 'P', type: 'formula' },
        { separator: true },
        { name: 'h (phase shift)', type: 'formula' },
        { separator: true },
        { name: 'k (vertical shift, midline)', type: 'formula' },
        { separator: true },
        { name: 'Trig function', type: 'select', options: [{ label: 'sin', value: 0 }, { label: 'cos', value: 1 }] }
    ],
    func: sinusodialTransformationsFromParameters
}

const _sinusodialTransformationsFromMaxMin = {
    title: 'Sinusodial Transformations (from max/min points)',
    description: 'Analyze function transformations for sin/cos functions from parameters A, B or P, h, k ',
    parameters: [
        { name: 'Max point x', type: 'formula' },
        { name: 'Max point y', type: 'formula' },
        { separator: true },
        { name: 'Min point x', type: 'formula' },
        { name: 'Min point y', type: 'formula' },
        { separator: true },
        {
            name: 'Generated trig function',
            type: 'select',
            options: [
                { label: 'cos', value: 1 },
                { label: 'sin', value: 0 },
                { label: '-cos', value: 3 },
                { label: '-sin', value: 2 },
            ]
        }
    ],
    func: sinusodialTransformationsFromMaxMin
}

const _exponentialFunctionTransformationsFromParameters = {
    title: 'Exponential Function Transformation from Parameters',
    description: 'Enter transformation parameters a,b,h, and k, as well as the base of the parent function n for parent function n^x',
    parameters: [
        { name: 'a', value: 1, size: 4 },
        { name: 'b', value: 1, size: 4 },
        { name: 'h', value: 0, size: 4 },
        { name: 'k', value: 0, size: 4 },
        { name: 'parent function base (number)', value: 1, size: 4 },
    ],
    func: exponentialFunctionTransformationsFromParameters
}

const _exponentialFunctionTransformationsFromEquation = {
    title: 'Exponential Function Transformation from Equation',
    description: 'Enter equation of the form y = a(n)^(b(x-h)) +k ',
    parameters: [
        { name: 'Equation', type: 'formula', cssClass: "width700", value: "y = a\\cdot n^{b(x-h)} + k" },
    ],
    func: exponentialFunctionTransformationsFromEquation

}

const _functionByValue = {
    title: 'Function by value table; composition, inverse',
    description: 'Enter values for f and g as list of point like [[1,3],[-2,4],[6,2]]',
    parameters: [
        { name: 'values for f', value: '', noEval: true },
        { separator: true },
        { name: 'values for g', value: '', noEval: true },
        { separator: true },
        { name: 'apply on value:', value: 0 },
        { separator: true },
        {
            name: 'Include inverses',
            type: 'select',
            options: [
                { label: 'yes', value: 1 },
                { label: 'no', value: 0 },
            ]
        }
    ],
    func: functionByValue
}

const _logarithmicFunctionTransformationsFromParameters = {
    title: 'Logarithmitc Function Transformation from Parameters',
    description: 'Enter transformation parameters a,b,h, and k, as well as the base of the parent function n for parent function log n x',
    parameters: [
        { name: 'a', value: 1, size: 4 },
        { name: 'b', value: 1, size: 4 },
        { name: 'h', value: 0, size: 4 },
        { name: 'k', value: 0, size: 4 },
        { name: 'parent function base (number or "e")', value: 1, size: 4 },
    ],
    func: logarithmicFunctionTransformationsFromParameters
}

const _financialModelsFixedRate = {
    title: 'Financial Models fixed rate',
    description: 'Enter all the known fields, leave the one that is unknown (will be calculated) empty',
    parameters: [
        { name: 'A', value: '13918.09', size: 8 },
        { name: 'P', value: '8540', size: 8 },
        { name: 'r (decimal)', value: '0.0288', size: 8 },
        { name: 'n', value: '6', size: 4 },
        { name: 't', value: '', size: 6 }
    ],
    func: financialModelFixedRate
}

const _financialModelsContinuous = {
    title: 'Financial Models continuous',
    description: 'Enter all the known fields, leave the one that is unknown (will be calculated) empty',
    parameters: [
        { name: 'A', value: '9808.87', size: 8 },
        { name: 'P', value: '6496', size: 8 },
        { name: 'r (decimal)', value: '0.0317', size: 8 },
        { name: 't', value: '13', size: 6 }
    ],
    func: financialModelContinuous
}

/*
Adam invests $6,496 in a retirement
account with a fixed annual interest rate of
3.17% compounded continuously. How
long will it take for the account balance to
reach $9,808.87?
13 years
*/

const _findExponentialFunctionFromPoints = {
    title: 'Find exponential function using 2 points',
    description: '',
    parameters: [
        { name: 'point 1 x', value: 1 },
        { name: 'point 1 y', value: 6 },
        { separator: true },
        { name: 'point 2 x', value: 4 },
        { name: 'point 2 y', value: 48 },
        { separator: true },
        { name: 'apply function to value', value: -5 }
    ],
    func: findExponentialFunctionFromPoints
}

const _logarithmicGrowthDecay = {
    title: 'Logarithmic growth and decay',
    description: '',
    parameters: [
        { name: 'A', value: '9808.87', size: 8 },
        { name: 'P (initial value)', value: '6496', size: 8 },
        { name: 'r (decimal)', value: '0.0317', size: 8 },
        { name: 't', value: '13', size: 6 },
        {
            name: 'time unit',
            type: 'select',
            options: [
                { label: 'years', value: 'years' },
                { label: 'months', value: 'months' },
                { label: 'days', value: 'days' },
                { label: 'hours', value: 'hours' },
                { label: 'minutes', value: 'minutes' },
            ]
        }
    ],
    func: logarithmicGrowthDecay
}

const _halfLifeQuestions = {
    title: 'Half-life questions (logarithmic decay)',
    description: `Given the half-life of an element, either
    <ul>
    <li>given percentage of element left in the object, determine the age, or</li>
    <li>given the age, determine how much of the element is left in the object</li>
    </ul>`,
    parameters: [
        { name: 'half-live of element (in years)', value: 5730 },
        { name: 'percentage of element left in object (decimal)', value: 0.08 },
        { name: 'age (in years)', value: '' }
    ],
    func: halfLifeQuestions
}

const _inverseTrigonomicFunctions = {
    title: 'Inverse Trigonomic Functions',
    description: '',
    parameters: [],
    func: inverseTrigonomicFunctions
}

const _configurableUnitCircle = {
    title: 'Unit circle',
    description: '',
    parameters: [],
    func: configurableUnitCircle
}

const _reverseUnitCircleLookup = {
    title: 'Reverse Unit Circle Value Lookup',
    description: 'Shows which value of a unit circle trig-function is equal to the given value/formula',
    parameters: [
        { name: 'Enter value/expression', type: 'formula', cssClass: 'width700' }
    ],
    func: reverseUnitCircleLookup
}

const _trigInverseTrigOptions = [
    { label: 'cos', value: 'cos' },
    { label: 'sin', value: 'sin' },
    { label: 'tan', value: 'tan' },
    { label: 'sec', value: 'sec' },
    { label: 'csc', value: 'csc' },
    { label: 'cot', value: 'cot' },
    { label: 'cos-1', value: 'arccos' },
    { label: 'sin-1', value: 'arcsin' },
    { label: 'tan-1', value: 'arctan' },
    { label: 'sec-1', value: 'arcsec' },
    { label: 'csc-1', value: 'arccsc' },
    { label: 'cot-1', value: 'arccot' },
];

const _singleTrigFunctionOnUnitCircleAngle = {
    title: 'Apply Trig/InvTrig function',
    description: 'Derive value of (inverse) trig function applied on unit circle angle',
    parameters: [
        {
            name: 'Outer Trig/InvTrig Function',
            type: 'select',
            options: [{ label: 'None', value: null }].concat(_trigInverseTrigOptions)
        },
        {
            name: 'Trig/InvTrig Function',
            type: 'select',
            options: _trigInverseTrigOptions
        },
        { name: 'Value: (Angle for trig, numeric for inverse trig)', type: 'formula' }
    ],
    func: singleTrigFunction
}

const _calculatedInverseTrigValues = {
    title: 'Calculated Inverse Trig Values',
    description: 'Determine solutions for inverse trig functions based on calculated value (0 <= x < 2pi)',
    parameters: [
        {
            name: 'Trig Function',
            type: 'select',
            options: _trigInverseTrigOptions.filter(({ value }) => ['cos', 'sin', 'tan'].includes(value))
        },
        {
            name: 'Value',
            value: ''
        }
    ],
    func: calculatedInverseTrigValues
}

const _calculator = {
    title: 'Calculator',
    description: '',
    parameters: [
        { name: 'Formula', type: 'formula', cssClass: 'width700' }
    ],
    func: calculator
}

const _bearingAngles = {
    title: 'Bearing Angles',
    description: 'draw bearing angles of the form 170 or N20E',
    parameters: [
        { name: 'Bearing angle', value: '' }
    ],
    func: bearingAngles
}

const _triangleQuestions = {
    title: 'Triangle Questions',
    description: 'Solve triangle questions where sides and angles are given',
    parameters: [
        {
            name: 'Type',
            type: 'select',
            options: [
                { label: 'Select Triangle type', value: null },
                { label: 'Right Triangle', value: 'right' },
                { label: 'Oblique Triangle', value: 'oblique' }
            ]
        },
        { separator: true }, { name: 'Side/Angle name', value: 'a' }, { name: 'Angle', value: '' }, { name: 'Side', value: '' },
        { separator: true }, { name: 'Side/Angle name', value: 'b' }, { name: 'Angle', value: '' }, { name: 'Side', value: '' },
        { separator: true }, { name: 'Side/Angle name', value: 'c' }, { name: 'Angle', value: '' }, { name: 'Side', value: '' },
        { separator: true },
        { name: 'Sketch', type: 'select', options: [ { label: 'fake', value: 'fake' }, { label: 'accurate', value: 'accurate' }]}
    ],
    func: triangleQuestions
}

const topicObjects = [
    _triangleQuestions,
    _bearingAngles,
    '<b>---------------------</b>',
    _calculatedInverseTrigValues,
    _singleTrigFunctionOnUnitCircleAngle,
    _reverseUnitCircleLookup,
    _inverseTrigonomicFunctions,
    '<b>---------------------</b>',
    _configurableUnitCircle,
    '<b>---------------------</b>',
    _halfLifeQuestions,
    _logarithmicGrowthDecay,
    _financialModelsContinuous,
    _financialModelsFixedRate,
    _findExponentialFunctionFromPoints,
    '<b>---------------------</b>',
    _logarithmicFunctionTransformationsFromParameters,
    //_exponentialFunctionTransformationsFromEquation,
    _exponentialFunctionTransformationsFromParameters,
    _functionByValue,
    _sinusodialTransformationsFromEquation,
    _sinusodialTransformationsFromParameters,
    _sinusodialTransformationsFromMaxMin,
    _trigFunctions,
    '<b>---------------------</b>',
    _angleInfo,
    _circleSectorAndArea,
    '<b>---------------------</b>',
    _abcFormula,
    //_pqFormula,
    _describeFunctionBasedOnParentFunctions,
    _factorQuadratic,
    _polynomial,
    _describeTransformations,
    _fenceMaxArea,
    _standardToVertex,
    _whatPoint,
    _imageOnly('Parent Functions', 'images/parent_functions.png'),
    '<b>---------------------</b>',
    _calculator
];
