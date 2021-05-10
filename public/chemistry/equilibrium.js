const _includeChemicalTermInEquilibriumCalculation = t => {
    return !t.state || (t.state === 'gas' || t.state === 'aqueous');
}

function equilibriumGetDynamicParameters(maxBalancingFactor, formula) {
    const parameters = [];
    parameters.push({ name: 'K_eq', value: '', noEval: true });
    parameters.push({ separator: true });
    try {
        const eq = ChemicalEquation.createFromString(formula);
        if (!eq.checkStateInfo()) {
            throw "inconsistent state information for components";
        }
        console.clear();
        const terms = [];
        terms.push(...eq.lhs.terms);
        terms.push(...eq.rhs.terms);
        console.log(terms.map(t => t.toString()));
        terms.forEach(t => {
            console.log(t);
            if (!_includeChemicalTermInEquilibriumCalculation(t)) {
                return;
            }
            const name = `[${t.toString()}]`;
            const noEval = true;
            const value = '';
            parameters.push({ name, value, noEval });
            parameters.push({ separator: true });
        })
    } catch (err) {
        console.log(`%cchemical equation does not parse (yet): ${err}`, "color: magenta");
        throw err;
    }
    return parameters;
}

function equilibrium(maxBalancingFactor, formula, Keq, ...molarities) {
    const o = this;
    elemStyle(o, { fontSize: '18pt' });
    try {
        const viewOptions = { tableIsCollapsible: true, initialStateCollapsed: true };
        const callback = (eq, solveResult) => {
            try {
                const reactantTerms = eq.lhs.terms.filter(_includeChemicalTermInEquilibriumCalculation);
                const productTerms = eq.rhs.terms.filter(_includeChemicalTermInEquilibriumCalculation);
                const allTerms = [...reactantTerms, ...productTerms];
                if (molarities.length !== allTerms.length) {
                    throw `internal error: formula has ${allTerms.length} relevant terms, but number of molarities given is ${molarities.length}`;
                }
                const molaritiesList = [];
                const termsCnt = allTerms.length;
                for (let i = 0; i < termsCnt; i++) {
                    let term = allTerms[i];
                    let isReactant = reactantTerms.includes(term);
                    let molarity = molarities[i];
                    molaritiesList.push({ term, isReactant, molarity });
                }
                console.log('molaritiesList: %o', molaritiesList);
                const givenMolarities = molaritiesList.filter(minfo => minfo.molarity);
                const allNumberInputs = givenMolarities.map(minfo => minfo.molarity);
                if (Keq) allNumberInputs.push(Keq);
                console.log(`allNumberInputs: ${allNumberInputs}`)
                const sigFigs = Math.max(...allNumberInputs.map(_getSigFigs));
                const missingKeq = !Keq;
                const missingMolarities = molaritiesList.filter(minfo => !minfo.molarity);
                const getEquilibriumExpression = (insertValues, skipLhs, useQ) => {
                    const molarityTermsLatex = minfos => {
                        const joinStr = insertValues ? '\\cdot ' : '';
                        return minfos.length === 0 ? "1" : minfos.map(({ term, molarity }) => {
                            return insertValues
                                ? term.getMolarityTermLatex(molarity)
                                : term.getMolarityTermLatex();
                        }).join(joinStr);
                    }
                    const productMolarityTerms = molarityTermsLatex(molaritiesList.filter(minfo => !minfo.isReactant));
                    const reactantMolarityTerms = molarityTermsLatex(molaritiesList.filter(minfo => minfo.isReactant));
                    var lhs = skipLhs ? "" : useQ ? "Q = " : "K_{eq} = ";
                    if (!skipLhs && insertValues && !useQ && Keq) {
                        lhs = exponentialNumStringToLatex(Keq) + " = ";
                    }
                    return `${lhs}\\frac{${productMolarityTerms}}{${reactantMolarityTerms}}`;
                }
                const calculateEquilibriumExpression = (toExponential, getDecimal) => {
                    const reduceFun = (pvalue, { term, molarity }) => {
                        return pvalue.mul(term.getMolarityValue(molarity));
                    };
                    const numerator = molaritiesList
                        .filter(minfo => !minfo.isReactant)
                        .reduce(reduceFun, _d(1));
                    const denominator = molaritiesList
                        .filter(minfo => minfo.isReactant)
                        .reduce(reduceFun, _d(1));
                    var res = numerator.div(denominator);
                    if (getDecimal) {
                        return res;
                    }
                    res = res.toPrecision(sigFigs);
                    return toExponential ? exponentialNumStringToLatex(_d(res).toExponential()) : res;
                }
                const solveForMissing = (calculate) => {
                    const reduceFun = (pvalue, { term, molarity }) => {
                        return pvalue.mul(term.getMolarityValue(molarity));
                    };
                    const missingMolarity = missingMolarities[0];
                    if (!missingMolarity) throw "internal error";
                    const mlist = molaritiesList.filter(minfo => minfo.molarity);
                    const plist = mlist.filter(minfo => !minfo.isReactant)
                    const rlist = mlist.filter(minfo => minfo.isReactant)
                    const pterms = plist.map(({ term, molarity }) => term.getMolarityTermLatex(molarity));
                    const pvalue = plist.reduce(reduceFun, _d(1));
                    const rterms = rlist.map(({ term, molarity }) => term.getMolarityTermLatex(molarity));
                    const rvalue = rlist.reduce(reduceFun, _d(1));
                    var latex = 'x = ';
                    const term1 = (pterms.length === 0 ? "1" : pterms.join('\\cdot '));
                    const term1Value = pvalue;
                    const term2 = ([Keq, ...rterms]).join('\\cdot ');
                    const term2Value = rvalue.mul(_d(Keq));
                    const numerator = missingMolarity.isReactant ? term1 : term2;
                    const numeratorValue = missingMolarity.isReactant ? term1Value : term2Value;
                    const denominator = missingMolarity.isReactant ? term2 : term1;
                    const denominatorValue = missingMolarity.isReactant ? term2Value : term1Value;
                    const fterm = denominator === "1" ? numerator : `\\frac{${numerator}}{${denominator}}`;
                    const exponent = missingMolarity.term.coefficient;
                    latex += exponent === 1 ? fterm
                        : exponent === 2 ? `\\sqrt{${fterm}}`
                            : `\\sqrt[${exponent}]{${fterm}}`;
                    const res = numeratorValue.div(denominatorValue).pow(_d(1/exponent)).toPrecision(sigFigs);
                    latex += ' = ' + res;
                    latex += ' = ' + exponentialNumStringToLatex(_d(res).toExponential());
                    return latex;
                }
                const steps = ['&nbsp;'];
                if (missingMolarities.length === termsCnt) {
                    steps.push('Equilibrium Expression:')
                    steps.push({ latex: `${getEquilibriumExpression()}` });
                } else {
                    if (missingMolarities.length > 1) {
                        throw `unsupported: only one molarity value can be missing`;
                    }
                    steps.push(`<em style="font-size: smaller">Calculated sigFigs: ${sigFigs}</em>`);
                    if (missingMolarities.length === 1) {
                        //steps.push('<div style="color:cyan;padding:20px">TODO</div>');
                        let space = "\\text{&nbsp;&nbsp;}";
                        steps.push({ latex: `${getEquilibriumExpression()}${space}\\Rightarrow${space}${getEquilibriumExpression(true)}` });
                        steps.push({ latex: `${solveForMissing()}` })
                    }
                    else if (missingKeq) {
                        let latex = getEquilibriumExpression();
                        latex += ' = ' + getEquilibriumExpression(true, true);
                        latex += ' = ' + calculateEquilibriumExpression();
                        latex += ' = ' + calculateEquilibriumExpression(true);
                        steps.push({ latex });
                    }
                    else {
                        steps.push({ latex: `K_{eq} = ${Keq}`});
                        let latex = getEquilibriumExpression(false, false, true);
                        latex += ' = ' + getEquilibriumExpression(true, true);
                        latex += ' = ' + calculateEquilibriumExpression();
                        latex += ' = ' + calculateEquilibriumExpression(true);
                        steps.push({ latex });
                        const kvalue = _d(Keq);
                        const qvalue = calculateEquilibriumExpression(false, true);
                        if (qvalue.toPrecision(sigFigs) === kvalue.toPrecision(sigFigs)) {
                            latex = `Q = K_{eq}: \\text{&nbsp; the reaction is at equilibrium}`;
                        }
                        else if (qvalue.lt(kvalue)) {
                            latex = `Q < K_{eq}: \\text{&nbsp;the reaction will proceed in the forward direction (to the right)}`;
                        } 
                        else {
                            latex = `Q > K_{eq}: \\text{&nbsp;the reaction will proceed in the reverse direction (to the left)}`;
                        } 
                        steps.push({ latex });
                    }
                }
                _showComputationSteps(o, steps);
            } catch (err) {
                _addErrorElement(o, `*** ${err}`);
                throw err;
            }
        };
        balanceChemicalEquation.call(o, maxBalancingFactor, formula, callback, viewOptions);
    } catch (err) {
        _addErrorElement(o, `*** ${err}`);
        throw err;
    }
}