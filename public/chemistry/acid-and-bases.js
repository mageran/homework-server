

/*
function pHpOHCalculations(formula, acidOrBase, molarity, ph, pOH) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    const determineAcidOrBase = () => {
        const fromName = name => {
            const lname = name.toLowerCase();
            if (lname.indexOf('acid') >= 0) {
                return 'acid';
            }
            if (lname.indexOf('hydroxide') >= 0) {
                return 'base'
            }
            return null;
        }
        if (acidOrBase !== 'auto') {
            return Promise.resolve(acidOrBase);
        }
        if (!formula) {
            return Promise.reject(`please fill in the name/formula field`);
        }
        const ab = fromName(formula);
        if (ab) {
            return Promise.resolve(ab);
        }
        const queryString = `${formula} alternate names`;
        return chemicalQueryPromise(queryString)
            .then(queryResult => {
                console.log(JSON.stringify(queryResult, null, 2));
                const { plaintext } = queryResult;
                if (Array.isArray(plaintext)) {
                    const acidOrBase = fromName(plaintext.join(" "));
                    if (acidOrBase) {
                        return acidOrBase;
                    }
                }
                throw `can't determine whether it's an acid or base using the provided information`
            })
    }
    try {
        const loadingImg = _htmlElement('img', o);
        loadingImg.src = '/images/loading.gif';
        const steps = [];
        const calculatePHorPOH = (isAcid, molarity, sigFigs) => {
            const steps = [];
            const pH = isAcid ? 'pH' : 'pOH';
            const pOH = isAcid ? 'pOH' : 'pH';
            const m = _d(molarity);
            const result = m.log(10).negated().toPrecision(sigFigs);
            steps.push({
                latex: `\\text{${pH}} = -log[${molarity}] = ${result}`
            })
            steps.push({
                latex: `\\text{${pOH}} = 14 - ${result} = ${14 - result}`
            })
            return steps;
        }
        determineAcidOrBase()
            .then(acidOrBase => {
                const isAcid = acidOrBase === 'acid';
                loadingImg.remove();
                const numberInputs = [molarity, ph, pOH];
                const sigFigs = Math.max(...numberInputs.map(_getSigFigs));
                steps.push(`(calculated sig figs: ${sigFigs})`);
                steps.push(`&nbsp;`);
                steps.push(formula ? `${formula} is a${isAcid ? "n" : ""} ${acidOrBase}` : `Processing as ${acidOrBase}`);
                steps.push(...calculatePHorPOH(isAcid, molarity, sigFigs));
                _showComputationSteps(o, steps);
            })
            .catch(err => {
                loadingImg.remove();
                _addErrorElement(o, err);
            })
    } catch (err) {
        _addErrorElement(o, err);
    }
}
*/

/**
 * calculates the missing values from H3O+ and OH- concentration and pH or pOH values
 * @param {*} h3o 
 * @param {*} oh 
 * @param {*} pH 
 * @param {*} pOH 
 * @returns 
 */
const calculatePHFromToConcentration = (pH, pOH, h3o, oh, coefficientIn = 1) => {
    const steps = [];
    const molarity = h3o ? h3o : oh;
    const isAcidGiven = !!h3o
    const phPOH = pH ? pH : pOH;
    const isPHGiven = !!pH;
    const coefficient = (typeof coefficientIn === 'number') ? coefficientIn : 1;
    if (h3o && oh) {
        throw `you can only provide either [H3O+] or [OH-], not both`;
    }
    if (pH && pOH) {
        throw `you can only provide either pH or pOH, not both`
    }
    if (molarity && phPOH) {
        throw `only provide one value, the rest will be calcutated`;
    }
    const sigFigs = Math.max(...[h3o, oh, pH, pOH].map(_getSigFigs));
    const phSigFigs = Math.max(2, sigFigs);
    steps.push(`(calculated sig figs: ${sigFigs})`);
    if (molarity) {
        let pH = isAcidGiven ? 'pH' : 'pOH';
        let pOH = isAcidGiven ? 'pOH' : 'pH';
        let oh = isAcidGiven ? 'OH^-' : 'H_3O^+';
        let m = _d(molarity);
        let pHres = m.log(10).negated();
        let pHDisp = pHres.toPrecision(phSigFigs);
        let pOHres = _d(14).minus(pHDisp);
        let pOHDisp = pOHres;
        let ohMolarity = _d(10).pow(pOHres.negated());
        let ohMolarityDisp = ohMolarity.toPrecision(sigFigs);
        steps.push({
            latex: `\\text{${pH}} = -log[${molarity}] = ${pHDisp}`
        })
        steps.push({
            latex: `\\text{${pOH}} = 14 - ${pHDisp} = ${pOHDisp}`
        })
        steps.push({
            latex: `[${oh}] = 10^{-${pOH}} = 10^{-${pOHDisp}} = ${ohMolarityDisp}`
        })
    }
    else if (phPOH && coefficient === 1) {
        let [h3o, oh, pH, pOH] = isPHGiven
            ? ['H_3O^+', 'OH^-', 'pH', 'pOH']
            : ['OH^-', 'H_3O^+', 'pOH', 'pH'];
        let phValue = _d(phPOH);
        let phDisp = phValue.toPrecision(phSigFigs);
        let pOHvalue = _d(14).minus(phDisp);
        let pOHDisp = pOHvalue;
        let h3oRes = _d(10).pow(phValue.negated());
        let h3oDisp = h3oRes.toPrecision(sigFigs);
        let ohRes = _d(10).pow(pOHvalue.negated());
        let ohDisp = ohRes.toPrecision(sigFigs);
        steps.push({
            latex: `${pOH} = 14 - ${pH} = 14 - ${phDisp} = ${pOHDisp}`
        })
        steps.push({
            latex: `[${h3o}] = 10^{-${pH}} = 10^{-${phPOH}} = ${h3oDisp}`
        })
        steps.push({
            latex: `[${oh}] = 10^{-${pOH}} = 10^{-${pOHvalue}} = ${ohDisp}`
        })
    }
    else if (phPOH && coefficient > 1) {
        let [h3o, oh, pH, pOH] = isPHGiven
            ? ['H_3O^+', 'OH^-', 'pH', 'pOH']
            : ['OH^-', 'H_3O^+', 'pOH', 'pH'];
        let phValue = _d(phPOH);
        let phDisp = phValue.toPrecision(phSigFigs);
        let pOHvalue = _d(14).minus(phDisp);
        let pOHDisp = pOHvalue;
        let h3oRes = _d(10).pow(phValue.negated()).div(coefficient);
        let h3oDisp = h3oRes.toPrecision(sigFigs);
        let ohRes = _d(10).pow(pOHvalue.negated()).div(coefficient);
        let ohDisp = ohRes.toPrecision(sigFigs);
        steps.push({
            latex: `${pOH} = 14 - ${pH} = 14 - ${phDisp} = ${pOHDisp}`
        })
        steps.push({
            latex: `[${h3o}] = \\frac{10^{-${pH}}}{${coefficient}} = \\frac{10^{-${phPOH}}}{${coefficient}} = ${h3oDisp}`
        })
        steps.push({
            latex: `[${oh}] = \\frac{10^{-${pOH}}}{${coefficient}} = \\frac{10^{-${pOHvalue}}}{${coefficient}} = ${ohDisp}`
        })
    }
    else {
        throw `no values given...`;
    }
    return steps
}

