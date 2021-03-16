function stoichiometryFindLimitingReactant(maxBalancingFactor, formula) {
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

// ---------------------------------------------------------------------------------------------------

const percentYieldUI = (cdiv, quantity) => {
    _htmlElement('h3', cdiv, "Percent yield:", 'bigSkip');
    const numberInput = _htmlElement('input', cdiv, null, 'number-input');
    numberInput.setAttribute('size', 18);
    numberInput.setAttribute('placeholder', `actual yield [${quantity.unitToString()}]`);
    const b = _htmlElement('input', cdiv);
    b.type = "button";
    b.value = "calculate Percent yield";
    const ydiv = _htmlElement('div', cdiv);
    b.addEventListener('click', () => {
        ydiv.innerHTML = '';
        try {
            const actual = new Decimal(numberInput.value);
            const eyield = new Decimal(quantity.numberToString())
            const pyield = actual.div(eyield).mul(100);
            const pyieldStr = pyield.toPrecision(3);
            var latex = `\\text{percent yield} = \\frac{${actual}}{${quantity.numberToString()}} = ${pyieldStr} \\text{%}`;
            addLatexElement(ydiv, latex);
        } catch (err) {
            _addErrorElement(cdiv, err);
        }
    });
}

// ---------------------------------------------------------------------------------------------------

const MOLES = 0;
const GRAMS = 1;
const LITERS = 2;
const MOLECULES = 3;

const PRODUCED_FROM = 4;
const NEEDED_TO_REACT_WITH = 5;
const NEEDED_TO_PRODUCE = 6;

const questionUnitOptions = [
    { label: 'moles', value: { unit: MOLES } },
    { label: 'grams', value: { unit: GRAMS } },
    { label: 'liters', value: { unit: LITERS } },
    { label: 'molecules', value: { unit: MOLECULES } }
]

const questionStartUnitOptions = [
    { label: 'How many moles', value: { unit: MOLES, verb: 'are' } },
    { label: 'How many grams', value: { unit: GRAMS, verb: 'are' } },
    { label: 'What mass', value: { unit: GRAMS, verb: 'is' } },
    { label: 'How many liters', value: { unit: LITERS, verb: 'are' } },
    { label: 'What volume', value: { unit: LITERS, verb: 'is' } },
    { label: 'How many molecules', value: { unit: MOLECULES, verb: 'are' } }
];

const questionVerbOptions = [
    { label: 'produced from', value: PRODUCED_FROM },
    { label: 'needed to react with', value: NEEDED_TO_REACT_WITH },
    { label: 'needed to produce', value: NEEDED_TO_PRODUCE }
]

function stoichiometryMissingQuantities(maxBalancingFactor, formula) {
    const o = this;
    o.style.fontSize = '18pt';
    const _d = n => new Decimal(n);
    const callback = (eq, solveResult) => {
        const reactantsOptions = eq.lhs.terms.map(t => {
            const label = `${t.toString()} (reactant)`;
            const value = { isReactant: true, isProduct: false, term: t };
            return { label, value };
        });
        const productsOptions = eq.rhs.terms.map(t => {
            const label = `${t.toString()} (product)`;
            const value = { isReactant: false, isProduct: true, term: t };
            return { label, value };
        });
        const allTermsOptions = [...reactantsOptions, ...productsOptions];
        const buildQuestionUi = () => {
            _htmlElement('h2', o, 'Construct question:');
            var verbSpan;
            const given = {};
            const requested = {};
            const qdiv = _htmlElement('div', o, null, 'stoichiometry-question');
            const selectQuestionStartHook = ({ value }) => {
                if (!verbSpan) return;
                verbSpan.innerHTML = value.verb;
            };
            requested.unitSelect = createSelectElement(qdiv, questionStartUnitOptions, selectQuestionStartHook);
            _htmlElement('span', qdiv, 'of', 'constant-text');
            requested.termSelect = createSelectElement(qdiv, allTermsOptions);
            const verb0 = questionStartUnitOptions[0].value.verb;
            verbSpan = _htmlElement('span', qdiv, verb0, 'constant-text');
            const questionSelect = createSelectElement(qdiv, questionVerbOptions);
            const numberInput = _htmlElement('input', qdiv, null, 'number-input');
            numberInput.setAttribute('size', 8);
            numberInput.setAttribute('placeholder', 'quantity');
            given.numberInput = numberInput;
            given.unitSelect = createSelectElement(qdiv, questionUnitOptions);
            _htmlElement('span', qdiv, 'of', 'constant-text');
            given.termSelect = createSelectElement(qdiv, allTermsOptions);
            _htmlElement('span', qdiv, '?', 'constant-text');
            return { given, requested, questionSelect };
        }
        const getValuesFromInputs = inputs => {
            const given = {
                unit: inputs.given.unitSelect.selected.value.unit,
                quantity: inputs.given.numberInput.value,
                term: inputs.given.termSelect.selected.value.term,
                termIsReactant: inputs.given.termSelect.selected.value.isReactant
            };
            const requested = {
                unit: inputs.requested.unitSelect.selected.value.unit,
                term: inputs.requested.termSelect.selected.value.term,
                termIsReactant: inputs.requested.termSelect.selected.value.isReactant
            };
            const question = inputs.questionSelect.selected;
            return { given, requested, question };

        }
        const checkValues = ({ given, requested, question }) => {
            if (given.term === requested.term) {
                throw "the two terms cannot be identical"
            }
            try {
                _d(given.quantity);
            } catch (err) {
                throw `quantity must be given as a number`;
            }
            switch (question.value) {
                case PRODUCED_FROM:
                    if (!given.termIsReactant) {
                        throw `"${question.label}" requires the given (second) term to be a reactant`
                    }
                    if (requested.termIsReactant) {
                        throw `"${question.label}" requires the requested (first) term to be a product`
                    }
                    break;
                case NEEDED_TO_REACT_WITH:
                    if (!given.termIsReactant) {
                        throw `"${question.label}" requires the given (second) term to be a reactant`
                    }
                    if (!requested.termIsReactant) {
                        throw `"${question.label}" requires the requested (first) term to be a reactant`
                    }
                    break;
                case NEEDED_TO_PRODUCE:
                    if (given.termIsReactant) {
                        throw `"${question.label}" requires the given (second) term to be a product`
                    }
                    if (!requested.termIsReactant) {
                        throw `"${question.label}" requires the requested (first) term to be a reactant`
                    }
                    break;
            }
        }
        var cdiv;
        const constructConversionChain = ({ given, requested, question }) => {
            const givenQuantity = new Quantity(given.quantity, given.unit, given.term);
            //console.log(`given quantity: ${givenQuantity.toString()}`);
            const ctable = new ConversionTile(givenQuantity);
            const convertToFromMoles = (unit, term) => {
                switch (unit) {
                    case GRAMS:
                        ctable.attach(new ConversionTileAtomicMass(term));
                        break;
                    case LITERS:
                        ctable.attach(new ConversionTileLiters(term));
                        break;
                    case MOLECULES:
                        ctable.attach(new ConversionTileMolecules(term));
                        break;
                    default:
                        throw `not yet implemented: unit ${Quantity.unitToString(unit)}`;
                }
            }
            // step 1 convert given to moles
            for (; ;) {
                let lunit = ctable.getLastUnit();
                if (lunit === MOLES) break;
                let lterm = ctable.getLastTerm();
                convertToFromMoles(lunit, lterm);
            }
            // setp 2: mole-to-mole conversion using the balancing coefficients of the terms
            ctable.attach(new ConversionTileMoles(given.term, requested.term));
            // step 3: convert moles to requested unit
            const runit = requested.unit;
            const rterm = requested.term;
            for (; ;) {
                let lunit = ctable.getLastUnit();
                if (lunit === runit) break;
                if (lunit !== MOLES) {
                    // should not happen
                    throw `conversion from ${Quantity.unitToString(lunit)} to ${Quantity.unitToString(runit)} not supported.`
                }
                convertToFromMoles(runit, rterm);
            }
            return ctable;
        }
        const constructConversionTable = (cdiv, ctable) => {
            const table = _htmlElement('table', cdiv, null, 'conversion-table');
            const tr1 = _htmlElement('tr', table);
            const tr2 = _htmlElement('tr', table);
            ctable.toHTMLTableCells(tr1, tr2);
        };
        const addCalculateButton = inputs => {
            const b = _htmlElement('input', o);
            b.type = "button";
            b.value = "Calculate";
            b.addEventListener('click', () => {
                cdiv.innerHTML = "";
                const values = getValuesFromInputs(inputs);
                console.log(values);
                try {
                    checkValues(values);
                    const ctable = constructConversionChain(values);
                    constructConversionTable(cdiv, ctable);
                    const resultQuantity = ctable.getResultQuantity();
                    if (resultQuantity.unit === GRAMS || resultQuantity.unit === LITERS) {
                        percentYieldUI(cdiv, resultQuantity);
                    }
                } catch (err) {
                    _addErrorElement(cdiv, err);
                    return;
                }
            });
        }
        const inputs = buildQuestionUi();
        addCalculateButton(inputs);
        cdiv = _htmlElement('div', o, null, 'conversion-table-container');
    }
    balanceChemicalEquation.call(o, maxBalancingFactor, formula, callback);
}

/**
 * Class representing a quantity of a term in the given unit (e.g. 15 g CO2).
 * Units are given using the constants introduced above.
 */
class Quantity {

    constructor(number, unit, term, precision) {
        this.number = new Decimal(number);
        if (unit === GRAMS || unit === LITERS) {
            this.precision = typeof precision === 'number' ? precision : Quantity.getSignificantFigures(String(number));
        }
        this.unit = unit;
        this.term = term;
    }

    static unitToString(unitId) {
        switch (unitId) {
            case MOLES:
                return 'mol';
            case LITERS:
                return 'L';
            case GRAMS:
                return 'g';
            case MOLECULES:
                return 'molec';
            default:
                return 'unknown unit'
        }
    }

    static getSignificantFigures(numberString) {
        const chars = numberString.split('');
        var cnt = 0;
        for (let i = 0; i < chars.length; i++) {
            let c = chars[i];
            if (c === '.') continue;
            if (!isNaN(Number(c))) {
                cnt++;
            }
            if (c === 'e' || c === 'E') {
                break;
            }
        }
        return cnt;
    }

    /**
     * checks whether this unit/term matches with the given ones
     * @param {Quantity} quantity 
     */
    compareUnits(quantity) {
        if (this.unit !== quantity.unit) {
            return false;
        }
        if (this.term !== quantity.term) {
            return false;
        }
        return true;
    }

    cancel() {
        this.isCanceled = true;
    }

    numberToString() {
        if (typeof this.precision === 'number') {
            return this.number.toPrecision(this.precision);
        }
        const s0 = this.number + "";
        const s1 = this.number.toNumber().toFixed(4);
        return s0.length < s1.length ? s0 : s1;
    }

    unitToString() {
        return `${Quantity.unitToString(this.unit)} ${this.term.toString()}`;
    }

    toString() {
        const nstr = this.numberToString();
        return `${nstr} ${this.unitToString()}`
    }

    toLatex() {
        const nstr = this.numberToString();
        return `${nstr} \\text{${this.unitToString()}}`;
    }

    toHTML(cont) {
        const span0 = _htmlElement('span', cont, null, 'unit-in-conversion-table');
        const span1 = _htmlElement('span', span0, this.numberToString());
        const span2a = _htmlElement('span', span0, null, this.isCanceled ? "unit-canceled unit" : "unit");
        const span2b = _htmlElement('span', span2a, this.unitToString(), "unit-text");
    }
}

class ConversionTile {

    constructor(quantity1, quantity2) {
        this.quantity1 = quantity1;
        this.quantity2 = quantity2;
        this.next = null;
        this.previous = null;
    }

    flip() {
        const q1 = this.quantity1;
        this.quantity1 = this.quantity2;
        this.quantity2 = q1;
    }

    getLast() {
        if (!this.next) {
            return this;
        }
        return this.next.getLast();
    }

    getFirst() {
        if (!this.previous) {
            return this;
        }
        return this.previous.getFirst();
    }

    getInitialQuantity() {
        return this.getFirst().quantity1;
    }

    getInitialPrecision() {
        return this.getInitialQuantity().precision;
    }

    getLastUnit() {
        return this.getLast().quantity1.unit;
    }

    getLastTerm() {
        return this.getLast().quantity1.term;
    }

    /**
     * attaches another conversion tile to this one.
     * @param {ConversionTile} conversionTile 
     */
    attach(conversionTile) {
        var ctile = this.getLast();
        var attachOk = false;
        if (ctile.quantity1.compareUnits(conversionTile.quantity2)) {
            attachOk = true;
        }
        else if (ctile.quantity1.compareUnits(conversionTile.quantity1)) {
            conversionTile.flip();
            attachOk = true;
        }
        if (attachOk) {
            ctile.quantity1.cancel();
            conversionTile.quantity2.cancel();
            ctile.next = conversionTile;
            conversionTile.previous = ctile;
            return conversionTile;
        }
        throw `error in conversion chain: ${ctile.toStringPair()} and ${conversionTile.toStringPair()} cannot be linked together`;
    }

    getResultQuantity(resultNumberSoFar) {
        if (!resultNumberSoFar) {
            resultNumberSoFar = new Decimal(1);
        }
        var newResult = resultNumberSoFar;
        if (this.quantity1) {
            newResult = newResult.mul(this.quantity1.number);
        }
        if (this.quantity2) {
            newResult = newResult.div(this.quantity2.number);
        }
        if (!this.next) {
            if (!this.quantity2.isCanceled) {
                throw `the bottom quantity of the last entry is not canceled; something went wrong`;
            }
            if (this.quantity1.isCanceled) {
                throw `the top quantity of the last entry is marked canceled; something went wrong`;
            }
            const unit = this.quantity1.unit;
            const term = this.quantity1.term;
            const number = newResult;
            const initialPrecision = this.getInitialPrecision();
            console.log(`initial precision: ${initialPrecision}`)
            return new Quantity(number, unit, term, initialPrecision);
        } else {
            if (!this.quantity1.isCanceled || (this.quantity2 && !this.quantity2.isCanceled)) {
                throw `unit in intermediate terms must cancel out; something went wrong`;
            }
            return this.next.getResultQuantity(newResult);
        }
    }

    toStringPair() {
        return [this.quantity1 ? this.quantity1.toString() : '', this.quantity2 ? this.quantity2.toString() : ''];
    }

    toHTMLTableCells(tr1, tr2) {
        const td1 = _htmlElement('td', tr1);
        const td2 = _htmlElement('td', tr2);
        if (this.quantity1) {
            this.quantity1.toHTML(td1);
        }
        if (this.quantity2) {
            this.quantity2.toHTML(td2);
        }
        if (this.next) {
            this.next.toHTMLTableCells(tr1, tr2);
        } else {
            const q = this.getFirst().getResultQuantity();
            const td = _htmlElement('td', tr1);
            td.style.borderWidth = "0px";
            td.setAttribute("rowspan", 2);
            td.setAttribute("valign", "middle");
            const eqspan = _htmlElement('span', td, "=");
            eqspan.style.margin = "5px";
            const rspan = _htmlElement('span', td);
            q.toHTML(rspan);
        }
    }
}

class ConversionTileAtomicMass extends ConversionTile {

    constructor(term) {
        const q1 = new Quantity(1, MOLES, term);
        const q2 = new Quantity(term.getMolarMass(), GRAMS, term);
        super(q1, q2);
    }

}

class ConversionTileLiters extends ConversionTile {

    constructor(term) {
        const q1 = new Quantity(1, MOLES, term);
        const q2 = new Quantity(22.4, LITERS, term);
        super(q1, q2);
    }

}

class ConversionTileMolecules extends ConversionTile {

    constructor(term) {
        const q1 = new Quantity(1, MOLES, term);
        const q2 = new Quantity("6.022E23", MOLECULES, term);
        super(q1, q2);
    }

}

class ConversionTileMoles extends ConversionTile {

    constructor(term1, term2) {
        const q1 = new Quantity(term1.balancingFactor, MOLES, term1);
        const q2 = new Quantity(term2.balancingFactor, MOLES, term2);
        super(q1, q2);
    }

}