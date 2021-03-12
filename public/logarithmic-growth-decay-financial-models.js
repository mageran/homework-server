function financialModelFixedRate(A, P, r, n, t) {
    const outputElem = this;
    outputElem.style.fontSize = "18pt";
    const _d = x => new Decimalx(x);
    const _solveForA = () => {
        _htmlElement('div', outputElem, 'Solving for A:');
        addLatexElement(outputElem, `A = P(1+\\frac{r}{n})^{n\\cdot t}`);
        addLatexElement(outputElem, `A = ${P}(1 + \\frac{${r}}{${n}})^{${n}\\cdot ${t}}`, 'insert values');
        const rn = (_d(r)).div(_d(n));
        const nt = (_d(n).mul(_d(t)));
        addLatexElement(outputElem, `A = ${P}(1 + ${rn})^{${nt}}`);
        const rn1 = rn.add(_d(1));
        addLatexElement(outputElem, `A = ${P}(${rn1})^{${nt}}`);
        const rn1pnt = rn1.pow(nt);
        addLatexElement(outputElem, `A = ${P}\\cdot ${rn1pnt}`);
        const Avalue = _d(P).mul(rn1pnt);
        addLatexElement(outputElem, `A = ${Avalue} = ${Avalue.toFixed(2)}`);
        _htmlElement('div', outputElem, 'Interest:', 'bigSkip');
        const interest = Avalue.sub(_d(P));
        addLatexElement(outputElem, `A - P = ${interest} = ${interest.toFixed(2)}`);
    }
    const _solveForP = () => {
        addLatexElement(outputElem, `A = P(1+\\frac{r}{n})^{n\\cdot t}`);
        addLatexElement(outputElem, `${A} = P(1 + \\frac{${r}}{${n}})^{${n}\\cdot ${t}}`, 'insert values'); const rn = (_d(r)).div(_d(n));
        const nt = (_d(n).mul(_d(t)));
        addLatexElement(outputElem, `${A} = P(1 + ${rn})^{${nt}}`);
        const rn1 = rn.add(_d(1));
        addLatexElement(outputElem, `${A} = P(${rn1})^{${nt}}`);
        const rn1pnt = rn1.pow(nt);
        addLatexElement(outputElem, `${A} = P\\cdot ${rn1pnt}`);
        addLatexElement(outputElem, `P = \\frac{${A}}{${rn1pnt}}`, 'solve for P');
        const pvalue = _d(A).div(rn1pnt);
        addLatexElement(outputElem, `P = ${pvalue} = ${pvalue.toFixed(2)}`);
    }
    const _solveForT = () => {
        addLatexElement(outputElem, `A = P(1+\\frac{r}{n})^{n\\cdot t}`);
        const x = _d(1).add(_d(r).div(_d(n)));
        const y = _d(A).div(_d(P));
        addLatexElement(outputElem, `\\frac{A}{P} = ${x}^{${n}t}`, 'divide by P and plugin values');
        addLatexElement(outputElem, `${y.toFixed(5)} = ${x.toFixed(5)}^{${n}t}`);
        addLatexElement(outputElem, `\\ln ${y.toFixed(5)} = \\ln(${x.toFixed(5)}^{${n}t})`, 'apply ln on both sides');
        addLatexElement(outputElem, `\\ln ${y.toFixed(5)} = ${n}t\\cdot\\ln(${x.toFixed(5)})`, 'apply log rule');
        const z = _d(n).mul(x.ln());
        const lny = y.ln();
        addLatexElement(outputElem, `t = \\frac{${lny.toFixed(5)}}{${z.toFixed(5)}}`, 'solve for t');
        const tvalue = lny.div(z);
        addLatexElement(outputElem, `t = ${tvalue.toFixed(2)}`);
        toTimeUnits(outputElem, tvalue, 'years');//yearDecimalToYearsAndMonths(tvalue);
        //_htmlElement('div', outputElem, `${years} years, ${months} months`);
        //_htmlElement('div', outputElem, ss0);
    }
    const _solveForR = () => {
        addLatexElement(outputElem, `A = P(1+\\frac{r}{n})^{n\\cdot t}`);
        const x = _d(n).mul(_d(t));
        addLatexElement(outputElem, `\\frac{A}{P} = (1+\\frac{r}{n})^{${x.toFixed(5)}}`);
        const y = _d(A).div(_d(P));
        addLatexElement(outputElem, `${y.toFixed(5)}^{\\frac{1}{${x.toFixed(5)}}} = 1 + \\frac{r}{${n}}`);
        const z = y.pow(_d(1).div(x));
        addLatexElement(outputElem, `(${z.toFixed(5)} - 1)\\cdot${n} = r`);
        const rvalue = z.sub(1).mul(_d(n));
        addLatexElement(outputElem, `r = ${rvalue.toFixed(5)} = ${rvalue.mul(100).toFixed(2)}%`);

    }
    try {
        if (
            (!A)
            && (typeof P === 'number')
            && (typeof r === 'number')
            && (typeof n === 'number')
            && (typeof t === 'number')
        ) {
            _solveForA();
        }
        else if (
            (!P)
            && (typeof A === 'number')
            && (typeof r === 'number')
            && (typeof n === 'number')
            && (typeof t === 'number')
        ) {
            _solveForP();
        }
        else if (
            (!t)
            && (typeof A === 'number')
            && (typeof r === 'number')
            && (typeof n === 'number')
            && (typeof P === 'number')
        ) {
            _solveForT();
        }
        else if (
            (!r)
            && (typeof A === 'number')
            && (typeof t === 'number')
            && (typeof n === 'number')
            && (typeof P === 'number')
        ) {
            _solveForR();
        }
        else {
            throw "this combination of values is not supported"
        }
    } catch (err) {
        _addErrorElement(outputElem, err);
    }
}


