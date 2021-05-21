function calculator(formulaLatex) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        //var { ast, value } = evalLatexFormula(formulaLatex);
        var { value } = evalLatexFormulaWithContext(formulaLatex);
        //_htmlElement('pre', o, `value: ${value}`);
        value = _d(precision(value.toNumber(), 10));
        _htmlElement('pre', o, `value: ${value}`);
        const numeric = Numeric.createFromValue(value);
        addLatexElement(o, numeric.toLatex(), 'Numeric reverse lookup:');
        const trigFunctionsAngles = Angle.reverseLookupTrigFunctions(value, true);
        console.log(`trigFunctionsAngles:`);
        console.log(trigFunctionsAngles);
        if (Object.keys(trigFunctionsAngles).length === 0) {
            _htmlElement('div', o, 'No unit circle values found');
        } else {
            reverseUnitCircleLookup.call(o, formulaLatex, true, true, value);
        }
    } catch(err) {
        _addErrorElement(o, err);
        throw err;
    }
}