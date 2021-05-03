class ChemicalLawContainer {
    constructor() {
        this.tileContainer = new TileContainer();
        this._toFixed = 3;
    }

    createUI(cont) {
        this.cont = cont;
        this.tileContainer.createUI(cont);
        this._addTiles();
        if (this.addSTPButton) {
            this._addSTPButton();
        }
        this._addContentBeforeGoButton(cont);
        this._addGoButton();
        this.resultContainer = _htmlElement('div', cont);
    }

    clearResultContainer() {
        this.resultContainer.innerHTML = "";
        return this.resultContainer;
    }

    _addTiles() {
    }

    _addContentBeforeGoButton(cont) {

    }

    _disp(num) {
        const { _toFixed } = this;
        return Number(_d(num).toFixed(_toFixed));
    }

    _valueObjToLatex({ numberValue, unit, formula }) {
        const _disp = this._disp.bind(this);
        const nstr = numberValue === null ? 'x' : _disp(numberValue);
        const unitStr = unit ? `\\text{&nbsp;}${unit}` : '';
        return `(${nstr}${unitStr})`;
    }

    _formulaToLatex(formula) {
        return formula.replaceAll(/([A-Za-z])([0-9]+)/g, '$1_{$2}')
    }

    getSigFigs() {
        const allInputValues = this.tileContainer.getAllValues(true);
        console.log(`all input values: %o`, allInputValues);
        const sigFigs = Math.max(...allInputValues.map(val => _getSigFigs(val)));
        console.log(`calculated sigFigs: ${sigFigs}`);
        return sigFigs;
    }

    process() {

    }

    getTile(id) {
        return this.tileContainer.getTile(id);
    }

    getValue(id) {
        return this.tileContainer.getValue(id);
    }

    getMissingValueTile(okIfNotOne = false) {
        const missingTiles = this.tileContainer.getMissingValueTiles();
        if (missingTiles.length !== 1) {
            if (okIfNotOne) {
                return null;
            }
            throw "Please leave only one field empty; the value will be calculated from the others";
        }
        return missingTiles[0];
    }

    getMissingValueTiles() {
        return this.tileContainer.getMissingValueTiles();
    }

    getAllNumberInputTiles() {
        return this.tileContainer.getAllNumberInputTiles();
    }

    _addGoButton() {
        const div = _htmlElement('div', this.cont);
        this.goButton = _htmlElement('input', div);
        this.goButton.type = "button";
        this.goButton.value = "Go";
        elemStyle(this.goButton, { fontSize: '18pt' })
        const safeProcess = () => {
            try {
                this.process.call(this);
            } catch (err) {
                _addErrorElement(this.resultContainer, err);
            }
        }
        this.goButton.addEventListener('click', safeProcess);
        this._addClearInputButton(div);
    }

    _addClearInputButton(div) {
        const b = _htmlElement('input', div);
        b.type = 'button';
        b.value = 'Clear';
        elemStyle(b, { fontSize: '18pt', marginLeft: '10px', float: 'right' })
        b.addEventListener('click', () => {
            this.tileContainer.clearAllTiles();
            this.clearResultContainer();
        });
    }

    setSTP() {
    }

    _addSTPButton() {
        const div = _htmlElement('div', this.cont);
        this.stpButton = _htmlElement('input', div);
        this.stpButton.type = "button";
        this.stpButton.value = "STP";
        elemStyle(this.stpButton, { fontSize: '18pt' })
        const safeProcess = () => {
            try {
                this.setSTP.call(this);
            } catch (err) {
                //_addErrorElement(this.resultContainer, err);
            }
        }
        this.stpButton.addEventListener('click', safeProcess);
    }

    _addOtherButtons(cont, functionsHash) {
        Object.keys(functionsHash).forEach(label => {
            let func = functionsHash[label];
            let b = _htmlElement('input', cont, null, 'big-button', { marginLeft: '10px' });
            b.type = 'button';
            b.value = label;
            b.addEventListener('click', () => {
                this.tileContainer.resetUI();
                this._addTiles();
                if (typeof func === 'function') {
                    func();
                }
            });
        });
    }

    _convertToSameUnit(o, category, ...valueObjs) {
        const _disp = this._disp.bind(this);
        let units = Object.keys(UnitConversionsMap[category]);
        let sortedValueObjs = valueObjs.sort((value1, value2) => {
            if (value1.numberValue === null) {
                return -1;
            }
            if (value2.numberValue === null) {
                return 1;
            }
            let index1 = units.indexOf(value1.unit);
            let index2 = units.indexOf(value2.unit);
            if (index1 < 0) throw `unit ${value1.unit} not found in category ${category}`;
            if (index2 < 0) throw `unit ${value2.unit} not found in category ${category}`;
            return index1 < index2 ? -1 : index1 > index2 ? 1 : 0;
        });
        console.log(sortedValueObjs);
        let fromUnit = sortedValueObjs[1].unit;
        let toUnit = sortedValueObjs[0].unit;
        if (fromUnit === toUnit) {
            console.log(`no unit conversion needed for ${fromUnit}`);
            return;
        }
        let value = sortedValueObjs[1].numberValue;
        console.log(`unit conversion needed for ${fromUnit} ==> ${toUnit}`);
        const convertInfo = convertUnit(fromUnit, toUnit, value, 1);
        _htmlElement('h4', o, `Unit conversion: ${_disp(value)} ${fromUnit} ==> ${toUnit}`);
        _addConversionTable(o, convertInfo);
        //console.log(convertInfo);
        sortedValueObjs[1].numberValue = _d(convertInfo.result);
        sortedValueObjs[1].unit = toUnit;
    }

    _convertToKelvin(o, t2) {
        if (t2.numberValue === null) return;
        const t1 = { numberValue: null, unit: 'K' };
        this._convertToSameUnit(o, 'temperature', t1, t2);
    }

    _convertToLiters(o, v2) {
        if (v2.numberValue === null) {
            v2.unit = 'L';
            return;
        }
        const v1 = { numberValue: null, unit: 'L' };
        this._convertToSameUnit(o, 'liquidVolume', v1, v2);
    }

    _convertToAtm(o, p2) {
        if (p2.numberValue === null) {
            p2.unit = 'atm';
            return;
        }
        const p1 = { numberValue: null, unit: 'atm' };
        this._convertToSameUnit(o, 'pressure', p1, p2);
    }

    _convertToGramPerLiter(o, d) {
        if (d.numberValue === null) {
            d.unit = 'g/L';
            return;
        }
        const d1 = { numberValue: null, unit: 'g/L' };
        this._convertToSameUnit(o, 'density', d1, d);
    }

    _convertToWeight(o, m, unit = 'g') {
        if (m.numberValue === null) {
            m.unit = unit;
            return;
        }
        const m1 = { numberValue: null, unit };
        this._convertToSameUnit(o, 'weight', m1, m);
    }

    _convertToGrams(o, m) {
        return this._convertToWeight(o, m, 'g');
    }

    _convertToKilograms(o, m) {
        return this._convertToWeight(o, m, 'kg');
    }

    _convertToMoles(o, valueObj) {
        const _disp = this._disp.bind(this);
        const _formulaToLatex = this._formulaToLatex.bind(this);
        const { numberValue, unit, formula, molarMass } = valueObj;
        console.log(valueObj);
        if (numberValue === null) {
            return;
        }
        if (unit === 'moles') {
            valueObj.moles = numberValue;
            return;
        }
        if (unit !== 'g') {
            throw `unit ${unit} not supported, please use "g"`;
        }
        const lformula = _formulaToLatex(formula)
        const gunit = `\\text{${unit}${formula}}`;
        var latex = `${_disp(numberValue)}${gunit} = \\frac{1\\text{mol}${lformula}}{${molarMass}${gunit}}`;
        const res = numberValue.div(_d(molarMass));
        latex += ` = ${_disp(res)}\\text{mol}${lformula}`;
        addLatexElement(o, latex);
        valueObj.numberValue = res;
        valueObj.unit = 'moles';
        valueObj.moles = res;
    }

    _convertMolesToMolarMassGrams(o, valueObj) {
        const _disp = this._disp.bind(this);
        const _formulaToLatex = this._formulaToLatex.bind(this);
        const { numberValue, unit, formula, molarMass } = valueObj;
        if (numberValue === null) {
            return;
        }
        if (unit === 'g') {
            // nothing to do
            return;
        }
        if (unit !== 'moles') {
            throw `unit ${unit} not supported; "moles" expected`;
        }
        const latex = `\\frac{${_disp(molarMass)}g ${_formulaToLatex(formula)}}{1 moles}`;
        addLatexElement(o, latex);
        return latex;
    }

}