function financialModelContinuous(A, P, r, t) {
    const outputElem = this;
    const nameOfRateVariable = "r";
    const timeUnit = 'years';
    const fixed = 5;
    const fillMissingInput = true;
    logarithmicGrowthDecayInternal({ outputElem, A, P, r, t, nameOfRateVariable, timeUnit, fixed, fillMissingInput });
}

function logarithmicGrowthDecay(A, P, r, t, timeUnit) {
    const outputElem = this;
    const nameOfRateVariable = "k";
    const fixed = 10;
    const fillMissingInput = true;
    logarithmicGrowthDecayInternal({ outputElem, A, P, r, t, nameOfRateVariable, timeUnit, fixed, fillMissingInput });
}

function halfLifeQuestions(halfLife, decay, age) {
    const outputElem0 = this;
    try {
        outputElem0.style.fontSize = "18pt";
        var outputElem = _htmlElement('div', outputElem0);
        outputElem.style.border = "1px solid green";
        outputElem.style.margin = "5px";
        outputElem.style.padding = "10px";
        _htmlElement('div', outputElem, 'Step 1: determine decay rate k');
        var A = 0.5;
        var P = 1;
        var r = null;
        var t = halfLife;
        const k = logarithmicGrowthDecayInternal({ outputElem, A, P, t });
        const decayIsNum = typeof decay === 'number';
        const ageIsNum = typeof age === 'number';
        var step2Title;
        if (decayIsNum && !ageIsNum) {
            step2Title = 'Determine age';
        }
        else if (!decayIsNum && ageIsNum) {
            step2Title = 'Determine percentage left'
        }
        else {
            throw 'this combination of values is not supported'
        }
        outputElem = _htmlElement('div', outputElem0);
        outputElem.style.border = "1px solid green";
        outputElem.style.margin = "5px";
        outputElem.style.padding = "10px";
        _htmlElement('div', outputElem, `Step 2: ${step2Title}`);
        A = decay;
        P = 1;
        r = k.toNumber();
        t = age;
        logarithmicGrowthDecayInternal({ outputElem, A, P, r, t });
    } catch (err) {
        _addErrorElement(outputElem0, err);
    }
}

