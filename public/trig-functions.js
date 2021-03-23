function trigFunctions(x0, y0, r0, signOfMissing) {
    const outputElem = this;
    //const signOfMissing = 1;
    //outputElem.innerHTML = `x=${x}, y=${y}, r=${r}`;
    try {
        const [x, y, r] = _mayUsePythagoras(outputElem, signOfMissing, x0, y0, r0);
        const _addTrig = (fname, formulaLatex, expr) => {
            const l1 = numericToLatex(expr);
            const l2 = numericToLatex(expr.simplify());
            const noChange = l1 === l2;
            const cstr = noChange ? '' : ` = ${l2}`;
            addLatexElement(outputElem, `${fname}\\theta = ${formulaLatex} = ${l1}${cstr}`);
        }
        _addTrig('cos', '\\frac{x}{r}', fraction(x, r));
        _addTrig('sec', '\\frac{r}{x}', fraction(r, x));
        _addTrig('sin', '\\frac{y}{r}', fraction(y, r));
        _addTrig('csc', '\\frac{r}{y}', fraction(r, y));
        _addTrig('tan', '\\frac{y}{x}', fraction(y, x));
        _addTrig('cot', '\\frac{x}{y}', fraction(x, y));
    } catch (e) {
        _addErrorElement(outputElem, e);
    }
}

const _mayUsePythagoras = (outputElem, signOfMissing, ...params) => {
    const sqrtRe = new RegExp('^sqrt\\(([0-9]+)\\)$');
    params = params.map(p => {
        if (typeof p === 'undefined') {
            return p;
        }
        if (p instanceof Numeric) {
            console.log(`${p} is a Numeric`);

            return p;
        }
        const m = String(p).match(sqrtRe);
        if (m) {
            const num = Number(m[1]);
            console.log(`found sqrt input with radicand ${num}`);
            return sqrt(num);
        }
        const pnum = Number(p);
        if (isNaN(pnum)) {
            throw `${p} is not a number`;
        }
        return pnum;
    });
    var missing = params.map(p => (typeof p) === 'undefined');
    //console.log(`missing: ${missing}`);
    if (missing.every(isMissing => !isMissing)) {
        return params;
    }
    const mcnt = missing.reduce((cnt, isMissing) => isMissing ? cnt + 1 : cnt, 0);
    console.log(`missing count: ${mcnt}`);
    if (mcnt > 1) {
        const msg = `you have to specify at least two of x, y, and r`;
        throw msg;
    }
    const xIsMissing = missing[0];
    const yIsMissing = missing[1];
    const rIsMissing = missing[2];
    const [x, y, r] = params;
    addLatexElement(outputElem, 'x^2 + y^2 = r^2');
    if (xIsMissing) {
        addLatexElement(outputElem, `x^2 + (${numericToLatex(y)})^2 = (${numericToLatex(r)})^2`)
        const y2 = powerNumeric(y, 2);
        const r2 = powerNumeric(r, 2);
        addLatexElement(outputElem, `x^2 + ${y2} = ${r2}`);
        const rhs = r2 - y2;
        addLatexElement(outputElem, `x^2 = ${rhs}`);
        const sq = sqrt(rhs, signOfMissing).simplify();
        addLatexElement(outputElem, `x = ${numericToLatex(sq)}`);
        return [sq, y, r];
    }
    else if (yIsMissing) {
        addLatexElement(outputElem, `(${numericToLatex(x)})^2 + y^2 = (${numericToLatex(r)})^2`)
        const x2 = powerNumeric(x, 2);
        const r2 = powerNumeric(r, 2);
        addLatexElement(outputElem, `${numericToLatex(x2)} + y^2 = ${numericToLatex(r2)}`);
        const rhs = r2 - x2;
        addLatexElement(outputElem, `y^2 = ${numericToLatex(rhs)}`);
        const sq = sqrt(rhs, signOfMissing).simplify();
        addLatexElement(outputElem, `y = ${numericToLatex(sq)}`);
        return [x, sq, r];
    }
    else if (rIsMissing) {
        addLatexElement(outputElem, `(${numericToLatex(x)})^2 + (${numericToLatex(y)})^2 = r^2`)
        const x2 = powerNumeric(x, 2);
        const y2 = powerNumeric(y, 2);
        addLatexElement(outputElem, `${numericToLatex(x2)} + ${numericToLatex(y2)} = r^2`);
        const rhs = x2 + y2;
        addLatexElement(outputElem, `r^2 = ${numericToLatex(rhs)}`);
        const sq = sqrt(rhs).simplify();
        addLatexElement(outputElem, `r = ${numericToLatex(sq)}`);
        return [x, y, sq];

    }
    return params;
}

