// ellipse variants
const MAJOR_AXIS_HORIZONTAL = 0;
const MAJOR_AXIS_VERTICAL = 1;

function createEllipseInputFields(problemClass) {
    if (problemClass === 'fromEquation') {
        return [{ name: 'Ellipse Equation', type: 'formula', cssClass: 'width500' }];
    }
    else if (problemClass === 'fromParameters') {
        return [
            { html: '<h3>Enter information you have (3 values needed)</h3>' },
            { name: _fwl('Center Point (h,k)', 200), value: '', noEval: true, placeholder: '(h,k)' },
            { html: '<hr/>' },
            { separator: true },
            { name: _fwl('Vertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { name: _fwl('Vertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { html: '<hr/>' },
            { separator: true },
            { name: _fwl('Covertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { name: _fwl('Coertex Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { html: '<hr/>' },
            { separator: true },
            { name: _fwl('Focus Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { name: _fwl('Focus Point'), value: '', noEval: true, placeholder: '(x,y)' },
            { separator: true },
        ];
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
}

const _parsePointString = pointString => {
    const m = pointString.match(/^\s*\(\s*(-?[0-9\.]+)\s*,\s*(-?[0-9\.]+)\s*\)\s*$/);
    if (!m) {
        throw `can't parse "${pointString}" as point; please use "(x,y)" format.`;
    }
    const x = _d(m[1]);
    const y = _d(m[2]);
    return { x, y };
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
    if (p1.y.equals(p2.y)) {
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
    const fromParameters = (...pointStrings) => {
        const steps = [];
        const _tryCalc_abc = (abc, centerPoint, otherPoint, majorAxis) => {
            if (!centerPoint || !otherPoint) {
                return null;
            }
            const xy = (majorAxis === MAJOR_AXIS_HORIZONTAL) ? ((abc === 'a' || abc === 'c') ? 'x' : 'y') : ((abc === 'a' || abc === 'c') ? 'y' : 'x');
            steps.push(`Using ${xy}-coordinates of center and vertex to determine "${abc}":`);
            steps.push('');
            const [p1, p2] = [centerPoint[xy], otherPoint[xy]].sort((a, b) => a.lt(b) ? -1 : a.gt(b) ? 1 : 0);
            const avalue = p2.sub(p1);
            steps.push({ latex: `${abc} = ${_decimalToLatex(p2)} - (${_decimalToLatex(p1)}) = ${_decimalToLatex(avalue)}` });
            return avalue;
        }
        const points = pointStrings.map(pointString => pointString ? _parsePointString(pointString) : null);
        console.log('parsed points: %o', points);
        var [centerPoint, vertexPoint1, vertexPoint2, covertexPoint1, covertexPoint2, focusPoint1, focusPoint2] = points;
        if (vertexPoint2 && !vertexPoint1) {
            vertexPoint1 = vertexPoint2;
            vertexPoint2 = null;
        }
        if (covertexPoint2 && !covertexPoint1) {
            covertexPoint1 = covertexPoint2;
            covertexPoint2 = null;
        }
        if (focusPoint2 && !focusPoint1) {
            focusPoint1 = focusPoint2;
            focusPoint2 = null;
        }
        const pointPairs = {
            Vertices: [vertexPoint1, vertexPoint2],
            Covertices: [covertexPoint1, covertexPoint2],
            Foci: [focusPoint1, focusPoint2]
        };
        var majorAxis = null;
        if (centerPoint) {
            steps.push('Center point:');
            steps.push({ latex: `(h,k) = \\left(${_decimalToLatex(centerPoint.x)}, ${_decimalToLatex(centerPoint.y)}\\right)` });
        } else {
            var pointsUsed = null;
            var pointsUsedName = "";
            var xCoordinatesUsed;
            for (let pname in pointPairs) {
                let [p1, p2] = pointPairs[pname];
                if (p1 && p2) {
                    ({ centerPoint, xCoordinatesUsed } = _midPoint(p1, p2));
                    pointsUsedName = pname;
                    pointsUsed = [p1, p2];
                    break;
                }
            }
            if (!pointsUsed) {
                throw `can't determine the center point of the ellipse using the given information`;
            }
            console.log(`${pointsUsedName} used to determine center point; xCoordinatedUsed: ${xCoordinatesUsed}`);
            steps.push(`${pointsUsedName} used to determine center point:`);
            let [p1, p2] = pointsUsed;
            var xCalc = xCoordinatesUsed
                ? `\\frac{${p1.x} + (${p2.x})}{2}`
                : `${p1.x}`
            var yCalc = xCoordinatesUsed
                ? `${p1.y}`
                : `\\frac{${p1.y} + (${p2.y})}{2}`;
            var latex = `(h,k) = \\left(${xCalc},${yCalc}\\right) = ${_pointToLatex(centerPoint)}`;
            steps.push({ latex });
        }
        majorAxis = _getMajorAxisDirection(centerPoint, vertexPoint1, covertexPoint1, focusPoint1);
        if (majorAxis === null) {
            throw `can't determine the direction of the major axis using the given information`;
        }
        steps.push(`Major axis direction is ${majorAxis === MAJOR_AXIS_HORIZONTAL ? 'horizontal' : 'vertical'}.`);
        const info = {};
        var a = _tryCalc_abc('a', centerPoint, vertexPoint1, majorAxis);
        var b = _tryCalc_abc('b', centerPoint, covertexPoint1, majorAxis);
        var c = _tryCalc_abc('c', centerPoint, focusPoint1, majorAxis);
        var aLatex = a ? _decimalToLatex(a) : null;
        var bLatex = b ? _decimalToLatex(b) : null;
        var cLatex = c ? _decimalToLatex(c) : null;
        var asquare = a ? a.pow(2) : null;
        var bsquare = b ? b.pow(2) : null;
        var csquare = c ? c.pow(2) : null;
        if (!a) {
            asquare = (c.pow(2).add(b.pow(2)));
            a = asquare.sqrt();
            asquareLatex = _decimalToLatex(asquare);
            aLatex = _decimalToLatex(a);
            steps.push(`Determining "a":`);
            steps.push({ latex: `a^2 - b^2 = c^2:` });
            steps.push({ latex: `a^2 = c^2 + b^2 = ${cLatex}^2 + ${bLatex}^2 = ${asquareLatex}` });
            steps.push({ latex: `a = \\sqrt{${asquareLatex}} = ${aLatex}` });
        }
        if (!b) {
            bsquare = (a.pow(2).sub(c.pow(2)));
            b = bsquare.sqrt();
            bsquareLatex = _decimalToLatex(bsquare);
            bLatex = _decimalToLatex(b);
            steps.push(`Determining "b":`);
            steps.push({ latex: `a^2 - b^2 = c^2:` });
            steps.push({ latex: `b^2 = a^2 - c^2 = ${aLatex}^2 - ${cLatex}^2 = ${bsquareLatex}` });
            steps.push({ latex: `b = \\sqrt{${bsquareLatex}} = ${bLatex}` });
        }
        /*
        if (!c) {
            csquare = (a.pow(2).sub(b.pow(2)));
            c = csquare.sqrt();
            csquareLatex = _decimalToLatex(csquare);
            cLatex = _decimalToLatex(c);
            steps.push(`Determining "c":`);
            steps.push({ latex: `a^2 - b^2 = c^2:` });
            steps.push({ latex: `c^2 = a^2 - b^2 = ${aLatex}^2 + ${bLatex}^2 = ${csquareLatex}` });
            steps.push({ latex: `c = \\sqrt{${csquareLatex}} = ${cLatex}` });
        }
        */
        steps.push(...ellipseSteps(majorAxis, centerPoint.x, centerPoint.y, a, b, c));
        return steps;
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
    steps.push({ latex: `a = ${aLatex}, b = ${bLatex}` });
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
        vertices.push([{x:'h+a', y:'k'},{ x: hvalue.add(avalue), y: kvalue }]);
        covertices.push([{x:'h', y:'k+b'},{ x: hvalue, y: kvalue.add(bvalue) }]);
        covertices.push([{x:'h', y:'k-b'},{ x: hvalue, y: kvalue.sub(bvalue) }]);
        foci.push([{x:'h-c', y:'k'},{ x: hvalue.sub(cvalue), y: kvalue }]);
        foci.push([{x:'h+c', y:'k'},{ x: hvalue.add(cvalue), y: kvalue }]);
    } else {
        vertices.push([{x:'h', y:'k+a'},{ x: hvalue, y: kvalue.add(avalue) }]);
        vertices.push([{x:'h', y:'k-a'},{ x: hvalue, y: kvalue.sub(avalue) }]);
        covertices.push([{x:'h-b', y:'k'},{ x: hvalue.sub(bvalue), y: kvalue }]);
        covertices.push([{x:'h+b', y:'k'},{ x: hvalue.add(bvalue), y: kvalue }]);
        foci.push([{x:'h', y:'k+c'},{ x: hvalue, y: kvalue.add(cvalue) }]);
        foci.push([{x:'h', y:'k-c'},{ x: hvalue, y: kvalue.sub(cvalue) }]);
    }
    steps.push('Center:');
    steps.push({ latex: _p2l([{x:'h', y:'k'},center]) });
    steps.push(`Vertices:`);
    steps.push(...vertices.map(v => ({ latex: _p2l(v) })));
    steps.push(`Covertices:`);
    steps.push(...covertices.map(v => ({ latex: _p2l(v) })));
    steps.push(`Foci:`);
    steps.push(...foci.map(v => ({ latex: _p2l(v) })));

    const allPoints = [center, ...vertices, ...covertices, ...foci];

    const xdenominator = majorAxis === MAJOR_AXIS_HORIZONTAL ? _decimalToLatex(avalue.pow(2)) : _decimalToLatex(bvalue.pow(2));
    const ydenominator = majorAxis === MAJOR_AXIS_HORIZONTAL ? _decimalToLatex(bvalue.pow(2)) : _decimalToLatex(avalue.pow(2));
    const xnum = new Sum(new Variable('x'), ensureNumeric(hvalue.negated()));
    const ynum = new Sum(new Variable('y'), ensureNumeric(kvalue.negated()));
    const equation = `\\frac{(${xnum.toLatex()})^2}{${xdenominator}} + \\frac{(${ynum.toLatex()})^2}{${ydenominator}} = 1`

    steps.push('Ellipse equation:');
    steps.push({ latex: equation });

    steps.push({
        collapsibleSection: {
            title: "Ellipse Graph",
            steps: [{
                desmos: {
                    equations: [...otherEquations, equation],
                    points: allPoints,
                    //dashedLines: [directrix]
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
        if (resObj.ellipseParameters) {
            let { majorAxis, h, k, a, b, c } = resObj.ellipseParameters;
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