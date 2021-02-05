
function polynomialGraph(...coefficents) {
    const outputElem = this;
    // for testing: if all values are zero, fill with random values
    if (coefficents.every(n => n === 0)) {
        coefficents = coefficents.map(n => Math.trunc(Math.random() * 30) - 15);
        let div = document.createElement('div');
        div.innerHTML = "RANDOM VALUES GENERATED FOR TESTING!";
        outputElem.appendChild(div);
    }
    addPolynomialGraph(outputElem, ...coefficents);
}

const doLongDivision = (coeffs, divisor) => {
    const coefficents = coeffs.concat([]);
    while (coefficents[0] === 0 && coefficents.length > 0) {
        coefficents.shift();
    }
    const res = [];
    var pvalue = 0;
    for (let i = 0; i < coefficents.length; i++) {
        let topValue = coefficents[i];
        let middleValue = divisor * pvalue;
        let bottomValue = topValue + middleValue;
        let entry = { topValue, middleValue: i === 0 ? "" : middleValue, bottomValue };
        pvalue = bottomValue;
        res.push(entry);
    }
    console.log(res);
    return res;
}

function addPolynomialGraph(outputElem, ...coefficents) {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '10px';
    div.style.left = '600px';
    div.style.margin = '20px';
    div.style.border = '1px solid green';
    outputElem.appendChild(div);
    const calc = appendGraphingCalculator(div);
    const pterm = createPolynomial('x', ...coefficents);
    calc.setExpression({ latex: pterm });
    addMathResult(outputElem, ({ mathField, textDiv }) => {
        textDiv.innerHTML = '';
        mathField.latex(pterm);
    });
    const _longDivTable = longDivResult => {
        const table = document.createElement('table');
        table.className = 'longdiv-table';
        const _addRow = (values, clname) => {
            const tr = document.createElement('tr');
            table.appendChild(tr);
            values.forEach(v => {
                const td = document.createElement('td');
                td.className = clname;
                td.setAttribute('align', 'right');
                td.innerHTML = v;
                tr.appendChild(td);
            })
        }
        const topValues = longDivResult.map(entry => entry.topValue);
        const middleValues = longDivResult.map(entry => entry.middleValue);
        const bottomValues = longDivResult.map(entry => entry.bottomValue);
        _addRow(topValues, 'longdiv-table-cell longdiv-table-cell-top');
        _addRow(middleValues, 'longdiv-table-cell longdiv-table-cell-middle');
        _addRow(bottomValues, 'longdiv-table-cell longdiv-table-cell-bottom');
        return table;
    }
    const addLongDivisionSection = () => {
        const cont = _collapsibleSection(outputElem, 'Long Division');
        const div1 = document.createElement('div');
        const span = document.createElement('span');
        span.innerHTML = 'Enter value:';
        div1.appendChild(span);
        const input = document.createElement('input');
        input.setAttribute('size', 3);
        div1.appendChild(input);
        cont.appendChild(div1);
        const button = document.createElement('input');
        button.setAttribute('type', 'button');
        button.value = 'Go';
        div1.appendChild(button);
        const output = document.createElement('div');
        cont.appendChild(output);
        button.addEventListener('click', event => {
            output.innerHTML = '';
            const divisor = Number(input.value);
            const longDivResult = doLongDivision(coefficents, divisor);
            var p = document.createElement('p');
            output.appendChild(p);
            p.appendChild(_longDivTable(longDivResult));
            const newCoeffs = longDivResult.map(entry => entry.bottomValue);
            const remainder = newCoeffs.splice(newCoeffs.length - 1, 1)[0];
            const pterm = createPolynomial('x', ...newCoeffs);
            p = document.createElement('p');
            output.appendChild(p);
            addMathResult(p, ({ mathField, textDiv }) => {
                textDiv.innerHTML = 'Quotient:';
                mathField.latex(pterm);
            });
            p = document.createElement('p');
            output.appendChild(p);
            addMathResult(p, ({ mathField, textDiv }) => {
                textDiv.innerHTML = 'Remainder:';
                mathField.latex(remainder);
            });
        });
    }
    const addInsertValueSection = (outputValueTable = false) => {
        const title = outputValueTable ? 'Value table' : 'Insert Values'
        const cont = _collapsibleSection(outputElem, title)
        const div1 = document.createElement('div');
        const span = document.createElement('span');
        span.innerHTML = 'Enter (comma-separated) values:';
        div1.appendChild(span);
        const input = document.createElement('input');
        div1.appendChild(input);
        cont.appendChild(div1);
        const button = document.createElement('input');
        button.setAttribute('type', 'button');
        button.value = 'Go';
        div1.appendChild(button);
        const outputCont = document.createElement('div');
        cont.appendChild(outputCont);
        button.addEventListener('click', event => {
            outputCont.innerHTML = '';
            if (input.value.trim().length === 0) {
                return;
            }
            const values = input.value.split(/\s*,\s*/)
                .filter(nstr => {
                    console.log(`nstr: ${nstr}`);
                    return !isNaN(Number(nstr))
                })
                .map(Number);
            if (values.length === 0) {
                return;
            }
            var table;
            if (outputValueTable) {
                values.sort((a, b) => a > b ? 1 : a < b ? -1 : 0);
                table = document.createElement('table');
                table.className = 'values-table';
                outputCont.appendChild(table);
                let tr = document.createElement('tr');
                table.appendChild(tr);
                let th = document.createElement('th');
                th.innerHTML = 'x';
                tr.appendChild(th);
                th = document.createElement('th');
                th.innerHTML = 'y';
                tr.appendChild(th);
            }
            for (let i = 0; i < values.length; i++) {
                let { latex, latexResultOnly, value } = createPolynomial(values[i], ...coefficents);
                if (outputValueTable) {
                    let tr = document.createElement('tr');
                    let td = document.createElement('td');
                    td.innerHTML = values[i];
                    tr.appendChild(td);
                    td = document.createElement('td');
                    td.innerHTML = value;
                    tr.appendChild(td);
                    table.appendChild(tr);
                } else {
                    let p = document.createElement('p');
                    outputCont.appendChild(p);
                    addMathResult(p, ({ mathField }) => {
                        mathField.latex(i === 0 ? latex : latexResultOnly);
                    });
                }
            }
        })
    }
    const addPossibleZerosSection = () => {
        const mathFieldForPMList = values => {
            var latex = "\\pm ( ";
            latex += values.map(term => {
                if (term instanceof Fraction) {
                    return term.toLatex(true);
                }
                return term;
            }).join(', ');
            latex += " )";
            const elem = document.createElement('div');
            addMathResult(elem, ({ mathField }) => {
                console.log(latex);
                mathField.latex(latex);
            }, { notext: true });
            return elem;
        }
        const possibleZeros = (factors1, factors2) => {
            const pzeros = [];
            for (let i = 0; i < factors1.length; i++) {
                for (let j = 0; j < factors2.length; j++) {
                    let pzero = new Fraction(factors1[i], factors2[j]);
                    if (pzeros.findIndex(f => f.decimalValue() === pzero.decimalValue()) < 0) {
                        pzeros.push(pzero);
                    } else {
                        console.log('skipping duplicate zero: ' + pzero.toString());
                    }
                }
            }
            return pzeros;
        }
        const cont = _collapsibleSection(outputElem, 'Possible Zeros');
        const pindex = coefficents.length - 1;
        const qindex = coefficents.findIndex(n => n !== 0);
        if (qindex < 0 || pindex === qindex) {
            cont.innerHTML = 'cannot compute possible zeros.';
            return;
        }
        let pval = coefficents[pindex];
        let qval = coefficents[qindex];
        let pfactors = factorsOf(pval);
        let qfactors = factorsOf(qval);
        let pzeros = possibleZeros(pfactors, qfactors);
        const table = document.createElement('table');
        addTableRow(table, `p = ${pval}`, 'Factors:', mathFieldForPMList(pfactors));
        addTableRow(table, `q = ${qval}`, 'Factors:', mathFieldForPMList(qfactors));
        addTableRow(table, '<b>Possible Zeros</b>', '', mathFieldForPMList(pzeros));
        cont.appendChild(table);
        if (pval === 0 || qval === 0) {
            const div = document.createElement('div');
            div.innerHTML = `p and/or q are 0, so it's not possible to determine possible zeros.`
            cont.appendChild(div);
            return;
        }
        const odiv = document.createElement('div');
        var firstTerm = true;
        pzeros.forEach(pzero => {
            const pterm = createPolynomial(pzero, ...coefficents);
            const nzero = pzero.multiply(-1);
            const nterm = createPolynomial(nzero, ...coefficents);
            var p = document.createElement('p');
            odiv.appendChild(p);
            addMathResult(p, ({ mathField }) => {
                mathField.latex(firstTerm ? pterm.latex : pterm.latexResultOnly);
            }, { notext: true });
            firstTerm = false;
            p = document.createElement('p');
            odiv.appendChild(p);
            addMathResult(p, ({ mathField }) => {
                mathField.latex(nterm.latexResultOnly);
            }, { notext: true });
        });
        cont.appendChild(odiv);
    }
    addInsertValueSection();
    addInsertValueSection(true);
    addPossibleZerosSection();
    addLongDivisionSection();
    return null;
}

