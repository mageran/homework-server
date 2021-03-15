var MaxBalancingFactor = 20;
const MaxTermsForSymbolInEquation = 4;

function balanceChemicalEquation(maxBalancingFactor, formula, callback) {
    const outputElem = this;
    var lhs;
    var rhs;
    var eq;
    const processEquation = ast => {
        assert(ast.op === 'equation', `formula is not an equation`);
        lhs = createEquationSide(ast.operands[0]);
        rhs = createEquationSide(ast.operands[1]);
        eq = new ChemicalEquation(lhs, rhs);
        console.log(eq.toString(true))
    }
    const createEquationSide = term => {
        var elements;
        if (Array.isArray(term.formulasList)) {
            elements = [term];
        }
        else if (term.op === '+') {
            elements = term.operands;
        }
        else {
            throw `[*] unsupported format of equation side: ${JSON.stringify(term)}`;
        }
        const cterms = elements.map(elem => {
            //assert(Array.isArray(elem), `unsupported format of term: ${JSON.stringify(elem)}`);
            return new ChemicalEquationTerm(elem);
        });
        //cterms.forEach(cterm => console.log(cterm.toString()));
        return new ChemicalEquationSide(cterms);
    }
    const addTable = (skipTable = false) => {
        const _htmlElement = (tag, parent, content, cssClass) => {
            const elem = document.createElement(tag);
            parent.appendChild(elem);
            if (content instanceof HTMLElement) {
                elem.appendChild(content);
            }
            else if (typeof content === 'string') {
                elem.innerHTML = content;
            }
            if (cssClass) {
                elem.className = cssClass;
            }
            return elem;
        }
        const table = document.createElement('table');
        table.className = 'chemical-equation-balancing';
        var tr;
        var td;
        var span;
        tr = document.createElement('tr');
        td = document.createElement('td');
        tr.appendChild(td);

        td = document.createElement('td');
        td.setAttribute("colspan", lhs.terms.length + 1);
        td.setAttribute("align", "center");
        td.className = "last-lhs-column";
        td.innerHTML = "Reactants"
        tr.appendChild(td);

        td = document.createElement('td');
        td.setAttribute("colspan", rhs.terms.length + 1);
        td.setAttribute("align", "center");
        td.innerHTML = "Products"
        tr.appendChild(td);

        table.appendChild(tr);


        tr = document.createElement('tr');
        td = document.createElement('td');
        tr.appendChild(td);
        [lhs, rhs].forEach(side => {
            side.terms.forEach(t => {
                let bfactorString = t.balancingFactor === 0 ? '&nbsp;' : String(t.balancingFactor);
                let td = document.createElement('td');
                _htmlElement('span', td, bfactorString, 'bfactor-span bfactor-span-header');
                _htmlElement('span', td, t.toString());
                //td.innerHTML = t.toString();
                tr.appendChild(td);
            });
            td = document.createElement('td');
            if (side === lhs) {
                td.className = 'last-lhs-column';
            }
            td.innerHTML = "Total";
            tr.appendChild(td);
        });
        table.appendChild(tr);

        const lhsMapList = lhs.getElementsMultiplier();
        const rhsMapList = rhs.getElementsMultiplier();

        // element rows
        eq.getElementSymbols().forEach(symbol => {
            const isBalanced = eq.isBalancedForSymbol(symbol);
            const balancedCssClass = isBalanced ? "balanced" : "unbalanced";
            tr = document.createElement('tr');
            td = document.createElement('td');
            td.innerHTML = symbol;
            tr.appendChild(td);
            [lhs, rhs].forEach(side => {
                const totals = side.getElementTotals(true);
                side.terms.forEach(term => {
                    const mmap = term.getElementsMultiplier(false);
                    const mmapTotals = term.getElementsMultiplier(true);
                    const bfactor = term.balancingFactor;
                    //console.log(`symbol: ${symbol}, ${JSON.stringify(mmap)}`);
                    td = document.createElement('td');
                    const multiplier = mmap[symbol];
                    const multiplierTotal = mmapTotals[symbol];
                    if (typeof multiplier === 'number') {
                        _htmlElement('span', td, String(multiplier));
                        _htmlElement('span', td, '&middot;');
                        _htmlElement('span', td, String(bfactor), 'bfactor-span');
                        _htmlElement('span', td, '=');
                        _htmlElement('span', td, String(multiplierTotal));
                    } else {
                        td.innerHTML = '&nbsp;';
                    }
                    tr.appendChild(td);
                });
                td = document.createElement('td');
                const totalClassNames = []
                if (side === lhs) {
                    totalClassNames.push('last-lhs-column');
                }
                totalClassNames.push(balancedCssClass);
                td.className = totalClassNames.join(" ");
                _htmlElement('span', td, String(totals[symbol]), 'totals-span');
                tr.appendChild(td);
            });
            table.appendChild(tr);
        })
        if (!skipTable) {
            outputElem.appendChild(table);
        }

        const equationString = eq.toString(true);
        const eqIsBalanced = eq.isBalanced();
        const balancedCssClass = eqIsBalanced ? "balancing-equation-balanced" : "balancing-equation-unbalanced";
        _htmlElement('div', outputElem, equationString, `balancing-equation-div ${balancedCssClass}`);
        _htmlElement('div', outputElem, eqIsBalanced ? "balanced" : "unbalanced", `balancing-equation-div2 ${balancedCssClass}`)
    }
    const _warnIfZeros = formula => {
        if (formula.indexOf('0') >= 0) {
            _addErrorElement(outputElem, `
            Warning: your formula contains zero digit(s).
            Sometimes this indicates a typo if you meant to put the letter "O".
            If not, you can ignore this message :)`);
        }

        if (formula.indexOf('H20') >= 0) {
            _addErrorElement(outputElem, `
            You probably meant to write "H2O", not "H20" (letter "O" vs. number "0" )`);
        }
    }
    try {
        if (typeof maxBalancingFactor === 'number' && maxBalancingFactor > 1) {
            MaxBalancingFactor = maxBalancingFactor;
        }
        console.log(`MaxBalancing Factor is ${MaxBalancingFactor}.`)
        _warnIfZeros(formula);
        const ast = parseChemicalFormula(formula);
        //console.log(JSON.stringify(ast, null, 2));
        //addJsonAsPreElement(outputElem, ast);
        processEquation(ast);
        //console.log(`lhs symbols: ${lhs.getElementSymbols()}`);
        //console.log(`rhs symbols: ${rhs.getElementSymbols()}`);
        //console.log(`equation symbols: ${eq.getElementSymbols()}`)
        const pbar = createProgressIndicator(outputElem);
        const updateProgress = p => {
            //console.log(`%cprogress ${p}`, 'font-size: 20pt')
            pbar.style.display = 'none';
            pbar.update(p)
            pbar.style.display = 'block';
        }
        setTimeout(() => {
            //console.log(`equation ${eq.toString(true)} is balanced: ${eq.isBalanced()}`)
            var solveResult = true;
            if (eq.isBalanced()) {
                _htmlElement('div', outputElem, 'Equation is already balanced.');
                addTable(true);
                pbar.style.display = 'none';
            } else {
                solveResult = eq.solve(updateProgress);
                addTable();
                pbar.style.display = 'none';
                if (!solveResult) {
                    _addErrorElement(outputElem, `Could not find a solution to balance the equation`);
                }
            }
            if (typeof callback === 'function') {
                callback(eq, solveResult);
            }
        }, 10);
        updateProgress(0);
    } catch (err) {
        _addErrorElement(outputElem, `*** ${err}`);
        throw err;
    }
}

