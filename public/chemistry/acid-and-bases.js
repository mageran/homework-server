function pHpOHCalculations(nameOrFormula, acidOrBase, molarity, ph, pOH) {
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
        if (!nameOrFormula) {
            return Promise.reject(`please fill in the name/formula field`);
        }
        const ab = fromName(nameOrFormula);
        if (ab) {
            return Promise.resolve(ab);
        }
        const queryString = `${nameOrFormula} alternate names`;
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
                steps.push(nameOrFormula ? `${nameOrFormula} is a${isAcid ? "n" : ""} ${acidOrBase}` : `Processing as ${acidOrBase}`);
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

/**
 * calculates the missing values from H3O+ and OH- concentration and pH or pOH values
 * @param {*} h3o 
 * @param {*} oh 
 * @param {*} pH 
 * @param {*} pOH 
 * @returns 
 */
const calculatePHFromToConcentration = (pH, pOH, h3o, oh) => {
    const steps = [];
    const molarity = h3o ? h3o : oh;
    const isAcidGiven = !!h3o
    const phPOH = pH ? pH : pOH;
    const isPHGiven = !!pH;
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
    steps.push(`(calculated sig figs: ${sigFigs})`);
    if (molarity) {
        let pH = isAcidGiven ? 'pH' : 'pOH';
        let pOH = isAcidGiven ? 'pOH' : 'pH';
        let oh = isAcidGiven ? 'OH^-' : 'H_3O^+';
        let m = _d(molarity);
        let pHres = m.log(10).negated();
        let pHDisp = pHres.toPrecision(sigFigs);
        let pOHres = _d(14).minus(pHres);
        let pOHDisp = pOHres.toPrecision(sigFigs);
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
    else if (phPOH) {
        let [h3o, oh, pH, pOH] = isPHGiven
            ? ['H_3O^+', 'OH^-', 'pH', 'pOH']
            : ['OH^-', 'H_3O^+', 'pOH', 'pH'];
        let phValue = _d(phPOH);
        let phDisp = phValue.toPrecision(sigFigs);
        let pOHvalue = _d(14).minus(phValue);
        let pOHDisp = pOHvalue.toPrecision(sigFigs);
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
    else {
        throw `no values given...`;
    }
    return steps
}

function pHFromToConcentration(h3o, oh, pH, pOH) {
    const o = this;
    elemStyle(o, { fontSize: '16pt' });
    try {
        const steps = [];
        steps.push(...calculatePHFromToConcentration(h3o, oh, pH, pOH));
        _showComputationSteps(o, steps);
    } catch (err) {
        _addErrorElement(o, err);
    }
}