const createPolynomialOptionalPrefix = (x, addPrefix, ...coefficents) => {
    const degree = coefficents.length - 1;
    var isFirstTerm = true;
    const isNumber = typeof x === 'number';
    const isFraction = x instanceof Fraction;
    const isNumeric = isNumber || isFraction;
    const xstr = isNumber ? `(${x})` : isFraction ? `(${x.toLatex(true)})` : x;
    var value = 0;
    const xvalue = isNumber ? x : isFraction ? x.decimalValue() : 'x'
    console.log(`xvalue = ${xvalue}`)
    var prefix = addPrefix ? `P(${x}) = ` : '';
    var s = '';
    for (let i = 0; i <= degree; i++) {
        let cf = coefficents[i];
        let exp = degree - i;
        if (isNumeric) {
            value += cf * Math.pow(xvalue, exp);
        }
        if (cf === 0 && exp > 0) {
            continue;
        }
        if (cf === 0 && exp === 0) {
            if (isFirstTerm) {
                s += '0'
            }
        } else {
            let sign = Math.sign(cf);
            let val = Math.abs(cf);
            if (sign < 0) {
                s += '-';
            }
            else if (!isFirstTerm) {
                s += '+';
            }
            s += (val !== 1 || exp === 0) ? val : '';
            if (exp === 0) {
            }
            else if (exp === 1) {
                s += xstr;
            }
            else if (exp > 1) {
                s += `${xstr}^${exp}`;
            }
        }
        isFirstTerm = false;
    }
    if (isNumeric) {
        console.log(`createPolynomial(${xstr}) = ${value}`);
        const valueOutput = isNumber ? value : new Fraction(value).toLatex(true);
        const latex = prefix + s + ` = ${valueOutput}`;
        const latexResultOnly = prefix + valueOutput;
        return { latex, latexResultOnly, value }
    }
    return prefix + s;
}

