
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
            triangle.draw(_htmlElement('div', o), fakeSketch);
        }
    });
    return steps;
}


function triangleQuestions(triangleType, aName, A, a, bName, B, b, cName, C, c, sketchType) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        var forceOblique = false;
        if (!triangleType) {
            throw "please select a triangle type"
        }
        if (triangleType === 'right' && (!C || Number(C) === 90)) {
            currentInputElements[8].value = '90';
            C = 90;
        } else {
            forceOblique = true;
        }
        const triangle = new Triangle(aName, A, a, bName, B, b, cName, C, c);
        triangle.forceOblique = forceOblique;
        const status = triangle.getGivenStatus();
        console.log(`status: ${status}`);
        _htmlElement('div', o, `This is an ${status.join('')} problem (SSA might be SAS!)`);
        const steps = triangle.solve();
        _showComputationSteps(o, steps, { fakeSketch: sketchType === 'fake'});
    } catch (err) {
        _addErrorElement(o, err);
        //throw err
    }
}

function bearingAngleNavigationQuestions(bearingAngle1, side1, bearingAngle2, side2) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        const bearingTriangle = new BearingAngleTriangle(bearingAngle1, bearingAngle2, side1, side2);
        bearingTriangle.skipHeightCalculationSteps = true;
        _showComputationSteps(o, bearingTriangle.solve(), { fakeSketch: false });
    } catch (err) {
        _addErrorElement(o, err);
        throw err
    }
}