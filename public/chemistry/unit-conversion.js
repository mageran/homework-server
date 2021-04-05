function unitConversion(value, fromUnit, fromUnitExponent, fromQuotientUnit, fromQuotientExponent, toUnit, toUnitExponent, toQuotientUnit, toQuotientExponent) {
    const outputElem = this;
    var convInfo0 = null;
    var newFromUnit = fromUnit;
    var newFromUnitExponent = fromUnitExponent;
    var newFromQuotientUnit = fromQuotientUnit;
    var newFromQuotientExponent = fromQuotientExponent;
    var newValue = value;
    var steps0 = [];

    var convInfo1 = null;
    var newToUnit = toUnit;
    var newToUnitExponent = toUnitExponent;
    var newToQuotientUnit = toQuotientUnit;
    var newToQuotientExponent = toQuotientExponent;
    var convertLbin2ToResultUnit = false;
    if (_specialCasePressure(fromUnit, fromUnitExponent, fromQuotientUnit, fromQuotientExponent, toUnit, toUnitExponent, toQuotientUnit, toQuotientExponent)) {
        convInfo0 = convertUnit(fromUnit, 'lbin2', value, fromUnitExponent);
        convInfo0.exponent = 1;
        console.log(convInfo0);
        newFromUnit = 'lb';
        newFromUnitExponent = 1;
        newFromQuotientUnit = 'in';
        newFromQuotientExponent = 2;
        newValue = convInfo0.result;
    }
    else if (_specialCasePressure(toUnit, toUnitExponent, toQuotientUnit, toQuotientExponent, fromUnit, fromUnitExponent, fromQuotientUnit, fromQuotientExponent)) {
        newToUnit = 'lb';
        newToUnitExponent = 1;
        newToQuotientUnit = 'in';
        newToQuotientExponent = 2;
        convertLbin2ToResultUnit = true;
    }
    assert(newFromUnitExponent === newToUnitExponent, "exponents don't match");
    const convInfo = convertUnit(newFromUnit, newToUnit, newValue, newFromUnitExponent);
    const convInfoQuotient = newFromQuotientUnit ? convertUnit(newFromQuotientUnit, newToQuotientUnit, 1, newFromQuotientExponent) : null;
    convInfo.exponent = newFromUnitExponent;
    if (convInfoQuotient) {
        convInfoQuotient.exponent = newFromQuotientExponent;
    }
    if (convertLbin2ToResultUnit) {
        // special case: toUnit is a pressure, fromUnit: weight/length2
        // the conversion is already done into lb/in2
        // the conversion from lbin2 to the final toUnit needs to be added:
        convInfo1 = convertUnit('lbin2', toUnit, convInfo.result, 1);
    }
    var totalConvInfo = convInfo0 ? concatConvInfo(convInfo0, convInfo) : convInfo;
    totalConvInfo = convInfo1 ? concatConvInfo(totalConvInfo, convInfo1) : totalConvInfo;
    _addConversionTable(outputElem, totalConvInfo, convInfoQuotient);
}

const P = 5;

const _addConversionTable = (outputElem, convInfo, convInfoQuotient) => {
    console.log(`convInfoQuotient: ${JSON.stringify(convInfoQuotient, null, 2)}`);
    var { fromUnit, toUnit, exponent, value, steps, formula, result } = convInfo;
    if (typeof formula === 'string') {
        addLatexElement(outputElem, `${formula}:`);
        addLatexElement(outputElem, `${value} ${fromUnit} = ${result} ${toUnit}`);
        return;
    }
    if (typeof exponent !== 'number') exponent = 1;
    const fromUnitWithExponent = exponent === 1 ? `\\text{${fromUnit}}` : `\\text{${fromUnit}}^${exponent}`;
    const toUnitWithExponent = exponent === 1 ? `\\text{${toUnit}}` : `\\text{${toUnit}}^${exponent}`;
    const table = document.createElement('table');
    table.className = 'conversion-table';
    const tr1 = document.createElement('tr');
    const tr2 = document.createElement('tr');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    addLatexElement(td1, `${value}${fromUnitWithExponent}`);
    console.log(fromUnitWithExponent);
    if (convInfoQuotient) {
        let quotientFromUnit = convInfoQuotient.fromUnit;
        let quotientExponent = convInfoQuotient.exponent;
        let quotientFromUnitWithExponent = quotientExponent === 1 ? `\\text{${quotientFromUnit}}` : `\\text{${quotientFromUnit}}^${quotientExponent}`;
        addLatexElement(td2, quotientFromUnitWithExponent);
    } else {
        td2.innerHTML = "&nbsp;";
    }
    tr1.appendChild(td1);
    tr2.appendChild(td2);
    table.appendChild(tr1);
    table.appendChild(tr2);
    steps.forEach(step => {
        const { fromUnit, toUnit, factor, quotient, exponent } = step;
        const fromUnitWithExponent = exponent === 1 ? `\\text{${fromUnit}}` : `\\text{${fromUnit}}^${exponent}`;
        const toUnitWithExponent = exponent === 1 ? `\\text{${toUnit}}` : `\\text{${toUnit}}^${exponent}`;
        td1 = document.createElement('td');
        td2 = document.createElement('td');
        if (exponent === 1) {
            addLatexElement(td1, `1 \\text{${toUnit}}`);
            addLatexElement(td2, `${precision(quotient, P)} \\text{${fromUnit}}`);
        } else {
            addLatexElement(td1, `(1 \\text{${toUnit}})^${exponent}`);
            addLatexElement(td2, `(${precision(quotient, P)} \\text{${fromUnit}})^${exponent}`);
        }
        tr1.appendChild(td1);
        tr2.appendChild(td2);
    })
    if (convInfoQuotient) {
        convInfoQuotient.steps.forEach(step => {
            const { fromUnit, toUnit, factor, quotient, exponent } = step;
            const fromUnitWithExponent = exponent === 1 ? `\\text{${fromUnit}}` : `\\text{${fromUnit}}^${exponent}`;
            const toUnitWithExponent = exponent === 1 ? `\\text{${toUnit}}` : `\\text{${toUnit}}^${exponent}`;
            td1 = document.createElement('td');
            td2 = document.createElement('td');
            if (exponent === 1) {
                addLatexElement(td1, `1 \\text{${toUnit}}`);
                addLatexElement(td2, `${precision(quotient, P)} \\text{${fromUnit}}`);
            } else {
                addLatexElement(td1, `(1 \\text{${toUnit}})^${exponent}`);
                addLatexElement(td2, `(${precision(quotient, P)} \\text{${fromUnit}})^${exponent}`);
            }
            tr2.appendChild(td1);
            tr1.appendChild(td2);
        });
    }
    // result
    if (convInfoQuotient) {
        const quotientResult = convInfoQuotient.result;
        result = result.dividedBy(quotientResult);
    }
    td1 = document.createElement('td');
    addLatexElement(td1, ` = ${precision(result, P)}${toUnitWithExponent}`);
    tr1.appendChild(td1);
    td2 = document.createElement('td');
    if (convInfoQuotient) {
        let quotientToUnit = convInfoQuotient.toUnit;
        let quotientExponent = convInfoQuotient.exponent;
        let quotientToUnitWithExponent = quotientExponent === 1 ? `\\text{${quotientToUnit}}` : `\\text{${quotientToUnit}}^${quotientExponent}`;
        addLatexElement(td2, quotientToUnitWithExponent);
    } else {
        td2.innerHTML = "&nbsp;";
    }
    tr2.appendChild(td2);
    outputElem.appendChild(table);
}

