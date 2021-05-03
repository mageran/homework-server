function solutionConcentrationUI() {
    const lawsOptions = [
        {
            value: null,
            label: "Select the formula to work with..."
        },
        {
            value: 'Molarity',
            containerClass: MolarityContainer,
            label: div => {
                addLatexElement(div, `\\text{Molarity:&nbsp;} M = \\frac{\\text{moles of solute}}{\\text{liters of solution}}`);
            },
        },
        {
            value: 'Molality',
            containerClass: MolalityContainer,
            label: div => {
                addLatexElement(div, `\\text{Molality:&nbsp;} M = \\frac{\\text{moles of solute}}{\\text{kilograms of solvent}}`);
            },
        },
        {
            value: 'Mole fraction',
            containerClass: MoleFractionContainer,
            label: div => {
                addLatexElement(div, `\\text{Mole fraction:&nbsp;} M = \\frac{\\text{moles of component}}{\\text{total moles of solution}}`);
            },
        },
        {
            value: 'Dilution',
            containerClass: DilutionContainer,
            label: div => {
                addLatexElement(div, `\\text{Dilution:&nbsp;} {M_1}\\cdot{V_1} = {M_2}\\cdot{V_2}`);
            },
        },
    ];
    chemicalLawsUI(this, lawsOptions, { menuWidth: '500px', menuContainerWidth: '500px' });
}

class MolarityOrMolalityContainer extends ChemicalLawContainer {
    constructor() {
        super();
    }

    _addTiles() {
        const { tileContainer } = this;
        const labelStyle = this.labelStyle || { width: '220px', textAlign: 'right', display: 'inline-block' };
        tileContainer.addTile(new NumberInputTile('M', { label: 'M', labelIsLatex: true, labelStyle }));
        tileContainer.addTile(new MassOrMolesInputTile('MM', { label: '\\text{moles of solution}', labelIsLatex: true, labelStyle }));
        tileContainer.addTile(this.createTotalAmountInputTile(labelStyle));
        //tileContainer.addTile(new VolumeInputTile('V', { label: '\\text{volume of solute}', labelIsLatex: true, labelStyle }));
    }

    process() {
        const { totalAmountId } = this;
        const sigFigs = this.getSigFigs();
        const _disp = this._disp.bind(this);
        const _formulaToLatex = this._formulaToLatex.bind(this);
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, `(calculated sig figs: ${sigFigs})`);
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let m = this.getValue('M');
        let moles = this.getValue('MM');
        let v = this.getValue(totalAmountId);
        this._convertToMoles(o, moles);
        //this._convertToLiters(o, v);
        this.convertTotalAmount(o, v);
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === totalAmountId) {
            latex = `\\text{volume of solute&nbsp;} = \\frac{${_l(moles)}}{${_l(m)}}`;
            res = moles.numberValue.div(m.numberValue);
            unit = v.unit;
        }
        if (missingId === 'M') {
            latex = `M = \\frac{${_l(moles)}}{${_l(v)}}`;
            res = moles.numberValue.div(v.numberValue);
            unit = '';
        }
        if (missingId === 'MM') {
            if (moles.unit === 'moles') {
                latex = '\\text{Moles}';
            } else {
                latex = `\\text{Mass of&nbsp;}${_formulaToLatex(moles.formula)}`;
            }
            latex += `= ${_l(m)}\\cdot ${_l(v)}`;
            res = m.numberValue.mul(v.numberValue);
            unit = 'moles';
            if (moles.unit === 'g') {
                const molesValueObj = {
                    numberValue: res,
                    unit: 'moles',
                    formula: moles.formula,
                    molarMass: moles.molarMass
                };
                const latexConversionFraction = this._convertMolesToMolarMassGrams(o, molesValueObj);
                const mm = _d(moles.molarMass);
                if (mm) {
                    let cres = res.mul(mm);
                    let unitStr = ` \\text{&nbsp;}${moles.unit}${_formulaToLatex(moles.formula)}`;
                    convertedResult = `\\cdot ${latexConversionFraction} = ${_disp(cres)}${unitStr}`;
                    convertedResult += ` = ${cres.toPrecision(sigFigs)}${unitStr} \\text{&nbsp;(in ${sigFigs} sig figs)&nbsp;}`;
                }
            } else {
                if (moles.unit !== 'moles') throw `unit ${moles.unit} not supported here`;
            }
        }
        addLatexElement(o, latex + '=' + res.toPrecision(sigFigs) + `\\text{&nbsp;&nbsp;}${unit}${convertedResult}`);
    }
}

