const _showComputationSteps = (o, steps, options = {}) => {
    steps.forEach(step => {
        var text, latex, triangle, collapsibleSection, section, desmos;
        if (typeof step === 'string') {
            text = step;
        } else {
            ({ text, latex, drawTriangle, collapsibleSection, section, desmos } = step);
            //text0 = text;
            //latex0 = latex;
            triangle = drawTriangle;
            //collapsibleSection0 = collapsibleSection;
        }
        if (text) {
            _htmlElement('div', o, text);
        }
        if (latex) {
            addLatexElement(o, latex);
        }
        if (triangle) {
            triangle.draw(_htmlElement('div', o));
        }
        if (desmos) {
            let { equations, points, dashedLines, expressions, width, height } = desmos;
            let displayOptions = { width, height };
            addDesmosGraph(o, equations, points, dashedLines, expressions, displayOptions);
        }
        if (section) {
            let { steps, style, collapsible } = section;
            if (collapsible) {
                collapsibleSection = section;
            } else {
                let div = _htmlElement('div', o);
                if (style) {
                    elemStyle(div, style);
                }
                return _showComputationSteps(div, steps, options);
            }
        }
        if (collapsibleSection) {
            let { steps, title, style } = collapsibleSection;
            let cdiv = _collapsibleSection(o, title, {
                noBorder: true,
                initialStateCollapsed: true,
                width: "100%"
            });
            if (style) {
                elemStyle(cdiv.parentElement, style);
            }
            return _showComputationSteps(cdiv, steps, options)
        }
    });
    return steps;
}

const addDesmosGraph = (outputElem, equations = [], points = [], dashedLines = [], expressions, displayOptions = {}) => {
    const div = document.createElement('div');
    outputElem.appendChild(div);
    const width = displayOptions.width || "1000px";
    const height = displayOptions.height;
    const calc = appendGraphingCalculator(div, { width, height });
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
    if (Array.isArray(expressions)) {
        expressions.forEach(expr => {
            calc.setExpression(expr);
        })
    }
    return calc;
}