function sinusodialTransformations(formulaLatex) {
    const outputElem = this;
    var formula;
    try {
        console.log(`formula: ${formulaLatex}`);
        formulaLatex = formulaLatex
            .replace(/\\ /g, ' ')
            .replace(/\\left/g, '')
            .replace(/\\right/g, '');
        console.log(`formula: ${formulaLatex}`);
        const ast = latexFormulaParser.parse(formulaLatex, { createFactionObjects: true });
        console.log(`parsed: ${JSON.stringify(ast, null, 2)}`);
        //formula = simplifyFormula(ast, 0, logStepFun);
        //console.log(`simplified: ${JSON.stringify(formula, null, 2)}`);
        //console.log('starting analysis...');
        //analyzeFunctionTermForTransformations(outputElem, formula);
        const parameters = parseSinusodialEquation(ast);
        parameters.P = Fop2Pi.divideBy(parameters.B);
        parameters.P_isComputed = true;
        populateSinusodialTransformationsFromParameters(outputElem, parameters, formulaLatex);
        /*
        const equationLatex = getEquation(parameters);
        addLatexElement(outputElem, equationLatex, 'Computed Equation:');
        _addSinusodialParameters(outputElem, parameters);
        const keypointsMap = calculateTransformedKeypoints(parameters);
        const calc = _addSinusodialGraph(outputElem, formulaLatex, parameters, keypointsMap);
        _addTChart(outputElem, parameters, keypointsMap);
        */
    } catch (e) {
        _addErrorElement(outputElem, `*** ${e}`);
        //throw e;
        return null;
    }
}

const parseFactorOfPi = latex => {
    const ast = parseLatexFormula(latex);
    return numberOrFactorOfPi(ast);
}

function sinusodialTransformationsFromParameters(A_latex, B_latex, P_latex, h_latex, k_latex, trigFunctionIndicator) {
    const outputElem = this;
    try {
        assert(A_latex.length > 0, 'input for field "A" is missing');
        const A = parseFactorOfPi(A_latex);
        assert(h_latex.length > 0, 'input for field "h" is missing');
        const h = parseFactorOfPi(h_latex);
        assert(k_latex.length > 0, 'input for field "k" is missing');
        const k = parseFactorOfPi(k_latex);
        if (B_latex.length > 0 && P_latex.length > 0) {
            throw 'please specify only B or P, not both';
        }
        if (B_latex.length === 0 && P_latex.length === 0) {
            throw 'please specify either B or P';
        }
        var B;
        var P;
        var P_isComputed;
        if (B_latex.length > 0) {
            B = parseFactorOfPi(B_latex);
            P = Fop2Pi.divideBy(B);
            P_isComputed = true;
        } else {
            P = parseFactorOfPi(P_latex);
            B = Fop2Pi.divideBy(P);
            P_isComputed = false;
        }
        const trigFunction = trigFunctionIndicator === 0 ? 'sin' : 'cos';
        populateSinusodialTransformationsFromParameters(outputElem, { A, B, h, k, P, P_isComputed, trigFunction });
    } catch (e) {
        _addErrorElement(outputElem, `*** ${e}`);
    }
}

const populateSinusodialTransformationsFromParameters = (outputElem, parameters, inputEquation) => {
    const equationLatex = getEquation(parameters);
    const equationLatexFx = getEquation(parameters, 'f(x)');
    addLatexElement(outputElem, equationLatex, 'Computed Equation:');
    _addSinusodialParameters(outputElem, parameters);
    const keypointsMap = calculateTransformedKeypoints(parameters);
    const formulaLatex = inputEquation ? inputEquation : equationLatex;
    const equationFx = inputEquation ? null : equationLatexFx;
    const calc = _addSinusodialGraph(outputElem, formulaLatex, parameters, keypointsMap, equationFx);
    _addTChart(outputElem, parameters, keypointsMap);
}

