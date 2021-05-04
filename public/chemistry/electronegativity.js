function electronegativityUI(formula) {
    const o = this;
    elemStyle(o, { fontSize: '18pt' });

    const _addENTable = enMap => {
        const table = _htmlElement('table', o, null, 'table-with-header');
        var tr = _htmlElement('tr', table);
        _htmlElement('th', tr, 'Element');
        _htmlElement('th', tr, 'EN');
        Object.keys(enMap).forEach(symbol => {
            const tr = _htmlElement('tr', table);
            _htmlElement('td', tr, symbol);
            _htmlElement('td', tr, String(enMap[symbol]));
        });
    }
    const _addBondTable = enMap => {
        const table = _htmlElement('table', o, null, 'table-with-header', { marginTop: '10px' });
        var tr = _htmlElement('tr', table);
        _htmlElement('th', tr, 'Bond');
        _htmlElement('th', tr, 'EN-difference');
        Object.keys(enMap).forEach(symbol => {
            const tr = _htmlElement('tr', table);
            _htmlElement('td', tr, symbol);
            _htmlElement('td', tr, String(enMap[symbol]));
        });
    }
    try {
        const term = ChemicalEquationTerm.createFromString(formula);
        const enMap = {};
        const symbols = term.getElementSymbols();
        symbols.forEach(symbol => {
            const en = electroNegativity(symbol);
            enMap[symbol] = en;
        });
        _addENTable(enMap);

        const bondMap = {};
        for(let indexes of allCombinations(0, symbols.length - 1, 2)) {
            if (!isSorted(indexes)) continue;
            let symbolPair = indexes.map(i => symbols[i]);
            let [sym1, sym2] = symbolPair;
            if (sym1 === sym2) continue;
            let bondStr = symbolPair.join(' - ');
            let enDiff = Number(Math.abs(enMap[sym1] - enMap[sym2]).toFixed(2));
            bondMap[bondStr] = enDiff;
        }
        console.log(bondMap);

        _addBondTable(bondMap);

    } catch (err) {
        _addErrorElement(o, err);
    }
}