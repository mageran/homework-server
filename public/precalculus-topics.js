
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
        { name: 'Sketch', type: 'select', options: [{ label: 'fake', value: 'fake' }, { label: 'accurate', value: 'accurate' }] }
    ],
    testValues: [
        ['oblique', 'a', '', 3, 'b', '', 4, 'c', '', 5, 'accurate'],
        ['right', 'c', '', 500, 'b', 58, '', 'a', 90, '', 'accurate'],
        ['right', 'a', 90, '', 'b', 58, '', 'c', '', 500, 'accurate'],
        ['oblique', 'a', '', 6, 'b', 25, '', 'c', '', 7, 'accurate'],
        ['oblique', 'a', '', 7, 'b', '', 3, 'c', '', 6, 'accurate'],
        ['oblique', 'a', 70, '', 'b', '', 9, 'c', '', 7, 'accurate'],
        ["oblique", "a", 73, '', "b", '', 4, "c", '', 7, "accurate"]],
    func: triangleQuestions
}

const _triangleQuestionsOneLineInput = {
    title: 'Triangle Questions (1-line input)',
    description: `Solve triangle questions where sides and angles are given. Specify the triangle using assignments
    like "a = 5; B = 60; c = 5" which stands for "length of side a is 5, angle B is 60 degrees, length of side c is 5"`,
    parameters: [
        { name: 'Sides and angles', type: 'formula', cssClass: 'width500' }
    ],
    testValues: [
        ['P=34,\ r,\ p\ =\ 8,\ Q=90'],
        ['R=90, r=19, q=14.3, p'],
        ['a = 3, b = 4, c = 5'],
        ['c = 500, B = 58, A = 90'],
        ['A = 90, B = 58, c = 500'],
        ['a = 6, B = 25, c = 7'],
        ['a = 7, b = 3, c = 6'],
        ['A = 70, b = 9, c = 7'],
        ['A = 73, b = 4, c = 7'],
        ['B = 35, a = 3, c = 6'],
        ['a = 14, b = 10, c = 6'],
        ['a = 7, c = 6, B = 115'],
        ['a = 8, b = 17, c = 20'],
        ['P = 44, p = 4, Q = 56, r'],
    ],
    func: triangleQuestionsOneLineInput
}

const _bearingAngleNavigationQuestions = {
    title: 'Bearing Angles Navigation Problems',
    description: `This page is used to solve navigation style question, for instance:
    <p>
      <em>
       After leaving an airport, a plane flies for 1.5 h at a speed of 200 km/h on a course of 200 degree. 
       Then on a course of 340 degree, the plane flies for 2 h at a speed of 250 km/h. At that time,
       how far is the plane from the airport? Draw and label a diagram. (332 km)
      </em>
    </p>
    In this case the two bearing angle are 200 and 340, the two side lengths are 1.5*200 = 300 and 2*250 = 500.`,
    parameters: [
        { name: 'Starting direction (bearings) (at point A)', value: '' },
        { name: 'Distance for initial part', value: '' },
        { separator: true },
        { name: '&nbsp;&nbsp; Turn direction (bearings) (at point B)', value: '' },
        { name: 'Distance for second part', value: '' },
        { separator: true }
    ],
    testValues: [
        ['S61E', 112, 'N20.8W', 148.78],
        [200, 300, 340, 500],
        ['S20W', 300, 'N20W', 500],
        [200, 30000, 340, 50000],
        [200, 0.3, 340, 0.5],
        ['S62E', 75, 'N18E', 53],
        [90, 500, 125, 200],
        [90, 500, 180, 200],
        ['N90E', 500, 'S55E', 200],
        ['N90E', 500, 'S0E', 200],
        ['N90E', 500, 'S45W', 800],
        ['N46E', 3.8, 'N25W', 1.6],
        ['N10E', 3.8, 'N85W', 2.6],
        [10, 3.8, 275, 2.6],
        {
            label: 'Random bearings and distances',
            values: (() => [
                Math.trunc(Math.random() * 340) + 10,
                Math.trunc(Math.random() * 100) + 10,
                Math.trunc(Math.random() * 340) + 10,
                Math.trunc(Math.random() * 100) + 10
            ])
        },
        {
            label: 'Random Compass Bearings and Distances',
            values: (() => [
                (Math.random() > .5 ? 'N' : 'S') + Math.trunc(Math.random() * 90) + (Math.random() > .5 ? 'E' : 'W'),
                Math.trunc(Math.random() * 100) + 10,
                (Math.random() > .5 ? 'N' : 'S') + Math.trunc(Math.random() * 90) + (Math.random() > .5 ? 'E' : 'W'),
                Math.trunc(Math.random() * 100) + 10
            ]
            )
        },
    ],
    func: bearingAngleNavigationQuestions
}

