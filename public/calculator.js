function calculator(formulaLatex) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        //var { ast, value } = evalLatexFormula(formulaLatex);
        var { value } = evalLatexFormulaWithContext(formulaLatex);
        //_htmlElement('pre', o, `value: ${value}`);
        value = _d(precision(value.toNumber(), 10));
        _htmlElement('pre', o, `value: ${value}`);
        const numeric = Numeric.createFromValue(value);
        addLatexElement(o, numeric.toLatex(), 'Numeric reverse lookup:');
        const trigFunctionsAngles = Angle.reverseLookupTrigFunctions(value, true);
        console.log(`trigFunctionsAngles:`);
        console.log(trigFunctionsAngles);
        if (Object.keys(trigFunctionsAngles).length === 0) {
            _htmlElement('div', o, 'No unit circle values found');
        } else {
            reverseUnitCircleLookup.call(o, formulaLatex, true, true, value);
        }
    } catch (err) {
        _addErrorElement(o, err);
        throw err;
    }
}

/*
function processTerm(formulaLatex, operation) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        const url = "/api/solveFor";
        const data = { equation: formulaLatex, variable: 'x' };
        const success = response => {
            const steps = [];
            console.log(`response: ${JSON.stringify(response, null, 2)}`);
            var resObj = response;
            try {
                resObj = JSON.parse(response);
            } catch (err) {
                console.error(err);
            }
            //_htmlElement('pre', o, JSON.stringify(resObj, null, 2));
            //steps.push('Simplified term:')
            //steps.push({ latex: resObj });
            if (resObj.steps) {
                _showComputationSteps(o, resObj.steps);
            }
        }
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: success,
            error: ajaxErrorFunction(o)
        });
    } catch (err) {
        _addErrorElement(o, err);
        throw err;
    }
}
*/

function processTerm(formulaLatex, operation, substTermLatex) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        if (!operation) {
            throw 'please enter a term/equation and select an operation';
        }
        const addResultTermsTable = terms => {
            let table = _htmlElement('table', o);
            terms.forEach(termLatex => {
                const tr = _htmlElement('tr', table);
                var td = _htmlElement('td', tr);
                td.setAttribute("valign", "middle");
                addLatexElement(td, termLatex);
                td = _htmlElement('td', tr);
                td.setAttribute("valign", "middle");
                const b = _htmlElement('input', td);
                b.type = 'button';
                b.value = "Set as input term";
                b.className = 'main-button';
                b.addEventListener("click", () => {
                    currentInputElements[0].mathField.latex(termLatex);
                })
            })
        }
        if (operation.startsWith("solve:")) {
            const vname = operation.substr(6);
            callServerService('solveFor', { equation: formulaLatex, variable: vname }, resObj => {
                if (resObj.steps) {
                    let steps = [{ collapsibleSection: { title: 'Steps', steps: resObj.steps } }];
                    _showComputationSteps(o, steps);
                }
                if (resObj.terms) {
                    _htmlElement('h3', o, 'Solution(s):');
                    addResultTermsTable(resObj.terms);
                }
            }, ajaxErrorFunction(o))
        }
        else if (operation.startsWith("subst:")) {
            const vname = operation.substr(6);
            console.log(`subsituting ${vname} in ${formulaLatex} with ${substTermLatex}...`);
            callServerService('substitute', { term: formulaLatex, variable: vname, substTerm: substTermLatex }, resObj => {
                if (resObj.steps) {
                    let steps = [{ collapsibleSection: { title: 'Steps', steps: resObj.steps } }];
                    _showComputationSteps(o, steps);
                }
                if (resObj.term) {
                    addResultTermsTable([resObj.term]);
                }
            }, ajaxErrorFunction(o))
        }
        else if (operation === 'simplify') {
            callServerService('simplifyTerm', { term: formulaLatex }, term => {
                addResultTermsTable([term]);
            }, ajaxErrorFunction(o))
        }
    } catch (err) {
        _addErrorElement(o, err);
        throw err;
    }
}

const processTermDynamicParameters = (term, callback) => {
    callServerService('getVarNames', { term }, varnames => {
        const options = [{ label: 'Select operation', value: null }];
        options.push({ label: 'Simplify', value: 'simplify' }),
        options.push({ label: '------------------------', value: null });
        options.push(...varnames.map(vname => {
            return { label: `Solve for "${vname}"`, value: `solve:${vname}` };
        }))
        options.push({ label: '------------------------', value: null });
        options.push(...varnames.map(vname => {
            return { label: `Substitute "${vname}" with value or term`, value: `subst:${vname}` };
        }))
        callback([
            { name: 'Operation', hideButtons: true, type: 'select', options },
            { name: `Enter substitution value/term`, type: 'formula' }
        ]);
    })
}