function sinusodialTransformationsFromMaxMin(maxx_latex, maxy_latex, minx_latex, miny_latex, trigFunctionCode) {
    const outputElem = this;
    const trigFunctions = ['sin', 'cos', '-sin', '-cos'];
    const trigFunction0 = trigFunctions[trigFunctionCode];
    try {
        const coords_latex = [maxx_latex, maxy_latex, minx_latex, miny_latex];
        const coords = coords_latex.map(latex => {
            assert(latex.length > 0, "please fill out all fields");
            const fop = parseFactorOfPi(latex);
            return fop;
        });
        const [maxx, maxy, minx, miny] = coords;
        assert(!maxy.isFactorOfPi && !miny.isFactorOfPi, "factors of PI not supported for y coordinates");
        assert(maxy.greaterThan(miny), "you seem to have max and min swapped.");
        addLatexElement(outputElem, `(${maxx.toLatex()},${maxy.toLatex()})`, "Max point");
        addLatexElement(outputElem, `(${minx.toLatex()},${miny.toLatex()})`, "Min point");
        const k = maxy.add(miny).divideBy(Fop2);
        addLatexElement(outputElem, `y = ${k.toLatex()} = ${k.decimalValue()}`, "Midline");
        const amplitude = maxy.subtract(miny).divideBy(Fop2);
        addLatexElement(outputElem, `${amplitude.toLatex()} = ${amplitude.decimalValue()}`, "Amplitude");
        const P = maxx.subtract(minx).absoluteValue().multiplyWith(Fop2);
        addLatexElement(outputElem, `P = ${P.toLatex()} = ${P.decimalValue()}`, "Period");
        var h;
        var A = amplitude;
        var trigFunction = trigFunction0;
        const P4 = P.divideBy(Fop4);
        switch (trigFunction0) {
            case 'cos':
                h = maxx;
                break;
            case 'sin':
                h = maxx.subtract(P4);
                break;
            case '-cos':
                h = minx;
                A = amplitude.negate();
                trigFunction = 'cos';
                break;
            case '-sin':
                h = maxx.add(P4);
                A = amplitude.negate();
                trigFunction = 'sin';
                break;
        }
        B = Fop2Pi.divideBy(P);
        P_isComputed = false;
        populateSinusodialTransformationsFromParameters(outputElem, { A, B, h, k, P, P_isComputed, trigFunction });
    } catch (e) {
        _addErrorElement(outputElem, `*** ${e}`);
    }
}

const getEquation = (params, lhs = "y") => {
    const { trigFunction, A, B, h, k, P } = params;
    var latex = `${lhs} =`;
    if (A.isNegative()) latex += "-";
    if (!A.absoluteValue().equals(Fop1)) latex += A.absoluteValue().toLatex();
    latex += "\\" + trigFunction + '(';
    if (B < 0) latex += '-';
    if (!B.absoluteValue().equals(Fop1)) latex += B.absoluteValue().toLatex();
    if (!h.equals(Fop0) || !B.equals(Fop1)) latex += '(';
    latex += 'x';
    if (!h.equals(Fop0)) {
        latex += h.isNegative() ? '+' : '-';
        latex += h.absoluteValue().toLatex();
    }
    if (!h.equals(Fop0) || !B.equals(Fop1)) latex += ')';
    latex += ')';
    if (!k.equals(Fop0)) {
        latex += k.isNegative() ? '-' : '+';
        latex += k.absoluteValue().toLatex();
    }
    return latex;
}

const calculateTransformedKeypoints = params => {
    const { trigFunction, A, B, h, k, P } = params;
    const keypoints = TrigKeyPoints[trigFunction];
    if (keypoints.length !== 5) {
        throw `list of keypoints is invalid`;
    }
    return keypoints.map(kp => {
        const { x, y } = kp;
        const xval = x.divideBy(B).add(h);
        const yval = y.multiplyWith(A).add(k);
        const keypoint = kp;
        const transformedKeypoint = { x: xval, y: yval };
        return { keypoint, transformedKeypoint };
    })

}

const _addSinusodialParameters = (outputElem, params) => {
    const { trigFunction, A, B, h, k, P, P_isComputed } = params;
    assert(A instanceof FactorOfPi, "A is not an instance of class FactorOfPi (2)");
    const PComputedString = P_isComputed ? `\\frac{2\\pi}{B} = \\frac{2\\pi}{${B.toLatex()}} = ` : '';
    const BComputedString = !P_isComputed ? `\\frac{2\\pi}{P} = \\frac{2\\pi}{${P.toLatex()}} = ` : '';
    addLatexElement(outputElem, `A = ${A.toLatex()}`);
    addLatexElement(outputElem, `B = ${BComputedString} ${B.toLatex()}`);
    addLatexElement(outputElem, `h = ${h.toLatex()}`, "Phase Shift");
    addLatexElement(outputElem, `k = ${k.toLatex()}`, "Vertical Shift, Midline");
    addLatexElement(outputElem, `P = ${PComputedString} ${P.toLatex()}`);
}