function chemicalElementInfoUi(symbol) {
    const outputElem = this;
    try {
        const info = chemicalElement(symbol);
        const json = JSON.stringify(info, null, 2);
        const pre = document.createElement('pre');
        pre.innerHTML = json;
        outputElem.appendChild(pre);
    } catch (err) {
        _addErrorElement(outputElem, `*** ${err}`);
    }
}

const getMolarMassFromFormula = formula => {
    const ast = parseChemicalFormula(formula);
    console.log(JSON.stringify(ast, null, 2));
    const { coefficient, formulasList } = ast;
    var totalMass = 0;
    formulasList.forEach(astElem => {
        const m = _processChemicalFormulas(null, astElem);
        totalMass += m;
    });
    return totalMass;
}

function molarMassUi(formula) {
    const outputElem = this;
    try {
        const ast = parseChemicalFormula(formula);
        console.log(JSON.stringify(ast, null, 2));
        const { coefficient, formulasList } = ast;
        var totalMass = 0;
        formulasList.forEach(astElem => {
            const m = _processChemicalFormulas(outputElem, astElem);
            totalMass += m;
        });
        var div = document.createElement('div');
        div.innerHTML = `total mass: ${totalMass} g/mol`;
        outputElem.appendChild(div);

        const hr = document.createElement('hr');
        _htmlElement('h3', outputElem, "with percentages:");
        outputElem.appendChild(hr);
        formulasList.forEach(astElem => {
            _processChemicalFormulas(outputElem, astElem, totalMass);
        });
        div = document.createElement('div');
        div.innerHTML = `total mass: ${totalMass} g/mol`;
        outputElem.appendChild(div);
    } catch (err) {
        _addErrorElement(outputElem, `*** ${err}`);
    }
}

const _processChemicalFormulas = (outputElem, { formulas, multiplier }, calculatedTotal) => {
    const outerMultiplier = (typeof multiplier === 'number') ? multiplier : 1;
    var massInTotal = 0;
    const createUi = !!outputElem;
    formulas.forEach(elemInfo => {
        let { chemicalElement, multiplier } = elemInfo;
        if (typeof multiplier !== 'number') {
            multiplier = 1;
        }
        const mass = atomicMass(chemicalElement.symbol);
        const div = createUi ? document.createElement('div') : null;
        var multiplierString = `${multiplier}`;
        if (outerMultiplier > 1) {
            multiplierString += ` * ${outerMultiplier}`;
        }
        const multiplierValue = multiplier * outerMultiplier;
        const totalMass = mass * multiplierValue;
        var pstr = "";
        if (typeof calculatedTotal === 'number') {
            const percent = precision(totalMass / calculatedTotal * 100, 2);
            pstr = `(${percent}%)`;
        }
        massInTotal += totalMass;
        if (createUi) {
            div.innerHTML = `${chemicalElement.symbol}, atoms: ${multiplierString}, atomic mass: ${mass} g/mol = ${totalMass} ${pstr}`;
            outputElem.appendChild(div);
        }
    })
    return massInTotal;
}


const abc = () => {
    const amBa = atomicMass('Ba');
    const amN = atomicMass('N');
    const amO = atomicMass('O');
    for (let i = 1; i < 10; i++) {
        for (let j = 1; j < 10; j++) {
            for (let k = 1; k < 10; k++) {
                let ba = i * amBa;
                let n = j * amN;
                let o = k * amO;

                let total = ba + n + o;

                let baPercent = ba / total * 100;
                let nPercent = n / total * 100;
                let oPercent = o / total * 100;
                if (baPercent > 52 && baPercent < 53) {
                    console.log(`Ba${i} N${j} O${k}`);
                    console.log(`ba = ${precision(baPercent, 2)}, N = ${precision(nPercent, 2)}, O = ${precision(oPercent, 2)}`);
                }
            }
        }
    }
}