function createConicsInputFields(problemClass) {
    if (problemClass === 'findCenterRadiusFromEquation') {
        return [{ name: 'Circle Equation', type: 'formula', cssClass: 'width700' }];
    }
    else if (problemClass === 'findEquationFromCenterRadius') {
        return [
            { name: _fwl('Center point h', 180), value: '', type: 'formula' },
            { name: 'k', value: '', type: 'formula' },
            { separator: true },
            { name: _fwl('Radius r'), value: '', type: 'formula' },
            { separator: true },
        ]
    }
    else if (problemClass === 'findEquationFromCenterAndPointOnCircle') {
        return [
            { name: _fwl('Center point h', 180), value: '', type: 'formula' },
            { name: 'k', value: '', type: 'formula' },
            { separator: true },
            { name: _fwl('Point on circle x'), value: '', type: 'formula' },
            { name: 'y', value: '', type: 'formula' },
            { separator: true },
        ]

    }
    else if (problemClass === 'findEquationFromDiameterEndPoints') {
        return [
            { name: _fwl('Endpoint x1', 180), value: '', type: 'formula' },
            { name: 'y1', value: '', type: 'formula' },
            { separator: true },
            { name: _fwl('Endpoint x2'), value: '', type: 'formula' },
            { name: 'y2', value: '', type: 'formula' },
            { separator: true },
        ]
    }
    return [];
}

function conicsCircle(problemClass, ...args) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    const _latexToDecimal = formulaLatex => {
        const { value } = evalLatexFormulaWithContext(formulaLatex);
        return value;
    }
    const _decimalToLatex = decimal => numericToLatex(Numeric.createFromValue(decimal));
    const findEquationFromCenterRadius = (hLatex, kLatex, rLatex) => {
        const hvalue = _latexToDecimal(hLatex).negated();
        const kvalue = _latexToDecimal(kLatex).negated();
        const rvalue = _latexToDecimal(rLatex);
        const rSquare = rvalue.pow(2);
        _showComputationSteps(o, getStepsForCircleGraph({ h: hvalue, k: kvalue, r: rvalue, rSquare }));
    }
    const findEquationFromCenterAndPointOnCircle = (hLatex, kLatex, xLatex, yLatex, initialSteps = [], points = []) => {
        const steps = initialSteps;
        const h = _latexToDecimal(hLatex);
        const k = _latexToDecimal(kLatex);
        const minush = h.negated();
        const minusk = k.negated();
        const x = _latexToDecimal(xLatex);
        const y = _latexToDecimal(yLatex);
        steps.push({
            text: 'circle equation, solve for r:',
            latex: `r = \\sqrt{(x${_valueAsSummandLatex(minush)})^2 + (y${_valueAsSummandLatex(minusk)})^2}`
        })
        const rSquare = (x.sub(h).pow(2)).add(y.sub(k).pow(2));
        const r = rSquare.sqrt();
        steps.push({
            latex: ` = \\sqrt{(${xLatex}${_valueAsSummandLatex(minush)})^2 + (${yLatex}${_valueAsSummandLatex(minusk)})^2}`
                + ` = \\sqrt{${_decimalToLatex(rSquare)}} = ${r}`
        })
        steps.push({
            latex: `r = ${_decimalToLatex(r)}`
        })
        const gsteps = getStepsForCircleGraph({ h, k, r, rSquare }, null, [{ x, y }, ...points]);
        _showComputationSteps(o, [...steps, ...gsteps]);
    }
    const findEquationFromDiameterEndPoints = (x1Latex, y1Latex, x2Latex, y2Latex) => {
        const steps = [];
        const h = (_latexToDecimal(x1Latex).add(_latexToDecimal(x2Latex))).div(_d(2));
        const k = (_latexToDecimal(y1Latex).add(_latexToDecimal(y2Latex))).div(_d(2));
        const hLatex = _decimalToLatex(h);
        const kLatex = _decimalToLatex(k);
        steps.push({
            text: 'Determining center point using midpoint formula:',
            latex: `(h,k) = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)`
                + ` = \\left(\\frac{${x1Latex}+(${x2Latex})}{2}, \\frac{${y1Latex}+(${y2Latex})}{2}\\right)`
                + ` = (${hLatex}, ${kLatex})`
        })
        steps.push(`Calculating radius using point (x1,y1)`);
        findEquationFromCenterAndPointOnCircle(hLatex, kLatex, x1Latex, y1Latex, steps, [{ x: x2Latex, y: y2Latex }]);
    }
    try {
        if (problemClass === 'findCenterRadiusFromEquation') {
            conicsCircleFindCenterRadiusFromEquation(o, ...args);
        }
        else if (problemClass === 'findEquationFromCenterRadius') {
            findEquationFromCenterRadius(...args);
        }
        else if (problemClass === 'findEquationFromCenterAndPointOnCircle') {
            findEquationFromCenterAndPointOnCircle(...args);
        }
        else if (problemClass === 'findEquationFromDiameterEndPoints') {
            findEquationFromDiameterEndPoints(...args);
        }
    } catch (err) {
        _addErrorElement(o, JSON.stringify(err, null, 2));
        throw err
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

const _valueAsSummandLatex = decimal => {
    const d = _d(decimal);
    if (d == 0) {
        return "";
    }
    const op = d.isNegative() ? ' - ' : ' + '
    const decimalAbs = d.abs();
    const lx = numericToLatex(Numeric.createFromValue(decimalAbs));
    return `${op} ${lx}`;
}

const getStepsForCircleGraph = ({ h, k, r, rSquare }, originalEquation, morePoints = []) => {
    const steps = [];
    const hx = numericToLatex(Numeric.createFromValue(h));
    const kx = numericToLatex(Numeric.createFromValue(k));
    const rx = numericToLatex(Numeric.createFromValue(r));
    const rsx = numericToLatex(Numeric.createFromValue(rSquare));
    steps.push('Circle parameters:');
    steps.push({
        latex: `h = ${hx},\\text{&nbsp;} k = ${kx},\\text{&nbsp;} r = \\sqrt{${rsx}} = ${rx}`
    })
    const hv = _d(h).negated();
    const kv = _d(k).negated();
    const derivedEquation = `(x ${_valueAsSummandLatex(hv)})^2 + (y ${_valueAsSummandLatex(kv)})^2 = ${rsx}`;
    steps.push({
        text: 'Circle Equation:',
        latex: derivedEquation
    });
    const equations = originalEquation ? [originalEquation, derivedEquation] : [derivedEquation];
    const points = [{ x: hx, y: kx }, ...morePoints]
    steps.push({
        collapsibleSection: {
            title: "Graph",
            steps: [{ desmos: { equations, points } }]
        }
    })
    return steps;
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
        if (resObj.circleParameters) {
            steps.push(...getStepsForCircleGraph(resObj.circleParameters, equation));
        }
        _showComputationSteps(o, steps);
    }
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: success,
        error: ajaxErrorFunction(o)
    });
}