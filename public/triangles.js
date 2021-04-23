function triangleQuestions(triangleType, aName, A, a, bName, B, b, cName, C, c) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        if (!triangleType) {
            throw "please select a triangle type"
        }
        if (triangleType === 'right' && !C) {
            currentInputElements[8].value = '90';
            C = 90;
        }
        const triangle = new Triangle(aName, A, a, bName, B, b, cName, C, c);
        const status = triangle.getGivenStatus();
        console.log(`status: ${status}`);
        const steps = triangle.solve();
        steps.forEach(step => {
            var text0, latex0;
            if (typeof step === 'string') {
                text0 = step;
            } else {
                let { text, latex } = step;
                text0 = text;
                latex0 = latex;
            }
            if (text0) {
                _htmlElement('div', o, text0);
            }
            if (latex0) {
                addLatexElement(o, latex0);
            }
        })
    } catch (err) {
        _addErrorElement(o, err);
        //throw err
    }
}