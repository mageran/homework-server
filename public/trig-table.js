const initializeInverseTrigTable = () => {
    const trigTable = {
        arccos: {
            base: 'cos',
            latex: 'cos^{-1}',
            domainLatex: '[-1,1]', rangeLatex: '[0,\\pi]',
            angleIsInRange: angle => angle.degree >= 0 && angle.degree <= 180,
            angles: [0, 30, 45, 60, 90, 120, 135, 150, 180]
        },
        arcsin: {
            base: 'sin',
            latex: 'sin^{-1}',
            domainLatex: '[-1,1]', rangeLatex: '[-\\frac{\\pi}{2},\\frac{\\pi}{2}]',
            angleIsInRange: angle => angle.degree >= -90 && angle.degree <= 90,
            angles: [-90, -60, -45, -30, 0, 30, 45, 60, 90]
        },
        arctan: {
            base: 'tan',
            latex: 'tan^{-1}',
            domainLatex: '(-\\infinity, \\infinity)', rangeLatex: '(-\\frac{\\pi}{2},\\frac{\\pi}{2})',
            angleIsInRange: angle => angle.degree > -90 && angle.degree < 90,
            angles: [-60, -45, -30, 0, 30, 45, 60]
        },
        arccot: {
            base: 'cot',
            latex: 'cot^{-1}',
            domainLatex: '(-\\infinity, \\infinity)', rangeLatex: '(0,\\pi)',
            angleIsInRange: angle => angle.degree > 0 && angle.degree < 180,
            angles: [30, 45, 60, 90, 120, 135, 150]
        },
        arcsec: {
            base: 'sec',
            latex: 'sec^{-1}',
            domainLatex: '(-\\infinity, -1] \\cup [1,\\infinity)',
            rangeLatex: '[0,\\frac{\\pi}{2})\\cup(\\frac{\\pi}{2},\\pi]',
            angleIsInRange: angle => angle.degree >= 0 && angle.degree <= 180 && angle.degree !== 90,
            angles: [0, 30, 45, 60, 120, 135, 150, 180]
        },
        arccsc: {
            base: 'csc',
            latex: 'csc^{-1}',
            domainLatex: '(-\\infinity, -1] \\cup [1,\\infinity)',
            rangeLatex: '[-\\frac{\\pi}{2},0)\\cup(0,\\frac{\\pi}{2}]',
            angleIsInRange: angle => angle.degree >= -90 && angle.degree <= 90 && angle.degree !== 0,
            angles: [-90, -60, -45, -30, 30, 45, 60, 90]
        }
    }
    Object.keys(trigTable).forEach(fn => {
        const { base, angles } = trigTable[fn];
        trigTable[fn].values = [];
        angles.forEach(degree => {
            const angle = Angle.fromDegree(degree);
            const value = angle[base];
            trigTable[fn].values.push({ value, angle });
        })
    })
    console.log(trigTable);
    return trigTable;
}

const TrigTable = initializeInverseTrigTable();