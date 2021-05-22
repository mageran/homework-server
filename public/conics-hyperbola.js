
// hyperbola variants
const TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS = 0;
const TRANSVERSE_AXIS_PARALLEL_TO_Y_AXIS = 1;

function createHyperbolaInputFields(problemClass) {
    if (problemClass === 'fromEquation') {
        return [{ name: 'Hyperbola Equation', type: 'formula', cssClass: 'width500' }];
    }
    else if (problemClass === 'fromCenterVariantAB') {
        return [
            {
                name: _fwl('Transverse Axix parallel to', 250),
                type: 'select',
                options: [
                    { label: 'x-axis', value: TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS },
                    { label: 'y-axis', value: TRANSVERSE_AXIS_PARALLEL_TO_Y_AXIS },
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
    return [];
}

function conicsHyperbola(problemClass, ...args) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    try {
        Numeric.doNotAttemptToCreateValueWithPi = true;
        const steps = [];
        if (problemClass === 'fromEquation') {
            hyperbolaFromEquation(o, ...args);
        }
        //else if (problemClass === 'fromParameters') {
        //    steps.push(...fromParameters(...args));
        //}
        else if (problemClass === 'fromCenterVariantAB') {
            steps.push(...hyperbolaSteps(...args));
        }
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, JSON.stringify(err, null, 2));
        throw err
    }
}

const hyperbolaSteps = (transverseAxis, h, k, a, b, c, otherEquations = []) => {
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
    const hvalue = _d(h);
    const kvalue = _d(k);
    const avalue = _d(a);
    const bvalue = _d(b);
    const aLatex = _decimalToLatex(avalue);
    const bLatex = _decimalToLatex(bvalue);
    steps.push({ latex: `a = ${aLatex}, b = ${bLatex}` });
    steps.push({ latex: `\\text{Transverse Axis Length:&nbsp;&nbsp;} ${_decimalToLatex(avalue.mul(2))}` });
    steps.push({ latex: `\\text{Conjugate Axis length:&nbsp;&nbsp;} ${_decimalToLatex(bvalue.mul(2))}` });
    if (!c) {
        let csquare = (avalue.pow(2).add(bvalue.pow(2)));
        c = csquare.sqrt();
        let csquareLatex = _decimalToLatex(csquare);
        let cLatex = _decimalToLatex(c);
        steps.push(`Determining "c":`);
        steps.push({ latex: `a^2 + b^2 = c^2:` });
        steps.push({ latex: `c^2 = a^2 + b^2 = ${aLatex}^2 + ${bLatex}^2 = ${csquareLatex}` });
        steps.push({ latex: `c = \\sqrt{${csquareLatex}} = ${cLatex}` });
    }
    const cvalue = _d(c);
    const center = [{ x: 'h', y: 'k' }, { x: hvalue, y: kvalue }];
    const vertices = [];
    const covertices = [];
    const foci = [];
    if (transverseAxis === TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS) {
        vertices.push(
            [{ x: 'h-a', y: 'k' }, { x: hvalue.sub(avalue), y: kvalue }],
            [{ x: 'h+a', y: 'k' }, { x: hvalue.add(avalue), y: kvalue }]
        );
        covertices.push(
            [{ x: 'h', y: 'k+b' }, { x: hvalue, y: kvalue.add(bvalue) }],
            [{ x: 'h', y: 'k-b' }, { x: hvalue, y: kvalue.sub(bvalue) }]
        );
        foci.push(
            [{ x: 'h-c', y: 'k' }, { x: hvalue.sub(cvalue), y: kvalue }],
            [{ x: 'h+c', y: 'k' }, { x: hvalue.add(cvalue), y: kvalue }]
        );
    } else {
        vertices.push(
            [{ x: 'h', y: 'k+a' }, { x: hvalue, y: kvalue.add(avalue) }],
            [{ x: 'h', y: 'k-a' }, { x: hvalue, y: kvalue.sub(avalue) }]
        );
        covertices.push(
            [{ x: 'h-b', y: 'k' }, { x: hvalue.sub(bvalue), y: kvalue }],
            [{ x: 'h+b', y: 'k' }, { x: hvalue.add(bvalue), y: kvalue }]
        );
        foci.push(
            [{ x: 'h', y: 'k+c' }, { x: hvalue, y: kvalue.add(cvalue) }],
            [{ x: 'h', y: 'k-c' }, { x: hvalue, y: kvalue.sub(cvalue) }]
        );
    }

    steps.push('Center:');
    steps.push({ latex: _p2l(center) });
    steps.push(`Vertices:`);
    steps.push(...vertices.map(v => ({ latex: _p2l(v) })));
    steps.push(`Covertices:`);
    steps.push(...covertices.map(v => ({ latex: _p2l(v) })));
    steps.push(`Foci:`);
    steps.push(...foci.map(v => ({ latex: _p2l(v) })));

    const allPoints = [center[1], ...vertices.map(pl => pl[1]), ...covertices.map(pl => pl[1]), ...foci.map(pl => pl[1])];

    const x_minus_h = `(${new Sum(new Variable('x'), ensureNumeric(hvalue.negated())).toLatex()})^2`;
    const y_minus_k = `(${new Sum(new Variable('y'), ensureNumeric(kvalue.negated())).toLatex()})^2`;
    const numerators = transverseAxis === TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS ? [x_minus_h, y_minus_k] : [y_minus_k, x_minus_h];
    const equation = `\\frac{${numerators[0]}}{${_decimalToLatex(avalue.pow(2))}} - \\frac{${numerators[1]}}{${_decimalToLatex(bvalue.pow(2))}} = 1`;
    const equationSymbolic = transverseAxis === TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS
        ? `\\frac{(x-h)^2}{a^2} - \\frac{(y-k)^2}{b^2} = 1`
        : `\\frac{(y-k)^2}{a^2} - \\frac{(x-h)^2}{b^2} = 1`

    const asymptotes = transverseAxis === TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS
        ? [
            'y - k = \\plusminus \\frac{b}{a}(x - h)',
            `y - ${_decimalToLatex(kvalue)} = \\plusminus \\frac{${_decimalToLatex(bvalue)}}{${_decimalToLatex(avalue)}}(x - ${_decimalToLatex(hvalue)})`,
            `y - ${_decimalToLatex(kvalue)} = \\frac{${_decimalToLatex(bvalue)}}{${_decimalToLatex(avalue)}}(x - ${_decimalToLatex(hvalue)})`,
            `y - ${_decimalToLatex(kvalue)} = - \\frac{${_decimalToLatex(bvalue)}}{${_decimalToLatex(avalue)}}(x - ${_decimalToLatex(hvalue)})`
        ]
        : [
            'y - k = \\plusminus \\frac{a}{b}(x - h)'
            `y - ${_decimalToLatex(kvalue)} = \\plusminus \\frac{${_decimalToLatex(avalue)}}{${_decimalToLatex(bvalue)}}(x - ${_decimalToLatex(hvalue)})`,
            `y - ${_decimalToLatex(kvalue)} = \\frac{${_decimalToLatex(avalue)}}{${_decimalToLatex(bvalue)}}(x - ${_decimalToLatex(hvalue)})`,
            `y - ${_decimalToLatex(kvalue)} = - \\frac{${_decimalToLatex(avalue)}}{${_decimalToLatex(bvalue)}}(x - ${_decimalToLatex(hvalue)})`
        ]

    steps.push('Assymptotes:');
    steps.push({ latex: `${asymptotes[0]},\\text{&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}${asymptotes[1]}` });

    steps.push('Equation:');
    steps.push({ latex: `${equationSymbolic}` });
    steps.push({ latex: `${equation}` });

    const rectPoints = (transverseAxis === TRANSVERSE_AXIS_PARALLEL_TO_X_AXIS
        ? [
            [hvalue.sub(avalue), kvalue.add(bvalue)],
            [hvalue.add(avalue), kvalue.add(bvalue)],
            [hvalue.add(avalue), kvalue.sub(bvalue)],
            [hvalue.sub(avalue), kvalue.sub(bvalue)],
            [hvalue.sub(avalue), kvalue.add(bvalue)],
        ]
        : [
            [hvalue.sub(bvalue), kvalue.add(avalue)],
            [hvalue.add(bvalue), kvalue.add(avalue)],
            [hvalue.add(bvalue), kvalue.sub(avalue)],
            [hvalue.sub(bvalue), kvalue.sub(avalue)],
            [hvalue.sub(bvalue), kvalue.add(avalue)],
        ])
        .map(([x, y]) => `(${_decimalToLatex(x)},${_decimalToLatex(y)})`)
        .join(',');

    steps.push({
        section: {
            title: "Hyperbola Graph",
            style: { position: 'absolute', top: 0, left: '400px' },
            steps: [{
                desmos: {
                    equations: [...otherEquations, equation],
                    points: allPoints,
                    //dashedLines: [directrix]
                    expressions: [
                        { latex: rectPoints, lines: true, lineStyle: 'DASHED' },
                        { latex: asymptotes[2], lineStyle: 'DASHED' },
                        { latex: asymptotes[3], lineStyle: 'DASHED' },
                    ]
                }
            }]
        }
    })

    return steps;
}