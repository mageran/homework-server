class ChemicalEquationSide {

    constructor(terms) {
        this.terms = terms;
    }

    getElementsMultiplier(multiplyWithBalancingFactor = true) {
        return this.terms.map(t => t.getElementsMultiplier(multiplyWithBalancingFactor));
    }

    getElementSymbols() {
        const hash = {};
        const mmaps = this.getElementsMultiplier();
        mmaps.forEach(mmap => {
            Object.keys(mmap).forEach(symbol => hash[symbol] = true);
        });
        return Object.keys(hash).sort();
    }

    getFactorMatrix(elementSymbols) {
        return elementSymbols.map(symbol => {
            return this.terms.map(t => {
                const mmap = t.getElementsMultiplier(false);
                const multiplier = mmap[symbol];
                return (typeof multiplier === 'number') ? multiplier : 0;
            });
        });
    }

    getElementTotals(multiplyWithBalancingFactor = true) {
        const totalsMap = {};
        const mmaps = this.getElementsMultiplier(multiplyWithBalancingFactor);
        mmaps.forEach(mmap => {
            Object.keys(mmap).forEach(symbol => {
                const m = mmap[symbol];
                if (typeof m === 'number') {
                    if (!(typeof totalsMap[symbol] === 'number')) {
                        totalsMap[symbol] = m;
                    } else {
                        totalsMap[symbol] += m;
                    }
                }
            });
        });
        return totalsMap;
    }

    getElementTotal(symbol, multiplyWithBalancingFactor = true) {
        return this.getElementTotals(multiplyWithBalancingFactor)[symbol];
    }

    getTermsForElement(symbol) {
        const res = [];
        this.terms.forEach(t => {
            const mmap = t.getElementsMultiplier();
            if (typeof mmap[symbol] === 'number') {
                res.push(t);
            }
        });
        return res;
    }

    toString(includeBalancingFactor = false, latex) {
        return this.terms.map(t => t.toString(includeBalancingFactor, latex)).join(' + ');
    }

    toLatex(includeBalancingFactor = false) {
        return this.toString(includeBalancingFactor, true);
    }

    static createFromString(inputString) {
        const ast = parseChemicalFormula(inputString);
        try {
            const term = ChemicalEquationTerm.createFromString(inputString);
            return new ChemicalEquationSide([term]);
        } catch (err) {
        }
        const { operands } = ast;
        if (Array.isArray(operands)) {
            const terms = operands.map(operand => {
                const term = new ChemicalEquationTerm(operand);
                return term;
            });
            return new ChemicalEquationSide(terms);
        } else {
            throw `${inputString} cannot be parsed as ChemicalEquationSide`;
        }
    }

}
