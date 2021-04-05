const UnitConversionsMap = {
    liquidVolume: {
        L: { metric: true, qts: _d(1.0566882094326), ref: true },
        qts: { metric: false, L: _d(0.946352946), ref: true },
        mL: { metric: true, L: _d(0.001), oz: _d(0.033814022701843) },
        oz: { metric: false, mL: _d(29.5735295625), qts: _d(0.03125) },
        gal: { metric: false, L: _d(3.785411784), qts: _d(4), },
        'm^3': { metric: true, L: _d(1000) },
        'dm^3': { metric: true, L: _d(1) },
        'cm^3': { metric: true, L: _d(0.001) },
        'mm^3': { metric: true, L: _d("1e-6") }
    },
    length: {
        m: { metric: true, ft: _d(3.2808398950131), ref: true },
        ft: { metric: false, m: _d(0.3048), ref: true },
        mm: { metric: true, m: _d(0.001), in: _d(1).dividedBy(_d(25.4)) },
        cm: { metric: true, m: _d(0.01), in: _d(1).dividedBy(_d(2.54)) },
        dm: { metric: true, m: _d(0.1) },
        km: { metric: true, m: _d(1000), yd: _d(1093.6132983377) },
        in: { metric: false, cm: _d(2.54), ft: _d(1).dividedBy(_d(12)) },
        yd: { metric: false, m: _d(0.91440000000001), ft: _d(3) },
        mi: { metric: false, ft: _d(5280), km: _d(1.609344) }
    },
    weight: {
        mg: { metric: true, g: _d(0.001) },
        g: { metric: true, ref: true, lb: _d(0.0022046226218488) },
        lb: { metric: false, ref: true, g: _d(453.59237) },
        kg: { metric: true, g: _d(1000), lb: _d(2.2046226218488) },
        tons: { metric: true, g: _d(1000000) }

    },
    time: {
        sec: { metric: true, ref: true },
        min: { metric: true, sec: _d(60) },
        hour: { metric: true, sec: _d(3600) },
        msec: { metric: true, sec: _d(0.001) }
    },
    temperature: {
        K: { C: (K => _d(K - 273.15)), F: (K => (_d(K - 273.15)).times(_d(1.8)).plus(_d(32))) },
        C: { K: (C => _d(C).plus(_d(273.15))), F: (C => _d(C).times(_d(1.8)).plus(32)) },
        F: { C: (F => _d(F - 32).dividedBy(_d(1.8))), K: (F => _d(F - 32).dividedBy(_d(1.8)).plus(_d(273.15))) },
    },
    pressure: {
        atm: { ref: true, Pa: _d(101325), mmHg: _d(760), torr: _d(760), lbin2: _d(14.7) },
        bar: { atm: _d(0.9869), Pa: _d(100000) },
        mmHg: { atm: _d(1).div(_d(760)) },
        Pa: { atm: _d(1).div(_d(101325)) },
        kPa: { atm: _d(1000).div(_d(101325))},
        torr: { atm: _d(1).div(_d(760)) },
        lbin2: {
            atm: _d(1).div(_d(14.6959)),
            sameAs: { unit: 'lb', exponent: 1, quotientUnit: 'in', quotientExponent: 2 }
        }
    }
};

const TemperatureFormulas = {
        C: {
            //K: (C => _d(C).plus(_d(273))),
            K: `K = {}^oC + 273.15`,
            //F: (C => _d(C).times(_d(1.8)).plus(32)),
            F: `F = {}^oC \\cdot 1.8 + 32`
        },
        F: {
            //C: (F => _d(F - 32).dividedBy(_d(1.8))),
            C: `C = \\fraction{F-32}{1.8}`,
            //K: (F => _d(F - 32).dividedBy(_d(1.8)).minus(_d(273)))
            K: `K = \\fraction{F-32}{1.8} + 273.15`
        },
        K: {
            //C: (K => _d(K - 273)),
            C: `C = K - 273.15`,
            //F: (K => (_d(K - 273)).times(_d(1.8)).plus(_d(32)))
            F: `F = (K - 273.15) \\cdot 1.8 + 32`
        },
}

const _isNumberOrDecimal = n => ((typeof n === 'number') || (n instanceof Decimal));

const unitConversionFactor = 10;

const _findUnitCategory = unit => {
    const categories = Object.keys(UnitConversionsMap);
    for(let i = 0; i < categories.length; i++) {
        let category = categories[i];
        let conversionMap = UnitConversionsMap[category];
        if (conversionMap[unit]) {
            return { category, conversionMap };
        }
    }
    throw `unit not supported: "${unit}"`
}