const _areaOfComposedShapes = {
    title: 'Area of Geometrical Shapes',
    description: `Calculate the area of shapes (triangle, circle sectors, rectangles) that are composed with each other.
    For instance, the area of a circle segment, which is the area of a triangle substcted from the area of a circle sector.
    `,
    parameters: [
        { name: "Shapes input (see test cases for examples)", rows: 20, size: 80, value: '', noEval: true, codeEditor: true },
        { name: "Area calculation expression", value: '', noEval: true }
    ],
    testValues: [
        [
            `T1: A = 66, b = 8, c = 12;\nT2: d = T1.a, b = 9, c = 6;`,
            'T1 + T2'
        ],
        [
            'T1: A = 108, b = 12, c = 10;\nT2: B = 132 - T1.B, d = T1.a, c = 10;',
            'T1 + T2'
        ],
        [
            `T1: A = 75, c = 16.5, b = 26;\nT2: c = 18, b = 12.5, a = T1.a;`,
            `T1 + T2`
        ],
        [
            `T: A=60, b=6, c=b;\nS: angle=60, radius=6;`,
            `S - T`
        ],
        [
            `R: width = 12, height = 8.5;\nT: a = 12, b = 11, c = 11;`,
            'R + T'
        ],
        [
            `S: angle = 180, radius = 3;\nT: B = 90, b = 6, c = 3;`,
            'S - T'
        ],
        [
            'T: C=40, b=5, a=b;\nS: angle=180, radius = 0.5 * T.c;',
            'T + S'
        ],
        ['T: P = 44, p = 4, Q = 56, r;', 'T'],
        ['T: S = 122, s = 7, r = 4.3;', 'T'],
        ['T: R = 32, Q = 62, p = 13;', 'T'],
        ['T1: A=108, b=10, c=12;\nT2: b=T1.a, A=132-T1.B, c=10;', 'T1+T2'],
        ['T: A = 46, B = 104, c = 16;', 'T']
    ],
    func: areaOfComposedShapes
}

const _debug = {
    title: 'Debug',
    description: '',
    parameters: [
        { name: 'rules', rows: 10, value: '', noEval: true, codeEditor: true },
        { name: 'formula', type: 'formula', cssClass: 'width500' },
        { separator: true },
        { name: 'mode', type: 'select', options: [{ label: 'match term', value: 'matchTerm' }, { label: 'apply rules', value: 'applyRules' }] },
        { separator: true },
        { name: 'functor', value: '' },
        { separator: true },
    ],
    func: debugUI,
    testValues: [
        ['sum(...A)', 'a + b + c', 'matchTerm', ''],
        [`solve(equation(x,X8), solution(X8)).

solve(equation(sum(x,T#),0), solution(product(-1,T#))).
solve(equation(X1,0), equation(Xsim, 0)) => sim(X1,Xsim).

solve(equation(X2,Y2), R)
        => solve(equation(sum(X2,product(-1,Y2)),0), R).
        
        
sim(sum(A, C), B) => flattenSum(sum(A, C), B).
sim(X7,X7).
        
flattenSum(sum(sum(X3,Y3),Z3), sum(X3, Y3, Z3)).
flattenSum(sum(Z4,sum(X4,Y4)), sum(X4, Y4, Z4)).
flattenSum(X5,X5).`, 'x + 4 = 9', 'applyRules', 'solve']
    ]
}

