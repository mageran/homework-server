const UnitConversionsMap = {
    liquidVolume: {
        L: { metric: true, qts: new Decimal(1.0566882094326), ref: true },
        qts: { metric: false, L: new Decimal(0.946352946), ref: true },
        mL: { metric: true, L: new Decimal(0.001), oz: new Decimal(0.033814022701843) },
        oz: { metric: false, mL: new Decimal(29.5735295625), qts: new Decimal(0.03125) },
        gal: { metric: false, L: new Decimal(3.785411784), qts: new Decimal(4), },
    },
    length: {
        m: { metric: true, ft: new Decimal(3.2808398950131), ref: true },
        ft: { metric: false, m: new Decimal(0.3048), ref: true },
        mm: { metric: true, m: new Decimal(0.001), in: new Decimal(1).dividedBy(new Decimal(25.4)) },
        cm: { metric: true, m: new Decimal(0.01), in: new Decimal(1).dividedBy(new Decimal(2.54)) },
        km: { metric: true, m: new Decimal(1000), yd: new Decimal(1093.6132983377) },
        in: { metric: false, cm: new Decimal(2.54), ft: new Decimal(1).dividedBy(new Decimal(12)) },
        yd: { metric: false, m: new Decimal(0.91440000000001), ft: new Decimal(3) },
        mi: { metric: false, ft: new Decimal(5280), km: new Decimal(1.609344) }
    },
    weight: {
        g: { metric: true, ref: true, lb: new Decimal(0.0022046226218488) },
        lb: { metric: false, ref: true, g: new Decimal(453.59237) },
        kg: { metric: true, g: new Decimal(1000), lb: new Decimal(2.2046226218488) },
        tons: { metric: true, g: new Decimal(1000000) }

    },
    time: {
        sec: { metric: true, ref: true },
        min: { metric: true, sec: new Decimal(60) },
        hour: { metric: true, sec: new Decimal(3600) },
        msec: { metric: true, sec: new Decimal(0.001) }
    },
    temperature: {
        C: { K: (C => new Decimal(C).plus(new Decimal(273))), F: (C => new Decimal(C).times(new Decimal(1.8)).plus(32)) },
        F: { C: (F => new Decimal(F - 32).dividedBy(new Decimal(1.8))), K: (F => new Decimal(F - 32).dividedBy(new Decimal(1.8)).plus(new Decimal(273))) },
        K: { C: (K => new Decimal(K - 273)), F: (K => (new Decimal(K - 273)).times(new Decimal(1.8)).plus(new Decimal(32))) },
    },
};

const TemperatureFormulas = {
        C: {
            //K: (C => new Decimal(C).plus(new Decimal(273))),
            K: `K = {}^oC + 273`,
            //F: (C => new Decimal(C).times(new Decimal(1.8)).plus(32)),
            F: `F = {}^oC \\cdot 1.8 + 32`
        },
        F: {
            //C: (F => new Decimal(F - 32).dividedBy(new Decimal(1.8))),
            C: `C = \\fraction{F-32}{1.8}`,
            //K: (F => new Decimal(F - 32).dividedBy(new Decimal(1.8)).minus(new Decimal(273)))
            K: `K = \\fraction{F-32}{1.8} + 273`
        },
        K: {
            //C: (K => new Decimal(K - 273)),
            C: `C = K - 273`,
            //F: (K => (new Decimal(K - 273)).times(new Decimal(1.8)).plus(new Decimal(32)))
            F: `F = (K - 273) \\cdot 1.8 + 32`
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

const convertUnit = (fromUnit, toUnit, value = 1, exponent = 1) => {
    if (fromUnit === toUnit) {
        return { fromUnit, toUnit, value, steps: [], result: value };
    }
    assert((typeof fromUnit === 'string') && (typeof toUnit === 'string'), "unit arguments must be strings");
    const fromUnitInfo = _findUnitCategory(fromUnit);
    const toUnitInfo = _findUnitCategory(toUnit);
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
                factor = new Decimal(1).dividedBy(toMap[from])
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
        step.quotient = new Decimal(1).dividedBy(step.factor);
        step.exponent = exponent;
    });
    const result = steps.reduce((res, step) => res.dividedBy(step.quotient.pow(exponent)), new Decimal(value));
    const returnValue = { fromUnit, toUnit, value, steps, result };
    console.log(JSON.stringify(returnValue, null, 2));
    return returnValue;
}