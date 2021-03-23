


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
            addLatexElement(outputElem, info.domainLatex, 'Domain:');
            addLatexElement(outputElem, info.rangeLatex, 'Range:');
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

const initializeInverseTrigTable = () => {
    const trigTable = {
        arccos: {
            base: 'cos',
            latex: 'cos^{-1}',
            domainLatex: '[-1,1]', rangeLatex: '[0,\\pi]',
            angles: [0, 30, 45, 60, 90, 120, 135, 150, 180]
        },
        arcsin: {
            base: 'sin',
            latex: 'sin^{-1}',
            domainLatex: '[-1,1]', rangeLatex: '[-\\frac{\\pi}{2},\\frac{\\pi}{2}]',
            angles: [-90, -60, -45, -30, 0, 30, 45, 60, 90]
        },
        arctan: {
            base: 'tan',
            latex: 'tan^{-1}',
            domainLatex: '(-\\infinity, \\infinity)', rangeLatex: '(-\\frac{\\pi}{2},\\frac{\\pi}{2})',
            angles: [-60, -45, -30, 0, 30, 45, 60]
        },
        arccot: {
            base: 'cot',
            latex: 'cot^{-1}',
            domainLatex: '(-\\infinity, \\infinity)', rangeLatex: '[0,\\pi]',
            angles: [30, 45, 60, 90, 120, 135, 150]
        },
        arcsec: {
            base: 'sec',
            latex: 'sec^{-1}',
            domainLatex: '(-\\infinity, -1] \\cup [1,\\infinity)',
            rangeLatex: '[0,\\frac{\\pi}{2})\\cup(\\frac{\\pi}{2},\\pi]',
            angles: [0, 30, 45, 60, 120, 135, 150, 180]
        },
        arccsc: {
            base: 'csc',
            latex: 'csc^{-1}',
            domainLatex: '(-\\infinity, -1] \\cup [1,\\infinity)',
            rangeLatex: '[-\\frac{\\pi}{2},0)\\cup(0,\\frac{\\pi}{2}]',
            angles: [-90, -60, -45, -30, 30, 45, 60, 90]
        }
    }
    Object.keys(trigTable).forEach(fn => {
        const { base, angles } = trigTable[fn];
        trigTable[fn].values = [];
        angles.forEach(degree => {
            const angle = Angle.fromDegree(degree);
            const value = angle[base];
            trigTable[fn].values.push({ value, angle });
        })
    })
    console.log(trigTable);
    return trigTable;
}