function createConicsInputFields(problemClass) {
    if (problemClass === 'findCenterRadiusFromEquation') {
        return [{ name: 'Circle Equation', type: 'formula', cssClass: 'width700' }];
    }
    else if (problemClass === 'findEquationFromCenterRadius') {
        return [
            { name: _fwl('Center point (h,k)', 180), value: '' },
            { separator: true },
            { name: _fwl('Radius r'), value: '' },
            { separator: true },
        ]
    }
    else if (problemClass === 'findEquationFromCenterAndPointOnCircle') {
        return [
            { name: _fwl('Center point (h,k)', 180), value: '' },
            { separator: true },
            { name: _fwl('Point on circle'), value: '' },
            { separator: true },
        ]

    }
    else if (problemClass === 'findEquationFromDiameterEndPoints') {
        return [
            { name: _fwl('Endpoint (x1, y1)', 180), value: '' },
            { separator: true },
            { name: _fwl('Endpoint (x2, y2)'), value: '' },
            { separator: true },
        ]
    }
    return [];
}

function conicsCircle(problemClass, ...args) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    try {
        if (problemClass === 'findCenterRadiusFromEquation') {
            conicsCircleFindCenterRadiusFromEquation(o, ...args);
        }
    } catch (err) {
        _addErrorElement(o, JSON.stringify(err, null, 2));
    }
}

const addDesmosGraph = (outputElem, equations, points, dashedLines) => {
    const div = document.createElement('div');
    outputElem.appendChild(div);
    const width = "1000px";
    const calc = appendGraphingCalculator(div, { width });
    const eqs = Array.isArray(equations) ? equations : [equations];
    eqs.forEach(eq => {
        calc.setExpression({ latex: eq });
    })
    //calc.setExpression({ latex: `y = ${k}`, lineStyle: "DASHED", showLabel: true });
    if (Array.isArray(points)) {
        points.forEach(({ x, y }) => {
            calc.setExpression({ latex: `(${x}, ${y})`, showLabel: true });
        });
    }
    return calc;
}

const conicsCircleFindCenterRadiusFromEquation = (o, equation) => {
    console.log(`find center and radius from equation: ${equation}`);
    const url = '/api/circleEquation';
    const data = { equation };
    const success = response => {
        const steps = [];
        //console.log(`response: ${JSON.stringify(response, null, 2)}`);
        var resObj = response;
        try {
            resObj = JSON.parse(response);
        } catch (err) {
            console.error(err);
        }
        //_htmlElement('pre', o, JSON.stringify(resObj, null, 2));
        console.log(`response returned from server: %o`, resObj);
        if (Array.isArray(resObj.steps)) {
            steps.push(...resObj.steps);
        }
        var afterSteps = () => { };
        if (resObj.circleParameters) {
            const { h, k, r, rSquare } = resObj.circleParameters;
            const hx = numericToLatex(Numeric.createFromValue(h));
            const kx = numericToLatex(Numeric.createFromValue(k));
            const rx = numericToLatex(Numeric.createFromValue(r));
            const rsx = numericToLatex(Numeric.createFromValue(rSquare));
            steps.push('Circle parameters:');
            steps.push({
                latex: `h = ${hx},\\text{&nbsp;} k = ${kx},\\text{&nbsp;} r = \\sqrt{${rsx}} = ${rx}`
            })
            const derivedEquation = `(x - (${hx}))^2 + (y - (${kx}))^2 = ${rsx}`
            afterSteps = () => {
                addDesmosGraph(o, [equation, derivedEquation], [{ x: hx, y: kx }]);
            }
        }
        _showComputationSteps(o, steps);
        afterSteps();
    }
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: success,
        error: ajaxErrorFunction(o)
    });
}