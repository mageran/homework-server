class ChemicalEquationTermElement {

    constructor(symbol, multiplier = 1) {
        this.symbol = symbol;
        this.multiplier = (typeof multiplier === 'number') ? multiplier : 1;
    }

    getMolarMass() {
        const mm = atomicMass(this.symbol);
        if (typeof mm !== 'number') {
            throw `can't determine the molar mass of ${this.symbol}`;
        }
        return mm * this.multiplier;
    }

    toString() {
        const mstr = this.multiplier === 1 ? '' : String(this.multiplier);
        return `${this.symbol}${mstr}`;
    }

}