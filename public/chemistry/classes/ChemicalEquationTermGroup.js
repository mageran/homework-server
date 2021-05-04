class ChemicalEquationTermGroup {

    constructor(elements, multiplier) {
        this.elements = elements;
        this.multiplier = (typeof multiplier === 'number') ? multiplier : 1;
    }

    getElementsMultiplier() {
        const { elements, multiplier } = this;
        const mmap = {};
        elements.forEach(element => {
            var previousValue = 0;
            if (typeof mmap[element.symbol] === 'number') {
                previousValue = mmap[element.symbol];
            }
            mmap[element.symbol] = previousValue + element.multiplier * multiplier;
        })
        return mmap;
    }

    getMolarMass(info) {
        const { elements, multiplier } = this;
        var mm = 0;
        elements.forEach(element => {
            let mmElem = element.getMolarMass();
            mm += mmElem * multiplier;
            if (Array.isArray(info)) {
                let mult = multiplier * element.multiplier;
                let symbol = element.symbol;
                let elemMM = atomicMass(symbol)
                info.push({ symbol, multiplier: mult, atomicMass: elemMM });
            }
        })
        return mm;
    }

    toString() {
        const needParenthesis = this.multiplier > 1;
        const [open, close] = needParenthesis ? ["(", ")"] : ["", ""];
        const mstr = this.multiplier === 1 ? '' : String(this.multiplier);
        return `${open}${this.elements.map(e => e.toString()).join('')}${close}${mstr}`;
    }

}
