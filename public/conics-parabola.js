// parabola variants
const VERTICAL_UP = 0;
const VERTICAL_DOWN = 1;
const HORIZONTAL_RIGHT = 2;
const HORIZONTAL_LEFT = 3;


function createParabolaInputFields(problemClass) {
    if (problemClass === 'fromEquation') {
        return [{ name: 'Parabola Equation', type: 'formula', cssClass: 'width500' }];
    }
    else if (problemClass === 'fromVertexAndDirectrix') {
        return [
            { name: 'Vertex point h', value: '', type: 'formula' },
            { name: 'k', value: '', type: 'formula' },
            { separator: true },
            { name: 'Directrix', type: 'select', options: [{ label: 'x', value: 'x' }, { label: 'y', value: 'y' }] },
            { name: 'Value', value: '', type: 'formula' },
            { separator: true },
        ]
    }
    else if (problemClass === 'fromFocusAndDirectrix') {
        return [
            { name: 'Focus point x', value: '', type: 'formula' },
            { name: 'y', value: '', type: 'formula' },
            { separator: true },
            { name: 'Directrix', type: 'select', options: [{ label: 'x', value: 'x' }, { label: 'y', value: 'y' }] },
            { name: 'Value', value: '', type: 'formula' },
            { separator: true },
        ]
    }
    else if (problemClass === 'fromVertexAndFocus') {
        return [
            { name: 'Vertex point h', value: '', type: 'formula' },
            { name: 'k', value: '', type: 'formula' },
            { separator: true },
            { name: 'Focus point x', value: '', type: 'formula' },
            { name: 'y', value: '', type: 'formula' },
            { separator: true },
        ]

    }
    else if (problemClass === 'fromVertexVariantAndA') {
        return [
            { name: 'Vertex point h', value: '', type: 'formula' },
            { name: 'k', value: '', type: 'formula' },
            { separator: true },
            {
                name: 'Parabola Variant',
                type: 'select',
                options: [
                    { label: "open upwards", value: VERTICAL_UP },
                    { label: "open downwards", value: VERTICAL_DOWN },
                    { label: "open right", value: HORIZONTAL_RIGHT },
                    { label: "open left", value: HORIZONTAL_LEFT },
                ]
            },
            { separator: true },
            { name: 'a', value: '', type: 'formula' },
            { separator: true },
        ]
    }
    else if (problemClass === 'fromVertexVariantAndPoint') {
        return [
            { name: 'Vertex point', value: '', placeholder: '(h,k)', noEval: true },
            { separator: true },
            {
                name: 'Parabola Variant',
                type: 'select',
                options: [
                    { label: "open upwards", value: VERTICAL_UP },
                    { label: "open downwards", value: VERTICAL_DOWN },
                    { label: "open right", value: HORIZONTAL_RIGHT },
                    { label: "open left", value: HORIZONTAL_LEFT },
                ]
            },
            { separator: true },
            { name: 'Point on Parabola', value: '', placeholder: '(x,y)', noEval: true },
            { separator: true },
        ]
    }

    return [];
}

