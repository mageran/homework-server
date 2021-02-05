

function abcFormula(a, b, c) {
    const outputElem = this;
    var div;
    div = document.createElement('div'); outputElem.appendChild(div);
    appendAbcFormula(div, 'a', 'b', 'c', 'abc formula');
    div = document.createElement('div'); outputElem.appendChild(div);
    appendAbcFormula(div, a, b, c, "with values")
    div = document.createElement('div'); outputElem.appendChild(div);
    const t1 = -b;
    const rt1 = Math.pow(b, 2);
    const rt2 = 4 * a * c;
    const denom = 2 * a;
    addMathResult(div, ({ mathField }) => {
        const pth = t => t < 0 ? `(${t})` : t;
        const latex = `x_{1,2} = \\frac{${t1}\\pm\\sqrt{${rt1} - ${pth(rt2)}}}{${denom}}`;
        mathField.latex(latex);
    }, { notext: true })
    var rt = rt1 - rt2;
    div = document.createElement('div'); outputElem.appendChild(div);
    addMathResult(div, ({ mathField }) => {
        const latex = `x_{1,2} = \\frac{${t1}\\pm\\sqrt{${rt}}}{${denom}}`;
        mathField.latex(latex);
    }, { notext: true });
    var isIrrational = false;
    if (rt < 0) {
        const msg = `no rational solution, term under square root is negative`;
        _addErrorElement(outputElem, msg);
        //return;
        isIrrational = true;
        rt = Math.abs(rt);
        console.log('solution is irrational')
    }
    const irf = isIrrational ? '{i}\\cdot' : '';
    if (isIrrational) {
        div = document.createElement('div'); outputElem.appendChild(div);
        addMathResult(div, ({ mathField }) => {
            const latex = `x_{1,2} = \\frac{${t1}\\pm ${irf} \\sqrt{${rt}}}{${denom}}`;
            mathField.latex(latex);
        }, { notext: true });
    }
    if (_isSquareNumber(rt) && !isIrrational) {
        const t2 = Math.sqrt(rt);
        div = document.createElement('div'); outputElem.appendChild(div);
        addMathResult(div, ({ mathField }) => {
            const latex = `x_{1,2} = \\frac{${t1}\\pm${t2}}{${denom}}`;
            mathField.latex(latex);
        }, { notext: true });
        const x1 = new Fraction(t1 + t2, denom);
        const x2 = new Fraction(t1 - t2, denom);
        div = document.createElement('div'); outputElem.appendChild(div);
        addMathResult(div, ({ mathField }) => {
            const latex = `x_1 = \\frac{${t1}+${t2}}{${denom}} = ${x1.toLatex()}`;
            mathField.latex(latex);
        }, { notext: true })
        div = document.createElement('div'); outputElem.appendChild(div);
        addMathResult(div, ({ mathField }) => {
            const latex = `x_2 = \\frac{${t1}-${t2}}{${denom}} = ${x2.toLatex()}`;
            mathField.latex(latex);
        }, { notext: true })
        div = document.createElement('div'); outputElem.appendChild(div);
        addMathResult(div, ({ mathField, textDiv }) => {
            textDiv.innerHTML = "Quadratic term in factored form";
            const _asFactor = t => {
                if (t === 0) {
                    return 'x';
                }
                const opsym = Math.sign(t) > 0 ? '-' : '+';
                return `(x ${opsym} ${printFormula(_absNumeric(t), { latex: true, keepNumerator: true })})`;
            }
            const latex = `${_asFactor(x1)}${_asFactor(x2)}`;
            mathField.latex(latex);
        })
    } else {
        const _simplifySqrt = sqrtTerm => sqrtTerm === 1 ? '1' : `\\sqrt{${sqrtTerm}}`;
        // try to extract a square number from the number under the square root:
        const [factor, sqrtTerm] = _simplyfySquareRoot(rt);
        const irf = isIrrational ? '{i}\\cdot' : '';
        console.log(`simplify sqrt ${rt}: factor=${factor}, sqrtTerm=${sqrtTerm} irf=${irf}`);
        if (factor !== 1) {
            div = document.createElement('div'); outputElem.appendChild(div);
            addMathResult(div, ({ mathField }) => {
                const latex = `x_{1,2} = \\frac{${t1}\\pm${factor}\\cdot ${irf} ${_simplifySqrt(sqrtTerm)}}{${denom}}`;
                mathField.latex(latex);
            }, { notext: true });
        }
        const gcf0 = gcf(t1, factor, denom);
        if (gcf0 !== 1) {
            div = document.createElement('div'); outputElem.appendChild(div);
            addMathResult(div, ({ mathField }) => {
                const t1x = t1 / gcf0;
                const factorx = factor / gcf0;
                const denomx = denom / gcf0;
                const fstring = factorx !== 1 ? `${factorx}\\cdot` : '';
                const latex = `x_{1,2} = \\frac{${t1x}\\pm${fstring}${irf}${_simplifySqrt(sqrtTerm)}}{${denomx}}`;
                mathField.latex(latex);
            }, { notext: true });
        }
    }
}