const conicsCircleProblems = [
    { label: 'Given circle equation, find center and radius', value: 'findCenterRadiusFromEquation' },
    { label: 'Given center and radius, find circle equation', value: 'findEquationFromCenterRadius' },
    { label: 'Given center and point on circle, find circle equation', value: 'findEquationFromCenterAndPointOnCircle' },
    { label: 'Given diameter endpoint, find circle equation', value: 'findEquationFromDiameterEndPoints' }

]

const conicsParabolaProblems = [
    { label: 'Given Equation, find parabola parameters', value: 'fromEquation' },
    { label: 'Given Vertex and Focus, find parabola equation', value: 'fromVertexAndFocus' },
    { label: 'Given Vertex and Directrix, find parabola equation', value: 'fromVertexAndDirectrix' },
    { label: 'Given Vertex, graph variant, and value for "a"', value: 'fromVertexVariantAndA' }
]

const conicsEllipseProblems = [
    { label: 'From Equation', value: 'fromEquation' },
    { label: 'From Parameters (Vertices, Covertices, Center, Foci)', value: 'fromParameters' },
    { label: 'From Major Axis Direction, values for "a" and "b"', value: 'fromAxisAB' },
]

const conicsHyperbolaProblems = [
    { label: 'From Equation', value: 'fromEquation' },
    { label: 'From Parameters (Vertices, Covertices, Center, Foci)', value: 'fromParameters' },
    { label: 'From Transverse Axis Direction, values for center, "a" and "b"', value: 'fromCenterVariantAB' },
]

const _conicsCircle = {
    title: 'Conics: Circle',
    description: 'Problems regarding circle equations (x-h)^2 + (y-k)^2 = r^2',
    parameters: [
        { name: 'Problem', type: 'select', options: [{ label: 'Select Problem', value: '' }, ...conicsCircleProblems] },
        { name: '', type: 'dynamic', hideButtons: true, func: createCircleInputFields }
    ],
    func: conicsCircle,
    testValues: [
        { values: ['findCenterRadiusFromEquation', '(x+2)^2 + (y-1)^2 = 12'], label: 'Eq1' },
        { values: ['findCenterRadiusFromEquation', '(x+2)^2 + (y-1)^2 - 12 = 0'], label: 'Eq2' },
        { values: ['findCenterRadiusFromEquation', '(x+2)^2-12=4 -(y + 3)^2'], label: 'Eq3' },
        { values: ['findCenterRadiusFromEquation', '(y+2)^2-12= -(x+\\frac{3}{5})^2'], label: 'Eq4' },
        { values: ['findCenterRadiusFromEquation', '(x+3)^2 + (y-1)^2 = 4'], label: 'Eq5' },
        { values: ['findCenterRadiusFromEquation', 'x^2 + (y+2)^2 = 36'], label: 'Eq6' },
        { values: ['findCenterRadiusFromEquation', 'x^2 - 4x + y^2 + 6y = 3'], label: 'Eq7' },
        { values: ['findCenterRadiusFromEquation', 'x^2+y^2-2x-8y-8=0'], label: 'Eq8' },
        { values: ['findCenterRadiusFromEquation', 'x^2+y^2-6x+2y+9=36'], label: 'Eq9' },
        { values: ['findCenterRadiusFromEquation', '4x^2 + 4y^2 - 16x + 24y = 12'], label: 'Eq10' },
        { values: ['findCenterRadiusFromEquation', '4x^2+y^2+8x+4y+17=0'], label: 'Eq11' },
        { values: ['findEquationFromCenterRadius', '0', '0', '4'], label: 'Center+Radius1' },
        { values: ['findEquationFromCenterRadius', '2', '-5', '3'], label: 'Center+Radius2' },
        { values: ['findEquationFromCenterAndPointOnCircle', '1', '2', '1', '0'], label: 'Center+Point1' },
        { values: ['findEquationFromCenterAndPointOnCircle', '0', '0', '-2', '-3'], label: 'Center+Point2' },
        { values: ['findEquationFromDiameterEndPoints', '2', '16', '-2', '-2'], label: 'Diameter1' },
        { values: ['findEquationFromDiameterEndPoints', '-2', '-3', '-1', '5'], label: 'Diameter2' },
    ]
}

