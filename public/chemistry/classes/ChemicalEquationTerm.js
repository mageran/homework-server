class ChemicalEquationTerm {

    constructor({ coefficient, formulasList, state }, skipInit = false) {
        if (!skipInit) {
            this.groups = formulasList.map(({ formulas, multiplier }) => {
                const elements = formulas.map(({ chemicalElement, multiplier }) => {
                    const { symbol } = chemicalElement;
                    return new ChemicalEquationTermElement(symbol, multiplier);
                });
                return new ChemicalEquationTermGroup(elements, multiplier);
            });
            this.coefficient = (typeof coefficient === 'number') ? coefficient : 1;
            this.$balancingFactor = coefficient;
            this.state = state;
            //this.balancingFactor = 1;
            //this.balancingFactor = Math.trunc(Math.random() * 3) + 1;
        }
    }

    clone() {
        const t = new ChemicalEquationTerm({}, true);
        t.coefficient = this.coefficient;
        t.$balancingFactor = this.$balancingFactor;
        t.state = this.state;
        t.groups = this.groups.map(g => g.clone());
        return t;
    }

    get balancingFactor() {
        return this.$balancingFactor;
    }

    set balancingFactor(val) {
        this.$balancingFactor = val;
        this.coefficient = val;
    }

    getElementsMultiplier(multiplyWithBalancingFactor = true) {
        const mmap = {};
        this.groups.forEach(group => {
            const gmap = group.getElementsMultiplier();
            Object.keys(gmap).forEach(symbol => {
                if (mmap[symbol]) {
                    mmap[symbol] += gmap[symbol];
                } else {
                    mmap[symbol] = gmap[symbol];
                }
                if (multiplyWithBalancingFactor) {
                    mmap[symbol] *= this.balancingFactor;
                }
            })
        });
        return mmap;
    }

    getElementSymbols() {
        return Object.keys(this.getElementsMultiplier());
    }

    getMolarMass(info) {
        var mm = 0;
        this.groups.forEach(group => {
            mm += group.getMolarMass(info);
        });
        return mm;
    }

    getMolarMassWithCoefficient(info) {
        const mm = this.getMolarMass(info);
        return mm * this.coefficient;
    }

    getMolarityTermLatex(molarityValue = null) {
        var latex;
        if (molarityValue === '') {
            latex = 'x';
        } else {
            latex = `${molarityValue === null ? ("[" + this.toString() + "]") : ("(" + exponentialNumStringToLatex(String(molarityValue)) + ")")}`;
        }
        if (this.coefficient > 1) {
            latex += `^{${this.coefficient}}`
        }
        return latex;
    }

    getMolarityValue(decimalValue) {
        var res = _d(decimalValue);
        if (this.coefficient > 1) {
            res = res.pow(_d(this.coefficient));
        }
        return res;
    }

    findOH(eliminate = false) {
        for (let g of this.groups) {
            const c = g._findOH(eliminate);
            if (typeof c === 'number') {
                this._cleanup();
                return c;
            }
        };
        return null;
    }

    findH(eliminate = false) {
        for (let g of this.groups) {
            const c = g._findH(eliminate);
            if (typeof c === 'number') {
                this._cleanup();
                return c;
            }
        };
        return null;
    }

    _cleanup() {
        for (; ;) {
            let index = this.groups.findIndex(g => g.isEmpty());
            if (index < 0) break;
            this.groups.splice(index, 1);
        }
    }


    toString(includeBalancingFactor = false, latex) {
        const bfstr = (includeBalancingFactor && this.balancingFactor > 1) ? String(this.balancingFactor) : '';
        return `${bfstr}${this.groups.map(g => g.toString(latex)).join('')}`
    }

    toLatex(includeBalancingFactor = false) {
        return this.toString(includeBalancingFactor, true);
    }

    static createFromString(inputString) {
        const ast = parseChemicalFormula(inputString);
        const { coefficient, formulasList } = ast;
        if (Array.isArray(formulasList)) {
            return new ChemicalEquationTerm(ast);
        } else {
            throw `${inputString} doesn't represent a chemical term; try parsing it as ChemicalEquationSide`
        }
    }

}