const _addSinusodialGraph = (outputElem, formulaLatex, params, keypointsMap, equationFx) => {
    const { trigFunction, A, B, h, k, P } = params;
    const div = document.createElement('div');
    outputElem.appendChild(div);
    const xAxisStep = P.divideBy(new FactorOfPi(4)).decimalValue();
    const width = "1000px";
    const calc = appendGraphingCalculator(div, { width, xAxisStep });
    //const pterm = createPolynomial('x', ...coefficents);
    const ftermLatex = `${formulaLatex}`;
    calc.setExpression({ latex: ftermLatex, xAxisStep: Math.PI / 4 });
    calc.setExpression({ latex: `y = ${k.decimalValue()}`, lineStyle: "DASHED", showLabel: true });
    keypointsMap.forEach(({ keypoint, transformedKeypoint }) => {
        const tx = transformedKeypoint.x;
        const ty = transformedKeypoint.y;
        const txd = tx.decimalValue();
        const tyd = ty.decimalValue();
        calc.setExpression({ latex: `(${txd}, ${tyd})`, showLabel: true });
    });
    const p2 = P.decimalValue() * 1.6;
    const left = -p2;
    const right = p2;
    const amplitudeAndPadding = A.absoluteValue().decimalValue() * 1.4;
    const top = k.absoluteValue().decimalValue() + amplitudeAndPadding;
    const bottom = k.absoluteValue().decimalValue() - amplitudeAndPadding;
    calc.setMathBounds({ left, right, bottom, top });
    if (equationFx) {
        calc.setExpression({ latex: equationFx, hidden: true });
    }
    return calc;
}

const _addTChart = (outputElem, params, keypointsMap) => {
    const { trigFunction, A, B, h, k, P } = params;
    const hd = document.createElement("h2");
    hd.innerHTML = "T-Chart";
    outputElem.appendChild(hd);
    addLatexElement(outputElem, '(\\frac{x}{B}+h, Ay+k)');
    const table = document.createElement('table');
    table.className = 't-chart-table';
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.innerHTML = "Parent Graph";
    tr.appendChild(td);
    td = document.createElement('td');
    var div = document.createElement('div');
    addLatexElement(div, `\\frac{x}{${B.toLatex()}} + (${h.toLatex()})`);
    td.appendChild(div);
    tr.appendChild(td);
    td = document.createElement('td');
    var div = document.createElement('div');
    addLatexElement(div, `{${A.toLatex()}y + ${k.toLatex()}}`);
    td.appendChild(div);
    tr.appendChild(td);
    table.appendChild(tr);
    keypointsMap.forEach(pmap => {
        const kp = pmap.keypoint;
        const tkp = pmap.transformedKeypoint;
        const { x, y } = kp;
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        addLatexElement(td, `(${x.toLatex()}, ${y.toLatex()})`);
        tr.appendChild(td);
        // transformed x coordinate: x/B + h
        td = document.createElement('td');
        let xOverB = x.divideBy(B);
        let xval = tkp.x;//x.divideBy(B).add(h);
        addLatexElement(td, `${xOverB.toLatex()} + (${h.toLatex()}) = ${xval.toLatex()}`);
        tr.appendChild(td);
        td = document.createElement('td');
        let ATimesy = A.multiplyWith(y);
        let yval = tkp.y;//y.multiplyWith(A).add(k);
        addLatexElement(td, `${ATimesy.toLatex()} + (${k.toLatex()}) = ${yval.toLatex()}`);
        tr.appendChild(td);
        table.appendChild(tr);
    })
    outputElem.appendChild(table);
}