const createPolynomial = (x, ...coefficents) => {
    return createPolynomialOptionalPrefix(x, true, ...coefficents);
}

const appendGraphingCalculator = (elem, { width, height, xAxisStep, yAxisStep } = {}) => {
    if (!width) {
        width = '600px';
    }
    if (!height) {
        height = '500px'
    }
    const div = document.createElement('div');
    div.style.width = width;
    div.style.height = height;
    div.style.resize = 'both';
    div.style.overflow = 'auto';

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('checked', true);

    elem.appendChild(checkbox);

    const options = { autosize: false, expressions: true, expressionsCollapsed: true };
    if (typeof xAxisStep === 'number') {
        options.xAxisStep = xAxisStep;
    }
    if (typeof yAxisStep === 'number') {
        options.yAxisStep = yAxisStep;
    }
    const calculator = Desmos.GraphingCalculator(div, options);
    elem.appendChild(div);
    calculator.resize();
    var divRect = div.getBoundingClientRect();
    console.log(divRect);
    setInterval(() => {
        const rect = div.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w !== divRect.width || h !== divRect.height) {
            divRect = rect;
            calculator.resize();
        }
    }, 500);
    checkbox.addEventListener('change', event => {
        const display = checkbox.checked ? 'block' : 'none';
        div.style.display = display;
    });
    return calculator;
}