function pHFromToConcentration(pH, pOH, h3o, oh) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    try {
        const steps = [];
        steps.push(...calculatePHFromToConcentration(pH, pOH, h3o, oh));
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, err);
    }
}

function pHpOHCalculations(formula, molarity, pH, pOH) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    try {
        const steps = [];
        if (!formula) {
            throw "element formula is missing";
        }
        const sigFigs = Math.max(...[molarity, pH, pOH].map(_getSigFigs));
        const info = getAcidBaseInfo(formula);
        steps.push(...info.steps);
        const { coefficient, isAcid } = info;
        var h3o = molarity && isAcid ? molarity : null;
        var oh = molarity && !isAcid ? molarity : null;
        const ionWithMolarity = h3o ? 'H_3O^+' : 'OH^-';
        if (molarity) {
            if (coefficient > 1) {
                var newMolarity;
                if (h3o) {
                    h3o = _d(h3o).mul(coefficient).toPrecision(sigFigs);
                    newMolarity = h3o;
                }
                else if (oh) {
                    oh = _d(oh).mul(coefficient).toPrecision(sigFigs);
                    newMolarity = oh;
                }
                steps.push(`Multiplying molarity with ${coefficient}:`);
                steps.push({ latex: `[${ionWithMolarity}] = ${coefficient}\\cdot(${molarity}) = ${newMolarity}` })
            } else {
                steps.push({ latex: `[${ionWithMolarity}] = ${molarity}` })
            }
        } else {
            coefficient > 1 && steps.push(`Quotient for molarity results: ${coefficient}`);
        }
        steps.push(...calculatePHFromToConcentration(pH, pOH, h3o, oh, coefficient));
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, err);
    }
}

const getAcidBaseInfo = formula => {
    const steps = [];
    const term = ChemicalEquationTerm.createFromString(formula);
    console.log(`${term} has ${term.groups.length} group(s)`);
    var isAcid = true;
    var reducedTerm = term.clone();
    var coefficient = reducedTerm.findOH(true);
    var equation = '';
    if (typeof coefficient === 'number') {
        console.log(`found OH with multiplier ${coefficient} in ${term}: remaining term; ${reducedTerm}`);
        let coefficientPrefix = coefficient === 1 ? '' : `${coefficient}`;
        isAcid = false;
        equation = `${term.toLatex()} \\rightarrow ${reducedTerm.toLatex()}^{${coefficientPrefix}+} + ${coefficientPrefix}OH^-`;
    } else {
        coefficient = reducedTerm.findH(true);
        let coefficientPrefix = coefficient === 1 ? '' : `${coefficient}`;
        if (typeof coefficient === 'number') {
            console.log(`found H with multiplier ${coefficient} in ${term}: remaining term; ${reducedTerm}`);
            isAcid = true;
            equation = `${term.toLatex()} \\rightarrow ${coefficientPrefix}H^+ + ${reducedTerm.toLatex()}^{${coefficientPrefix}-}`;
        } else {
            throw `no H or OH found in formula`
        }
    }
    const cssStyle = isAcid ? "color:white;background:red;" : "color:white;background:purple;"
    steps.push(`<div style="border:1px solid black;padding:5px;${cssStyle};display:inline-block;margin-bottom:10px">`
        + `${term} is a${isAcid ? 'n acid' : ' base'}</div>`)
    steps.push('Dissociation equation:');
    steps.push({ latex: equation });
    coefficient = (typeof coefficient === 'number') ? coefficient : 1;
    return { isAcid, coefficient, steps };
}