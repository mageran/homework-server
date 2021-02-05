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
        { separator : true },
        //{ name: 'divided by (enter a number)', value: '', size: 3 },
    ],
    func: polynomialGraph
}

const _factorQuadratic ={
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
        { name: 'function', type: 'formula'},
        { separator: true}
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
        { name: 'Trig function', type: 'select', options: [{ label: 'sin', value: 0 }, { label: 'cos', value: 1 }]}
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

const topicObjects = [
    _sinusodialTransformationsFromEquation,
    _sinusodialTransformationsFromParameters,
    _sinusodialTransformationsFromMaxMin,
    _trigFunctions,
    _angleInfo,
    _circleSectorAndArea,
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
];
