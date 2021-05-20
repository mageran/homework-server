class ChemicalEquationTermGroup {

    constructor(elements, multiplier, skipInit = false) {
        if (!skipInit) {
            this.elements = elements;
            this.multiplier = (typeof multiplier === 'number') ? multiplier : 1;
        }
    }

    clone() {
        const g = new ChemicalEquationTermGroup(null, null, true);
        g.multiplier = this.multiplier;
        g.elements = this.elements.map(elem => elem.clone());
        return g;
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

    _findOH(eliminate = false) {
        const oindex = this.elements.findIndex(element => element.multiplier === 1 && element.symbol === 'O');
        const hindex = this.elements.findIndex(element => element.multiplier === 1 && element.symbol === 'H');
        if (oindex < 0) return null;
        if (hindex < 0) return null;
        if (oindex !== hindex - 1) return null;
        console.log(`%cfound OH with multiplier ${this.multiplier}`, 'color:purple;padding:5px;border:1px solid black');
        if (eliminate) {
            this.elements.splice(oindex, 2);
        }
        return this.multiplier;
    }

    _findH(eliminate = false) {
        const hindex = this.elements.findIndex(element => element.symbol === 'H');
        if (hindex < 0) return null;
        const hElement = this.elements[hindex];
        const m = hElement.multiplier * this.multiplier;
        console.log(`%cfound H with multiplier ${m}`, 'color:red;padding:5px;border:1px solid black');
        if (eliminate) {
            this.elements.splice(hindex, 1);
        }
        return m;
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    toString(latex) {
        const _suffix = m => {
            const mstr = String(m);
            return latex ? `_{${mstr}}` : mstr;
        }
        const needParenthesis = this.multiplier > 1;
        const [open, close] = needParenthesis ? ["(", ")"] : ["", ""];
        const mstr = this.multiplier === 1 ? '' : _suffix(this.multiplier);
        return `${open}${this.elements.map(e => e.toString(latex)).join('')}${close}${mstr}`;
    }

    toLatex() {
        return this.toString(true);
    }

}
