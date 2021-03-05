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
        _htmlElement('div', outputElem, 'Interest:');
        const interest = Avalue.sub(_d(P));
        addLatexElement(outputElem, `A - P = ${interest} = ${interest.toFixed(2)}`);
    }
    const _solveForP = () => {
        addLatexElement(outputElem, `A = P(1+\\frac{r}{n})^{n\\cdot t}`);
        addLatexElement(outputElem, `${A} = P(1 + \\frac{${r}}{${n}})^{${n}\\cdot ${t}}`, 'insert values');        const rn = (_d(r)).div(_d(n));
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
        const { years, months } = yearDecimalToYearsAndMonths(tvalue);
        _htmlElement('div', outputElem, `${years} years, ${months} months`);
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
        ){
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
    outputElem.style.fontSize = "18pt";
    const _d = x => new Decimalx(x);
    const e = _d(Math.E);
    const _solveForA = () => {
        _htmlElement('div', outputElem, 'Solving for A:');
        addLatexElement(outputElem, `A = Pe^{r\\cdot t}`);
        const x = _d(r).mul(t);
        addLatexElement(outputElem, `A = ${P}\\cdot e^{${x}}`);
        const avalue = _d(P).mul(e.pow(x));
        addLatexElement(outputElem, `A = ${avalue} = ${avalue.toFixed(2)}`);
    }
    const _solveForP = () => {
        addLatexElement(outputElem, `A = Pe^{r\\cdot t}`);
        const x = _d(r).mul(t);
        addLatexElement(outputElem, `${A} = P\\cdot e^{${x}}`);
        addLatexElement(outputElem, `P = \\frac{${A}}{e^{${x}}}`);
        const ex = e.pow(x);
        addLatexElement(outputElem, `P = \\frac{${A}}{${ex}}`);
        const pvalue = _d(A).div(ex);
        addLatexElement(outputElem, `P = ${pvalue} = ${pvalue.toFixed(2)}`);
    }
    const _solveForT = () => {
        addLatexElement(outputElem, `A = Pe^{r\\cdot t}`);
        addLatexElement(outputElem, `\\frac{A}{P} = e^{r\\cdot t}`, 'divide by P');
        const x = _d(A).div(_d(P));
        addLatexElement(outputElem, `${x.toFixed(5)} = e^{${r}\\cdot t}`, 'plugin values');
        addLatexElement(outputElem, `\\ln ${x.toFixed(5)} = ${r}\\cdot t`, ' ln on both sides');
        const tvalue = x.ln().div(_d(r));
        addLatexElement(outputElem, `t = ${tvalue.toFixed(2)}`);
        const { years, months } = yearDecimalToYearsAndMonths(tvalue);
        _htmlElement('div', outputElem, `${years} years, ${months} months`);
    }
    const _solveForR = () => {
        addLatexElement(outputElem, `A = Pe^{r\\cdot t}`);
        addLatexElement(outputElem, `\\frac{A}{P} = e^{r\\cdot t}`, 'divide by P');
        const x = _d(A).div(_d(P));
        addLatexElement(outputElem, `${x.toFixed(5)} = e^{r\\cdot ${t}}`, 'plugin values');
        addLatexElement(outputElem, `\\ln ${x.toFixed(5)} = r\\cdot ${t}`, ' ln on both sides');
        const rvalue = x.ln().div(_d(t));
        addLatexElement(outputElem, `r = ${rvalue.toFixed(5)} = ${rvalue.mul(100).toFixed(2)}%`);
    }
    try {
        if (
            (!A) 
          && (typeof P === 'number')
          && (typeof r === 'number')
          && (typeof t === 'number')
        ){
            _solveForA();
        }
        else if (
            (!P)
          && (typeof A === 'number')
          && (typeof r === 'number')
          && (typeof t === 'number')
        ) {
            _solveForP();
        }
        else if (
            (!t)
          && (typeof A === 'number')
          && (typeof r === 'number')
          && (typeof P === 'number')
        ) {
            _solveForT();
        }
        else if (
            (!r)
          && (typeof A === 'number')
          && (typeof t === 'number')
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

const yearDecimalToYearsAndMonths = t0 => {
    const t = t0.mul(100).round().div(100);
    const years = t.floor();
    const months = t.sub(years).mul(12).floor();
    return { years, months };
}