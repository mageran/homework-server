function logarithmicFunctionTransformationsFromParameters(a, b, h, k, base, skipInverse = false) {
    const outputElem = _htmlElement('div', this, null, 'exponential-function-properties');

    const baseNum = base === 'e' ? Math.E : base;


    const _numToLatex = num => {
        const { numerator, denominator } = findFraction(num);
        if (denominator === 1) {
            return num;
        }
        var latex = "";
        if (num < 0) {
            latex += "-";
        }
        latex += `\\frac{${Math.abs(numerator)}}{${Math.abs(denominator)}}`;
        return latex;
    }

    const _baseToLatex = () => _numToLatex(base);

    const getEquation = () => {
        var exp = '';
        if (b < 0) {
            exp += '-';
        }
        if (Math.abs(b) !== 1) {
            exp += _numToLatex(Math.abs(b));
        }
        if (h !== 0) {
            exp += '(';
        }
        exp += 'x';
        if (h !== 0) {
            exp += h > 0 ? '-' : '+';
            exp += _numToLatex(Math.abs(h))
        }
        if (h !== 0) {
            exp += ')';
        }
        var astr = '';
        if (a < 0) astr += '-';
        if (Math.abs(a) !== 1) {
            astr += _numToLatex(Math.abs(a));
        }
        var latex = `f(x) = ${astr}\\log_{${_baseToLatex()}}{(${exp})}`
        if (k !== 0) {
            latex += k > 0 ? '+' : '-';
            latex += _numToLatex(Math.abs(k));
        }
        return latex;
    }

    const _addPropertiesTable = (includeParameters) => {
        const table = _htmlElement('table', outputElem, null, 'exponential-function-properties-table');
        const _addParameter = (pname, pvalue) => {
            const td = _htmlElement('td')
            addLatexElement(td, _numToLatex(pvalue))
            _htmlElement('tr', table, [
                _htmlElement('td', null, `${pname}:`),
                td
            ])

        }
        if (includeParameters) {
            _addParameter('a', a);
            _addParameter('b', b);
            _addParameter('h', h);
            _addParameter('k', k);
        }
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Vertical Assymptote:'),
            _htmlElement('td', null, `x = ${h}`)
        ])
        var td = _htmlElement('td');
        addLatexElement(td, `y = \\log_{${_baseToLatex()}}x \\text{&nbsp;&nbsp;<b>or</b>&nbsp;&nbsp;} (${_baseToLatex()})^y = x`);
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Parent function:'),
            td
        ])
        td = _htmlElement('td');
        const domain = b > 0 ? `(${h},\\infty)` : b < 0 ? `(-\\infty,${h})` : `\\{${h}\\}`;
        addLatexElement(td, domain);
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Domain:'),
            td
        ])
        td = _htmlElement('td');
        addLatexElement(td, '(-\\infty,\\infty)');
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Range:'),
            td
        ])
        const a0 = a;
        const b0 = b;
        const h0 = h;
        const k0 = k;
        var transformationsText = describeTransformation(a0, b0, h0, k0, true);
        _htmlElement('tr', table, [
            _htmlElement('td', null, "Describe the transformations:"),
            _htmlElement('td', null, transformationsText)
        ]);
        td = _htmlElement('td');
        addLatexElement(td, getEquation());
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Equation:'),
            td
        ])
    }

    const _addGraph = (keypointsMap, sampleValues, equation = null) => {
        const div = document.createElement('div');
        outputElem.appendChild(div);
        const width = "1000px";
        const calc = appendGraphingCalculator(div, { width });
        const ftermLatex = equation ? equation : getEquation();
        calc.setExpression({ latex: ftermLatex });
        calc.setExpression({ latex: `x = ${h}`, lineStyle: "DASHED", showLabel: true, lineColor: 'orange' });
        if (keypointsMap) {
            keypointsMap.forEach(({ keypoint, transformedKeypoint }) => {
                const tx = transformedKeypoint.x;
                const ty = transformedKeypoint.y;
                const txd = tx;
                const tyd = ty;
                calc.setExpression({ latex: `(${_numToLatex(txd)}, ${_numToLatex(tyd)})`, showLabel: true });
            });
        }
        if (sampleValues) {
            sampleValues.forEach(({x, y}) => {
                calc.setExpression({ latex: `(${x}, ${y})`, showLabel: true });
            })
        }
        return calc;
    }

    const _addTChart = (keypointsMap) => {
        const x_over_b = () => {
            var latex = "";
            var b0 = b;
            if (b0 < 0) {
                latex += "-";
                b0 = Math.abs(b0);
            }
            if (b0 === 1) {
                latex += 'x';
                return latex;
            }
            const { numerator, denominator } = findFraction(b0);
            if (denominator === 1) {
                latex += `\\frac{x}{${numerator}}`
            } else {
                const numeratorx = `${denominator}x`;
                if (numerator === 1) {
                    latex += numeratorx;
                } else {
                    latex += `\\frac{${numeratorx}}{${numerator}}`
                }
            }
            return latex;
        }
        const plusSymInFrontOf = num => num < 0 ? '' : '+';

        const hd = document.createElement("h2");
        hd.innerHTML = "T-Chart";
        outputElem.appendChild(hd);
        addLatexElement(outputElem, '(\\frac{x}{b}+h, ay+k)');
        const table = document.createElement('table');
        table.className = 't-chart-table';
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerHTML = "Parent Graph";
        tr.appendChild(td);
        td = document.createElement('td');
        var div = document.createElement('div');
        //addLatexElement(div, `\\frac{x}{${_numToLatex(b)}} + (${_numToLatex(h)})`);
        addLatexElement(div, `${x_over_b()} + (${_numToLatex(h)})`);
        td.appendChild(div);
        tr.appendChild(td);
        td = document.createElement('td');
        var div = document.createElement('div');
        addLatexElement(div, `{${_numToLatex(a)}y + ${_numToLatex(k)}}`);
        td.appendChild(div);
        tr.appendChild(td);
        table.appendChild(tr);
        if (keypointsMap) {
            keypointsMap.forEach(pmap => {
                const kp = pmap.keypoint;
                const tkp = pmap.transformedKeypoint;
                const { x, y } = kp;
                let tr = document.createElement('tr');
                let td = document.createElement('td');
                addLatexElement(td, `(${_numToLatex(x)}, ${_numToLatex(y)})`);
                tr.appendChild(td);
                // transformed x coordinate: x/B + h
                td = document.createElement('td');
                let xOverB = x / b;
                let xval = tkp.x;
                addLatexElement(td, `${_numToLatex(xOverB)} + (${_numToLatex(h)}) = ${_numToLatex(xval)}`);
                tr.appendChild(td);
                td = document.createElement('td');
                let ATimesy = a * y;
                let yval = tkp.y;
                addLatexElement(td, `${_numToLatex(ATimesy)} + (${_numToLatex(k)}) = ${_numToLatex(yval)}`);
                tr.appendChild(td);
                table.appendChild(tr);
            })
        }
        outputElem.appendChild(table);
    }

    const _makeATable = sampleValues => {
        const table = _htmlElement('table', outputElem, null, "make-a-table");
        const xtr = _htmlElement('tr', table);
        const ytr = _htmlElement('tr', table);
        _htmlElement('td', xtr, 'x');
        _htmlElement('td', ytr, 'y');
        sampleValues.forEach(({ x, y }) => {
            _htmlElement('td', xtr, String(x));
            _htmlElement('td', ytr, String(y));
        })
    }

    const _transformPoint = ({ x, y }) => {
        return { x: x / b + h, y: a * y + k };
    }

    const logBase = (n, base) => Math.log(n) / Math.log(base);

    const _applyParentFunction = x => logBase(x, baseNum);
    const _applyInverseParentFunction = y => Math.pow(baseNum, y)

    const _applyFunction = x => {
        const _x = new Decimalx(x);
        const _a = new Decimalx(a);
        const _b = new Decimalx(b);
        const _h = new Decimalx(h);
        const _k = new Decimalx(k);
        const _base = new Decimalx(baseNum);
        return ((((_x.minus(_h)).times(_b)).logarithm(_base)).times(_a)).plus(_k);
    }

    const _getSamplesValues = () => {
        const numEntries = 5;
        const stepWidth = 1;
        const step = stepWidth * Math.sign(b);
        const values = [];
        for(let x = h; Math.abs(x-h) <= numEntries; x += step) {
            let y = _applyFunction(x).toPrecision(3);
            values.push({ x, y });
        }
        return b < 0 ? values.reverse() : values;
    }

    const functionToLatex = logToLatex(base,_numToLatex(base))
    const inverseFunctionToLatex = expToLatex(base, _numToLatex(base))
    const precalculusHelperFunctionForInverse = exponentialFunctionTransformationsFromParameters;

    try {
        const sampleValues = _getSamplesValues();
        console.log(`sample values: ${JSON.stringify(sampleValues, null, 2)}`);
        const ypoints = [-1, 0, 1];
        const keypointsMap = ypoints.map(y => {
            const x = _applyInverseParentFunction(y);
            const keypoint = { x, y }
            const transformedKeypoint = _transformPoint(keypoint);
            return { keypoint, transformedKeypoint };
        });
        _addPropertiesTable(true);
        _addGraph(keypointsMap);
        _addTChart(keypointsMap);
        _htmlElement('h2', outputElem, '"Make a table"', 'bigSkip');
        _makeATable(sampleValues);
        _htmlElement('h2', outputElem, 'Graph with values from table');
        _addGraph(null, sampleValues);

        if (!skipInverse) {
            const { f_1, A, B, H, K } = calculateInverseSteps(outputElem, a, b, h, k, functionToLatex, inverseFunctionToLatex);
            console.log(`A=${A}, B=${B}, H=${H}, K=${K}`);
            const inverseSampleValues = sampleValues.map(p => ({ x: p.y, y : p.x }));
            _htmlElement('h2', outputElem, '"Make a table" for inverse function', 'bigSkip');
            _makeATable(inverseSampleValues);
            _htmlElement('h2', outputElem, 'Graph for inverse function');
            _addGraph(null, inverseSampleValues, f_1)
            const inverseDiv = _htmlElement('div', outputElem, null, 'inverse-info');
            precalculusHelperFunctionForInverse.call(inverseDiv, A, B, H, K, base, true);
        }

    } catch (err) {
        _addErrorElement(outputElem, err);
    }
}

