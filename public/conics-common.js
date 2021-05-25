
const getEllipseHyperbolaFromParametersInputFields = isHyperbola => {
    const majorAxisName = isHyperbola ? "Transverse Axis" : "Major Axis";
    const minorAxisName = isHyperbola ? "Conjugate Axis" : "Minor Axis";
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
        { html: '<hr/>' },
        { separator: true },
        { name: _fwl(`${majorAxisName} length`), value: '' },
        { name: _fwl(`${minorAxisName} length`), value: '' },
        { name: 'Distance between Foci', value: '' },
        { html: '<hr/>' },
        { separator: true },
    ];
}


const _fromParametersForEllipseAndHyperbola = (isHyperbola = false) => (...pointAndLengthStrings) => {
    const majorAxisName = isHyperbola ? "Transverse Axis" : "Major Axis";
    const minorAxisName = isHyperbola ? "Conjugate Axis" : "Minor Axis";
    const stepsFunction = isHyperbola ? hyperbolaSteps : ellipseSteps;
    const isEllipse = !isHyperbola;
    const steps = [];
    const _tryCalc_abc = (abc, centerPoint, otherPoint, majorAxis, otherPointName) => {
        if (!centerPoint || !otherPoint) {
            return null;
        }
        const xy = (majorAxis === MAJOR_AXIS_HORIZONTAL) ? ((abc === 'a' || abc === 'c') ? 'x' : 'y') : ((abc === 'a' || abc === 'c') ? 'y' : 'x');
        steps.push(`Using ${xy}-coordinates of center and ${otherPointName} to determine "${abc}":`);
        steps.push('');
        const [p1, p2] = [centerPoint[xy], otherPoint[xy]].sort((a, b) => a.lt(b) ? -1 : a.gt(b) ? 1 : 0);
        const avalue = p2.sub(p1);
        steps.push({ latex: `${abc} = ${_decimalToLatex(p2)} - (${_decimalToLatex(p1)}) = ${_decimalToLatex(avalue)}` });
        return avalue;
    }
    const abFromAxisLength = (axisLength, abc, axisName) => {
        if (axisLength) {
            let res = _d(axisLength).div(2);
            if (abc && axisName) {
                steps.push({ latex: `${abc} = \\frac{\\text{${axisName}}}{2} = ${_decimalToLatex(res)}` });
            }
            return res;
        }
        return null;
    }
    const pointStrings = pointAndLengthStrings.splice(0, pointAndLengthStrings.length - 3);
    const [majorAxisLength, minorAxisLength, distanceBetweenFoci] = pointAndLengthStrings;
    console.log(`major axis length: %o (${majorAxisLength})`, majorAxisLength);
    console.log(`minor axis length: %o (${minorAxisLength})`, minorAxisLength);
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
    var a = abFromAxisLength(majorAxisLength, 'a', majorAxisName + ' length')
        || _tryCalc_abc('a', centerPoint, vertexPoint1, majorAxis, 'vertex');
    var b = abFromAxisLength(minorAxisLength, 'b', minorAxisName + ' length')
        || _tryCalc_abc('b', centerPoint, covertexPoint1, majorAxis, 'covertex');
    var c = abFromAxisLength(distanceBetweenFoci, 'c', 'Distance between Foci')
        || _tryCalc_abc('c', centerPoint, focusPoint1, majorAxis, 'focus');
    if (isEllipse && a && b) {
        if (b.gt(a)) {
            throw `"b" can't be greater than "a" for an ellipse, please check your input`;
        }
    }
    var aLatex = a ? _decimalToLatex(a) : null;
    var bLatex = b ? _decimalToLatex(b) : null;
    var cLatex = c ? _decimalToLatex(c) : null;
    var asquare = a ? a.pow(2) : null;
    var bsquare = b ? b.pow(2) : null;
    var csquare = c ? c.pow(2) : null;
    if (!a && isEllipse) {
        asquare = (c.pow(2).add(b.pow(2)));
        a = asquare.sqrt();
        asquareLatex = _decimalToLatex(asquare);
        aLatex = _decimalToLatex(a);
        steps.push(`Determining "a":`);
        steps.push({ latex: `a^2 - b^2 = c^2:` });
        steps.push({ latex: `a^2 = c^2 + b^2 = ${cLatex}^2 + ${bLatex}^2 = ${asquareLatex}` });
        steps.push({ latex: `a = \\sqrt{${asquareLatex}} = ${aLatex}` });
    }
    if (!b && isEllipse) {
        bsquare = (a.pow(2).sub(c.pow(2)));
        b = bsquare.sqrt();
        bsquareLatex = _decimalToLatex(bsquare);
        bLatex = _decimalToLatex(b);
        steps.push(`Determining "b":`);
        steps.push({ latex: `a^2 - b^2 = c^2:` });
        steps.push({ latex: `b^2 = a^2 - c^2 = ${aLatex}^2 - ${cLatex}^2 = ${bsquareLatex}` });
        steps.push({ latex: `b = \\sqrt{${bsquareLatex}} = ${bLatex}` });
    }
    if (!a && isHyperbola) {
        asquare = (c.pow(2).sub(b.pow(2)));
        a = asquare.sqrt();
        asquareLatex = _decimalToLatex(asquare);
        aLatex = _decimalToLatex(a);
        steps.push(`Determining "a":`);
        steps.push({ latex: `a^2 + b^2 = c^2:` });
        steps.push({ latex: `a^2 = c^2 - b^2 = ${cLatex}^2 - ${bLatex}^2 = ${asquareLatex}` });
        steps.push({ latex: `a = \\sqrt{${asquareLatex}} = ${aLatex}` });
    }
    if (!b && isHyperbola) {
        bsquare = (c.pow(2).sub(a.pow(2)));
        b = bsquare.sqrt();
        bsquareLatex = _decimalToLatex(bsquare);
        bLatex = _decimalToLatex(b);
        steps.push(`Determining "b":`);
        steps.push({ latex: `a^2 + b^2 = c^2:` });
        steps.push({ latex: `b^2 = c^2 - a^2 = ${cLatex}^2 - ${aLatex}^2 = ${bsquareLatex}` });
        steps.push({ latex: `b = \\sqrt{${bsquareLatex}} = ${bLatex}` });
    }
    //steps.push(...ellipseSteps(majorAxis, centerPoint.x, centerPoint.y, a, b, c));
    steps.push(...stepsFunction(majorAxis, centerPoint.x, centerPoint.y, a, b, c));
    return steps;
}

