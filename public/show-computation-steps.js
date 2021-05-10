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
