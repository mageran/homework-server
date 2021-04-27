
const _showComputationSteps = (o, steps, options = {}) => {
    steps.forEach(step => {
        var text0, latex0, triangle;
        if (typeof step === 'string') {
            text0 = step;
        } else {
            let { text, latex, drawTriangle } = step;
            text0 = text;
            latex0 = latex;
            triangle = drawTriangle;
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
    });
    return steps;
}

const _addInputsForRoundingOfAnglesAndSides = (cont) => {
    var div;
    div = _htmlElement('div', cont);
    elemStyle(div, {
        fontSize: '12pt',
        position: 'absolute',
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
        const status = triangle.getGivenStatus();
        console.log(`status: ${status}`);
        _htmlElement('div', o, `<div style="margin-bottom:10px;padding:5px;border:1px solid black;display:inline-block">This is an ${triangle.getProblemCategory()} problem.</div>`);
        const steps = triangle.solve();
        _showComputationSteps(o, steps);
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