function pqFormula(p, q) {
    const outputElem = this;
    var div;
    div = document.createElement('div');
    outputElem.appendChild(div);
    //appendAbcFormula(div, a, b, c);
}

const appendAbcFormula = (div, a, b, c, text = null) => {
    const notext = !text;
    const isNumeric = [a, b, c].every(_isNumeric);
    const times = isNumeric ? '\\cdot' : '';
    const pth = term => isNumeric ? `(${term})` : term;
    const latex = `x_{1,2} = \\frac{-${pth(b)}\\pm\\sqrt{${pth(b)}^2-4${times}${pth(a)}${times}${pth(c)}}}{2${times}${pth(a)}}`;
    addMathResult(div, ({ mathField, textDiv }) => {
        if (text) {
            textDiv.innerHTML = text;
        }
        mathField.latex(latex);
    }, { notext })
}

function standardFormToVertexForm(a, b, c) {
    const outputElem = this;
    const f = x => a * x * x + b * x + c;
    addLatexElement(outputElem, `f(x) = ax^2 + bx + c`);
    const flatex = `f(x) = (${a})x^2 + (${b})x + (${c})`
    addLatexElement(outputElem, flatex);
    const h = -b / (2 * a);
    const k = f(h);
    addLatexElement(outputElem, `h = -\\frac{b}{2a} = -\\frac{${b}}{2\\cdot${a}} = ${h}`);
    addLatexElement(outputElem, `k = f(h) = f(${h}) = ${f(h)}`);
    addLatexElement(outputElem, `f(x) = ${a} * ( x - (${h}))^2 + (${k})`, "Vertex form");
    const maxMin = a > 0 ? "minimum" : "maximum";
    addLatexElement(outputElem, `(${h}, ${k})`, maxMin);
    addLatexElement(outputElem, `(0, ${f(0)})`, "y-intercept");
    const hd = document.createElement('h3');
    hd.innerHTML = "x-intercepts:";
    outputElem.appendChild(hd);
    abcFormula.call(outputElem, a, b, c);
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = "800px";
    div.style.top = "50px"
    outputElem.appendChild(div);
    const calc = appendGraphingCalculator(div);
    calc.setExpression( { latex: flatex });
    calc.setExpression( { latex: `(${h}, ${k})`, label: `(${h}, ${k})`, showLabel: true } );
}

function fenceMaxArea(fenceLength) {
    const outputElem = this;
    const x = fenceLength/4;
    const y = x;
    const maxArea = Math.pow(fenceLength, 2)/16;
    addLatexElement(outputElem, `max area = ${maxArea}`);
    addLatexElement(outputElem, `width = length = ${x}`);
}