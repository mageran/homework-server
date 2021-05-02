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
    ];
    chemicalLawsUI(this, lawsOptions);
}

class MolarityContainer extends ChemicalLawContainer {
    constructor() {
        super();
    }

    _addTiles() {
        const { tileContainer } = this;
        const labelStyle = { width: '220px', textAlign: 'right', display: 'inline-block' };
        tileContainer.addTile(new NumberInputTile('M', { label: 'M', labelIsLatex: true, labelStyle }));
        tileContainer.addTile(new MassOrMolesInputTile('MM', { label: '\\text{moles of solution}', labelIsLatex: true, labelStyle }));
        tileContainer.addTile(new VolumeInputTile('V', { label: '\\text{volume of solute}', labelIsLatex: true, labelStyle }));
    }

    process() {
        const _l = this._valueObjToLatex.bind(this);
        const o = this.clearResultContainer();
        _htmlElement('div', o, "Molarity");
        const missingTile = this.getMissingValueTile();
        addLatexElement(o, `\\text{Missing: &nbsp;} ${missingTile.label}`);
        const missingId = missingTile.id;
        let m = this.getValue('M');
        let moles = this.getValue('MM');
        let v = this.getValue('V');
        this._convertToMoles(o, moles);
        this._convertToLiters(o, v);
        var latex = "";
        var res = "";
        var unit = "";
        var convertedResult = "";
        if (missingId === 'V') {
            latex = `\\text{volume of solute&nbsp;} = \\frac{${_l(moles)}}{${_l(m)}}`;
            //latex = `V_1 = \\frac{${_l(v2)}${_l(n1)}}{${_l(n2)}}`;
            //res = v2.numberValue.mul(n1.numberValue).div(n2.numberValue);
            //unit = v1.unit;
        }
        if (missingId === 'M') {
            //latex = `V_2 = \\frac{${_l(v1)}${_l(n2)}}{${_l(n1)}}`;
            latex = `M = \\frac{${_l(moles)}}{${_l(v)}}`;
            //res = v1.numberValue.mul(n2.numberValue).div(n1.numberValue);
            //unit = v2.unit;
        }
        if (missingId === 'MM') {
            latex = `${_l(m)}\\cdot ${_l(v)}`;
            res = m.numberValue.mul(v.numberValue);
            unit = 'moles';
            let n = moles;
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