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
                var td = _htmlElement('td', tr);
                const input = _htmlElement('input', td);
                input.term = term;
                _htmlElement('td', tr, ' or: calculate');
                td = _htmlElement('td', tr);
                const cbox = _htmlElement('input', td);
                cbox.addEventListener('click', () => {
                    if (cbox.checked) {
                        input.style.backgroundColor = '#dddddd';
                        input.disabled = true;
                    } else {
                        input.style.backgroundColor = 'white';
                        input.disabled = false;
                    }
                })
                cbox.type = 'checkbox';
                if (terms.length === 1) {
                    cbox.disabled = true;
                }
                input.getCalculateFlag = () => cbox.checked;
                return input;
            });
        }
        try {
            if (!solveResult) return;
            console.clear();
            console.log(eq);
            const { lhs, rhs } = eq;
            if (lhs.terms.length !== 2 && lhs.terms.length !== 1) {
                throw `formula not supported for stoichiometry question; lhs should have 1 or 2 terms`;
            }
            if (rhs.terms.length > 1) {
                _addErrorElement(o, "Warning: ignoring all but the first product term");
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
                try {
                    o2.innerHTML = "";
                    inputs.forEach(input => {
                        if (input.getCalculateFlag()) {
                            return;
                        }
                        const value = input.value.trim();
                        if (value.length === 0) {
                            input.value = 'nothing';
                        }
                    });
                    if (!inputs.every(input => {
                        const { term, value } = input;
                        console.log(`value for ${term.toString()}: ${value}`);
                        if (input.getCalculateFlag()) {
                            return true;
                        }
                        if (!isNaN(Number(value))) {
                            return true;
                        } else {
                            _addErrorElement(o2, `enter a number for the amount of ${term.toString()}`);
                        }
                    })) {
                        return;
                    }
                    const terms = inputs.map(({ term, value, getCalculateFlag }) => {
                        if (getCalculateFlag()) {
                            term.calculatedFlag = true;
                        } else {
                            const grams = _d(Number(value));
                            const mm = _d(term.getMolarMass())
                            const mols = grams.div(mm);
                            term.givenAmountGrams = grams;
                            term.givenAmountMols = mols;
                        }
                        return term;
                    });
                    const termsToBeCalculated = terms.filter(t => t.calculatedFlag);
                    if (termsToBeCalculated.length > 1) {
                        throw "you can only calculate at most one term";
                    }
                    const termToBeCalculated = termsToBeCalculated[0];
                    const hasTermTobeCalculated = !!termToBeCalculated;
                    _htmlElement('h3', o2, "Convert grams into mols");
                    terms.forEach(term => {
                        if (term.calculatedFlag) return;
                        const grams = term.givenAmountGrams;
                        const mols = term.givenAmountMols;
                        const mm = _d(term.getMolarMass());
                        const name = term.toString();
                        var latex = `${grams}\\text{g ${name}}\\cdot\\frac{1\\text{mol ${name}}}{${mm.toFixed(4)}\\text{g ${name}}}`;
                        latex += ` = ${mols.toFixed(4)} \\text{mols ${name} (given)}`;
                        addLatexElement(o2, latex, `for ${name}`);
                    })
                    //const restTerms = terms.slice();
                    //const term0 = restTerms.shift();
                    // this all assumes that #terms is 2
                    //const term1 = restTerms.shift();
                    const getTermsAndTitle = () => {
                        const getCalculatedTitle = (t0, t1) => {
                            var title = `Determine how many gram of ${t1.toString()} is needed to react with `;
                            title += `${t0.givenAmountGrams}g of ${t0.toString()}`
                            return title;
                        }
                        var title = "Determine limiting/excess reactant";
                        if (terms.length === 1) {
                            return { term0: terms[0], term1: null, title: null };
                        }
                        if (terms[0].calculatedFlag) {
                            return { term0: terms[1], term1: terms[0], title: getCalculatedTitle(terms[1], terms[0]) };
                        }
                        if (terms[1].calculatedFlag) {
                            title = getCalculatedTitle(terms[0], terms[1]);
                        }
                        return { term0: terms[0], term1: terms[1], title };
                    }
                    const { term0, term1, title } = getTermsAndTitle();
                    const bfactor0 = _d(term0.balancingFactor);
                    var limitingTerm, excessTerm;
                    if (term1) {
                        _htmlElement('h3', o2, title);
                        const bfactor1 = _d(term1.balancingFactor);
                        const term1MolsRequired = term0.givenAmountMols.mul(bfactor1).div(bfactor0);
                        const term1MolarMass = _d(term1.getMolarMass());
                        let latex = `${term0.givenAmountMols.toFixed(4)}\\text{mol ${term0.toString()}}\\cdot `;
                        latex += `\\frac{${bfactor1}\\text{mol ${term1.toString()}}}{${bfactor0} \\text{mol ${term0.toString()}}}`;
                        latex += ` = ${term1MolsRequired.toFixed(4)}\\text{mol ${term1.toString()} (required)}`;
                        addLatexElement(o2, latex);
                        if (term1.calculatedFlag) {
                            // doesn't matter
                            limitingTerm = term0;
                            excessTerm = term1;
                            let term1GramsRequired = term1MolsRequired.mul(term1MolarMass);
                            term1.givenAmountGrams = term1GramsRequired;
                            term1.givenAmountMols = term1MolsRequired;
                            let latex = `${term1MolsRequired.toFixed(4)}\\text{mol ${term1.toString()}}\\cdot `;
                            latex += `\\frac{${term1MolarMass}\\text{g ${term1.toString()}}}{1 \\text{mol ${term1.toString()}}}`;
                            latex += `= ${term1GramsRequired.toFixed(4)}\\text{g ${term1.toString()}}`;
                            addLatexElement(_htmlElement('div', o2, null, 'highlight-div'), latex);
                        } else {
                            const hldiv = _htmlElement('div', o2, null, 'highlight-div')
                            if (term1MolsRequired > term1.givenAmountMols) {
                                limitingTerm = term1;
                                excessTerm = term0;
                                addLatexElement(hldiv, `\\text{${term1.toString()} is limiting reactant, because mols required} > \\text{mols given}`);
                                addLatexElement(hldiv, `\\text{${term0.toString()} is excess reactant}`);
                            } else {
                                limitingTerm = term0;
                                excessTerm = term1;
                                addLatexElement(hldiv, `\\text{${term1.toString()} is excess reactant, because mols required} < \\text{mols given}`);
                                addLatexElement(hldiv, `\\text{${term0.toString()} is limiting reactant}`);
                            }
                        }
                    } else {
                        limitingTerm = term0;
                    }
                    _htmlElement('h3', o2, `Use the ${limitingTerm.toString()} to determine the product ${productTerm.toString()}`);
                    var molProduct, pname, gramProduct, ename, limName, bflim, bfexcess;
                    {
                        let mol1 = limitingTerm.givenAmountMols;
                        limName = limitingTerm.toString();
                        let bfProduct = _d(productTerm.balancingFactor);
                        pname = productTerm.toString();
                        bflim = _d(limitingTerm.balancingFactor);
                        molProduct = mol1.mul(bfProduct).div(bflim);
                        let latex = `${mol1.toFixed(4)}\\text{mol ${limName}}\\cdot`;
                        latex += `\\frac{${bfProduct}\\text{mol ${pname}}}{${bflim} \\text{mol ${limName}}}`;
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
                    if (!hasTermTobeCalculated && term1) {
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
                    }
                } catch (err) {
                    _addErrorElement(o, err);
                }
            });

        } catch (err) {
            _addErrorElement(o, err);
        }
    }
    balanceChemicalEquation.call(o, maxBalancingFactor, formula, callback);
}