class MolarityContainer extends MolarityOrMolalityContainer {

    constructor() {
        super();
        this.totalAmountId = 'V';
    }

    convertTotalAmount(o, amountObj) {
        this._convertToLiters(o, amountObj);
    }

    createTotalAmountInputTile(labelStyle) {
        return new VolumeInputTile(this.totalAmountId, { label: '\\text{volume of solute}', labelIsLatex: true, labelStyle });
    }

}

class MolalityContainer extends MolarityOrMolalityContainer {

    constructor() {
        super();
        this.totalAmountId = 'Mass';
        this.labelStyle = { width: '250px', textAlign: 'right', display: 'inline-block' };
    }

    convertTotalAmount(o, amountObj) {
        this._convertToKilograms(o, amountObj);
    }

    createTotalAmountInputTile(labelStyle) {
        return new WeightInputTile(this.totalAmountId, { label: '\\text{weight of solvent}', labelIsLatex: true, labelStyle });
    }

}

class MoleFractionContainer extends ChemicalLawContainer {

    _addComponentTile() {
        const { tileContainer } = this;
        const labelStyle = this.labelStyle || { width: '280px', textAlign: 'right', display: 'inline-block' };
        const cnt = ((typeof this.tileCnt === 'number') ? this.tileCnt : -1) + 1;
        this.tileCnt = cnt;
        const tileId = `tile${cnt}`;
        const tile = new MassOrMolesInputTile(tileId, {
            alwaysShowFormula: true,
            label: '\\text{Component}',
            labelIsLatex: true,
            labelStyle
        });
        tile.isRemovable = true;
        tileContainer.addTile(tile);
        return tile;
    }

    _addTiles() {
        const labelStyle = this.labelStyle || { width: '280px', textAlign: 'right', display: 'inline-block' };
        const tile = new NumberInputTile('total', {
            label: '\\text{Total Moles of Solution}',
            labelIsLatex: true,
            labelStyle
        });
        this.tileContainer.addTile(tile);
        this._addComponentTile();
    }

    _enterTestValues1() {
        for (let i = 0; i < 2; i++) this._addComponentTile();
        const tiles = this.tileContainer.getAllNumberInputTiles();
        const [totalTile, SO2Tile, N2Tile, CO2Tile] = tiles;
        SO2Tile.input.value = "123.";
        SO2Tile.gasNameInput.value = "SO2";
        SO2Tile.selectValue('g');
        //N2Tile.input.value = "175.";
        N2Tile.gasNameInput.value = 'N2';
        N2Tile.selectValue('g');
        CO2Tile.input.value = "230.";
        CO2Tile.gasNameInput.value = "CO2";
        CO2Tile.selectValue('g');
        totalTile.input.value = 13.4;
    }

    _enterTestValues2() {
        for (let i = 0; i < 2; i++) this._addComponentTile();
        setTimeout(() => {
            const tiles = this.tileContainer.getAllNumberInputTiles();
            const [_, SO2Tile, N2Tile, CO2Tile] = tiles;
            SO2Tile.input.value = "123.";
            SO2Tile.gasNameInput.value = "SO2";
            SO2Tile.selectValue('g');
            N2Tile.input.value = "175.";
            N2Tile.gasNameInput.value = 'N2';
            N2Tile.selectValue('g');
            CO2Tile.input.value = "230.";
            CO2Tile.gasNameInput.value = "CO2";
            CO2Tile.selectValue('g');
        }, 200);
    }

