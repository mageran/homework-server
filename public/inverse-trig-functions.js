


function inverseTrigonomicFunctions() {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        const trigTable = initializeInverseTrigTable();
        const inputDiv = _htmlElement('div', o);
        const functionInputDiv = _htmlElement('div', inputDiv);
        const valuesInputDiv = _htmlElement('div', inputDiv);
        var valuesSelect;
        var outputElem;
        const populateValueMenu = arcfun => {
            valuesInputDiv.innerHTML = '';
            const values = trigTable[arcfun].values;
            const selectOptions = values.map(valueEntry => {
                const { value, angle } = valueEntry;
                const label = span => addLatexElement(span, numericToLatex(value));
                return { value: { xvalue: value, yvalue: angle }, label };
            });
            const sobj = createSelectElement(valuesInputDiv, selectOptions, () => {
                if (!outputElem) return;
                outputElem.innerHTML = '';
            });
            sobj.outerContainer.style.height = '60px';
            return sobj;
        }
        const functionSelect = createSelectElement(functionInputDiv, [
            { value: 'arccos', label: span => addLatexElement(span, 'cos^{-1}') },
            { value: 'arcsin', label: span => addLatexElement(span, 'sin^{-1}') },
            { value: 'arctan', label: span => addLatexElement(span, 'tan^{-1}') },
            { value: 'arcsec', label: span => addLatexElement(span, 'sec^{-1}') },
            { value: 'arccsc', label: span => addLatexElement(span, 'csc^{-1}') },
            { value: 'arccot', label: span => addLatexElement(span, 'cot^{-1}') }
        ], option => {
            console.log(option.value);
            valuesSelect = populateValueMenu(option.value);
            if (outputElem) {
                outputElem.innerHTML = '';
            }
        })
        functionSelect.outerContainer.style.height = '60px';
        const b = _htmlElement('input', o);
        b.type = "button";
        b.value = 'Go';
        b.style.fontSize = '20pt';
        b.style.display = 'block';
        outputElem = _htmlElement('div', o);
        const go = () => {
            outputElem.innerHTML = '';
            const trigFunction = functionSelect.selected.value;
            console.log(trigFunction);
            const info = trigTable[trigFunction];
            addLatexElement(outputElem, info.latex, 'Function:');
            addLatexElement(outputElem, info.domainLatex, `Domain (= Range of ${info.base}):`);
            addLatexElement(outputElem, info.rangeLatex, `Range ( = Domain of ${info.base}):`);
            if (valuesSelect) {
                let { xvalue, yvalue } = valuesSelect.selected.value;
                console.log(xvalue);
                let latex = `${info.latex}(${numericToLatex(xvalue)}) = ${yvalue.toLatex('radians')}`;
                addLatexElement(outputElem, latex);
            }
            configurableUnitCircle.call(outputElem);
        }
        b.addEventListener('click', go);

    } catch (err) {
        _addErrorElement(o, err);
    }
}

