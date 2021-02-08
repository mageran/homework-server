function exponentialFunctionTransformationsFromParameters(a, b, h, k, base) {
    const outputElem = _htmlElement('div', this, null, 'exponential-function-properties');

    _numToLatex = num => {
        const { numerator, denominator } = findFraction(num);
        if (denominator === 1) {
            return num;
        }
        return `\\frac{${numerator}}{${denominator}}`;
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
        var latex = `f(x) = ${astr}(${_baseToLatex()})^{${exp}}`
        if (k !== 0) {
            latex += k > 0 ? '+' : '-';
            latex += _numToLatex(Math.abs(k));
        }
        return latex;
    }

    const _addPropertiesTable = (includeParameters) => {
        const table = _htmlElement('table', outputElem, null, 'exponential-function-properties-table');
        const _addParameter = (pname, pvalue) => {
            _htmlElement('tr', table, [
                _htmlElement('td', null, `${pname}:`),
                _htmlElement('td', null, String(pvalue))
            ])

        }
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Growth or Decay:'),
            _htmlElement('td', null, Math.abs(base) < 1 ? "Decay" : "Growth")
        ])
        if (includeParameters) {
            _addParameter('a', a);
            _addParameter('b', b);
            _addParameter('h', h);
            _addParameter('k', k);
        }
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Assymptote:'),
            _htmlElement('td', null, `y = ${k}`)
        ])
        var td = _htmlElement('td');
        addLatexElement(td, `y = (${_baseToLatex()})^x`);
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Parent function:'),
            td
        ])
        td = _htmlElement('td');
        addLatexElement(td, '(-\\infty,\\infty)');
        _htmlElement('tr', table, [
            _htmlElement('td', null, 'Domain:'),
            td
        ])
        td = _htmlElement('td');
        const range = a > 0 ? `(${k},\\infty)` : a < 0 ? `(-\\infty,${k})` : `\\{${k}\\}`;
        addLatexElement(td, range);
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

    const _addGraph = (keypointsMap) => {
        const div = document.createElement('div');
        outputElem.appendChild(div);
        const width = "1000px";
        const calc = appendGraphingCalculator(div, { width });
        const ftermLatex = getEquation();
        calc.setExpression({ latex: ftermLatex });
        calc.setExpression({ latex: `y = ${k}`, lineStyle: "DASHED", showLabel: true });
        if (keypointsMap) {
            keypointsMap.forEach(({ keypoint, transformedKeypoint }) => {
                const tx = transformedKeypoint.x;
                const ty = transformedKeypoint.y;
                const txd = tx;
                const tyd = ty;
                calc.setExpression({ latex: `(${_numToLatex(txd)}, ${_numToLatex(tyd)})`, showLabel: true });
            });
        }
        return calc;
    }

    const _addTChart = (keypointsMap) => {
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
        addLatexElement(div, `\\frac{x}{${_numToLatex(b)}} + (${_numToLatex(h)})`);
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

    const _transformPoint = ({ x, y }) => {
        return { x: x / b + h, y: a * y + k };
    }

    const _applyParentFunction = x => Math.pow(base, x);

    try {
        const xpoints = [-1, 0, 1];
        const keypointsMap = xpoints.map(x => {
            const y = _applyParentFunction(x);
            const keypoint = { x, y }
            const transformedKeypoint = _transformPoint(keypoint);
            return { keypoint, transformedKeypoint };
        });
        _addPropertiesTable(true);
        _addGraph(keypointsMap);
        _addTChart(keypointsMap);
    } catch (err) {
        _addErrorElement(outputElem, err);
    }
}

function exponentialFunctionTransformationsFromEquation(latex) {
    const outputElem = this;
    const url = '/api/extractParametersExponentialFunction';
    const data = { latex };
    const success = response => {
        //console.log(`response: ${JSON.stringify(response, null, 2)}`);
        var resObj = response;
        try {
            resObj = JSON.parse(response);
        } catch(err) {
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