const numberOrFactorOfPi = (term, negated = false) => {
    const N = num => negated ? -num : num;
    if (typeof term === 'number') {
        return new FactorOfPi(N(term));
    }
    if (term === '\\pi') {
        return new FactorOfPi(N(1), true);
    }
    const _parseProduct = prod => {
        const operands = prod.operands;
        if (operands.length !== 2) {
            throw `unsupported numeric term: ${JSON.stringify(term)}`;
        }
        const factor = operands[0];
        const pi = operands[1];
        if (pi !== '\\pi') {
            throw `unsupported numeric term: ${JSON.stringify(term)}`;
        }
        if (typeof factor === 'number') {
            return N(factor);
        }
        if (factor.op === 'fraction' && (typeof factor.numerator === 'number') && (typeof factor.denominator === 'number')) {
            return new Fraction(N(factor.numerator), factor.denominator);
        }
        throw `unsupported numeric term: ${JSON.stringify(term)}`;
    }
    if (term.op === '*') {
        let factor = _parseProduct(term);
        return new FactorOfPi(factor, true);
    }
    if (term.op === 'fraction') {
        if (term.wholeNumber !== null) {
            throw 'mixed fractions are not supported';
        }
        if (typeof term.denominator !== 'number') {
            throw `non-numerical denominator not supported in ${JSON.stringify(term)}`;
        }
        if (typeof term.numerator === 'number') {
            return new FactorOfPi(new Fraction(N(term.numerator), term.denominator));
        }
        if (term.numerator.op === '*') {
            let factor = _parseProduct(term.numerator);
            return new FactorOfPi(new Fraction(factor, term.denominator), true);
        }
        if (term.numerator === '\\pi') {
            return new FactorOfPi(new Fraction(N(1), term.denominator), true);
        }
        if (term.numerator.op === 'uminus' && term.numerator.operands[0] === '\\pi') {
            return new FactorOfPi(new Fraction(N(-1), term.denominator), true);
        }
    }
    if (term.op === 'uminus') {
        return numberOrFactorOfPi(term.operands[0], !negated);
    }
    throw `unsupported numeric term: ${JSON.stringify(term)}`;
}

const parseSinusodialEquation = equation => {
    var trigFunction = null;
    var A = new FactorOfPi(1);
    var B = new FactorOfPi(1);
    var h = new FactorOfPi(0);
    var k = new FactorOfPi(0);
    const _splitProductOperands = operands => {
        if (operands.length <= 2) {
            return operands;
        }
        const newOperands = [...operands];
        const lastFactor = newOperands.splice(newOperands.length - 1, 1);
        return [{ op: '*', operands: newOperands }, lastFactor[0]];
    }
    const determine_k = term => {
        if (term.op === '+' && term.operands.length === 2) {
            const [t0, t1] = term.operands;
            const numObj = numberOrFactorOfPi(t1);
            if (numObj.isFactorOfPi) {
                throw 'factors of PI not supported for "k" (vertical shift)';
            }
            k = numObj;
            return t0;
        }
        else if (term.op === '+' && term.operands.length === 1) {
            const [t0] = term.operands;
            return t0;
        }
        else if (term.op === '+') {
            throw 'unsupported term: too many summands';
        }
        return term;
    }
    const determine_A = term => {
        if (term.op === '*') {
            const [t0, t1] = term.operands;
            const numObj = numberOrFactorOfPi(t0);
            if (numObj.isFactorOfPi) {
                throw 'factors of PI not supported for "A" (amplitude)';
            }
            A = numObj;
            assert(A instanceof FactorOfPi, "A is not an instance of class FactorOfPi");
            return t1;
        }
        return term;
    }
    const determine_B = term => {
        if (term.op === 'uminus') {
            A = new FactorOfPi(-1);
            term = term.operands[0];
        }
        if (!term.isTrigFunction) {
            throw `trig function expected, found ${JSON.stringify(term)}`;
        }
        trigFunction = term.op;
        const [t] = term.operands;
        console.log(`analyzing ${JSON.stringify(t)} to determine B...`);
        if (t.op === '*') {
            const [t0, t1] = _splitProductOperands(t.operands);
            const numObj = numberOrFactorOfPi(t0);
            B = numObj;
            return t1;
        }
        else if (t.op === 'uminus') {
            B = new FactorOfPi(-1);
            return t.operands[0];
        }
        return t;
    }
    const determine_h = term => {
        console.log(`analyzing ${JSON.stringify(term)} to determine h...`);
        if (typeof term === 'string') {
            assert(term === 'x', 'use "x" as variable name on the left-hand-side of the equation');
            return;
        }
        assert(term.op === '+', `unsupported term: operand to determine "h"; must be "+"; found "${term.op}"`);
        assert(term.operands.length === 2, `unsupported term: number of summands to determine "h" must be 2; found ${term.operands.length}`);
        const [t0, t1] = term.operands;
        assert(t0 === 'x', `unsupported term to determine "h", expected "x", found ${JSON.stringify(t0)}`);
        const numObj = numberOrFactorOfPi(t1, true);
        h = numObj;
    }
    try {
        const { op, operands: [lhs, rhs] } = equation;
        assert(op === 'equation', 'formula is not an equation');
        assert(lhs === 'y', 'lhs of equation must be "y"');
        var rterm = rhs;
        rterm = determine_k(rterm);
        rterm = determine_A(rterm);
        rterm = determine_B(rterm);
        determine_h(rterm);
        console.log(`%cA = ${_factorOfPiToLatex(A)}`, 'border: 1px solid black');
        console.log(`%cB = ${_factorOfPiToLatex(B)}`, 'border: 1px solid black');
        console.log(`%ch = ${_factorOfPiToLatex(h)}`, 'border: 1px solid black');
        console.log(`%ck = ${_factorOfPiToLatex(k)}`, 'border: 1px solid black');
        return { trigFunction, A, B, h, k }
    } catch (e) {
        if (e instanceof TypeError) {
            //e = 'formula is not an equation';
        }
        throw e;
    }
}