const _specialCasePressure = (unit, unitExponent, quotientUnit, quotientExponent, otherUnit, otherUnitExponent, otherQuotientUnit, otherQuotientExponent) => {
    const unitCategory = _findUnitCategory(unit).category;
    if (unitCategory === 'pressure' && unitExponent === 1 && !quotientUnit) {
        if (otherQuotientExponent !== 2) {
            console.log(`otherQuotientExponent is ${otherQuotientExponent}, should be 2`);
            return false;
        }
        let otherUnitCategory = _findUnitCategory(otherUnit).category;
        if (otherUnitCategory !== 'weight') {
            console.log(`otherUnitCategory is ${otherUnitCategory}, should be 'weight'`);
            return false;
        }
        let otherQuotientCategory = _findUnitCategory(otherQuotientUnit).category;
        if (otherQuotientCategory !== 'length') {
            console.log(`otherQuotientCategory is ${otherQuotientCategory}, should be 'length'`);
            return false;
        }
        console.log('conversion from/to lbin2 detected');
        return true;
    }
}

const convertUnit = (fromUnit, toUnit, value = 1, exponent = 1) => {
    if (fromUnit === toUnit) {
        return { fromUnit, toUnit, value, steps: [], result: value };
    }
    assert((typeof fromUnit === 'string') && (typeof toUnit === 'string'), "unit arguments must be strings");
    var fromUnitInfo = _findUnitCategory(fromUnit);
    var toUnitInfo = _findUnitCategory(toUnit);
    assert(fromUnitInfo.category === toUnitInfo.category, `units ${fromUnit} and ${toUnit} are cannot be converted into each other`);
    const { category, conversionMap } = fromUnitInfo;
    if (category === 'temperature') {
        const fun = conversionMap[fromUnit][toUnit];
        const result = fun(value);
        const steps = [ { fromUnit, toUnit } ];
        return { fromUnit, toUnit, value, steps, formula: TemperatureFormulas[fromUnit][toUnit], result };
    }
    const steps = [];
    const findReferenceUnit = metric => {
        const units = Object.keys(conversionMap);
        for(let i = 0; i<units.length; i++) {
            let unit = units[i];
            let unitMap = conversionMap[unit];
            if (unitMap.metric != metric) continue;
            if (unitMap.ref) {
                return unit;
            }
        }
        throw `can't find reference unit for category ${category}, metric=${metric}`;
    }
    const findOppositeMetricUnit = unit => {
        const unitMap = conversionMap[unit];
        const oppositeMetric = !unitMap.metric;
        const units = Object.keys(unitMap);
        for(let i = 0; i < units.length; i++) {
            let otherUnit = units[i];
            let factor = unitMap[otherUnit];
            if (!(_isNumberOrDecimal(factor))) continue;
            if (conversionMap[otherUnit].metric === oppositeMetric) {
                return { otherUnit, factor: unitMap[otherUnit] };
            }
        }
        throw `no mapping to opposite system unit found for "${unit}"`;
    }
    const convSteps = (from, to) => {
        if (from === to) {
            return;
        }
        const fromMap = conversionMap[from];
        const toMap = conversionMap[to]
        const fromIsMetric = fromMap.metric;
        const toIsMetric = toMap.metric;
        if (fromIsMetric === toIsMetric) {
            var factor;
            if (_isNumberOrDecimal(fromMap[to])) {
                factor = fromMap[to];
            }
            else if (_isNumberOrDecimal(toMap[from])) {
                factor = _d(1).dividedBy(toMap[from])
                //factor = precision(1/toMap[from], unitConversionFactorPrecision);
            }
            else {
                let runit = findReferenceUnit(fromIsMetric);
                let fromFac = fromMap[runit]
                let toFac = toMap[runit];
                assert(_isNumberOrDecimal(fromFac), `conversion to reference unit missing for "${from}"`);
                assert(_isNumberOrDecimal(toFac), `conversion to reference unit missing for "${to}"`);
                //factor = precision(fromFac/toFac, unitConversionFactorPrecision);
                factor = fromFac.dividedBy(toFac);
            }
            steps.push({ fromUnit: from, toUnit: to, factor });
            return;
        } else {
            let { otherUnit, factor } = findOppositeMetricUnit(fromUnit);
            steps.push({ fromUnit: from, toUnit: otherUnit, factor });
            convSteps(otherUnit, toUnit);
            return;
        }
    }
    convSteps(fromUnit, toUnit);
    steps.forEach(step => {
        step.quotient = _d(1).dividedBy(step.factor);
        step.exponent = exponent;
    });
    const result = steps.reduce((res, step) => res.dividedBy(step.quotient.pow(exponent)), _d(value));
    const returnValue = { fromUnit, toUnit, value, steps, result };
    console.log(JSON.stringify(returnValue, null, 2));
    return returnValue;
}

const getConversionResult = convInfo => {
    const { toUnit, result } = convInfo;
    return { unit: toUnit, value: result };
}

const concatConvInfo = (convInfo1, convInfo2) => {
    const fromUnit = convInfo1.fromUnit;
    const toUnit = convInfo2.toUnit;
    const value = convInfo1.value;
    const steps = convInfo1.steps.concat(convInfo2.steps);
    const result = convInfo2.result;
    const exponent = convInfo1.exponent;
    return { fromUnit, toUnit, value, exponent, steps, result };
}