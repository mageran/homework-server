// ellipse variants
const MAJOR_AXIS_HORIZONTAL = 0;
const MAJOR_AXIS_VERTICAL = 1;

function createEllipseInputFields(problemClass) {
    if (problemClass === 'fromEquation') {
        return [{ name: 'Ellipse Equation', type: 'formula', cssClass: 'width500' }];
    }
    else if (problemClass === 'fromParameters') {
        return getEllipseHyperbolaFromParametersInputFields(false);
    }
    else if (problemClass === 'fromAxisAB') {
        return [
            {
                name: _fwl('Major Axis Direction'),
                type: 'select',
                options: [
                    { label: 'Horizontal', value: MAJOR_AXIS_HORIZONTAL },
                    { label: 'Vertical', value: MAJOR_AXIS_VERTICAL },
                ]
            },
            { separator: true },
            { name: _fwl('h'), value: '' },
            { name: 'k', value: '' },
            { separator: true },
            { name: _fwl('a'), value: '' },
            { name: 'b', value: '' },
            { separator: true },
        ]
    }
    else if (problemClass === 'fromCenterDistancePoint') {
        return [
            { name: _fwl('Center point', 350), value: '', placeholder: '(h,k)', noEval: true },
            { separator: true },
            {
                name: _fwl('Distance from center to endpoint on '),
                type: 'select',
                options: [{ label: 'x-axis', value: 'xaxis' }, { label: 'y-axis', value: 'yaxis' }]
            },
            { value: '' },
            { separator: true },
            { name: _fwl('Point on ellipse', 350), value: '', placeholder: '(x,y)', noEval: true },
        ];
    }
}

const _getMajorAxisDirection = (centerPoint, vertexPoint1, covertexPoint1, focusPoint1) => {
    if (!centerPoint) return null;
    const cx = centerPoint.x;
    const cy = centerPoint.y;
    var p = vertexPoint1 || focusPoint1;
    if (p) {
        if (p.x.equals(cx)) {
            return MAJOR_AXIS_VERTICAL;
        }
        else if (p.y.equals(cy)) {
            return MAJOR_AXIS_HORIZONTAL;
        }
        else {
            return null;
        }
    }
    var p = covertexPoint1;
    if (p) {
        if (p.x.equals(cx)) {
            return MAJOR_AXIS_HORIZONTAL;
        }
        else if (p.y.equals(cy)) {
            return MAJOR_AXIS_VERTICAL;
        }
        else {
            return null;
        }
    }
    return null;
}

const _midPoint = (p1, p2) => {
    var centerPoint, xCoordinatesUsed;
    if (p1.x.equals(p2.x)) {
        centerPoint = { x: p1.x, y: (p1.y.add(p2.y)).div(2) };
        xCoordinatesUsed = false;
    }
    else if (p1.y.equals(p2.y)) {
        centerPoint = { x: (p1.x.add(p2.x)).div(2), y: p1.y };
        xCoordinatesUsed = true;
    }
    else {
        throw `points ${_pointToString(p1)} and ${_pointToString(p2)} must be either have same x or same y coordinates`;
    }
    return { centerPoint, xCoordinatesUsed };
}


