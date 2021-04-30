
const _showComputationSteps = (o, steps, options = {}) => {
    steps.forEach(step => {
        var text0, latex0, triangle, collapsibleSection0;
        if (typeof step === 'string') {
            text0 = step;
        } else {
            let { text, latex, drawTriangle, collapsibleSection } = step;
            text0 = text;
            latex0 = latex;
            triangle = drawTriangle;
            collapsibleSection0 = collapsibleSection;
        }
        if (text0) {
            _htmlElement('div', o, text0);
        }
        if (latex0) {
            addLatexElement(o, latex0);
        }
        if (triangle) {
            let { fakeSketch } = options;
            //_htmlElement('div', o, 'Triangle sketch:');
            triangle.draw(_htmlElement('div', o));
        }
        if (collapsibleSection0) {
            let { steps, title } = collapsibleSection0;
            let cdiv = _collapsibleSection(o, title, {
                noBorder: true,
                initialStateCollapsed: true,
                width: "100%"
            });
            _showComputationSteps(cdiv, steps, options)
        }
    });
    return steps;
}

const _addInputsForRoundingOfAnglesAndSides = (cont) => {
    var div;
    div = _htmlElement('div', cont);
    elemStyle(div, {
        fontSize: '12pt',
        position: 'fixed',
        right: '10px',
        top: '10px'
    });
    _htmlElement('label', div, 'Rounding for angles: ')
    const input1 = _htmlElement('input', div);
    input1.type = 'number';
    input1.min = 0;
    elemStyle(input1, { width: '30px', marginRight: '10px' });
    input1.value = _toFixedAngles;
    input1.addEventListener('change', () => {
        _toFixedAngles = Number(input1.value);
        DO_EXECUTE();
    })

    //div = _htmlElement('div', cont); var input;
    _htmlElement('label', div, 'Rounding for sides: ')
    const input2 = _htmlElement('input', div);
    input2.type = 'number';
    input2.min = 0;
    elemStyle(input2, { width: '30px' });
    input2.value = _toFixedSides;
    input2.addEventListener('change', () => {
        _toFixedSides = Number(input2.value);
        DO_EXECUTE();
    })
}


function triangleQuestions(triangleType, aName, A, a, bName, B, b, cName, C, c, sketchType) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        _addInputsForRoundingOfAnglesAndSides(o);
        var forceOblique = false;
        if (!triangleType) {
            throw "please select a triangle type"
        }
        if (triangleType === 'right') {
            if (A !== 90 && B !== 90 && C !== 90) {
                throw "one of the angles must be set to 90 degrees to be a right triangle";
            }
            //currentInputElements[8].value = '90';
            //C = 90;
        } else {
            forceOblique = true;
        }
        const triangle = new Triangle(aName, A, a, bName, B, b, cName, C, c);
        triangle.forceOblique = forceOblique;
        triangle.fakeCoords = sketchType === 'fake';
        _showTriangleSolution(o, triangle);
    } catch (err) {
        _addErrorElement(o, err);
        throw err
    }
}

const _showTriangleSolution = (o, triangle) => {
    const status = triangle.getGivenStatus();
    console.log(`status: ${status}`);
    _htmlElement('div', o, `<div style="margin-bottom:10px;padding:5px;border:1px solid black;display:inline-block">This is an ${triangle.getProblemCategory()} problem.</div>`);
    const steps = triangle.solve();
    //const calcSteps = steps.filter(step => !step.drawTriangle);
    //const drawSteps = steps.filter(step => step.drawTriangle);
    _showComputationSteps(o, steps);
    //_showComputationSteps(o, drawSteps);
    //_showComputationSteps(o, calcSteps);
    _showComputationSteps(o, triangle.solveArea());
}

function triangleQuestionsOneLineInput(anglesAndSidesLatex) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        _addInputsForRoundingOfAnglesAndSides(o);
        const hlp = new GeometricalShapeParserHelper();        
        const triangle = hlp.parseTriangleDefinition(anglesAndSidesLatex);
        _showTriangleSolution(o, triangle);
    } catch (err) {
        _addErrorElement(o, err);
        throw err
    }
}

function bearingAngleNavigationQuestions(bearingAngle1, side1, bearingAngle2, side2) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        _addInputsForRoundingOfAnglesAndSides(o);
        const bearingTriangle = new BearingAngleTriangle(bearingAngle1, bearingAngle2, side1, side2);
        bearingTriangle.skipHeightCalculationSteps = true;
        _showComputationSteps(o, bearingTriangle.solve());
    } catch (err) {
        _addErrorElement(o, err);
        throw err
    }
}

function areaOfComposedShapes(shapesSpec, resultExpression) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        _addInputsForRoundingOfAnglesAndSides(o);
        const hlp = new GeometricalShapeParserHelper();
        const shapeObjectsMap = hlp.parseDefinitions(shapesSpec);
        const steps = [];
        Object.keys(shapeObjectsMap).forEach(id => {
            const shape = shapeObjectsMap[id];
            const solveAreaSteps = shape.solveArea(3);
            var needsSolvingStr = '';
            if (shape.needsSolving) {
                needsSolvingStr = ` [needs solving for "${shape.needsSolving.join('" and "')}"]`;
            }
            steps.push(`<div style="color:white;background:black">${shape.shapeName} ${id}${needsSolvingStr}:</div>`);
            if (shape.needsSolving) {
                shape.reset();
                steps.push({
                    collapsibleSection: {
                        steps: shape.solve(),
                        title: `Solve ${shape.shapeName} ${id}...`
                    }
                });
            }
            steps.push(...solveAreaSteps);
        });
        steps.push(`<div style="color:white;background:black">Combined Area:</div>`);
        steps.push(...hlp.parseExpresion(resultExpression, shapeObjectsMap));
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, err);
        throw err
    }
}