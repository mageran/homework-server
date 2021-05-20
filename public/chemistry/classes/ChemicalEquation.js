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

    get allTerms() {
        return [...this.lhs.terms, ...this.rhs.terms];
    }

    checkStateInfo() {
        const terms = this.allTerms;
        const termsWithStateCnt = terms.filter(t => t.state).length;
        return termsWithStateCnt === 0 || termsWithStateCnt === terms.length;
    }

    toString(includeBalancingFactor, latex) {
        const { lhs, rhs } = this;
        return `${lhs.toString(includeBalancingFactor, latex)} = ${rhs.toString(includeBalancingFactor)}`;
    }

    toLatex(includeBalancingFactor) {
        return this.toString(includeBalancingFactor, true);
    }

    static createFromString = inputString => {
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
        const ast = parseChemicalFormula(inputString);
        assert(ast.op === 'equation', `formula is not an equation`);
        const lhs = createEquationSide(ast.operands[0]);
        const rhs = createEquationSide(ast.operands[1]);
        const eq = new ChemicalEquation(lhs, rhs);
        console.log(eq.toString(true))
        return eq;
    }

}