    _addContentBeforeGoButton(cont) {
        const addButton = _htmlElement('input', cont, null, 'big-button');
        addButton.type = 'button';
        addButton.value = 'Add component';
        addButton.addEventListener('click', () => {
            this._addComponentTile();
        });
        const testFuns = {
            'Reset Input Fields': null,
            'Test: "component is missing"': this._enterTestValues1.bind(this),
            'Test: "total is missing"': this._enterTestValues2.bind(this),
        };
        this._addOtherButtons(cont, testFuns);
    }

    process() {
        const sigFigs = this.getSigFigs();
        const _disp = this._disp.bind(this);
        const _formulaToLatex = this._formulaToLatex.bind(this);
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, `(calculated sig figs: ${sigFigs})`);
        const missingTile = this.getMissingValueTile();
        const totalTile = this.getValue('total');
        const allComponentValues = this.getAllNumberInputTiles()
            .filter(tile => tile.id !== 'total')
            .map(tile => tile.getValue());
        var moleSum = _d(0);
        var moleSumLatex = '';
        allComponentValues.forEach(valueObj => {
            this._convertToMoles(o, valueObj);
            console.log(valueObj);
            if (valueObj.moles) {
                moleSum = moleSum.add(valueObj.moles);
                if (moleSumLatex.length > 0) {
                    moleSumLatex += ' + ';
                }
                moleSumLatex += `${_disp(valueObj.moles)}`;
            }
        });
        const _moleFractions = moleSum => {
            _htmlElement('div', o, 'Mole fractions:');
            allComponentValues.forEach(valueObj => {
                const { moles, formula } = valueObj;
                const res = moles.div(moleSum);
                var latex = `X_{${_formulaToLatex(formula)}} = \\frac{${_disp(moles)}}{${_disp(moleSum)}} = ${res.toPrecision(sigFigs)}`;
                addLatexElement(o, latex);
            });
        }
        if (missingTile.id === 'total') {
            missingTile.input.value = moleSum.toPrecision(sigFigs);
            let latex = `${moleSumLatex} = ${moleSum.toPrecision(sigFigs)}`;
            _htmlElement('div', o, 'Total moles:');
            addLatexElement(o, latex);
            _moleFractions(moleSum);
        } else {
            // the missing tile is one of the components
            const totalMoles = totalTile.numberValue;
            const missingValueObj = allComponentValues.filter(obj => obj.numberValue === null)[0];
            missingValueObj.moles = totalMoles.sub(moleSum);
            let latex = `${_disp(totalMoles)} - (${moleSumLatex}) = ${missingValueObj.moles.toPrecision(sigFigs)}`;
            latex += `\\text{&nbsp;mol}${_formulaToLatex(missingValueObj.formula)}`;
            _htmlElement('div', o, `Moles of ${missingValueObj.formula}:`);
            addLatexElement(o, latex);
            console.log('allComponentValues: %o', allComponentValues);
            _moleFractions(totalMoles);
            if (missingValueObj.unit === 'g') {
                _htmlElement('div', o, `Conversion into g ${missingValueObj.formula}:`);
                missingValueObj.unit = 'moles';
                missingValueObj.numberValue = missingValueObj.moles;
                let mass = missingValueObj.moles.mul(missingValueObj.molarMass);
                let conversionFraction = this._convertMolesToMolarMassGrams(_htmlElement('div'), missingValueObj);
                let latex = `${missingValueObj.moles.toPrecision(sigFigs)} moles \\cdot ${conversionFraction} = `
                latex += `${mass.toPrecision(sigFigs)}\\text{&nbsp;}g${_formulaToLatex(missingValueObj.formula)}`;
                addLatexElement(o, latex);
            } else {
                if (missingValueObj.unit !== 'moles') {
                    _htmlElement('div', o,
                        `conversion into "${missingValueObj.unit}" not supported; please use either "g" or "moles"`,
                        null, { color: 'magenta' });
                }
            }
        }
    }

}