const _factorOfPiToLatex = ({ numeric, isFactorOfPi }) => {
    const piString = isFactorOfPi ? '\\pi' : '';
    const _numStr = num => {
        if (Math.abs(num) === 1 && isFactorOfPi) {
            let sign = Math.sign(num) < 0 ? '-' : '';
            return `${sign}${piString}`;
        }
        return `${num}${piString}`;
    }
    if (typeof numeric === 'number') {
        return _numStr(numeric);
    }
    if (numeric instanceof Fraction) {
        return `\\frac{${_numStr(numeric.numerator)}{${numeric.denominator}}`;
    }
}


const runSinusodialTransformationTest = (latexFormula, expected) => {
    const _compareFactorOfPi = (fop0, fop1, pname) => {
        const _eq = (n0, n1) => {
            if (typeof n0 === 'number' && typeof n1 === 'number') {
                return n0 === n1;
            }
            if ((n0 instanceof Fraction) && (n1 instanceof Fraction)) {
                return n0.numerator === n1.numerator && n0.denominator === n1.denominator;
            }
            return false;
        }
        assert(_eq(fop0.numeric, fop1.numeric) && fop0.isFactorOfPi === fop1.isFactorOfPi,
            `mismatch for parameter "${pname}": expected ${_factorOfPiToLatex(fop1)}; got ${_factorOfPiToLatex(fop0)}`);
    }
    try {
        const ast = parseLatexFormula(latexFormula);
        const { trigFunction, A, B, h, k } = parseSinusodialEquation(ast);
        assert(trigFunction === expected.trigFunction, `expected trig function "${expected.trigFunction}", found ${trigFunction}`);
        _compareFactorOfPi(A, expected.A, "A");
        _compareFactorOfPi(B, expected.B, "B");
        _compareFactorOfPi(h, expected.h, "h");
        _compareFactorOfPi(k, expected.k, "k");
        console.log(`test for "${latexFormula}" passed.`)
    } catch (e) {
        throw (`test failed for "${latexFormula}": ${e}`);
    }
}



