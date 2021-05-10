


const _addInputsForRoundingOfAnglesAndSides = (cont) => {
    var div;
    div = _htmlElement('div', cont);
    elemStyle(div, {
        fontSize: '20pt',
        position: 'fixed',
        right: '10px',
        top: '10px'
    });
    _htmlElement('label', div, 'Rounding for angles: ')
    const input1 = _htmlElement('input', div);
    input1.type = 'number';
    input1.min = 0;
    elemStyle(input1, { width: '60px', fontSize: '18pt', marginRight: '10px' });
    input1.value = _toFixedAngles;
    input1.addEventListener('change', () => {
        _toFixedAngles = Number(input1.value);
        cont.setFocusOnRoundingAnglesInput = true;
        DO_EXECUTE();
    })
    if (cont.setFocusOnRoundingAnglesInput) {
        input1.focus();
        cont.setFocusOnRoundingAnglesInput = false;
    }

    //div = _htmlElement('div', cont); var input;
    _htmlElement('label', div, 'Rounding for sides: ')
    const input2 = _htmlElement('input', div);
    input2.type = 'number';
    input2.min = 0;
    elemStyle(input2, { width: '60px', fontSize: '18pt' });
    input2.value = _toFixedSides;
    input2.addEventListener('change', () => {
        _toFixedSides = Number(input2.value);
        cont.setFocusOnRoundingSidesInput = true;
        DO_EXECUTE();
    })
    if (cont.setFocusOnRoundingSidesInput) {
        input2.focus();
        cont.setFocusOnRoundingSidesInput = false;
    }
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
        triangle.skipHeightCalculationSteps = false;
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
                needsSolvingStr = ` [needs solving for (at least) "${shape.needsSolving.join('" and "')}"]`;
            }
            steps.push(`<div style="color:white;background:black">${shape.shapeName} ${id}${needsSolvingStr}:</div>`);
            {
                let fyi = shape.needsSolving ? '' : ' (FYI)';
                shape.reset();
                let solveSteps = shape.solve();
                if (solveSteps) {
                    steps.push({
                        collapsibleSection: {
                            steps: solveSteps,
                            title: `Solve ${shape.shapeName} ${id}${fyi}...`
                        }
                    });
                }
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