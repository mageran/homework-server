

function gasLaws() {
    const gasLawsOptions = [
        {
            value: null,
            label: "Select the Gas Law to work with..."
        },
        {
            value: 'boyle',
            containerClass: BoylesLawContainer,
            label: div => {
                addLatexElement(div, `\\text{Boyle's law:&nbsp;} P_1\\cdot V_1 = P_2\\cdot V_2`);
            },
        },
        {
            value: 'charles',
            containerClass: CharlesLawContainer,
            label: div => {
                addLatexElement(div, `\\text{Charles's law:&nbsp;} \\frac{V_1}{T_1} = \\frac{V_2}{T_2}`);
            },
        },
        {
            value: 'gay-lussac',
            containerClass: GayLussacLawContainer,
            label: div => {
                addLatexElement(div, `\\text{Gay-Lussac's law:&nbsp;} \\frac{P_1}{T_1} = \\frac{P_2}{T_2}`);
            },
        },
        {
            value: 'combined',
            containerClass: CombinedLawContainer,
            label: div => {
                addLatexElement(div, `\\text{Combined law:&nbsp;} \\frac{P_1\\cdot V_1}{T_1} = \\frac{P_2\\cdot V_2}{T_2}`);
            },
        },
        {
            value: 'avogadro',
            containerClass: AvogardosLawContainer,
            label: div => {
                addLatexElement(div, `\\text{Avogadro's law:&nbsp;} \\frac{V_1}{n_1} = \\frac{V_2}{n_2}`);
            },
        },
        {
            value: 'ideal',
            containerClass: IdealGasLawContainer,
            label: div => {
                addLatexElement(div, `\\text{Ideal gas law:&nbsp;} PV = nRT`);
            },
        },
        {
            value: 'density',
            containerClass: GasDensityContainer,
            label: div => {
                addLatexElement(div, `\\text{Gas density:&nbsp;} d = \\frac{P\\cdot\\text{molar-mass}}{RT}`);
            },
        }
    ];
    chemicalLawsUI(this, gasLawsOptions);
}


class BoylesLawContainer extends ChemicalLawContainer {
    constructor() {
        super();
    }

    _addTiles() {
        const { tileContainer } = this;
        tileContainer.addTile(new PressureInputTile('P1', { label: 'P_1', labelIsLatex: true }));
        tileContainer.addTile(new VolumeInputTile('V1', { label: 'V_1', labelIsLatex: true }));
        tileContainer.addTile(new PressureInputTile('P2', { label: 'P_2', labelIsLatex: true }));
        tileContainer.addTile(new VolumeInputTile('V2', { label: 'V_2', labelIsLatex: true }));
    }

    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Boyle's Law");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let p1 = this.getValue('P1');
        let p2 = this.getValue('P2');
        let v1 = this.getValue('V1');
        let v2 = this.getValue('V2');
        this._convertToSameUnit(o, 'pressure', p1, p2);
        this._convertToSameUnit(o, 'liquidVolume', v1, v2);
        var latex = `${_l(p1)}${_l(v1)} = ${_l(p2)}${_l(v2)}`;
        addLatexElement(o, latex);
        var res;
        var unit;
        if (missingId === 'P1') {
            latex = `P_1 = \\frac{${_l(p2)}${_l(v2)}}{${_l(v1)}}`;
            res = p2.numberValue.mul(v2.numberValue).div(v1.numberValue);
            unit = p1.unit;
        }
        if (missingId === 'P2') {
            latex = `P_2 = \\frac{${_l(p1)}${_l(v1)}}{${_l(v2)}}`;
            res = p1.numberValue.mul(v1.numberValue).div(v2.numberValue);
            unit = p2.unit;
        }
        if (missingId === 'V1') {
            latex = `V_1 = \\frac{${_l(p2)}${_l(v2)}}{${_l(p1)}}`;
            res = p2.numberValue.mul(v2.numberValue).div(p1.numberValue);
            unit = v1.unit;
        }
        if (missingId === 'V2') {
            latex = `V_2 = \\frac{${_l(p1)}${_l(v1)}}{${_l(p2)}}`;
            res = p1.numberValue.mul(v1.numberValue).div(p2.numberValue);
            unit = v2.unit;
        }
        addLatexElement(o, latex + '=' + res + `\\text{${unit}}`);
    }
}

