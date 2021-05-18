const _showComputationSteps = (o, steps, options = {}) => {
    steps.forEach(step => {
        var text0, latex0, triangle, collapsibleSection0, desmos;
        if (typeof step === 'string') {
            text0 = step;
        } else {
            let { text, latex, drawTriangle, collapsibleSection } = step;
            text0 = text;
            latex0 = latex;
            triangle = drawTriangle;
            collapsibleSection0 = collapsibleSection;
            desmos = step.desmos
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
        if (desmos) {
            let { equations, points, dashedLines } = desmos;
            addDesmosGraph(o, equations, points, dashedLines);
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

const addDesmosGraph = (outputElem, equations = [], points = [], dashedLines = []) => {
    const div = document.createElement('div');
    outputElem.appendChild(div);
    const width = "1000px";
    const calc = appendGraphingCalculator(div, { width });
    const eqs = Array.isArray(equations) ? equations : [equations];
    eqs.forEach(eq => {
        calc.setExpression({ latex: eq });
    })
    if (Array.isArray(dashedLines)) {
        dashedLines.forEach(lineEquation => {
            //calc.setExpression({ latex: `y = ${k}`, lineStyle: "DASHED", showLabel: true });
            calc.setExpression({ latex: lineEquation, lineStyle: "DASHED", showLabel: true });
        })
    }
    if (Array.isArray(points)) {
        points.forEach(({ x, y }) => {
            calc.setExpression({ latex: `(${x}, ${y})`, showLabel: true });
        });
    }
    return calc;
}