class ChemicalEquation {

    constructor(lhs, rhs) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    getElementSymbols() {
        const lhsSymbols = this.lhs.getElementSymbols();
        const rhsSymbols = this.rhs.getElementSymbols();
        if (lhsSymbols.length !== rhsSymbols.length) {
            throw `invalid equation: different number of elements on each side`;
        }
        lhsSymbols.forEach(sym => {
            assert(rhsSymbols.includes(sym), `invalid equation: element ${sym} not found on right side`);
        });
        return lhsSymbols.sort((elem1, elem2) => {
            if (elem1 === 'H' || elem1 === 'O') {
                return 1;
            }
            if (elem2 === 'H' || elem2 === 'O') {
                return -1;
            }
            return elem1 < elem2 ? -1 : elem1 > elem2 ? 1 : 0;
        });
    }

    isBalancedForSymbol(symbol) {
        const lhsTotal = this.lhs.getElementTotal(symbol);
        const rhsTotal = this.rhs.getElementTotal(symbol);
        return lhsTotal === rhsTotal;
    }

    isBalanced() {
        const symbols = this.getElementSymbols();
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            if (this.isBalancedForSymbol(symbol)) {
                continue;
            }
            return false;
        }
        return true;
    }

    getTermsForElement(symbol) {
        const lhsTerms = this.lhs.getTermsForElement(symbol);
        const rhsTerms = this.rhs.getTermsForElement(symbol);
        return [...lhsTerms, ...rhsTerms];
    }


    solve(updateProgressCallback) {
        const updateProgress = (typeof updateProgressCallback === 'function') ? updateProgressCallback : () => { };
        const _getValidCombinations = (lmultipliers, rmultipliers, solutions, isLast) => {
            const coeffs = [...lmultipliers, ...rmultipliers.map(n => -Number(n))];
            const _reformat = combination => {
                const fullCombination = [];
                var index = 0;
                for (let i = 0; i < coeffs.length; i++) {
                    let n = coeffs[i];
                    if (n === 0) {
                        fullCombination.push(0);
                    } else {
                        fullCombination.push(combination[index++]);
                    }
                }
                return fullCombination;
            }
            const _combineSolutions = (sol1, sol2) => {
                const res = [];
                const len = sol1.length;
                for (let i = 0; i < len; i++) {
                    let n1 = sol1[i];
                    let n2 = sol2[i];
                    if (n1 === 0) {
                        res.push(n2);
                    }
                    else if (n2 === 0) {
                        res.push(n1);
                    }
                    else if (n1 === n2) {
                        res.push(n1);
                    }
                    else {
                        return null;
                    }
                }
                return res;
            }
            const _checkComplete = combination => {
                return combination.every(n => n !== 0);
            }
            const nonNulls = coeffs.filter(n => n !== 0);
            //console.log(coeffs);
            //console.log(nonNulls);
            const len = nonNulls.length;
            const newSolutions = [];
            for (let combination of allCombinations(1, MaxBalancingFactor, len)) {
                let sum = 0;
                for (let i = 0; i < len; i++) {
                    sum += nonNulls[i] * combination[i];
                }
                if (sum === 0) {
                    let comb = _reformat(combination);
                    //console.log(`combination ${comb} works for ${coeffs}`);
                    if (solutions.length === 0) {
                        newSolutions.push(comb);
                    } else {
                        for (let i = 0; i < solutions.length; i++) {
                            let sol = solutions[i];
                            let combined = _combineSolutions(sol, comb);
                            if (combined) {
                                //console.log(`solutions ${sol} and ${comb} could be combined to ${combined}!`);
                                if (isLast) {
                                    if (_checkComplete(combined)) {
                                        console.log(`found complete solution: ${combined}`);
                                        return [combined];
                                    }
                                } else {
                                    newSolutions.push(combined);
                                }
                            }
                        }
                    }
                }
            }
            return newSolutions;
        }
        const symbols = this.getElementSymbols();
        const lmatrix = this.lhs.getFactorMatrix(symbols);
        const rmatrix = this.rhs.getFactorMatrix(symbols);
        //console.log(`lmatrix: ${JSON.stringify(lmatrix, null, 2)}`);
        //console.log(`rmatrix: ${JSON.stringify(rmatrix, null, 2)}`);
        assert(lmatrix.length === rmatrix.length, `internal error: different #rows for lmatrix and rmatrix`);
        var solutions = [];
        updateProgress(0);
        for (let i = 0; i < lmatrix.length; i++) {
            const lmultipliers = lmatrix[i];
            const rmultipliers = rmatrix[i];
            solutions = _getValidCombinations(lmultipliers, rmultipliers, solutions, i === lmatrix.length - 1);
            updateProgress((i + 1) / lmatrix.length);
        }
        if (solutions.length === 0) {
            console.log(`no solution found`);
            return false;
        }
        const theSolution = solutions[0];
        this.lhs.terms.forEach(term => {
            term.balancingFactor = theSolution.shift();
        });
        this.rhs.terms.forEach(term => {
            term.balancingFactor = Math.abs(theSolution.shift());
        })
        return true;
    }

    toString(includeBalancingFactor) {
        const { lhs, rhs } = this;
        return `${lhs.toString(includeBalancingFactor)} = ${rhs.toString(includeBalancingFactor)}`;
    }

}

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

    toString(includeBalancingFactor = false) {
        return this.terms.map(t => t.toString(includeBalancingFactor)).join(' + ');
    }

}

class ChemicalEquationTerm {

    constructor({ coefficient, formulasList }) {
        this.groups = formulasList.map(({ formulas, multiplier }) => {
            const elements = formulas.map(({ chemicalElement, multiplier }) => {
                const { symbol } = chemicalElement;
                return new ChemicalEquationTermElement(symbol, multiplier);
            });
            return new ChemicalEquationTermGroup(elements, multiplier);
        });
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

    toString(includeBalancingFactor = false) {
        const bfstr = (includeBalancingFactor && this.balancingFactor > 1) ? String(this.balancingFactor) : '';
        return `${bfstr}${this.groups.map(g => g.toString()).join('')}`
    }

}

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