class CharlesLawContainer extends ChemicalLawContainer {
    constructor() {
        super();
    }

    _addTiles() {
        const { tileContainer } = this;
        tileContainer.addTile(new VolumeInputTile('V1', { label: 'V_1', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T1', { label: 'T_1', labelIsLatex: true }));
        tileContainer.addTile(new VolumeInputTile('V2', { label: 'V_2', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T2', { label: 'T_2', labelIsLatex: true }));
    }
    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Charles's Law");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let t1 = this.getValue('T1');
        let t2 = this.getValue('T2');
        let v1 = this.getValue('V1');
        let v2 = this.getValue('V2');
        this._convertToKelvin(o, t1);
        this._convertToKelvin(o, t2);
        this._convertToSameUnit(o, 'liquidVolume', v1, v2);
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === 'V1') {
            latex = `V_1 = \\frac{${_l(v2)}${_l(t1)}}{${_l(t2)}}`;
            res = v2.numberValue.mul(t1.numberValue).div(t2.numberValue);
            unit = v1.unit;
        }
        if (missingId === 'V2') {
            latex = `V_2 = \\frac{${_l(v1)}${_l(t2)}}{${_l(t1)}}`;
            res = v1.numberValue.mul(t2.numberValue).div(t1.numberValue);
            unit = v2.unit;
        }
        if (missingId === 'T1') {
            latex = `T_1 = \\frac{${_l(v1)}${_l(t2)}}{${_l(v2)}}`;
            res = v1.numberValue.mul(t2.numberValue).div(v2.numberValue);
            unit = 'K';
            const info = convertUnit('K', t1.unit, res);
            convertedResult = ` = ${info.result} ${t1.unit}`;
        }
        if (missingId === 'T2') {
            latex = `T_2 = \\frac{${_l(v2)}${_l(t1)}}{${_l(v1)}}`;
            res = v2.numberValue.mul(t1.numberValue).div(v1.numberValue);
            unit = 'K';
            const info = convertUnit('K', t2.unit, res);
            convertedResult = ` = ${info.result} ${t2.unit}`;
        }
        addLatexElement(o, latex + '=' + res + `\\text{${unit}}${convertedResult}`);
    }
}

class AvogardosLawContainer extends ChemicalLawContainer {
    constructor() {
        super();
    }

    _addTiles() {
        const { tileContainer } = this;
        tileContainer.addTile(new VolumeInputTile('V1', { label: 'V_1', labelIsLatex: true }));
        tileContainer.addTile(new MassOrMolesInputTile('n1', { label: 'n_1', labelIsLatex: true }));
        tileContainer.addTile(new VolumeInputTile('V2', { label: 'V_2', labelIsLatex: true }));
        tileContainer.addTile(new MassOrMolesInputTile('n2', { label: 'n_2', labelIsLatex: true }));
    }
    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Charles's Law");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let n1 = this.getValue('n1');
        let n2 = this.getValue('n2');
        let v1 = this.getValue('V1');
        let v2 = this.getValue('V2');
        this._convertToSameUnit(o, 'liquidVolume', v1, v2);
        this._convertToMoles(o, n1);
        this._convertToMoles(o, n2);
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === 'V1') {
            latex = `V_1 = \\frac{${_l(v2)}${_l(n1)}}{${_l(n2)}}`;
            res = v2.numberValue.mul(n1.numberValue).div(n2.numberValue);
            unit = v1.unit;
        }
        if (missingId === 'V2') {
            latex = `V_2 = \\frac{${_l(v1)}${_l(n2)}}{${_l(n1)}}`;
            res = v1.numberValue.mul(n2.numberValue).div(n1.numberValue);
            unit = v2.unit;
        }
        if (missingId === 'n1') {
            latex = `n_1 = \\frac{${_l(v1)}${_l(n2)}}{${_l(v2)}}`;
            res = v1.numberValue.mul(n2.numberValue).div(v2.numberValue);
            unit = 'moles';
            let n = n1;
            if (n.unit === 'g') {
                console.log(n);
                const mm = _d(n.molarMass);
                if (mm) {
                    let cres = res.mul(mm);
                    convertedResult = `= ${cres} \\text{${n.unit}${n.formula}}`;
                }
            } else {
                if (n.unit !== 'moles') throw `unit ${n.unit} not supported here`;
            }
        }
        if (missingId === 'n2') {
            latex = `n_2 = \\frac{${_l(v2)}${_l(n1)}}{${_l(v1)}}`;
            res = v2.numberValue.mul(n1.numberValue).div(v1.numberValue);
            unit = 'moles';
            let n = n2;
            if (n.unit === 'g') {
                console.log(n);
                const mm = _d(n.molarMass);
                if (mm) {
                    let cres = res.mul(mm);
                    convertedResult = `= ${cres} \\text{${n.unit}${n.formula}}`;
                }
            } else {
                if (n.unit !== 'moles') throw `unit ${n.unit} not supported here`;
            }
        }
        addLatexElement(o, latex + '=' + res + `\\text{${unit}}${convertedResult}`);
    }
}

class GayLussacLawContainer extends ChemicalLawContainer {
    constructor() {
        super();
    }

    _addTiles() {
        const { tileContainer } = this;
        tileContainer.addTile(new PressureInputTile('P1', { label: 'P_1', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T1', { label: 'T_1', labelIsLatex: true }));
        tileContainer.addTile(new PressureInputTile('P2', { label: 'P_2', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T2', { label: 'T_2', labelIsLatex: true }));
    }
    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Gay Lussac's Law");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let t1 = this.getValue('T1');
        let t2 = this.getValue('T2');
        let p1 = this.getValue('P1');
        let p2 = this.getValue('P2');
        this._convertToKelvin(o, t1);
        this._convertToKelvin(o, t2);
        this._convertToSameUnit(o, 'pressure', p1, p2);
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === 'P1') {
            latex = `P_1 = \\frac{${_l(p2)}${_l(t1)}}{${_l(t2)}}`;
            res = p2.numberValue.mul(t1.numberValue).div(t2.numberValue);
            unit = p1.unit;
        }
        if (missingId === 'P2') {
            latex = `P_2 = \\frac{${_l(p1)}${_l(t2)}}{${_l(t1)}}`;
            res = p1.numberValue.mul(t2.numberValue).div(t1.numberValue);
            unit = p2.unit;
        }
        if (missingId === 'T1') {
            latex = `T_1 = \\frac{${_l(p1)}${_l(t2)}}{${_l(p2)}}`;
            res = p1.numberValue.mul(t2.numberValue).div(p2.numberValue);
            unit = 'K';
            const info = convertUnit('K', t1.unit, res);
            convertedResult = ` = ${info.result} ${t1.unit}`;
        }
        if (missingId === 'T2') {
            latex = `T_2 = \\frac{${_l(p2)}${_l(t1)}}{${_l(p1)}}`;
            res = p2.numberValue.mul(t1.numberValue).div(p1.numberValue);
            unit = 'K';
            const info = convertUnit('K', t2.unit, res);
            convertedResult = ` = ${info.result} ${t2.unit}`;
        }
        addLatexElement(o, latex + '=' + res + `\\text{${unit}}${convertedResult}`);
    }
}

class CombinedLawContainer extends ChemicalLawContainer {
    constructor() {
        super();
    }

    _addTiles() {
        const { tileContainer } = this;
        tileContainer.addTile(new PressureInputTile('P1', { label: 'P_1', labelIsLatex: true }));
        tileContainer.addTile(new VolumeInputTile('V1', { label: 'V_1', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T1', { label: 'T_1', labelIsLatex: true }));
        tileContainer.addTile(new PressureInputTile('P2', { label: 'P_2', labelIsLatex: true }));
        tileContainer.addTile(new VolumeInputTile('V2', { label: 'V_2', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T2', { label: 'T_2', labelIsLatex: true }));
    }
    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Combined Gas Law");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let t1 = this.getValue('T1');
        let t2 = this.getValue('T2');
        let p1 = this.getValue('P1');
        let p2 = this.getValue('P2');
        let v1 = this.getValue('V1');
        let v2 = this.getValue('V2');
        this._convertToKelvin(o, t1);
        this._convertToKelvin(o, t2);
        this._convertToSameUnit(o, 'pressure', p1, p2);
        this._convertToSameUnit(o, 'liquidVolume', v1, v2);
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === 'P1') {
            latex = `P_1 = \\frac{${_l(p2)}${_l(v2)}${_l(t1)}}{${_l(t2)}${_l(v1)}}`;
            res = p2.numberValue.mul(v2.numberValue).mul(t1.numberValue)
                .div(t2.numberValue.mul(v1.numberValue));
            unit = p1.unit;
        }
        if (missingId === 'V1') {
            latex = `V_1 = \\frac{${_l(p2)}${_l(v2)}${_l(t1)}}{${_l(t2)}${_l(p1)}}`;
            res = p2.numberValue.mul(v2.numberValue).mul(t1.numberValue)
                .div(t2.numberValue.mul(p1.numberValue));
            unit = p1.unit;
        }
        if (missingId === 'T1') {
            latex = `T_1 = \\frac{${_l(p1)}${_l(v1)}${_l(t2)}}{${_l(p2)}${_l(v2)}}`;
            res = p1.numberValue.mul(v1.numberValue).mul(t2.numberValue)
                .div(p2.numberValue.mul(v2.numberValue));
            unit = 'K';
            const info = convertUnit('K', t1.unit, res);
            convertedResult = ` = ${info.result} ${t1.unit}`;
        }
        if (missingId === 'P2') {
            latex = `P_2 = \\frac{${_l(p1)}${_l(v1)}${_l(t2)}}{${_l(t1)}${_l(v2)}}`;
            res = p1.numberValue.mul(v1.numberValue).mul(t2.numberValue)
                .div(t1.numberValue.mul(v2.numberValue));
            unit = p1.unit;
        }
        if (missingId === 'V2') {
            latex = `V_2 = \\frac{${_l(p1)}${_l(v1)}${_l(t2)}}{${_l(t1)}${_l(p2)}}`;
            res = p1.numberValue.mul(v1.numberValue).mul(t2.numberValue)
                .div(t1.numberValue.mul(p2.numberValue));
            unit = p1.unit;
        }
        if (missingId === 'T2') {
            latex = `T_2 = \\frac{${_l(p2)}${_l(v2)}${_l(t1)}}{${_l(p1)}${_l(v1)}}`;
            res = p2.numberValue.mul(v2.numberValue).mul(t1.numberValue)
                .div(p1.numberValue.mul(v1.numberValue));
            unit = 'K';
            const info = convertUnit('K', t2.unit, res);
            convertedResult = ` = ${info.result} ${t2.unit}`;
        }
        addLatexElement(o, latex + '=' + res + `\\text{${unit}}${convertedResult}`);
    }
}

class IdealGasLawContainer extends ChemicalLawContainer {
    constructor() {
        super();
        this.addSTPButton = true;
    }

    _addTiles() {
        const { tileContainer } = this;
        tileContainer.addTile(new PressureInputTile('P', { label: 'P', labelIsLatex: true }));
        tileContainer.addTile(new VolumeInputTile('V', { label: 'V', labelIsLatex: true }));
        tileContainer.addTile(new MassOrMolesInputTile('n', { label: 'n', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T', { label: 'T', labelIsLatex: true }));
    }

    setSTP() {
        const ptile = this.getTile('P');
        ptile.setInputValues(1, "atm");
        const ttile = this.getTile('T');
        ttile.setInputValues(0, "C")
    }

    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Ideal Gas Law");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let p = this.getValue('P');
        let v = this.getValue('V');
        let n = this.getValue('n');
        let t = this.getValue('T');
        this._convertToKelvin(o, t);
        this._convertToMoles(o, n);
        this._convertToLiters(o, v);
        var r = { numberValue: _d(0.0821), unit: 'atm*L/(mol*K)' };
        if (p.unit === 'kPa') {
            r.numberValue = _d(8.314);
            r.unit = 'kPa*L/(mol*K)';
        }
        else if (p.unit === 'torr') {
            r.numberValue = _d(62.4);
            r.unit = 'torr*L/(mol*K)';
        }
        else {
            this._convertToAtm(o, p);
        }
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === 'P') {
            latex = `P = \\frac{${_l(n)}${_l(r)}${_l(t)}}{${_l(v)}}`;
            res = n.numberValue.mul(r.numberValue).mul(t.numberValue)
                .div(v.numberValue);
            unit = p.unit;
        }
        if (missingId === 'V') {
            latex = `V = \\frac{${_l(n)}${_l(r)}${_l(t)}}{${_l(p)}}`;
            res = n.numberValue.mul(r.numberValue).mul(t.numberValue)
                .div(p.numberValue);
            unit = v.unit;
        }
        if (missingId === 'n') {
            latex = `n = \\frac{${_l(p)}${_l(v)}}{${_l(r)}${_l(t)}}`;
            res = p.numberValue.mul(v.numberValue)
                .div(r.numberValue.mul(t.numberValue));
            unit = 'moles';
            if (n.unit === 'g') {
                console.log(n);
                const mm = _d(n.molarMass);
                if (mm) {
                    let cres = res.mul(mm);
                    convertedResult = `= ${cres} \\text{${n.unit}${n.formula}}`;
                }
            } else {
                if (n.unit !== 'moles') throw `unit ${n.unit} not supported here`;
            }
        }
        if (missingId === 'T') {
            latex = `t = \\frac{${_l(p)}${_l(v)}}{${_l(r)}${_l(n)}}`;
            console.log(latex);
            res = p.numberValue.mul(v.numberValue)
                .div(r.numberValue.mul(n.numberValue));
            unit = 'K';
            const info = convertUnit('K', t.unit, res);
            convertedResult = ` = ${info.result} ${t.unit}`;
        }
        addLatexElement(o, latex + '=' + res + `\\text{${unit}}${convertedResult}`);
    }
}

class GasDensityContainer extends ChemicalLawContainer {
    constructor() {
        super();
        this.addSTPButton = true;
    }

    _addTiles() {
        const { tileContainer } = this;
        tileContainer.addTile(new DensityInputTile('d', { label: 'd', labelIsLatex: true }));
        tileContainer.addTile(new PressureInputTile('P', { label: 'P', labelIsLatex: true }));
        tileContainer.addTile(new MolarMassInputTile('m', { label: 'm', labelIsLatex: true }));
        tileContainer.addTile(new TemperatureInputTile('T', { label: 'T', labelIsLatex: true }));
    }

    setSTP() {
        const ptile = this.getTile('P');
        ptile.setInputValues(1, "atm");
        const ttile = this.getTile('T');
        ttile.setInputValues(0, "C")
    }

    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Gas Density");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let p = this.getValue('P');
        let d = this.getValue('d');
        let m = this.getValue('m');
        let t = this.getValue('T');
        this._convertToKelvin(o, t);
        this._convertToGrams(o, m);
        this._convertToGramPerLiter(o, d);
        var r = { numberValue: _d(0.0821), unit: 'atm*L/(mol*K)' };
        if (p.unit === 'kPa') {
            r.numberValue = _d(8.314);
            r.unit = 'kPa*L/(mol*K)';
        }
        else if (p.unit === 'torr') {
            r.numberValue = _d(62.4);
            r.unit = 'torr*L/(mol*K)';
        }
        else {
            this._convertToAtm(o, p);
        }
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === 'P') {
            latex = `P = \\frac{${_l(d)}${_l(r)}${_l(t)}}{${_l(m)}}`;
            res = d.numberValue.mul(r.numberValue).mul(t.numberValue)
                .div(m.numberValue);
            unit = p.unit;
        }
        if (missingId === 'd') {
            latex = `d = \\frac{${_l(p)}${_l(m)}}{${_l(r)}${_l(t)}}`;
            res = p.numberValue.mul(m.numberValue)
                .div(r.numberValue.mul(t.numberValue));
            unit = d.unit;
        }
        if (missingId === 'm') {
            latex = `m = \\frac{${_l(d)}${_l(r)}${_l(t)}}{${_l(p)}}`;
            res = d.numberValue.mul(r.numberValue).mul(t.numberValue)
                .div(p.numberValue);
            unit = m.unit
        }
        if (missingId === 'T') {
            latex = `t = \\frac{${_l(p)}${_l(m)}}{${_l(d)}${_l(r)}}`;
            res = p.numberValue.mul(m.numberValue)
                .div(d.numberValue.mul(r.numberValue));
            unit = 'K';
            const info = convertUnit('K', t.unit, res);
            convertedResult = ` = ${info.result} ${t.unit}`;
        }
        addLatexElement(o, latex + '=' + res + `\\text{${unit}}${convertedResult}`);
    }
}



/*
function gasLaws() {
    const o = this;
    o.style.fontSize = "18pt";
    try {
        const gasLawsOptions = [
            {
                value: null,
                label: "Select the Gas Law to work with..."
            },
            {
                value: 'boyle',
                label: div => {
                    addLatexElement(div, `\\text{Boyle's law:&nbsp;} P_1\\cdot V_1 = P_2\\cdot V_2`);
                },
            },
            {
                value: 'charles',
                label: div => {
                    addLatexElement(div, `\\text{Charles's law:&nbsp;} \\frac{V_1}{T_1} = \\frac{V_2}{T_2}`);
                },
            },
            {
                value: 'gay-lussac',
                label: div => {
                    addLatexElement(div, `\\text{Gay-Lussac's law:&nbsp;} \\frac{P_1}{T_1} = \\frac{P_2}{T_2}`);
                },
            },
            {
                value: 'combined',
                label: div => {
                    addLatexElement(div, `\\text{Combined law:&nbsp;} \\frac{P_1\\cdot V_1}{T_1} = \\frac{P_2\\cdot V_2}{T_2}`);
                },
            },
            {
                value: 'avogadro',
                label: div => {
                    addLatexElement(div, `\\text{Avogadro's law:&nbsp;} \\frac{V_1}{n_1} = \\frac{V_2}{n_2}`);
                },
            },
            {
                value: 'ideal',
                label: div => {
                    addLatexElement(div, `\\text{Ideal gas law:&nbsp;} PV = nRT`);
                },
            },
            {
                value: 'density',
                label: div => {
                    addLatexElement(div, `\\text{Gas density:&nbsp;} d = \\frac{P\\cdot\\text{molar-mass}}{RT}`);
                },
            }
        ];
        _htmlElement('div', o, "Select which law to use: ");
        const output = document.createElement('div');
        var currentGasContainer = null;
        const lawSelect = createSelectElement(o, gasLawsOptions, selected => {
            if (!selected.value) return;
            console.log(`selected: ${selected.value}`);
            output.innerHTML = "";
            switch (selected.value) {
                case 'boyle':
                    currentGasContainer = new BoylesLawContainer();
                    break;
                case 'charles':
                    currentGasContainer = new CharlesLawContainer();
                    break;
                case 'avogadro':
                    currentGasContainer = new AvogardosLawContainer();
                    break;
                case 'gay-lussac':
                    currentGasContainer = new GayLussacLawContainer();
                    break;
                case 'combined':
                    currentGasContainer = new CombinedLawContainer();
                    break;
                case 'ideal':
                    currentGasContainer = new IdealGasLawContainer();
                    break;
                case 'density':
                    currentGasContainer = new GasDensityContainer();
                    break;
            }
            if (currentGasContainer) {
                currentGasContainer.createUI(output);
            }
        });
        lawSelect.outerContainer.style.height = '80px';
        o.appendChild(output);
    } catch (err) {
        _addErrorElement(o, err);
    }
}
*/