function logarithmicFunctionTransformationsFromEquation(latex) {
    const outputElem = this;
    const url = '/api/extractParametersExponentialFunction';
    const data = { latex };
    const success = response => {
        //console.log(`response: ${JSON.stringify(response, null, 2)}`);
        var resObj = response;
        try {
            resObj = JSON.parse(response);
        } catch (err) {
            console.error(err);
        }
        _htmlElement('pre', outputElem, JSON.stringify(resObj, null, 2));
    }
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: success,
        error: ajaxErrorFunction(outputElem)
    });
}

const logToLatex = (base, baseLatex) => (latexArg => {
    if (base === 'e') {
        return `ln(${latexArg})`;
    }
    return `log_{${baseLatex}}(${latexArg})`;
})

const expToLatex = (base, baseLatex) => (latexArg => {
    return `${baseLatex}^{${latexArg}}`;
})


const calculateInverseSteps = (cont, a, b, h, k, applyParentFunction, applyInverseParentFunction) => {
    const P = applyParentFunction;
    const P_1 = applyInverseParentFunction;
    const _descr = text => {
        const div = _htmlElement('div', cont);
        addLatexElement(div, text);
    }
    const _l = num => {
        const { numerator, denominator } = findFraction(num);
        if (denominator === 1) {
            return num;
        }
        var latex = "";
        if (num < 0) {
            latex += "-";
        }
        latex += `\\frac{${Math.abs(numerator)}}{${Math.abs(denominator)}}`;
        return latex;
    }
    const _f1 = a => {
        var latex = a < 0 ? '-' : '';
        const _a = Math.abs(a);
        if (_a !== 1) {
            latex += _l(_a) + " \\cdot ";
        }
        return latex;
    }

    const _s2 = n => {
        if (n === 0) {
            return '';
        }
        var latex = n < 0 ? '-' : '+';
        latex += _l(Math.abs(n));
        return latex;
    }

    const _swp = (x, n, noPars = false) => {
        var latex = `${x}${_s2(n)}`;
        if (n !== 0 && !noPars) {
            return `(${latex})`
        }
        return latex;
    }
    
    _htmlElement('h2', cont, 'Steps to calculate inverse function', 'bigSkip');
    _descr('\\text{Replace "x" and "y"}');
    var _tmp = `${_f1(b)}${_swp('y',-h)}`;
    var latex = `x = ${_f1(a)} ${P(_tmp)}${_s2(k)}`;
    addLatexElement(cont, latex);
    var H = k;
    if (k !== 0) {
        let t = '\\text{' + (k < 0 ? 'add' : 'subtract') + "&nbsp;} " + _l(Math.abs(k))
        _descr(t)
        latex = `x${_s2(-H)} = ${_f1(a)} ${P(_tmp)}`
        addLatexElement(cont, latex)
    }
    B = 1/a
    var ipar = `${_f1(B)}${_swp('x',-H)}`
    if (a !== 1) {
        var f = _l(a);
        var op = "divide by";
        if (a < 1) {
            f = _l(B);
            op = "multiply with"
        }
        _descr(`\\text{${op}&nbsp;}${f}`)
        latex = `${ipar} = ${P(_tmp)}`;
        addLatexElement(cont, latex);
    }
    _descr('\\text{apply inverse function}');
    latex = `${P_1(ipar)} = ${_tmp}`;
    addLatexElement(cont, latex);
    A = 1/b;
    var inv = `${_f1(A)}${P_1(ipar)}`
    if (b !== 1) {
        var f = _l(b);
        var op = "divide by";
        if (b < 1) {
            f = _l(A);
            op = "multiply with";
        }
        _descr(`\\text{${op}&nbsp;}${f}`);
        latex = `${inv} = ${_swp('y',-h,true)}`;
        addLatexElement(cont, latex);
    }
    var K = h;
    if (h !== 0) {
        var mh = -h
        let t = '\\text{' + (mh < 0 ? 'add' : 'subtract') + "&nbsp;} " + _l(Math.abs(h))
        _descr(t)
        latex = `${_swp(inv, h, true)} = y`
        addLatexElement(cont, latex)
    }
    latex = `f^{-1}(x) = ${_swp(inv, h, true)}`
    addLatexElement(cont, latex);
    const f_1 = `g(x) = ${_swp(inv, h, true)}`;
    return { f_1, A, B, H, K };
}