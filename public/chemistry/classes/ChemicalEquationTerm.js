class ChemicalEquationTerm {

    constructor({ coefficient, formulasList }) {
        this.groups = formulasList.map(({ formulas, multiplier }) => {
            const elements = formulas.map(({ chemicalElement, multiplier }) => {
                const { symbol } = chemicalElement;
                return new ChemicalEquationTermElement(symbol, multiplier);
            });
            return new ChemicalEquationTermGroup(elements, multiplier);
        });
        this.coefficient = (typeof coefficient === 'number') ? coefficient : 1;
        this.balancingFactor = coefficient;
        //this.balancingFactor = 1;
        //this.balancingFactor = Math.trunc(Math.random() * 3) + 1;
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

    toString(includeBalancingFactor = false) {
        const bfstr = (includeBalancingFactor && this.balancingFactor > 1) ? String(this.balancingFactor) : '';
        return `${bfstr}${this.groups.map(g => g.toString()).join('')}`
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
