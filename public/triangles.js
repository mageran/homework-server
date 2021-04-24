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
        const steps = triangle.solve();
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
                //_htmlElement('div', o, 'Triangle sketch:');
                triangle.draw(_htmlElement('div', o), sketchType === 'fake');
            }
        })
    } catch (err) {
        _addErrorElement(o, err);
        //throw err
    }
}