const runSinusodialTransformationTests = () => {
    try {
        runSinusodialTransformationTest("y\\ =\\ \\sin\\ x", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ \\cos\\ x + 4", { trigFunction: "cos", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: 4 } });
        runSinusodialTransformationTest("y\\ =\\ \\sin\\ x - 2", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: -2 } });
        runSinusodialTransformationTest("y=\\sin x-\\frac{4}{5}", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: new Fraction(-4, 5) } });
        runSinusodialTransformationTest("y\\ =\\ -\\sin\\ x", { trigFunction: "sin", A: { numeric: -1 }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ -\\sin(-x)", { trigFunction: "sin", A: { numeric: -1 }, B: { numeric: -1 }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ 4\\sin\\ x", { trigFunction: "sin", A: { numeric: 4 }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ -4\\sin\\ x", { trigFunction: "sin", A: { numeric: -4 }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ \\frac{6}{7}\\sin\\ x", { trigFunction: "sin", A: { numeric: new Fraction(6, 7) }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ \\frac{-6}{7}\\sin\\ x", { trigFunction: "sin", A: { numeric: new Fraction(-6, 7) }, B: { numeric: 1 }, h: { numeric: 0 }, k: { numeric: 0 } });

        runSinusodialTransformationTest("y\\ =\\ \\sin(\\pi x)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1, isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ \\sin(-\\pi x)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: -1, isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });

        runSinusodialTransformationTest("y\\ =\\ \\sin(7\\pi x)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 7, isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y\\ =\\ \\sin(-7\\pi x)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: -7, isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });

        runSinusodialTransformationTest("y=\\sin\\left(\\frac{7}{3}x\\right)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: new Fraction(7, 3) }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin\\left(-\\frac{7}{3}x\\right)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: new Fraction(-7, 3) }, h: { numeric: 0 }, k: { numeric: 0 } });

        runSinusodialTransformationTest("y=\\sin\\left(\\frac{7}{3}\\pi x\\right)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: new Fraction(7, 3), isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin\\left(-\\frac{7}{3}\\pi x\\right)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: new Fraction(-7, 3), isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });

        runSinusodialTransformationTest("y=\\sin\\left(\\frac{7\\pi}{3} x\\right)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: new Fraction(7, 3), isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin\\left(-\\frac{7\\pi}{3} x\\right)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: new Fraction(-7, 3), isFactorOfPi: true }, h: { numeric: 0 }, k: { numeric: 0 } });

        runSinusodialTransformationTest("y=\\sin(x-6)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: 6 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x+6)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: -6 }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x-\\frac{6}{5})", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(6, 5) }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x+\\frac{6}{5})", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(-6, 5) }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x-6\\pi)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: 6, isFactorOfPi: true }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x+6\\pi)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: -6, isFactorOfPi: true }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x-\\pi)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: 1, isFactorOfPi: true }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x+\\pi)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: -1, isFactorOfPi: true }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x-\\frac{6}{5}\\pi)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(6, 5), isFactorOfPi: true }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x+\\frac{6}{5}\\pi)", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(-6, 5), isFactorOfPi: true }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x-\\frac{6\\pi}{5})", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(6, 5), isFactorOfPi: true }, k: { numeric: 0 } });
        runSinusodialTransformationTest("y=\\sin(x+\\frac{6\\pi}{5})", { trigFunction: "sin", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(-6, 5), isFactorOfPi: true }, k: { numeric: 0 } });

        runSinusodialTransformationTest("y=\\cos\\left(x-\\frac{\\pi}{2}\\right)+7", { trigFunction: "cos", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(1, 2), isFactorOfPi: true }, k: { numeric: 7 } });
        runSinusodialTransformationTest("y=\\cos\\left(x+\\frac{\\pi}{2}\\right)+7", { trigFunction: "cos", A: { numeric: 1 }, B: { numeric: 1 }, h: { numeric: new Fraction(-1, 2), isFactorOfPi: true }, k: { numeric: 7 } });
    } catch (e) {
        console.error(e);
    }
}


class FactorOfPi {
    constructor(numeric, isFactorOfPi) {
        this.numeric = numeric;
        this.isFactorOfPi = isFactorOfPi;
    }

    simplify() {
        if ((this.numeric instanceof Fraction) && (this.numeric.denominator === 1)) {
            this.numeric = this.numeric.numerator;
        }
        if (this.numeric === 0) {
            this.isFactorOfPi = false;
        }
        return this;
    }

    divideBy(fop) {
        if (this.numeric === 0) {
            return new FactorOfPi(0);
        }
        if (!this.isFactorOfPi && fop.isFactorOfPi) {
            throw `unsupported division: ${this.toLatex()} divided by ${fop.toLatex()}}`;
        }
        const isFactorOfPi = this.isFactorOfPi && !fop.isFactorOfPi;
        const f0 = _forceFraction(this.numeric);
        const f1 = _forceFraction(fop.numeric);
        const numerator = f0.numerator * f1.denominator;
        const denominator = f0.denominator * f1.numerator;
        console.log(`numerator: ${numerator}, denominator: ${denominator}`);
        const numeric = denominator === 1 ? numerator : new Fraction(numerator, denominator);
        return (new FactorOfPi(numeric, isFactorOfPi)).simplify();
    }

    multiplyWith(fop) {
        if (this.numeric === 0 || fop.numeric === 0) {
            return new FactorOfPi(0);
        }
        if (this.isFactorOfPi && fop.isFactorOfPi) {
            throw `unsupported multiplication: ${this.toLatex()} multiplied with ${fop.toLatex()}}`;
        }
        const isFactorOfPi = this.isFactorOfPi || fop.isFactorOfPi;
        const f0 = _forceFraction(this.numeric);
        const f1 = _forceFraction(fop.numeric);
        const numerator = f0.numerator * f1.numerator;
        const denominator = f0.denominator * f1.denominator;
        const numeric = denominator === 1 ? numerator : new Fraction(numerator, denominator);
        return (new FactorOfPi(numeric, isFactorOfPi)).simplify();
    }

    add(fop) {
        if (this.numeric === 0) {
            return fop;
        }
        if (fop.numeric === 0) {
            return this;
        }
        if (!!this.isFactorOfPi !== !!fop.isFactorOfPi) {
            throw `unsupported addition: ${this.toLatex()} plus ${fop.toLatex()}}`;
        }
        const isFactorOfPi = this.isFactorOfPi;
        const f0 = _forceFraction(this.numeric);
        const f1 = _forceFraction(fop.numeric);
        const numeric = f0.add(f1);
        return (new FactorOfPi(numeric, isFactorOfPi)).simplify();
    }

    subtract(fop) {
        const mfop = fop.negate();
        return this.add(mfop);
    }

    decimalValue() {
        var val = 0;
        if (typeof this.numeric === 'number') {
            val = this.numeric;
        } else {
            val = this.numeric.decimalValue();
        }
        if (this.isFactorOfPi) {
            val *= Math.PI;
        }
        return val;
    }

    negate() {
        const { numeric, isFactorOfPi } = this;
        if (typeof numeric === 'number') {
            return new FactorOfPi(-numeric, isFactorOfPi);
        }
        const numerator = -(numeric.numerator);
        const nnumeric = new Fraction(numerator, numeric.denominator);
        return (new FactorOfPi(nnumeric, isFactorOfPi)).simplify();
    }

    isNegative() {
        return this.decimalValue() < 0;
    }

    absoluteValue() {
        const f = _forceFraction(this.numeric);
        const numerator = Math.abs(f.numerator);
        const denominator = Math.abs(f.denominator);
        const numeric = new Fraction(numerator, denominator);
        return (new FactorOfPi(numeric, this.isFactorOfPi)).simplify();
    }

    equals(fop) {
        if (!!this.isFactorOfPi !== !!fop.isFactorOfPi) {
            return false;
        }
        const f0 = _forceFraction(this.numeric);
        const f1 = _forceFraction(fop.numeric);
        return f0.numerator === f1.numerator && f0.denominator === f1.denominator;
    }

    greaterThan(fop) {
        return this.decimalValue() > fop.decimalValue();
    }

    lessThan(fop) {
        return this.decimalValue() < fop.decimalValue();
    }

    toLatex() {
        const { numeric, isFactorOfPi } = this;
        const piString = isFactorOfPi ? '\\pi' : '';
        const _numStr = num => {
            if (Math.abs(num) === 1 && isFactorOfPi) {
                let sign = Math.sign(num) < 0 ? '-' : '';
                return `${sign}${piString}`;
            }
            return `${num}${piString}`;
        }
        if (typeof numeric === 'number') {
            const { numerator, denominator } = findFraction(numeric);
            if (Math.abs(denominator) !== 1) {
                return `\\frac{${_numStr(numerator)}}{${denominator}}`;
            }
            return _numStr(numeric);
        }
        if (numeric instanceof Fraction) {
            return `\\frac{${_numStr(numeric.numerator)}}{${numeric.denominator}}`;
        }
    }
}

const Fop0 = new FactorOfPi(0);
const Fop1 = new FactorOfPi(1);
const Fop2 = new FactorOfPi(2);
const Fop4 = new FactorOfPi(4);
const FopMinus1 = new FactorOfPi(-1);
const FopPi = new FactorOfPi(1, true);
const FopPiOver2 = new FactorOfPi(new Fraction(1, 2), true);
const FopPiOver4 = new FactorOfPi(new Fraction(1, 4), true);
const Fop3PiOver2 = new FactorOfPi(new Fraction(3, 2), true);
const Fop2Pi = new FactorOfPi(2, true);

const TrigKeyPoints = {
    'sin': [
        { x: Fop0, y: Fop0 },
        { x: FopPiOver2, y: Fop1 },
        { x: FopPi, y: Fop0 },
        { x: Fop3PiOver2, y: FopMinus1 },
        { x: Fop2Pi, y: Fop0 },
    ],
    'cos': [
        { x: Fop0, y: Fop1 },
        { x: FopPiOver2, y: Fop0 },
        { x: FopPi, y: FopMinus1 },
        { x: Fop3PiOver2, y: Fop0 },
        { x: Fop2Pi, y: Fop1 },
    ]
}