function reverseUnitCircleLookup(formulaLatex) {
    const o = this;
    o.style.fontSize = '18pt';
    const trigTable = initializeInverseTrigTable();
    const findTrigTableEntry = trigFunction => {
        const keys = Object.keys(trigTable);
        for (let i = 0; i < keys.length; i++) {
            let entry = trigTable[keys[i]];
            if (entry.base === trigFunction) {
                return entry;
            }
        }
        return null;
    }
    const checkInRangeOfInverseTrigFunction = (trigFunction, angle) => {
        const entry = findTrigTableEntry(trigFunction);
        if (!entry) return false;
        const { angleIsInRange } = entry;
        return angleIsInRange(angle);
    }
    try {
        var { ast, value } = evalLatexFormula(formulaLatex);
        //_htmlElement('pre', o, `value: ${value}`);
        value = _d(precision(value.toNumber(), 10));
        _htmlElement('pre', o, `value: ${value}`);
        const storedValueDiv = _htmlElement('div', o);
        const trigFunctionsAngles = Angle.reverseLookupTrigFunctions(value, true);
        if (trigFunctionsAngles.length === 0) {
            _htmlElement('div', o, 'No matches found.');
        } else {
            //_htmlElement('pre', o, JSON.stringify(ast, null, 2));
            _htmlElement('div', o, 'The table contains trig-functions and angles that evaluate to the specified value.');
            _htmlElement('div', o, 'The highlighted angles are in the range of the inverse trig function.');
            //_htmlElement('pre', o, JSON.stringify(trigFunctionsAngles, null, 2));
            const table = _htmlElement('table', o, null, 'reverse-lookup-table');
            var tr = _htmlElement('tr', table);
            var td = _htmlElement('th', tr, "TrigFunction");
            td = _htmlElement('th', tr, "Angle(s)");
            const maxNumberOfAngles = Object.values(trigFunctionsAngles).reduce((max, angles) => Math.max(max, angles.length), 1);
            td.setAttribute("colspan", String(maxNumberOfAngles));
            var storedValueInserted = false;
            Object.keys(trigFunctionsAngles).forEach(trigFunction => {
                let tr = _htmlElement('tr', table);
                let angles = trigFunctionsAngles[trigFunction];
                let td = _htmlElement('td', tr);
                td.innerHTML = trigFunction;
                angles.forEach(angle => {
                    if (!storedValueInserted) {
                        let storedValue = angle[trigFunction];
                        if (storedValue) {
                            let latex = numericToLatex(storedValue);
                            addLatexElement(storedValueDiv, latex, 'Stored value:');
                            storedValueInserted = true;
                        }
                    }
                    let highlight = checkInRangeOfInverseTrigFunction(trigFunction, angle);
                    td = _htmlElement('td', tr);
                    if (highlight) {
                        td.style.backgroundColor = "yellow";
                    }
                    if (Math.abs(angle.degree) > 360) {
                        td.style.color = "#ddd";
                    }
                    if (angle.degree >= 0 && angle.degree < 360) {
                        td.style.fontWeight = "bold";
                    }
                    addLatexElement(td, angle.toLatex('radians'));
                })
            })
        }
        configurableUnitCircle.call(o);
    } catch (err) {
        _addErrorElement(o, err);
    }
}

const _getDomainCheckLatex = (trigFunction, valueOrAngle, result) => {
    const vlatex = (valueOrAngle instanceof Angle) ? valueOrAngle.toLatex('radians') : numericToLatex(valueOrAngle);
    if (trigFunction === 'cos') {

    }
}

