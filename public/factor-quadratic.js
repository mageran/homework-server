
function factorQuadraticEquation(inp_a, inp_b, inp_c, formulaLatex = "") {
    const outputElem = this;
    var coeffs = _getCoefficentsFromInput(outputElem, inp_a, inp_b, inp_c, formulaLatex);
    if (!coeffs) {
        return;
    }

    const fdiv = document.createElement('p');
    outputElem.appendChild(fdiv);
    addMathResult(fdiv, ({ mathField, textDiv }) => {
        textDiv.innerHTML = 'Term to be factored: '
        const latex = createPolynomialOptionalPrefix('x', false, ...coeffs);
        mathField.latex(latex);
    })
    const [a, b, c] = coeffs;
    const ac = a * c;
    const fpair = findFactorPair(ac, (f0, f1) => f0 + f1 === b);
    if (!fpair) {
        _addErrorElement(outputElem, 'cannot factor this equation');
        return;
    }
    const [f0, f1] = fpair;
    const a1 = gcd(a, f0);
    const b1 = a / a1;
    const b0 = f0 / a1;
    const a0 = f1 / b1;
    const table = document.createElement('table');
    table.setAttribute("cellspacing", "20px");
    outputElem.appendChild(table);
    const tr = document.createElement('tr');
    table.appendChild(tr);
    var td = document.createElement('td');
    td.setAttribute("valign", "middle");
    tr.appendChild(td);
    const fcross = new FactoringCanvas(100, 100);
    fcross.addCrossElement(td);
    fcross.setCrossTopNumber(ac);
    fcross.setCrossBottomNumber(b);
    fcross.setCrossLeftNumber(f0);
    fcross.setCrossRightNumber(f1);
    td = document.createElement('td');
    td.setAttribute("valign", "middle");
    tr.appendChild(td);
    const fbox = new FactorBox();
    fbox.addUI(td);
    fbox.addMathFieldAtCell(1, 1, ({ mathField }) => {
        const latex = createPolynomialOptionalPrefix('x', false, a, 0, 0);
        mathField.latex(latex);
    });
    fbox.addMathFieldAtCell(2, 2, ({ mathField }) => {
        mathField.latex(String(c));
    });
    fbox.addMathFieldAtCell(1, 2, ({ mathField }) => {
        const latex = createPolynomialOptionalPrefix('x', false, f0, 0);
        mathField.latex(latex);
    });
    fbox.addMathFieldAtCell(2, 1, ({ mathField }) => {
        const latex = createPolynomialOptionalPrefix('x', false, f1, 0);
        mathField.latex(latex);
    });
    fbox.addMathFieldAtCell(1, 0, ({ mathField }) => {
        const latex = createPolynomialOptionalPrefix('x', false, a1, 0);
        mathField.latex(latex);
    });
    fbox.addMathFieldAtCell(0, 1, ({ mathField }) => {
        const latex = createPolynomialOptionalPrefix('x', false, b1, 0);
        mathField.latex(latex);
    });
    fbox.addMathFieldAtCell(0, 2, ({ mathField }) => {
        const latex = createPolynomialOptionalPrefix('x', false, b0);
        mathField.latex(latex);
    });
    fbox.addMathFieldAtCell(2, 0, ({ mathField }) => {
        const latex = createPolynomialOptionalPrefix('x', false, a0);
        mathField.latex(latex);
    });
    addMathResult(outputElem, ({ mathField, textDiv }) => {
        textDiv.innerHTML = 'Term in factored form:';
        const t0 = createPolynomialOptionalPrefix('x', false, a1, a0);
        const t1 = createPolynomialOptionalPrefix('x', false, b1, b0);
        const latex = `(${t0})(${t1})`;
        mathField.latex(latex);
    });
    const x1 = new Fraction(-a0, a1);
    const x2 = new Fraction(-b0, b1);
    const pp = document.createElement('p');
    outputElem.appendChild(pp);
    addMathResult(pp, ({ mathField, textDiv }) => {
        textDiv.innerHTML = 'Zeros:';
        const latex = `x_1 = ${x1.toLatex(true)}`;
        mathField.latex(latex);
    });
    addMathResult(pp, ({ mathField, textDiv }) => {
        const latex = `x_2 = ${x2.toLatex(true)}`;
        mathField.latex(latex);
    }, { notext: true });
}

/**
 * tries to read polynomial term from the given input fields
 * @param {} outputElem 
 * @param {*} a 
 * @param {*} b 
 * @param {*} c 
 * @param {*} formulaLatex 
 */