function conicsParabola(problemClass, ...args) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    const fromVertexAndDirectrix = (h, k, xOry, d) => {
        const steps = [];
        const hvalue = _latexToDecimal(h);
        const kvalue = _latexToDecimal(k);
        const dvalue = _latexToDecimal(d);
        var focusx, focusy;
        if (xOry === 'x') {
            focusy = k;
            focusx = String(hvalue.add(hvalue.sub(dvalue)));
        } else {
            focusx = h;
            focusy = String(kvalue.add(kvalue.sub(dvalue)));
        }
        steps.push(...fromVertexAndFocus(h, k, focusx, focusy));
        return steps;
    }
    const fromFocusAndDirectrix = (x, y, xOry, d) => {
        const steps = [];
        const focusx = _latexToDecimal(x);
        const focusy = _latexToDecimal(y);
        const dvalue = _latexToDecimal(d);
        var h, k;
        if (xOry === 'x') {
            k = String(focusy);
            h = String(focusx.add(dvalue).div(2));
        } else {
            h = String(focusx);
            k = String(focusy.add(dvalue).div(2));
        }
        steps.push(...fromVertexAndFocus(h, k, String(focusx), String(focusy)));
        return steps;
    }
    const fromVertexAndFocus = (h, k, x, y) => {
        const steps = [];
        const hvalue = _latexToDecimal(h);
        const kvalue = _latexToDecimal(k);
        const xvalue = _latexToDecimal(x);
        const yvalue = _latexToDecimal(y);
        var pvariant, avalue;
        if (hvalue.equals(xvalue)) {
            if (kvalue.equals(yvalue)) {
                throw `vertex and focus must be different`;
            }
            pvariant = (yvalue.gt(kvalue)) ? VERTICAL_UP : VERTICAL_DOWN;
            avalue = kvalue.sub(yvalue).abs();
        }
        else if (kvalue.equals(yvalue)) {
            pvariant = (xvalue.gt(hvalue)) ? HORIZONTAL_RIGHT : HORIZONTAL_LEFT;
            avalue = hvalue.sub(xvalue).abs();
        }
        else {
            throw 'unsupported coordinates for vertex and focus';
        }
        steps.push(...parabolaSteps(pvariant, hvalue, kvalue, avalue));
        return steps;
    }
    const fromVertexVariantAndA = (h, k, pvariant, a) => {
        const steps = [];
        const hvalue = _latexToDecimal(h);
        const kvalue = _latexToDecimal(k);
        const avalue = _latexToDecimal(a);
        steps.push(...parabolaSteps(pvariant, hvalue, kvalue, avalue));
        return steps;
    }
    const fromVertexVariantAndPoint = (vertexPoint, pvariant, parabolaPoint) => {
        const vertex = _parsePointString(vertexPoint);
        const h = vertex.x;
        const k = vertex.y;
        const hlatex = _decimalToLatex(h);
        const klatex = _decimalToLatex(k)
        const { x, y } = _parsePointString(parabolaPoint);
        const eq = pvariant === VERTICAL_UP
            ? `(x - ${hlatex})^2 = 4a(y-${klatex})`
            : pvariant === VERTICAL_DOWN
                ? `(x - ${hlatex})^2 = -4a(y-${klatex})`
                : pvariant === HORIZONTAL_RIGHT
                    ? `(y-${klatex})^2 = 4a(x-${hlatex})`
                    : `(y-${klatex})^2 = -4a(x-${hlatex})`;
        const steps = [];
        steps.push("Using parabola equation:");
        steps.push({ latex: eq });
        steps.push(`Using point on parabola (${x},${y}) to determine missing parameter "a":`);
        const substMap = { x: String(x), y: String(y) }
        callServerService('substituteAll', { term: eq, substMap }, resObj => {
            const substSteps = [];
            if (resObj.term) {
                if (resObj.steps) {
                    substSteps.push(...resObj.steps);
                }
                callServerService('solveFor', { equation: resObj.term, variable: 'a' }, resObj => {
                    if (resObj.steps) {
                        steps.push({ collapsibleSection: { title: 'Plugin values for "x" and "y"', steps: substSteps } });
                        steps.push({ collapsibleSection: { title: 'Solve for "a"', steps: resObj.steps } });
                        if (resObj.steps.length > 0) {
                            steps.push(resObj.steps[resObj.steps.length - 1]);
                        }
                        const { solutions: [avalue] } = resObj;
                        if (!avalue) {
                            throw `something went wrong: no solution for "a" found.`;
                        }
                        console.log(`found avalue: ${avalue}`);
                        let adecimal;
                        try {
                            adecimal = _d(avalue);
                            steps.push(...parabolaSteps(pvariant, h, k, adecimal));
                        } catch(err) {
                            steps.push('could not simplify "a" to a value.');
                        }
                        console.log('steps: %o', steps);
                        _showComputationSteps(o, steps);
                    }
                })
            }
        })
    }
    try {
        const steps = [];
        if (problemClass === 'fromEquation') {
            parabolaFromEquation(o, ...args);
        }
        else if (problemClass === 'fromVertexAndDirectrix') {
            steps.push(...fromVertexAndDirectrix(...args));
        }
        else if (problemClass === 'fromFocusAndDirectrix') {
            steps.push(...fromFocusAndDirectrix(...args));
        }
        else if (problemClass === 'fromVertexAndFocus') {
            steps.push(...fromVertexAndFocus(...args));
        }
        else if (problemClass === 'fromVertexVariantAndA') {
            steps.push(...fromVertexVariantAndA(...args));
        }
        else if (problemClass === 'fromVertexVariantAndPoint') {
            fromVertexVariantAndPoint(...args);
        }
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, JSON.stringify(err, null, 2));
        throw err
    }
}