const _checkTrigFunctionDomain = (trigFunction, value, forInverse = false) => {
    const val = (value instanceof Angle) ? value.radiansDecimal
        : (value instanceof Numeric) ? value.decimalxValue() : _d(value);
    const vlatex = (value instanceof Angle) ? value.toLatex('radians') : numericToLatex(value);
    var result = true;
    var latex = '\\text{no domain restriction}'
    const _resultLatex = () => result ? '\\text{&nbsp;ok}' : '\\text{&nbsp;not ok!}';
    if (trigFunction === 'cos' && forInverse) {
        result = val >= 0 && val <= pi;
        latex = `${vlatex} \\in ${TrigTable.arccos.rangeLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'sin' && forInverse) {
        result = val >= -pi / 2 && val <= pi / 2
        latex = `${vlatex} \\in ${TrigTable.arcsin.rangeLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'tan' && forInverse) {
        result = val > -pi / 2 && val < pi / 2;
        latex = `${vlatex} \\in ${TrigTable.arctan.rangeLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'sec' && forInverse) {
        result = val >= 0 && val <= pi && val != pi / 2;
        latex = `${vlatex} \\in ${TrigTable.arcsec.rangeLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'csc' && forInverse) {
        result = val >= -pi / 2 && val <= pi / 2 && val != 0;
        latex = `${vlatex} \\in ${TrigTable.arccsc.rangeLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'cot' && forInverse) {
        result = val > 0 && val < pi;
        latex = `${vlatex} \\in ${TrigTable.arccot.rangeLatex} ${_resultLatex()}`;
    }
    // inverse trig functions:
    else if (trigFunction === 'arccos') {
        result = val >= -1 && val <= 1;
        latex = `${vlatex} \\in ${TrigTable.arccos.domainLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'arcsin') {
        result = val >= -1 && val <= 1
        latex = `${vlatex} \\in ${TrigTable.arcsin.domainLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'arctan') {
        result = true;
        latex = `${vlatex} \\in ${TrigTable.arctan.domainLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'arcsec') {
        result = val <= -1 || val >= 1;
        latex = `${vlatex} \\in ${TrigTable.arcsec.domainLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'arccsc') {
        result = val <= -1 || val >= 1;
        latex = `${vlatex} \\in ${TrigTable.arccsc.domainLatex} ${_resultLatex()}`;
    }
    else if (trigFunction === 'arccot') {
        result = true;
        latex = `${vlatex} \\in ${TrigTable.arccot.domainLatex} ${_resultLatex()}`;
    }
    return { result, latex };
}

const NotOnUnitCircleErrorPrefix = '[NotOnUnitCircle]';

const _createOnlyUnitCircleAngle = radians => {
    const angle = Angle.reverseLookupRadiansToUnitCircleAngle(radians);
    if (!angle) {
        throw `${NotOnUnitCircleErrorPrefix} ${radians} is not supported; it doesn\'t correspond to a unit circle angle`;
    }
    return angle;
}

const _createOnlyAngleInRangeOfTrigFunction = (invTrigFunction, value, numericOutput) => {
    const ttEntry = TrigTable[invTrigFunction];
    const trigFunction = ttEntry.base;
    const trigFunctionValues = Angle.reverseLookupTrigFunctions(value, true);
    const angles = trigFunctionValues[trigFunction];
    if (Array.isArray(angles)) {
        for (let i = 0; i < angles.length; i++) {
            let angle = angles[i];
            if (ttEntry.angleIsInRange(angle)) {
                if (typeof numericOutput === 'object') {
                    numericOutput.numeric = angle[trigFunction];
                }
                return angle;
            }
        }
    }
    throw `${NotOnUnitCircleErrorPrefix} ${value} is not supported for ${invTrigFunction}: it doesn't map to a unit circle angle`;
}

const _trigInvTrigToLatex = trigFunction => {
    switch (trigFunction) {
        case 'arccos': return 'cos^{-1}';
        case 'arcsin': return 'sin^{-1}';
        case 'arctan': return 'tan^{-1}';
        case 'arcsec': return 'sec^{-1}';
        case 'arccsc': return 'csc^{-1}';
        case 'arccot': return 'cot^{-1}';
        default: return trigFunction;
    }
}

const _getReciprocalTrigFunction = trigFunction => {
    switch (trigFunction) {
        case 'cos': return 'sec';
        case 'sin': return 'csc';
        case 'tan': return 'cot';
        case 'sec': return 'cos';
        case 'csc': return 'sin';
        case 'cot': return 'tan';
        case 'arccos': return 'arcsec';
        case 'arcsin': return 'arccsc';
        case 'arctan': return 'arccot';
        case 'arcsec': return 'arccos';
        case 'arccsc': return 'arcsin';
        case 'arccot': return 'arctan';
    }
    throw `internal error: no such trigFunction ${trigFunction}`;
}

const _getInverseTrigFunction = trigFunction => {
    switch (trigFunction) {
        case 'cos': return 'arccos';
        case 'sin': return 'arcsin';
        case 'tan': return 'arctan';
        case 'sec': return 'arcsec';
        case 'csc': return 'arccsc';
        case 'cot': return 'arccot';
        case 'arccos': return 'cos';
        case 'arcsin': return 'sin';
        case 'arctan': return 'tan';
        case 'arcsec': return 'sec';
        case 'arccsc': return 'csc';
        case 'arccot': return 'cot';
    }
    throw `internal error: no such trigFunction ${trigFunction}`;
}

const _isRegularTrigFunction = trigFunction => {
    return ['cos', 'sin', 'tan', 'sec', 'csc', 'cot'].includes(trigFunction);
}

const _isInverseTrigFunction = trigFunction => {
    return ['arccos', 'arcsin', 'arctan', 'arcsec', 'arccsc', 'arccot'].includes(trigFunction);
}

const _deriveTrigFunctionValue = (trigFunction, value, ensureAngleInRangeOfInverse = true) => {
    const entries = [];
    var specialCot = false;
    // special case 'cot' on angle that is undefined for 'tan'
    if (trigFunction === 'cot') {
        let angle = _createOnlyUnitCircleAngle(value);
        let rangle = angle.referenceAngle;
        specialCot = rangle.degree === 90;
    }
    if (['cos', 'sin', 'tan'].includes(trigFunction) || specialCot) {
        let angle = _createOnlyUnitCircleAngle(value);
        entries.push({ trigFunction, angle });
        if (ensureAngleInRangeOfInverse) {
            let angle0 = angle.normalize();
            if (angle0 instanceof Angle && !angle.equals(angle0)) {
                entries.push({ trigFunction, angle: angle0 });
            }
            let angle1 = angle.getAngleWithSameTrigValueInRangeOfInverseTrig(trigFunction);
            if (angle1 instanceof Angle && !angle1.equals(angle0)) {
                entries.push({ trigFunction, angle: angle1 });
            }
        }
        let numeric = angle[trigFunction];
        entries.push({ numeric });
    }
    else if (['sec', 'csc', 'cot'].includes(trigFunction)) {
        let angle = _createOnlyUnitCircleAngle(value);
        entries.push({ trigFunction, angle });
        let trigFunction1 = _getReciprocalTrigFunction(trigFunction);
        entries.push({ trigFunction: trigFunction1, isReciprocal: true, angle });
        let numeric = angle[trigFunction1];
        entries.push({ isReciprocal: true, numeric });
        if (numeric === 0) {
            entries.push({ isUndefined: true });
        } else {
            numeric = ensureNumeric(numeric).inverse();
            entries.push({ numeric: numeric.clone() });
            console.log(numeric);
            let simplified = numeric.simplify();
            if (numeric.hasBeenSimplified) {
                entries.push({ numeric: simplified });
            }
        }
    }
    else if (['arccos', 'arcsin', 'arctan'].includes(trigFunction) || (trigFunction === 'arccot' && value == 0)) {
        let storedValueHolder = {};
        let angle = _createOnlyAngleInRangeOfTrigFunction(trigFunction, value, storedValueHolder);
        let { numeric } = storedValueHolder;
        entries.push({ trigFunction, numeric });
        entries.push({ angle });
    }
    else if (['arcsec', 'arccsc', 'arccot'].includes(trigFunction)) {
        let storedValueHolder = {};
        let trigFunction0 = _getReciprocalTrigFunction(trigFunction);
        let angle = _createOnlyAngleInRangeOfTrigFunction(trigFunction, value, storedValueHolder);
        let { numeric } = storedValueHolder;
        entries.push({ trigFunction, numeric });
        let inum = ensureNumeric(numeric).inverse();
        entries.push({ trigFunction: trigFunction0, numeric: inum.clone() });
        let snum = inum.simplify();
        if (inum.hasBeenSimplified) {
            entries.push({ trigFunction: trigFunction0, numeric: snum });
        }
        let angle1 = _createOnlyAngleInRangeOfTrigFunction(trigFunction0, _d(snum));
        entries.push({ angle });
        //entries.push( { angle: angle1 });
    }
    return entries;
}

const _deriveStepsToLatex = entries => {
    var latexEntries = [];
    entries.forEach(({ trigFunction, angle, numeric, isReciprocal, isUndefined }) => {
        let latex = "";
        let ob = "";
        let cb = "";
        if (isUndefined) {
            latex += '\\text{undefined}';
        }
        if (trigFunction) {
            latex += _trigInvTrigToLatex(trigFunction);
            ob = '\\left(';
            cb = '\\right)';
        }
        if (angle) {
            latex += ob + angle.toLatex('radians') + cb;
        }
        if (numeric || (typeof numeric === 'number')) {
            latex += ob + numericToLatex(numeric) + cb;
        }
        if (isReciprocal) {
            latex = `\\frac{1}{${latex}}`;
        }
        latexEntries.push(latex);
    });
    return latexEntries;
}

const _addInverseTrigFunctionRangeSketch = (o, trigFunction) => {
    if (trigFunction.indexOf("arc") === 0) {
        let span = _htmlElement('span', o, "Range sketch:");
        span.style.verticalAlign = "top";
        let imgsrc = `images/${trigFunction}-range.png`;
        let img = _htmlElement('img', o, null, 'trigfunction-range-sketch');
        img.setAttribute("src", imgsrc);
    }
}


const _addDomainCheck = (o, trigFunction, value, entries = [], options) => {
    const { includeRangeSketch } = options;
    const domainCheckInfo = _checkTrigFunctionDomain(trigFunction, value);
    const dcdiv = _htmlElement('div', o);
    const dcdiv1 = _htmlElement('div', dcdiv);
    if (includeRangeSketch) {
        dcdiv1.style.display = "inline-block";
        dcdiv1.style.verticalAlign = "top";
        const dcdiv2 = _htmlElement('div', dcdiv);
        dcdiv2.style.display = "inline-block";
        dcdiv2.style.marginLeft = "50px";
        dcdiv2.style.verticalAlign = "top";
        _addInverseTrigFunctionRangeSketch(dcdiv2, trigFunction);
        if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            const resultAngle = lastEntry.angle;
            if (resultAngle instanceof Angle) {
                console.log(`result angle: ${resultAngle.degree}`);
                const angleHtml = new AngleHtml(resultAngle);
                const dcdiv3 = _htmlElement('div', dcdiv);
                dcdiv3.style.display = "inline-block";
                dcdiv3.style.marginLeft = "50px";
                dcdiv3.style.verticalAlign = "top";
                angleHtml.addCanvas(dcdiv3);
            }
        }
    }
    dcdiv1.style.color = domainCheckInfo.result ? 'green' : 'red';
    addLatexElement(dcdiv1, domainCheckInfo.latex, 'Domain check:');
    return domainCheckInfo;
}

const _singleTrigFunctionInternal = (o, trigFunction, latexValue, options = {}) => {
    const {
        throwErrorOnDomainCheckFail,
        includeRangeSketch,
        continueWithResult
    } = options;
    const { value } = evalLatexFormula(latexValue);
    //console.log(value);
    const entries = _deriveTrigFunctionValue(trigFunction, value);
    const domainCheckInfo = _addDomainCheck(o, trigFunction, value, entries, options);
    /*
    const domainCheckInfo = _checkTrigFunctionDomain(trigFunction, value);
    const dcdiv = _htmlElement('div', o);
    const dcdiv1 = _htmlElement('div', dcdiv);
    if (includeRangeSketch) {
        dcdiv1.style.display = "inline-block";
        dcdiv1.style.verticalAlign = "top";
        const dcdiv2 = _htmlElement('div', dcdiv);
        dcdiv2.style.display = "inline-block";
        dcdiv2.style.marginLeft = "50px";
        dcdiv2.style.verticalAlign = "top";
        _addInverseTrigFunctionRangeSketch(dcdiv2, trigFunction);
        if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            const resultAngle = lastEntry.angle;
            if (resultAngle instanceof Angle) {
                console.log(`result angle: ${resultAngle.degree}`);
                const angleHtml = new AngleHtml(resultAngle);
                const dcdiv3 = _htmlElement('div', dcdiv);
                dcdiv3.style.display = "inline-block";
                dcdiv3.style.marginLeft = "50px";
                dcdiv3.style.verticalAlign = "top";
                angleHtml.addCanvas(dcdiv3);
            }
        }
    }
    dcdiv1.style.color = domainCheckInfo.result ? 'green' : 'red';
    addLatexElement(dcdiv1, domainCheckInfo.latex, 'Domain check:');
    */
    if (domainCheckInfo.result) {
        const latexEntries = _deriveStepsToLatex(entries);
        const resultEntry = latexEntries[latexEntries.length - 1];
        addLatexElement(o, latexEntries.join('='), "Calculation:");
        if (continueWithResult) {
            const table = _htmlElement('table', o);
            const tr = _htmlElement('tr', table);
            const td1 = _htmlElement('td', tr);
            td1.setAttribute("valign", "top");
            const td2 = _htmlElement('td', tr);
            td2.setAttribute("valign", "top");
            let selectObj = createSelectElement(td1, _trigInverseTrigOptions);
            let button = _htmlElement('input', td2);
            button.style.fontSize = '14pt';
            button.style.margin = "10px";
            button.value = "Apply Result";
            button.type = "button";
            const o2 = _htmlElement('div', o);
            button.addEventListener('click', () => {
                const trigFunction2 = selectObj.selected.value;
                console.log(`applying result to ${trigFunction2}`);
                let options = {
                    includeRangeSketch: true
                };
                o2.innerHTML = "";
                _singleTrigFunctionInternal(o2, trigFunction2, resultEntry, options);
            });
        }
        return { latexEntries, entries };
    }
    if (throwErrorOnDomainCheckFail) {
        throw "Domain check failed";
    }
}

const _getXYRLatexForTrigFunction = trigFunction => {
    switch (trigFunction) {
        case 'cos': return '\\frac{x}{r}';
        case 'sin': return '\\frac{y}{r}';
        case 'tan': return '\\frac{y}{x}';
        case 'sec': return '\\frac{r}{x}';
        case 'csc': return '\\frac{r}{y}';
        case 'cot': return '\\frac{x}{y}';
    }
}

const _getXYRNumericObjects = (trigFunction, value) => {
    var fractionObject = Numeric.createFromValue(value, true);
    if (['sec', 'csc'].includes(trigFunction)) {
        fractionObject = fractionObject.flipSign();
    }
    const { numerator, denominator } = fractionObject;
    var x, y, r;
    if (trigFunction === 'cos') {
        x = numerator, r = denominator;
    }
    if (trigFunction === 'sin') {
        y = numerator, r = denominator;
    }
    if (trigFunction === 'tan') {
        y = numerator, x = denominator;
    }
    if (trigFunction === 'sec') {
        r = numerator, x = denominator;
    }
    if (trigFunction === 'csc') {
        r = numerator, y = denominator;
    }
    if (trigFunction === 'cot') {
        x = numerator, y = denominator;
    }
    return { x, y, r };
}

const _getXYRLatexForTrigFunctionWithValues = (trigFunction, xnumeric, ynumeric, rnumeric) => {
    const x = ensureNumeric(xnumeric).toLatex();
    const y = ensureNumeric(ynumeric).toLatex();
    const r = ensureNumeric(rnumeric).toLatex();
    switch (trigFunction) {
        case 'cos': return `\\frac{${x}}{${r}}`;
        case 'sin': return `\\frac{${y}}{${r}}`;
        case 'tan': return `\\frac{${y}}{${x}}`;
        case 'sec': return `\\frac{${r}}{${x}}`;
        case 'csc': return `\\frac{${r}}{${y}}`;
        case 'cot': return `\\frac{${x}}{${y}}`;
    }
}

const _getTrigFunctionValueFromXYR = (trigFunction, x0, y0, r0) => {
    const x = _d(x0);
    const y = _d(y0);
    const r = _d(r0);
    switch (trigFunction) {
        case 'cos': return x.div(r);
        case 'sin': return y.div(r);
        case 'tan': return y.div(x);
        case 'sec': return r.div(x);
        case 'csc': return r.div(y);
        case 'cot': return x.div(y);
    }
}

const _addQuadrantTriangeFromTrigFunctionAndValue = (o, trigFunction, value) => {
    var quadrant = 0;
    switch (trigFunction) {
        case 'arccos':
            quadrant = value < 0 ? 2 : 1;
            break;
        case 'arcsin':
            quadrant = value < 0 ? 4 : 1;
            break;
        case 'arctan':
            quadrant = value < 0 ? 4 : 1;
            break;
        case 'arcsec':
            quadrant = value < 0 ? 2 : 1;
            break;
        case 'arccsc':
            quadrant = value < 0 ? 4 : 1;
            break;
        case 'arccot':
            quadrant = value < 0 ? 2 : 1;
            break;
    }
    console.log(`trigFunction: ${trigFunction}, quadrant: ${quadrant}, value<0: ${value<0}`)
    if (quadrant === 0) return;
    const imgsrc = `images/q${quadrant}-triangle.png`;
    const img = _htmlElement('img', o, null, 'trigfunction-range-sketch');
    img.setAttribute("src", imgsrc);
}

const _solveTrigInvTrig = (o, trigFunction2, trigFunction, latexValue) => {
    const { value } = evalLatexFormula(latexValue);
    const domainCheckInfo = _addDomainCheck(o, trigFunction, value, [], { includeRangeSketch: true });
    const trigLatex = _trigInvTrigToLatex(trigFunction);
    const trig2Latex = _trigInvTrigToLatex(trigFunction2);
    if (!domainCheckInfo.result) {
        _htmlElement('div', o, 'domain check failed, formula is undefined');
        return;
    }
    if (trigFunction2 === _getInverseTrigFunction(trigFunction)) {
        addLatexElement(o, `${trig2Latex} and ${trigLatex}\\text{&nbsp;cancel out:}`);
        let latex = `${trig2Latex}\\left(${trigLatex}\\left(${latexValue}\\right)\\right) = ${latexValue}`;
        addLatexElement(o, latex);
        return;
    }
    // reverse the inner formula:
    const invTrigFunction = _getInverseTrigFunction(trigFunction);
    const invTrigLatex = _trigInvTrigToLatex(invTrigFunction);
    var latex = `${trigLatex}\\left(${latexValue}\\right) = \\theta \\text{&nbsp;}\\Rightarrow\\text{&nbsp;}${invTrigLatex}\\theta = ${latexValue}`;
    latex += `= ${_getXYRLatexForTrigFunction(invTrigFunction)}`;
    addLatexElement(o, latex);
    const { x, y, r } = _getXYRNumericObjects(invTrigFunction, value);
    console.log('in:');
    console.log(`x = ${x ? x.toString() : '?'}`);
    console.log(`y = ${y ? y.toString() : '?'}`);
    console.log(`r = ${r ? r.toString() : '?'}`);
    const latexList = [];
    if (x) latexList.push(`x=${ensureNumeric(x).toLatex()}`);
    if (y) latexList.push(`y=${ensureNumeric(y).toLatex()}`);
    if (r) latexList.push(`r=${ensureNumeric(r).toLatex()}`);
    addLatexElement(o, latexList.join(';\\text{&nbsp;&nbsp;}'));
    _addQuadrantTriangeFromTrigFunctionAndValue(o, trigFunction, value);
    const signOfMissing = 1;
    const [x0, y0, r0] = _mayUsePythagoras(o, signOfMissing, x, y, r);
    console.log('out:');
    console.log(`x = ${x0 ? x0.toString() : '?'}`);
    console.log(`y = ${y0 ? y0.toString() : '?'}`);
    console.log(`r = ${r0 ? r0.toString() : '?'}`);
    const resultValue = _getTrigFunctionValueFromXYR(trigFunction2, x0, y0, r0);
    console.log(`result = ${resultValue}`);
    const resultNumeric = Numeric.createFromValue(resultValue);
    latex = `${trig2Latex}\\theta = ${_getXYRLatexForTrigFunction(trigFunction2)}`;
    latex += ` = ${_getXYRLatexForTrigFunctionWithValues(trigFunction2, x0, y0, r0)}`;
    latex += ` = ${resultNumeric.toLatex()}`;
    addLatexElement(o, latex);
}

function singleTrigFunction(trigFunction2, trigFunction, latexValue) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        // flag whether this is a sin(cos-1(x)) etc pattern:
        const trigInvTrigPattern = _isInverseTrigFunction(trigFunction) && _isRegularTrigFunction(trigFunction2);
        const includeRangeSketch = true;
        const continueWithResult = false;
        try {
            const { latexEntries } = _singleTrigFunctionInternal(o, trigFunction, latexValue, { includeRangeSketch, continueWithResult });
            if (typeof trigFunction2 === 'string') {
                const resultEntry = latexEntries[latexEntries.length - 1];
                console.log(`resultEntry: ${resultEntry}`);
                _htmlElement('div', o, "Applying outer function:");
                _singleTrigFunctionInternal(o, trigFunction2, resultEntry, { includeRangeSketch });
            }
        } catch (err) {
            if (trigInvTrigPattern && (String(err).indexOf(NotOnUnitCircleErrorPrefix) === 0)) {
                console.log(`trying to solve using x, y, r...`);
                addLatexElement(o, `${latexValue} \\text{&nbsp;is not on the unit circle}`);
                _solveTrigInvTrig(o, trigFunction2, trigFunction, latexValue);
            } else {
                throw err;
            }
        }
    } catch (err) {
        _addErrorElement(o, err);
        //throw err
    }
}