const _conicsParabola = {
    title: 'Conics Parbola',
    description: 'Problems regarding parabola equations (x-h)^2 = 4a(y-k) or x and y swapped',
    parameters: [
        { name: 'Problem', type: 'select', options: [{ label: 'Select Problem', value: '' }, ...conicsParabolaProblems] },
        { name: '', type: 'dynamic', hideButtons: true, func: createParabolaInputFields }
    ],
    func: conicsParabola,
    testValues: [
        { values: ['fromEquation', '(x-3)^2=-4(y+1)'], label: 'Eq1' },
        { values: ['fromEquation', '(y-4)^2=12(x+1)'], label: 'Eq2' },
        { values: ['fromEquation', '(x+5)^2=4y'], label: 'Eq3' },
        { values: ['fromEquation', '(y+2)^2=-8(x-1)'], label: 'Eq4' },
        { values: ['fromEquation', 'y^2-6y+16x+25=0'], label: 'Eq10' },
        { values: ['fromEquation', 'x^2-8x-4y+12=0'], label: 'Eq11' },
        { values: ['fromEquation', 'y^2-2y-5=x'], label: 'Eq12' },
        { values: ['fromVertexAndFocus', '2', '-1', '2', '-4'], label: 'Vertex+Focus 1' },
        { values: ['fromVertexAndFocus', '-4', '-5', '-4', '-\\frac{9}{2}'], label: 'Vertex+Focus 2' },
        { values: ['fromVertexAndDirectrix', '-3', '1', 'x', '1'], label: 'Vertex+Directrix 1' },
        { values: ['fromVertexVariantAndA', '3', '-1', VERTICAL_DOWN, '1'], label: 'Vertex+Variant+A 1' },
    ]
}

const _conicsEllipse = {
    title: 'Conics Ellipse',
    description: 'Find ellipse equation/parameters',
    parameters: [
        { name: 'Problem', type: 'select', options: [{ label: 'Select Problem', value: '' }, ...conicsEllipseProblems] },
        { name: '', type: 'dynamic', hideButtons: true, func: createEllipseInputFields }
    ],
    func: conicsEllipse,
    testValues: [
        { values: ['fromParameters', '(2,-2)', '(2,2)', '', '', '', '(2,-4)', ''], label: 'Q10 P:C+Vx+F' },
        { values: ['fromParameters', '', '(-4,2)', '', '', '', '(1,2)', '(-3,2)'], label: 'Q11 P:Vx+F+F' },
        { values: ['fromParameters', '(2,-3)', '(5,-3)', '', '', '', '(3,-3)', ''], label: 'Q11 P:C+Vx+F' },
        { values: ['fromParameters', '(2,-1)', '(-2,-1)', '', '(2,2)', '', '', ''], label: 'Q11 P:C+Vx+Cx' },
        { values: ['fromAxisAB', MAJOR_AXIS_VERTICAL, '0', '0', '6', '3'], label: 'Q4' },
        { values: ['fromEquation', '\\frac{x^2}{9} + \\frac{y^2}{36} = 1'], label: 'Q4-Eq' },
        { values: ['fromAxisAB', MAJOR_AXIS_HORIZONTAL, '4', '5', '6', '2'], label: 'Q5' },
        { values: ['fromEquation', '\\frac{(x-4)^2}{36} + \\frac{(y-5)^2}{4} = 1'], label: 'Q5-Eq' },
        { values: ['fromAxisAB', MAJOR_AXIS_VERTICAL, '-4', '-2', '7', '5'], label: 'Q6' },
        { values: ['fromEquation', '\\frac{(x+4)^2}{25} + \\frac{(y+2)^2}{49} = 1'], label: 'Q6-Eq' },
        { values: ['fromEquation', '16x^2 + y^2-160x-4y+388 = 0'], label: 'Q7' },
        { values: ['fromEquation', '4x^2+9y^2+32x+90y+253 = 0'], label: 'Q8' },
        { values: ['fromEquation', '25x^2+36y^2-50x-144y-731=0'], label: 'Q9' },
    ]
}