/**
 * 
 */
const parabolaSteps = (pvariant, h, k, a, otherEquations = []) => {
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
    const _dl = _decimalToLatex;
    const hvalue = _d(h);
    const kvalue = _d(k);
    const avalue = _d(a);
    const a2 = avalue.mul(2);
    const a4 = avalue.mul(4);
    const minush = hvalue.negated();
    const minusk = kvalue.negated();
    const vertex = { x: _dl(hvalue), y: _dl(kvalue) };
    var equation, equationPattern, focus, directrix, directrixEquation, lrs, variantText, symmetryAxisEquation;
    if (pvariant === VERTICAL_UP) {
        variantText = "<b>Vertical</b> axis of symmetry, open upwards";
        equation = `(x ${_valueAsSummandLatex(minush)})^2 = ${_dl(a4)}(y ${_valueAsSummandLatex(minusk)})`;
        equationPattern = '(x-h)^2 = 4a(y-k)';
        focus = [{ x: 'h', y: 'k+a' }, { x: _dl(hvalue), y: _dl(kvalue.add(avalue)) }];
        directrix = `y = k - a = ${_dl(kvalue.sub(avalue))}`;
        directrixEquation = `y = ${_dl(kvalue.sub(avalue))}`;
        lrs = [
            [{ x: 'h-2a', y: 'k+a' }, { x: _dl(hvalue.sub(a2)), y: _dl(kvalue.add(avalue)) }],
            [{ x: 'h+2a', y: 'k+a' }, { x: _dl(hvalue.add(a2)), y: _dl(kvalue.add(avalue)) }],
        ];
        symmetryAxisEquation = `x = ${_dl(hvalue)}`;
    }
    else if (pvariant === VERTICAL_DOWN) {
        variantText = "<b>Vertical</b> axis of symmetry, open downwards";
        equation = `(x ${_valueAsSummandLatex(minush)})^2 = -${_dl(a4)}(y ${_valueAsSummandLatex(minusk)})`;
        equationPattern = '(x-h)^2 = -4a(y-k)';
        focus = [{ x: 'h', y: 'k-a' }, { x: _dl(hvalue), y: _dl(kvalue.sub(avalue)) }];
        directrix = `y = k + a = ${_dl(kvalue.add(avalue))}`;
        directrixEquation = `y = ${_dl(kvalue.add(avalue))}`;
        lrs = [
            [{ x: 'h - 2a', y: 'k-a' }, { x: _dl(hvalue.sub(a2)), y: _dl(kvalue.sub(avalue)) }],
            [{ x: 'h+2a', y: 'k-a' }, { x: _dl(hvalue.add(a2)), y: _dl(kvalue.sub(avalue)) }],
        ];
        symmetryAxisEquation = `x = ${_dl(hvalue)}`;
    }
    else if (pvariant === HORIZONTAL_RIGHT) {
        variantText = "<b>Horizontal</b> axis of symmetry, open to the right";
        equation = `(y ${_valueAsSummandLatex(minusk)})^2 = ${_dl(a4)}(x ${_valueAsSummandLatex(minush)})`;
        equationPattern = '(y-k)^2 = 4a(x-h)';
        focus = [{ x: 'h+a', y: 'k' }, { x: _dl(hvalue.add(avalue)), y: _dl(kvalue) }];
        directrix = `x = h - a = ${_dl(hvalue.sub(avalue))}`;
        directrixEquation = `x = ${_dl(hvalue.sub(avalue))}`;
        lrs = [
            [{ x: 'h+a', y: 'k-2a' }, { x: _dl(hvalue.add(avalue)), y: _dl(kvalue.sub(a2)) }],
            [{ x: 'h+a', y: 'k+2a' }, { x: _dl(hvalue.add(avalue)), y: _dl(kvalue.add(a2)) }],
        ];
        symmetryAxisEquation = `y = ${_dl(kvalue)}`;
    }
    else if (pvariant === HORIZONTAL_LEFT) {
        variantText = "<b>Horizontal</b> axis of symmetry, open to the left";
        equation = `(y ${_valueAsSummandLatex(minusk)})^2 = -${_dl(a4)}(x ${_valueAsSummandLatex(minush)})`;
        equationPattern = '(y-k)^2 = -4a(x-h)';
        focus = [{ x: 'h-a', y: 'k' }, { x: _dl(hvalue.sub(avalue)), y: _dl(kvalue) }];
        directrix = `x = h + a = ${_dl(hvalue.add(avalue))}`;
        directrixEquation = `x = ${_dl(hvalue.add(avalue))}`;
        lrs = [
            [{ x: 'h-a', y: 'k-2a' }, { x: _dl(hvalue.sub(avalue)), y: _dl(kvalue.sub(a2)) }],
            [{ x: 'h-a', y: 'k+2a' }, { x: _dl(hvalue.sub(avalue)), y: _dl(kvalue.add(a2)) }],
        ];
        symmetryAxisEquation = `y = ${_dl(kvalue)}`;
    }
    var latex = equation;
    const addProcessTermButton = true;
    steps.push({
        section: {
            style: {
                display: "inline-block",
                padding: "10px",
                background: "lightblue",
                color: "black",
                borderRadius: "8px"
            },
            steps: [variantText, { latex: equationPattern }, { latex, addProcessTermButton }]
        }
    })
    //steps.push({ latex });
    latex = `\\text{<b>Vertex:</b>&nbsp;} (h,k) = \\left(${vertex.x},${vertex.y}\\right)`;
    steps.push({ latex });
    latex = `a = ${_decimalToLatex(avalue)}`;
    steps.push({ latex });
    //latex = `\\text{<b>Focus:</b>&nbsp;} \\left(${focus.x},${focus.y}\\right)`;
    latex = `\\text{<b>Focus:</b>&nbsp;} ${_p2l(focus)}`;
    steps.push({ latex });
    latex = `\\text{<b>Directrix:</b>&nbsp;} ${directrix}`;
    steps.push({ latex });
    latex = `\\text{<b>Axis of Symmetry:</b>&nbsp;} ${symmetryAxisEquation}`;
    steps.push({ latex });
    //latex += lrs.map(p => `(${p.x}, ${p.y})`).join(",");
    steps.push('<b>Latus rectum endpoints:</b>');
    latex = _p2l(lrs[0]);
    steps.push({ latex });
    latex = _p2l(lrs[1]);
    steps.push({ latex });
    steps.push('<b>Length of Latus rectum:</b>');
    steps.push({ latex: `${a4}` });
    //latex = `\\text{<b>Length of Latus rectum:</b>&nbsp;' ${_dl(a4)}`;

    steps.push({
        section: {
            title: "Graph",
            style: { position: 'absolute', top: 0, left: '600px' },
            steps: [{
                desmos: {
                    equations: [...otherEquations, equation],
                    points: [vertex, focus[1], ...lrs.map(pl => pl[1])],
                    dashedLines: [directrixEquation, symmetryAxisEquation],
                    height: '800px',
                }
            }]
        }
    })
    return steps;
}

const parabolaFromEquation = (o, equation) => {
    console.log(`find parabola parameters from equation: ${equation}`);
    const url = '/api/parabolaEquation';
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
        if (resObj.parabolaParameters) {
            let { h, k, a, pvariant } = resObj.parabolaParameters;
            steps.push(...parabolaSteps(pvariant, h, k, a, [equation]));
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