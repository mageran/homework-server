class ChemicalEquationTermElement {

    constructor(symbol, multiplier = 1) {
        this.symbol = symbol;
        this.multiplier = (typeof multiplier === 'number') ? multiplier : 1;
    }

    clone() {
        return new ChemicalEquationTermElement(this.symbol, this.multiplier);
    }

    getMolarMass() {
        const mm = atomicMass(this.symbol);
        if (typeof mm !== 'number') {
            throw `can't determine the molar mass of ${this.symbol}`;
        }
        return mm * this.multiplier;
    }

    toString(latex) {
        const _suffix = m => {
            const mstr = String(m);
            return latex ? `_{${mstr}}` : mstr;
        }
        const mstr = this.multiplier === 1 ? '' : _suffix(this.multiplier);
        return `${this.symbol}${mstr}`;
    }

    toLatex() {
        return this.toString(true);
    }

}