const _conicsHyperbola = {
    title: 'Conics Hyperbola',
    description: 'Find hyperbola equation/parameters',
    parameters: [
        { name: 'Problem', type: 'select', options: [{ label: 'Select Problem', value: '' }, ...conicsHyperbolaProblems] },
        { name: '', type: 'dynamic', hideButtons: true, func: createHyperbolaInputFields }
    ],
    func: conicsHyperbola,
    testValues: [
        { values: ['fromCenterVariantAB', TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS, '0', '0', '4', '5'], label: 'Ex1' },
        { values: ['fromEquation', '\\frac{(y+2)^2}{9} - \\frac{(x-3)^2}{16} = 1'], label: 'Eq-1'},
        { values: ['fromParameters', '(0,2)', '(5,2)', '', '(0,4)' ], label: 'Q2' },
        { values: ['fromParameters', '(1,1)', '(1,4)', '', '(3,1)' ], label: 'Q3' },
        { values: ['fromEquation', '\\frac{y^2}{9} - \\frac{x^2}{64} = 1'], label: 'Q4'},
        { values: ['fromEquation', '\\frac{(x-3)^2}{4} - \\frac{(y+2)^2}{16} = 1'], label: 'Q5'},
        { values: ['fromEquation', '\\frac{(y+1)^2}{25} - \\frac{(x+3)^2}{4} = 1'], label: 'Q6'},
        { values: ['fromEquation', '\\frac{x^2}{9} - (y+4)^2 = 1'], label: 'Q7'},
        { values: ['fromEquation', '4x^2-y^2-24x-4y+16=0'], label: 'Q8'},
        { values: ['fromEquation', '-16x^2+9y^2+128x+180y+68=0'], label: 'Q9'},
        { values: ['fromEquation', '-2x^2+13y^2-20x-104y+28=0'], label: 'Q10'},
        { values: ['fromParameters', '(0,0)', '(1,0)', '', '', '', '(3,0)' ], label: 'Q11' },
        { values: ['fromParameters', '', '(-4,4)', '(-4,2)', '', '', '(-4,0)' ], label: 'Q12' },
        { values: ['fromParameters', '', '(-1,3)', '(-1,-9)', '', '', '', '', '', '10' ], label: 'Q13' },
        { values: ['fromParameters', '', '', '', '-6,6', '4,6', '', '', '', '', 12], label: 'Q13-1' }
    ]
}

const _conicsGeneric = {
    title: 'Detect Conics from Equation',
    description: 'Given an conics equation, detect and solve if it\'s a circle, parabola, ellipse, hyperbola equation',
    parameters: [
        { name: 'Conics equation', value: '', type: 'formula', cssClass: 'width500' }
    ],
    func: conicsGeneric
}

const topicObjects = [
    _conicsGeneric,
    _conicsHyperbola,
    _conicsEllipse,
    _conicsParabola,
    _conicsCircle,
    '<b>---------------------</b>',
    _areaOfComposedShapes,
    _bearingAngleNavigationQuestions,
    _triangleQuestionsOneLineInput,
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
    _calculator,
    '<b>---------------------</b>',
    _debug,
];