function conicsEllipse(problemClass, ...args) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    const fromParameters = _fromParametersForEllipseAndHyperbola(false);
    const fromCenterDistancePoint = (centerPoint, axis, distance, pointOnEllipse) => {
        const steps = [];
        const center = _parsePointString(centerPoint);
        const dvalue = _d(distance);
        const epoint = _parsePointString(pointOnEllipse);
        const h = center.x;
        const k = center.y;
        const hlatex = _decimalToLatex(h);
        const klatex = _decimalToLatex(k);
        const x = epoint.x;
        const y = epoint.y;
        const xlatex = _decimalToLatex(x);
        const ylatex = _decimalToLatex(y);
        steps.push('Because the major axis is not yet known, "p" and "q"</br> are used instead of "a" and "b":');
        var latex = `\\frac{(x-h)^2}{p^2} + \\frac{(y-k)^2}{q^2} = 1`;
        steps.push({ latex });
        steps.push(`Plugging in values for "h" and "k":`);
        latex = `\\frac{(x-${hlatex})^2}{p^2} + \\frac{(y-${klatex})^2}{q^2} = 1`;
        steps.push({ latex });
        const knownDistance = axis === 'xaxis' ? 'p' : 'q';
        const unknownDistance = axis === 'xaxis' ? 'q' : 'p';
        steps.push(`Plugging into the coordinates of the known point </br>${_pointToString(epoint)} for determining "${unknownDistance}":`);
        latex = `\\frac{(${xlatex}-${hlatex})^2}{p^2} + \\frac{(${ylatex}-${klatex})^2}{q^2} = 1`;
        steps.push({ latex });
        var p, q;
        {
            p = axis === 'xaxis' ? dvalue : null;
            q = axis === 'xaxis' ? null : dvalue;
            steps.push(`The distance over the ${axis} is known, so ${knownDistance} = ${dvalue} is used:`)
            let pqlatex = _decimalToLatex(dvalue);
            latex = axis === 'xaxis'
                ? `\\frac{(${xlatex}-${hlatex})^2}{${pqlatex}^2} + \\frac{(${ylatex}-${klatex})^2}{q^2} = 1`
                : `\\frac{(${xlatex}-${hlatex})^2}{p^2} + \\frac{(${ylatex}-${klatex})^2}{${pqlatex}^2} = 1`;
            steps.push({ latex });
            let solveForVar = unknownDistance;
            callServerService('solveFor', { equation: latex, variable: solveForVar, onlyPositiveRoots: true }, resObj => {
                if (resObj.steps) {
                    steps.push({ collapsibleSection: { title: `Solve for "${solveForVar}"`, steps: resObj.steps } });
                }
                if (resObj.steps.length > 0) {
                    steps.push(resObj.steps[resObj.steps.length - 1]);
                }
                const { solutions: [pqvalue] } = resObj;
                if (!pqvalue) {
                    throw `something went wrong: no solution for "${solveForVar}" found.`;
                }
                console.log(`found pqvalue: ${pqvalue}`);
                var pqdecimal;
                try {
                    pqdecimal = _d(pqvalue);
                    //steps.push(...parabolaSteps(pvariant, h, k, adecimal));
                    if (axis === 'xaxis') {
                        q = pqdecimal;
                    } else {
                        p = pqdecimal;
                    }
                } catch (err) {
                    steps.push(`could not simplify "${solveForVar}" to a value.`);
                }
                var a, b, majorAxis;
                if (p >= q) {
                    steps.push(`Because p > q, setting a = p and b = q:`);
                    a = p;
                    b = q;
                    majorAxis = MAJOR_AXIS_HORIZONTAL;
                } else {
                    steps.push(`Because p < q, setting a = q and b = p:`);
                    a = q;
                    b = p;
                    majorAxis = MAJOR_AXIS_VERTICAL;
                }
                steps.push({ latex: `a = ${a},\\text{&nbsp;&nbsp;} b = ${b}` });
                steps.push(...ellipseSteps(majorAxis, h, k, a, b, null, [_pointToString(epoint)]));
                _showComputationSteps(o, steps);
            }, ajaxErrorFunction(o))
        }
    }
    try {
        Numeric.doNotAttemptToCreateValueWithPi = true;
        const steps = [];
        if (problemClass === 'fromEquation') {
            ellipseFromEquation(o, ...args);
        }
        else if (problemClass === 'fromParameters') {
            steps.push(...fromParameters(...args));
        }
        else if (problemClass === 'fromAxisAB') {
            steps.push(...ellipseSteps(...args));
        }
        else if (problemClass === 'fromCenterDistancePoint') {
            fromCenterDistancePoint(...args);
        }
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, JSON.stringify(err, null, 2));
        throw err
    }
}