const _getCoefficentsFromInput = (outputElem, a, b, c, formulaLatex) => {
    var coeffs = [a, b, c];
    // for testing: if all number are 0 create a random equation
    // that can be factored
    var coeffsFound = false;
    if (coeffs.every(n => n === 0)) {
        // try to read the formula
        if (formulaLatex.trim().length > 0) {
            console.log('trying to parse formula into quadratic polynomial...');
            try {
                formulaLatex = formulaLatex.replace(/\\ /g, ' ');
                console.log(`formulaLatex: ${formulaLatex}`);
                const ast = latexFormulaParser.parse(formulaLatex);
                console.log(`ast: ${JSON.stringify(ast, null, 2)}`);
                const term = simplifyFormula(ast, 0, logStepFun);
                console.log(`simplified: ${JSON.stringify(term, null, 2)}`);
                const { pterms, otherOperands } = _extractPolynomialTerms(term);
                console.log(pterms);
                console.log(otherOperands);
                return null;
            } catch (e) {
                _addErrorElement(outputElem, `*** error while trying to parse formula: ${e}`);
                throw e;
                return null;
            }
        }
    } else {
        coeffsFound = true;
    }

    if (!coeffsFound) {
        const rinfo = _findRandom();
        coeffs = rinfo.coeffs;
        nums = rinfo.nums;
        addMathResult(outputElem, ({ mathField, textDiv }) => {
            textDiv.innerHTML = 'Random factored term:';
            const term0 = createPolynomialOptionalPrefix('x', false, nums[0], nums[1]);
            const term1 = createPolynomialOptionalPrefix('x', false, nums[2], nums[3]);
            mathField.latex(`(${term0})(${term1})`);
        });
        outputElem.appendChild(document.createElement('p'));
        coeffsFound = true;
    }
    if (!coeffsFound) {
        return null;
    }
    return coeffs;
}

const _rnd = (maxValue = 6) => {
    const sign = Math.random() >= 0.5 ? 1 : -1;
    const value = Math.trunc(Math.random() * maxValue) + 1;
    return sign * value;
}


const _findRandom = () => {
    const nums = Array(4).fill(0).map(() => _rnd());
    console.log(nums);
    const a = nums[0] * nums[2];
    const b = nums[0] * nums[3] + nums[1] * nums[2];
    const c = nums[1] * nums[3];
    const coeffs = [a, b, c];
    return { coeffs, nums };
}

// --------------------------------------------------------------
class FactoringCanvas {

    constructor(width = 300, height = 300, textSize = 24) {
        this.width = width;
        this.height = height;
        this.textSize = textSize;
    }

    addCrossElement(container) {
        const { width, height, textSize } = this;
        const c = document.createElement('canvas');
        c.setAttribute('width', width + 'px');
        c.setAttribute('height', height + 'px');
        c.className = 'factoring-cross-canvas';
        container.appendChild(c);
        const ctx = c.getContext('2d');
        this.ctx = ctx;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(width, height);
        ctx.moveTo(width, 0);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.stroke();
        ctx.font = `${this.textSize}px Franklin Gothic Medium`;
    }

    _setCrossNumber(n, position) {
        const { ctx, width, height, textSize } = this;
        var x, y, ta, tb;
        switch (position) {
            case 'top':
                ta = 'center';
                tb = 'top';
                x = width / 2;
                y = 0;
                break;
            case 'bottom':
                ta = 'center';
                tb = 'bottom';
                x = width / 2;
                y = height;
                break;
            case 'left':
                ta = 'left';
                tb = 'middle';
                x = 0;
                y = height / 2;
                break;
            case 'right':
                ta = 'right';
                tb = 'middle';
                x = width;
                y = height / 2;
        }
        ctx.textAlign = ta;
        ctx.textBaseline = tb;
        ctx.fillText(n, x, y);
        //this._drawX(x, y);
    }

    _drawX(x, y, color = 'red') {
        const { ctx } = this;
        const d = 3;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - d, y - d);
        ctx.lineTo(x + d, y + d);
        ctx.moveTo(x - d, y + d);
        ctx.lineTo(x + d, y - d);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    setCrossTopNumber(n) {
        this._setCrossNumber(n, 'top');
    }

    setCrossBottomNumber(n) {
        this._setCrossNumber(n, 'bottom');
    }

    setCrossLeftNumber(n) {
        this._setCrossNumber(n, 'left');
    }

    setCrossRightNumber(n) {
        this._setCrossNumber(n, 'right');
    }

}


class FactorBox {

    constructor() {

    }

    addUI(container) {
        const div = document.createElement('div');
        container.appendChild(div);
        this.div = div;
        div.innerHTML = `
        <table class="factor-box">
        <tr><td></td><td id="top-row-left"></td><td id="top-row-right"></td></tr>
        <tr><td id="outer-left-top"</td><td></td><td id="inner-top-right"></td></tr>
        <tr><td id="outer-left=bottom"></td><td id="inner-bottom-left"></td><td id="inner-bottom-right"></td></tr>
        </table>
        `;
    }

    addMathFieldAtCell(row, col, callback) {
        const cell = this._getCellAt(row, col);
        addMathResult(cell, callback, { notext: true });
    }

    _getCellAt(row, col) {
        const { div } = this;
        //console.log(div);
        const table = div.children.item(0);
        const tbody = table.children.item(0);
        const tr = tbody.children.item(row);
        const td = tr.children.item(col);
        return td;
    }

}

const logStepFun = (title, formula, previousFormula) => {
    const latexString0 = printFormula(previousFormula, { latex: true });
    const latexString1 = previousFormula ? `\\Rightarrow ${printFormula(formula, { latex:true })}` : '';
    const latexString = `${latexString0}`;
    console.log(latexString);
}