const logarithmicGrowthDecayInternal = params => {
    var { outputElem, A, P, r, t, nameOfRateVariable, timeUnit, fixed, fillMissingInput } = params;
    const _r = nameOfRateVariable ? nameOfRateVariable : 'k';
    timeUnit = timeUnit ? timeUnit : 'years';
    if (typeof fixed !== 'number') {
        fixed = 7;
    }
    outputElem.style.fontSize = "18pt";
    const _d = x => new Decimalx(x);
    const e = _d(Math.E);
    const _addGrowthOrDecayStatement = rvalue => {
        if (rvalue == 1) return;
        const growthOrDecay = rvalue > 0 ? "growth" : "decay" ;
        const symbol = rvalue > 0 ? "&gt;" : "&lt;";
        const stat = `${_r} is the exponential ${growthOrDecay}, because ${_r}${symbol}0`;
        _htmlElement('div', outputElem, stat);
    }
    const _fillMissingInput = (fieldName, value) => {
        //console.log(`fillMissingInput: ${fieldName}: ${value}`);
        if (!fillMissingInput) return;
        const indexMap = { A: 0, P: 1, r: 2, t: 3 };
        const index = indexMap[fieldName];
        const ilen = currentInputElements.length;
        if (typeof index === 'number' && index >= 0 && index < ilen) {
            currentInputElements[index].value = value.toNumber();
            currentInputElements[index].style.background = "yellow";
        }
    }
    const _solveForA = () => {
        _htmlElement('div', outputElem, 'Solving for A:');
        addLatexElement(outputElem, `A = Pe^{${_r}\\cdot t}`);
        _addGrowthOrDecayStatement(r);
        const x = _d(r).mul(t);
        addLatexElement(outputElem, `A = ${P}\\cdot e^{${x}}`);
        const avalue = _d(P).mul(e.pow(x));
        addLatexElement(outputElem, `A = ${avalue} = ${avalue.toFixed(2)}`);
        _fillMissingInput('A', avalue);
        return avalue;
    }
    const _solveForP = () => {
        addLatexElement(outputElem, `A = Pe^{${_r}\\cdot t}`);
        _addGrowthOrDecayStatement(r);
        const x = _d(r).mul(t);
        addLatexElement(outputElem, `${A} = P\\cdot e^{${x}}`);
        addLatexElement(outputElem, `P = \\frac{${A}}{e^{${x}}}`);
        const ex = e.pow(x);
        addLatexElement(outputElem, `P = \\frac{${A}}{${ex}}`);
        const pvalue = _d(A).div(ex);
        addLatexElement(outputElem, `P = ${pvalue} = ${pvalue.toFixed(2)}`);
        _fillMissingInput('P', pvalue);
        return pvalue;
    }
    const _solveForT = () => {
        addLatexElement(outputElem, `A = Pe^{${_r}\\cdot t}`);
        _addGrowthOrDecayStatement(r);
        addLatexElement(outputElem, `\\frac{A}{P} = e^{${_r}\\cdot t}`, 'divide by P');
        const x = _d(A).div(_d(P));
        addLatexElement(outputElem, `${x.toFixed(5)} = e^{${r}\\cdot t}`, 'plugin values');
        addLatexElement(outputElem, `\\ln ${x.toFixed(5)} = ${r}\\cdot t`, ' ln on both sides');
        const tvalue = x.ln().div(_d(r));
        addLatexElement(outputElem, `t = ${tvalue.toFixed(2)}`);
        //_htmlElement('div', outputElem, toTimeUnits(tvalue, timeUnit));
        toTimeUnits(outputElem, tvalue, timeUnit)
        _fillMissingInput('t', tvalue);
        return tvalue;
    }
    const _solveForR = () => {
        addLatexElement(outputElem, `A = Pe^{${_r}\\cdot t}`);
        addLatexElement(outputElem, `\\frac{A}{P} = e^{${_r}\\cdot t}`, 'divide by P');
        const x = _d(A).div(_d(P));
        addLatexElement(outputElem, `${x.toFixed(fixed)} = e^{${_r}\\cdot ${t}}`, 'plugin values');
        addLatexElement(outputElem, `\\ln ${x.toFixed(fixed)} = ${_r}\\cdot ${t}`, ' ln on both sides');
        const rvalue = x.ln().div(_d(t));
        addLatexElement(outputElem, `${_r} = ${rvalue.toFixed(fixed)} = ${rvalue.mul(100).toFixed(2)}%`);
        _addGrowthOrDecayStatement(rvalue);
        _fillMissingInput('r', rvalue);
        return rvalue;
    }
    try {
        if (
            (!A)
            && (typeof P === 'number')
            && (typeof r === 'number')
            && (typeof t === 'number')
        ) {
            return _solveForA();
        }
        else if (
            (!P)
            && (typeof A === 'number')
            && (typeof r === 'number')
            && (typeof t === 'number')
        ) {
            return _solveForP();
        }
        else if (
            (!t)
            && (typeof A === 'number')
            && (typeof r === 'number')
            && (typeof P === 'number')
        ) {
            return _solveForT();
        }
        else if (
            (!r)
            && (typeof A === 'number')
            && (typeof t === 'number')
            && (typeof P === 'number')
        ) {
            return _solveForR();
        }
        else {
            throw "this combination of values is not supported"
        }
    } catch (err) {
        _addErrorElement(outputElem, err);
        return null;
    }
}

