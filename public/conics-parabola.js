// parabola variants
const VERTICAL_UP = 0;
const VERTICAL_DOWN = 1;
const HORIZONTAL_RIGHT = 2;
const HORIZONTAL_LEFT = 3;


function createParabolaInputFields(problemClass) {
    if (problemClass === 'fromEquation') {
        return [{ name: 'Circle Equation', type: 'formula', cssClass: 'width500' }];
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
    try {
        const steps = [];
        if (problemClass === 'fromEquation') {
            //conicsCircleFindCenterRadiusFromEquation(o, ...args);
        }
        else if (problemClass === 'fromVertexAndDirectrix') {
            steps.push(...fromVertexAndDirectrix(...args));
        }
        else if (problemClass === 'fromVertexAndFocus') {
            steps.push(...fromVertexAndFocus(...args));
        }
        else if (problemClass === 'fromVertexVariantAndA') {
            steps.push(...fromVertexVariantAndA(...args));
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
const parabolaSteps = (pvariant, h, k, a) => {
    const steps = [];
    const _dl = _decimalToLatex;
    const hvalue = _d(h);
    const kvalue = _d(k);
    const avalue = _d(a);
    const a2 = avalue.mul(2);
    const a4 = avalue.mul(4);
    const minush = hvalue.negated();
    const minusk = kvalue.negated();
    const vertex = { x: _decimalToLatex(hvalue), y: _decimalToLatex(kvalue) };
    var equation, focus, directrix, lrs;
    if (pvariant === VERTICAL_UP) {
        equation = `(x ${_valueAsSummandLatex(minush)})^2 = ${_dl(a4)}(y ${_valueAsSummandLatex(minusk)})`;
        focus = { x: _dl(hvalue), y: _dl(kvalue.add(avalue)) };
        directrix = `y = ${_dl(kvalue.sub(avalue))}`;
        lrs = [
            { x: _dl(hvalue.sub(a2)), y: _dl(kvalue.add(avalue)) },
            { x: _dl(hvalue.add(a2)), y: _dl(kvalue.add(avalue)) },
        ]
    }
    else if (pvariant === VERTICAL_DOWN) {
        equation = `(x ${_valueAsSummandLatex(minush)})^2 = -${_dl(a4)}(y ${_valueAsSummandLatex(minusk)})`;
        focus = { x: _dl(hvalue), y: _dl(kvalue.sub(avalue)) };
        directrix = `y = ${_dl(kvalue.add(avalue))}`;
        lrs = [
            { x: _dl(hvalue.sub(a2)), y: _dl(kvalue.sub(avalue)) },
            { x: _dl(hvalue.add(a2)), y: _dl(kvalue.sub(avalue)) },
        ]
    }
    else if (pvariant === HORIZONTAL_RIGHT) {
        equation = `(y ${_valueAsSummandLatex(minusk)})^2 = ${_dl(a4)}(x ${_valueAsSummandLatex(minush)})`;
        focus = { x: _dl(hvalue.add(avalue)), y: _dl(kvalue) };
        directrix = `x = ${_dl(hvalue.sub(avalue))}`;
        lrs = [
            { x: _dl(hvalue.add(avalue)), y: _dl(kvalue.sub(a2)) },
            { x: _dl(hvalue.add(avalue)), y: _dl(kvalue.add(a2)) },
        ]
    }
    else if (pvariant === HORIZONTAL_LEFT) {
        equation = `(y ${_valueAsSummandLatex(minusk)})^2 = -${_dl(a4)}(x ${_valueAsSummandLatex(minush)})`;
        focus = { x: _dl(hvalue.sub(avalue)), y: _dl(kvalue) };
        directrix = `x = ${_dl(hvalue.add(avalue))}`;
        lrs = [
            { x: _dl(hvalue.sub(avalue)), y: _dl(kvalue.sub(a2)) },
            { x: _dl(hvalue.sub(avalue)), y: _dl(kvalue.add(a2)) },
        ]
    }
    var latex = equation;
    steps.push({ latex });
    latex = `a = ${_decimalToLatex(avalue)}`;
    steps.push({ latex });
    latex = `\\text{focus:} \\left(${focus.x},${focus.y}\\right)`;
    steps.push({ latex });
    latex = `\\text{directrix:} ${directrix}`;
    steps.push({ latex });
    latex = '\\text{Latus rectum endpoints:} '
    latex += lrs.map(p => `(${p.x}, ${p.y})`).join(",");
    steps.push({ latex });
    latex = `\\text{Length of Latus rectum:} ${_dl(a4)}`;
    steps.push({ latex });
    steps.push({
        collapsibleSection: {
            title: "Graph",
            steps: [{
                desmos: {
                    equations: [equation],
                    points: [vertex, focus, ...lrs],
                    dashedLines: [directrix]
                }
            }]
        }
    })
    return steps;
}