const _parsePointString = pointString => {
    const m = pointString.match(/^\s*\(\s*(-?[0-9\.]+)\s*,\s*(-?[0-9\.]+)\s*\)\s*$/)
        || pointString.match(/^\s*(-?[0-9\.]+)\s*,\s*(-?[0-9\.]+)\s*$/);
    if (!m) {
        throw `can't parse "${pointString}" as point; please use "(x,y)" format.`;
    }
    const x = _d(m[1]);
    const y = _d(m[2]);
    return { x, y };
}

const conicsFromEquation = (o, equation) => {
    const url = '/api/conicsEquation';
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
        else if (resObj.parabolaParameters) {
            let { h, k, a, pvariant } = resObj.parabolaParameters;
            steps.push(...parabolaSteps(pvariant, h, k, a, [equation]));
        }
        if (resObj.ellipseParameters) {
            let { majorAxis, h, k, a, b, c } = resObj.ellipseParameters;
            steps.push(...ellipseSteps(majorAxis, h, k, a, b, c, [equation]));
        }
        else if (resObj.hyperbolaParameters) {
            let { majorAxis, h, k, a, b, c } = resObj.hyperbolaParameters;
            steps.push(...hyperbolaSteps(majorAxis, h, k, a, b, c, [equation]));
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

function conicsGeneric(formulaLatex) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    try {
        conicsFromEquation(o, formulaLatex);
    } catch (err) {
        _addErrorElement(o, JSON.stringify(err, null, 2));
        throw err;
    }
}