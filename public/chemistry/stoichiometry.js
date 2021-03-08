function stoichiometry(maxBalancingFactor, formula) {
    const o = this;
    o.style.fontSize = '18pt';
    const _d = n => new Decimal(n);
    const callback = (eq, solveResult) => {
        const molarMassOfTermUi = (t, div) => {
            const info = [];
            const mm = t.getMolarMass(info);
            const infoStrings = info.map(({ symbol, multiplier, atomicMass }) => {
                var s = "";
                if (multiplier !== 1) {
                    s += `${multiplier}-times `
                }
                s += `${symbol} (${atomicMass}g)`
                return s;
            });
            _htmlElement('div', div, `${t.toString()}: ${infoStrings.join(' + ')} = ${mm}g`);
        }
        const addInputsForReactants = terms => {
            _htmlElement('h3', o, "Given amounts:");
            const div = _htmlElement('div', o);
            const table = _htmlElement('table', div);
            return terms.map(term => {
                const tr = _htmlElement('tr', table);
                _htmlElement('td', tr, `Amount given in grams for ${term.toString()}:`);
                const td = _htmlElement('td', tr);
                const input = _htmlElement('input', td);
                input.term = term;
                return input;
            });
        }
        try {
            if (!solveResult) return;
            console.clear();
            console.log(eq);
            const { lhs, rhs } = eq;
            if (lhs.terms.length !== 2 || rhs.terms.length !== 1) {
                throw `formula not supported for stoichiometry question; lhs should have 2 terms, and rhs should have 1 term`;
            }
            const productTerm = rhs.terms[0];
            const allTerms = lhs.terms.concat(rhs.terms);
            _htmlElement('h3', o, 'Molar masses:');
            allTerms.forEach(t => {
                molarMassOfTermUi(t, o);
            });
            const inputs = addInputsForReactants(lhs.terms);
            const b = _htmlElement('button', o, 'Continue');
            const o2 = _htmlElement('div', o);
            b.addEventListener('click', () => {
                o2.innerHTML = "";
                inputs.forEach(input => {
                    const value = input.value.trim();
                    if (value.length === 0) {
                        input.value = 'nothing';
                    }
                });
                if (!inputs.every(input => {
                    const { term, value } = input;
                    console.log(`value for ${term.toString()}: ${value}`);
                    if (!isNaN(Number(value))) {
                        return true;
                    } else {
                        _addErrorElement(o2, `enter a number for the amount of ${term.toString()}`);
                    }
                })) {
                    return;
                }
                const terms = inputs.map(({ term, value }) => {
                    const grams = _d(Number(value));
                    const mm = _d(term.getMolarMass())
                    const mols = grams.div(mm);
                    term.givenAmountGrams = grams;
                    term.givenAmountMols = mols;
                    return term;
                });
                _htmlElement('h3', o2, "Convert grams into mols");
                terms.forEach(term => {
                    const grams = term.givenAmountGrams;
                    const mols = term.givenAmountMols;
                    const mm = _d(term.getMolarMass());
                    const name = term.toString();
                    var latex = `${grams}\\text{g ${name}}\\cdot\\frac{1\\text{mol ${name}}}{${mm.toFixed(4)}\\text{g ${name}}}`;
                    latex += ` = ${mols.toFixed(4)} \\text{mols ${name} (given)}`;
                    addLatexElement(o2, latex, `for ${name}`);
                })
                _htmlElement('h3', o2, "Determine limiting/excess reactant");
                const restTerms = terms.slice();
                const term0 = restTerms.shift();
                const bfactor0 = _d(term0.balancingFactor);
                // this all assumes that #terms is 2
                const t = restTerms.shift();
                var limitingTerm, excessTerm;
                {
                    const bf = _d(t.balancingFactor);
                    const molsRequired = term0.givenAmountMols.mul(bf).div(bfactor0);
                    let latex = `${term0.givenAmountMols.toFixed(4)}\\text{mol ${term0.toString()}}\\cdot `;
                    latex += `\\frac{${bf}\\text{mol ${t.toString()}}}{${bfactor0} \\text{mol ${term0.toString()}}}`;
                    latex += ` = ${molsRequired.toFixed(4)}\\text{mol ${t.toString()} (required)}`;
                    addLatexElement(o2, latex);
                    const hldiv = _htmlElement('div', o2, null, 'highlight-div')
                    if (molsRequired > t.givenAmountMols) {
                        limitingTerm = t;
                        excessTerm = term0;
                        addLatexElement(hldiv, `\\text{${t.toString()} is limiting reactant, because mols required} > \\text{mols given}`);
                        addLatexElement(hldiv, `\\text{${term0.toString()} is excess reactant}`);
                    } else {
                        limitingTerm = term0;
                        excessTerm = t;
                        addLatexElement(hldiv, `\\text{${t.toString()} is excess reactant, because mols required} < \\text{mols given}`);
                        addLatexElement(hldiv, `\\text{${term0.toString()} is limiting reactant}`);
                    }
                };
                _htmlElement('h3', o2, `Use the limiting reactant ${limitingTerm.toString()} to determine the product ${productTerm.toString()}`);
                var molProduct, pname, gramProduct, ename, limName, bflim, bfexcess;
                {
                    let mol1 = limitingTerm.givenAmountMols;
                    limName = limitingTerm.toString();
                    let bfProduct = _d(productTerm.balancingFactor);
                    pname = productTerm.toString();
                    bflim = _d(limitingTerm.balancingFactor);
                    molProduct = mol1.mul(bfProduct).div(bflim);
                    let latex = `${mol1.toFixed(4)}\\text{mol ${limName}}\\cdot`;
                    latex += `\\frac{${bfProduct}\\text{mol ${pname}}}{${bflim} mol ${limName}}`;
                    latex += ` = ${molProduct.toFixed(4)} \\text{mol ${pname}}`
                    addLatexElement(o2, latex);
                }
                _htmlElement('div', o2, `<b>Molar mass of ${pname}:</b>`);
                molarMassOfTermUi(productTerm, o2);
                _htmlElement('div', o2, `<em>Convert product to gram</em>`);
                {
                    let mm = _d(productTerm.getMolarMass());
                    gramProduct = molProduct.mul(mm);
                    let latex = `${molProduct.toFixed(4)} \\text{mol ${pname}}\\cdot`;
                    latex += `\\frac{${mm.toFixed(4)}\\text{g ${pname}}}{1 \\text{mol ${pname}}}`;
                    latex += ` = ${gramProduct.toFixed(4)} \\text{g ${pname}}`;
                    addLatexElement(o2, latex);
                }
                ename = excessTerm.toString();
                _htmlElement('h3', o2, `What's the excess mol/mass of the excess reactant ${ename}`);
                {
                    let limMol = limitingTerm.givenAmountMols;
                    let excessMol = excessTerm.givenAmountMols;
                    bfexcess = _d(excessTerm.balancingFactor);
                    let excessMolInProduct = limMol.mul(bfexcess).div(bflim);
                    let latex = `${limMol.toFixed(4)} \\text{mol ${limName}}\\cdot`;
                    let mmExcess = _d(excessTerm.getMolarMass());
                    latex += `\\frac{${bfexcess} \\text{mol ${ename}}}{${bflim} \\text{mol ${limName}}}`;
                    latex += ` = ${excessMolInProduct.toFixed(4)} \\text{mol ${ename}}`
                    addLatexElement(o2, latex, `mols of ${ename} used in product`);
                    _htmlElement('div', o2, `Determine the excess by subtracting this from the given amount in mol of ${ename}:`);
                    let excessDiffMol = excessMol.sub(excessMolInProduct);
                    let excessDiffGrams = excessDiffMol.mul(mmExcess);
                    addLatexElement(o2, `${excessMol.toFixed(4)}\\text{mol ${ename}} - ${excessMolInProduct.toFixed(4)}\\text{mol ${ename}} = ${excessDiffMol.toFixed(4)}\\text{mol ${ename}}`);
                    _htmlElement('div', o2, `<em>Convert to grams:</em>`);
                    latex = `${excessDiffMol.toFixed(4)}\\text{mol ${ename}}\\cdot `;
                    latex += `\\frac{${mmExcess.toFixed(4)}\\text{g ${ename}}}{1 \\text{mol ${ename}}}`;
                    latex += `= ${excessDiffGrams.toFixed(4)}\\text{g ${ename}}`;
                    addLatexElement(o2, latex, `excess amount of ${ename}`);
                }
            });

        } catch (err) {
            _addErrorElement(o, err);
        }
    }
    balanceChemicalEquation.call(o, maxBalancingFactor, formula, callback);
}