const ellipseSteps = (majorAxis, h, k, a, b, c, otherEquations = []) => {
    const _p2l = points => {
        if (!points) return '';
        if (!Array.isArray(points)) {
            points = [points];
        }
        return points.map(p => {
            const { x, y } = p;
            if ((x instanceof Decimalx) && (y instanceof Decimalx)) {
                return _pointToLatex(p)
            }
            return `(${x}, ${y})`;
        }).join(' = ');
    }
    const steps = [];
    steps.push(`<div style="padding:10px">Major Axis direction: ${majorAxis === MAJOR_AXIS_HORIZONTAL ? "horizontal" : "vertical"}</div>`);
    const hvalue = _d(h);
    const kvalue = _d(k);
    const avalue = _d(a);
    const bvalue = _d(b);
    const aLatex = _decimalToLatex(avalue);
    const bLatex = _decimalToLatex(bvalue);
    steps.push({ latex: `a = ${aLatex}` });
    steps.push({ latex: `b = ${bLatex}` });
    steps.push({ latex: `\\text{Length of major axis:&nbsp;&nbsp;} ${_decimalToLatex(avalue.mul(2))}` });
    steps.push({ latex: `\\text{Length of minor axis:&nbsp;&nbsp;} ${_decimalToLatex(bvalue.mul(2))}` });
    if (!c) {
        let csquare = (avalue.pow(2).sub(bvalue.pow(2)));
        c = csquare.sqrt();
        let csquareLatex = _decimalToLatex(csquare);
        let cLatex = _decimalToLatex(c);
        steps.push(`Determining "c":`);
        steps.push({ latex: `a^2 - b^2 = c^2:` });
        steps.push({ latex: `c^2 = a^2 - b^2 = ${aLatex}^2 - ${bLatex}^2 = ${csquareLatex}` });
        steps.push({ latex: `c = \\sqrt{${csquareLatex}} = ${cLatex}` });
    }
    const cvalue = _d(c);
    const center = { x: hvalue, y: kvalue };
    const vertices = [];
    const covertices = [];
    const foci = [];
    if (majorAxis === MAJOR_AXIS_HORIZONTAL) {
        vertices.push([{ x: 'h-a', y: 'k' }, { x: hvalue.sub(avalue), y: kvalue }]);
        vertices.push([{ x: 'h+a', y: 'k' }, { x: hvalue.add(avalue), y: kvalue }]);
        covertices.push([{ x: 'h', y: 'k+b' }, { x: hvalue, y: kvalue.add(bvalue) }]);
        covertices.push([{ x: 'h', y: 'k-b' }, { x: hvalue, y: kvalue.sub(bvalue) }]);
        foci.push([{ x: 'h-c', y: 'k' }, { x: hvalue.sub(cvalue), y: kvalue }]);
        foci.push([{ x: 'h+c', y: 'k' }, { x: hvalue.add(cvalue), y: kvalue }]);
    } else {
        vertices.push([{ x: 'h', y: 'k+a' }, { x: hvalue, y: kvalue.add(avalue) }]);
        vertices.push([{ x: 'h', y: 'k-a' }, { x: hvalue, y: kvalue.sub(avalue) }]);
        covertices.push([{ x: 'h-b', y: 'k' }, { x: hvalue.sub(bvalue), y: kvalue }]);
        covertices.push([{ x: 'h+b', y: 'k' }, { x: hvalue.add(bvalue), y: kvalue }]);
        foci.push([{ x: 'h', y: 'k+c' }, { x: hvalue, y: kvalue.add(cvalue) }]);
        foci.push([{ x: 'h', y: 'k-c' }, { x: hvalue, y: kvalue.sub(cvalue) }]);
    }
    steps.push('Center:');
    steps.push({ latex: _p2l([{ x: 'h', y: 'k' }, center]) });
    steps.push(`Vertices:`);
    steps.push(...vertices.map(v => ({ latex: _p2l(v) })));
    steps.push(`Covertices:`);
    steps.push(...covertices.map(v => ({ latex: _p2l(v) })));
    steps.push(`Foci:`);
    steps.push(...foci.map(v => ({ latex: _p2l(v) })));

    const allPoints = [center, ...vertices.map(pl => pl[1]), ...covertices.map(pl => pl[1]), ...foci.map(pl => pl[1])];

    const xdenominator = majorAxis === MAJOR_AXIS_HORIZONTAL ? _decimalToLatex(avalue.pow(2)) : _decimalToLatex(bvalue.pow(2));
    const ydenominator = majorAxis === MAJOR_AXIS_HORIZONTAL ? _decimalToLatex(bvalue.pow(2)) : _decimalToLatex(avalue.pow(2));
    const xnum = new Sum(new Variable('x'), ensureNumeric(hvalue.negated()));
    const ynum = new Sum(new Variable('y'), ensureNumeric(kvalue.negated()));
    const equation = `\\frac{(${xnum.toLatex()})^2}{${xdenominator}} + \\frac{(${ynum.toLatex()})^2}{${ydenominator}} = 1`

    steps.push('Ellipse equation:');
    steps.push({ latex: equation, addProcessTermButton: true });

    steps.push({
        section: {
            title: "Ellipse Graph",
            style: { position: 'absolute', top: 0, left: '600px' },
            steps: [{
                desmos: {
                    equations: [...otherEquations, equation],
                    points: allPoints,
                    //dashedLines: [directrix],
                    height: '800px'
                }
            }]
        }
    })
    return steps;
    return steps;
}

const ellipseFromEquation = (o, equation) => {
    console.log(`find ellipse parameters from equation: ${equation}`);
    const url = '/api/ellipseEquation';
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
        if (resObj.parameters) {
            let { majorAxis, h, k, a, b, c } = resObj.parameters;
            steps.push(...ellipseSteps(majorAxis, h, k, a, b, c, [equation]));
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