const toTimeUnits = (outputElem, t0, timeUnit) => {
    const timeUnitMap = {
        years: {
            bigUnit: 'years',
            smallUnit: 'months',
            factor: 12
        },
        months: {
            bigUnit: 'months',
            smallUnit: 'days',
            factor: 30
        },
        days: {
            bigUnit: 'days',
            smallUnit: 'hours',
            factor: 24
        },
        hours: {
            bigUnit: 'hours',
            smallUnit: 'minutes',
            factor: 60
        },
        minutes: {
            bigUnit: 'minutes',
            smallUnit: 'seconds',
            factor: 60
        }
    };
    const { bigUnit, smallUnit, factor } = timeUnitMap[timeUnit];
    const t = t0.mul(100).round().div(100);
    const big = t.floor();
    const fraction = t.sub(big);
    const small = t.sub(big).mul(factor).round();
    addLatexElement(outputElem, `${fraction}\\cdot ${factor} = ${fraction.mul(factor).toFixed(5)} = ${small} \\text{&nbsp;(rounded)}`);
    _htmlElement('div', outputElem, `${big} ${bigUnit}, ${small} ${smallUnit}`);
}

function findExponentialFunctionFromPoints(x0, y0, x1, y1, xval) {
    var yval;
    var avalue, cvalue;
    const o = this;
    const _l = (latex, text) => {
        addLatexElement(o, latex, text);
    }
    const _bl = (latex, text) => {
        const d0 = _htmlElement('div', o);
        const d = _htmlElement('div', d0);
        d.style.display = 'inline-block';
        d.style.border = '1px solid green';
        addLatexElement(d, latex, text);
    }
    const _lpow = (base, exp) => {
        if (exp == 1) {
            return base;
        }
        return `${base}^{${exp}}`
    }
    const _d = x => new Decimalx(x);

    const addGraph = () => {
        const ftermLatex = `f(x) = ${cvalue}\\cdot ${avalue}^x`;
        const calc = appendGraphingCalculator(o);
        calc.setExpression({ latex: ftermLatex });
        const points = [
            { x: x0, y: y0 },
            { x: x1, y: y1 },
            { x: xval, y: yval }
        ]
        points.forEach(({ x, y }) => {
            calc.setExpression({ latex: `(${x}, ${y})`, showLabel: true });
        })
        return calc;
    }

    o.style.fontSize = "18pt";
    try {
        _l(`y = C\\cdot a^x`);
        _l(`${y0} = C \\cdot a^{${x0}}`, `plugin first point:`);
        var C;
        var solveForCText = null;
        if (x0 == 0) {
            C = y0;
            _bl(`C = ${C}`, solveForCText);
        } else {
            solveForCText = 'solve for C:';
            C = `\\frac{${y0}}{${_lpow('a', x0)}}`
            _l(`C = ${C}`, solveForCText);
        }
        _l(`${y1} = C \\cdot a^{${x1}}`, `plugin second point:`);
        var z = _d(x1).sub(_d(x0));
        const str = z < 0 ? `= \\frac{${y0}}{${_lpow('a', z.abs())}}` : '';
        _l(`${y1} = ${C}\\cdot ${_lpow('a', x1)} = ${y0}\\cdot ${_lpow('a', z)} ${str}`);
        if (z > 0) {
            let b = _d(y1).div(_d(y0));
            _l(`${_lpow('a', z)} = \\frac{${y1}}{${y0}} = ${b}`, 'solve for a:');
            avalue = b.pow(_d(1).div(z));
            if (z != 1) {
                _l(`a = \\sqrt[${z}]{${b}}`);
            }
        } else {
            z = z.abs();
            let b = _d(y0).div(_d(y1));
            _l(`${_lpow('a', z)} = \\frac{${y0}}{${y1}} = ${b}`, 'solve for a:');
            avalue = b.pow(_d(1).div(z));
            if (z != 1) {
                _l(`a = \\sqrt[${z}]{${b}}`);
            }
        }
        _bl(`a = ${avalue}`);
        cvalue = _d(y0).div(avalue.pow(x0));
        if (x0 != 0) {
            _l(`C = \\frac{${y0}}{${_lpow(avalue, x0)}}`, 'plugin a into formula for C above:')
            _bl(`C = ${cvalue}`)
        }
        _htmlElement('div', o, 'Function definition:');
        _bl(`f(x) = ${cvalue}\\cdot ${avalue}^x`);
        yval = cvalue.mul(avalue.pow(_d(xval)));
        const zwerg = xval < 0 ? `\\frac{${cvalue}}{${avalue.pow(_d(xval).abs())}}` : `${cvalue}\\cdot ${avalue.pow(_d(xval))}`
        _l(`f(${xval}) = ${cvalue}\\cdot ${avalue}^{${xval}} = ${zwerg} = ${yval}`, `determine f(${xval}):`);

        addGraph();
        _htmlElement('h3',o, 'More info:');
        exponentialFunctionTransformationsFromParameters.call(o, cvalue.toNumber(), 1, 0, 0, avalue.toNumber());

    } catch (err) {
        _addErrorElement(o, err);
    }

}