class DilutionContainer extends ChemicalLawContainer {
    _addTiles() {
        const { tileContainer } = this;
        const labelStyle = this.labelStyle || { width: '80px', textAlign: 'right', display: 'inline-block' };
        const m1 = new NumberInputTile('M1', { label: 'M_1', labelIsLatex: true, labelStyle });
        const v1 = new VolumeInputTile('V1', { label: 'V_1', labelIsLatex: true, labelStyle });
        const m2 = new NumberInputTile('M2', { label: 'M_2', labelIsLatex: true, labelStyle });
        const v2 = new VolumeInputTile('V2', { label: 'V_2', labelIsLatex: true, labelStyle });
        this.valuePairs = [
            { m: m1, v: v1, index: 1 }, { m: m2, v: v2, index: 2 }
        ]
        const tiles = [m1, v1, m2, v2];
        tiles.forEach(tile => tileContainer.addTile(tile));
    }

    _addContentBeforeGoButton(cont) {
        const testFuns = {
            'test1': () => {
                this.getTile('M1').input.value = 0.45;
                this.getTile('V1').input.value = 175;
                this.getTile('V1').selectValue('mL');
                //this.getTile('M2').input.value = 1.0;
                this.getTile('V2').input.value = 250;
                this.getTile('V2').selectValue('mL');
            },
            'test2': () => {
                this.getTile('M1').input.value = 2.4;
                this.getTile('V1').input.value = 500;
                this.getTile('V1').selectValue('mL');
                this.getTile('M2').input.value = '1.0';
                this.getTile('V2').selectValue('mL');
            },
            'test3': () => {
                this.getTile('M1').input.value = '0.50';
                this.getTile('V1').input.value = 750;
                this.getTile('V1').selectValue('mL');
                //this.getTile('M2').input.value = 1.0;
                this.getTile('V2').input.value = 600;
                this.getTile('V2').selectValue('mL');
            },
            'test4': () => {
                this.getTile('V1').input.value = 750;
                this.getTile('V1').selectValue('mL');
                //this.getTile('M1').input.value = 1.0;
                this.getTile('M2').input.value = '0.50';
                this.getTile('V2').input.value = 600;
                this.getTile('V2').selectValue('mL');
            }
        }
        this._addOtherButtons(cont, testFuns);
    }

    process() {
        const { totalAmountId, valuePairs } = this;
        const sigFigs = this.getSigFigs();
        const _p = num => {
            return num.toPrecision(sigFigs);
        }
        const _disp = this._disp.bind(this);
        const _formulaToLatex = this._formulaToLatex.bind(this);
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        var missingMolarity = false;
        valuePairs.forEach(valuePair => {
            const { m, v } = valuePair;
            valuePair.isMissing = false;
            if (missingTile === m) {
                missingMolarity = true;
                valuePair.isMissing = true;
            }
            if (missingTile === v) {
                missingMolarity = false;
                valuePair.isMissing = true;
            }
        });
        const [missingPair] = valuePairs.filter(vp => vp.isMissing);
        const [otherPair] = valuePairs.filter(vp => !vp.isMissing);
        console.log('valuePairs: %o', valuePairs);
        const m1 = missingPair.m.getValue();
        const v1 = missingPair.v.getValue();
        const index1 = missingPair.index;
        const m2 = otherPair.m.getValue();
        const v2 = otherPair.v.getValue();
        const index2 = otherPair.index;
        const M1 = `M_${index1}`;
        const V1 = `V_${index1}`;
        const M2 = `M_${index2}`;
        const V2 = `V_${index2}`;
        var latex = "";
        if (missingMolarity) {
            let res = m2.numberValue.mul(v2.numberValue).div(v1.numberValue);
            latex = `${M1} = \\frac{${M2}\\cdot ${V2}}{${V1}}`;
            latex += `= \\frac{${_p(m2.numberValue)}\\cdot ${_p(v2.numberValue)}}{${_p(v1.numberValue)}}`;
            latex += `= ${_p(res)}`;
        } else {
            let res = m2.numberValue.mul(v2.numberValue).div(m1.numberValue);
            latex = `${V1} = \\frac{${M2}\\cdot ${V2}}{${M1}}`;
            latex += `= \\frac{${_p(m2.numberValue)}\\cdot ${_p(v2.numberValue)}}{${_p(m1.numberValue)}}`;
            latex += `= ${_p(res)}`;
        }
        addLatexElement(o, latex);
    }
}