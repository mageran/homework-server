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