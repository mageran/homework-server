

/*
const _describeTransformations = {
    title: "Describe function transformations",
    description: `Describes the function transformation for a parent function f(x) for
        a f(b(x-h)) + k
        `,
    parameters: [
        { name: 'a', value: 1 },
        { name: 'b', value: 1 },
        { name: 'h', value: 0 },
        { name: 'k', value: 0 },
    ],
    func: describeTransformation
}
*/

const unitOptions = (umap => {
    const options = [];
    Object.keys(umap).forEach(cat => {
        options.push({ label: `--- ${cat} ---`, value: null });
        const map = umap[cat];
        Object.keys(map).forEach(u => {
            const label = u;
            const value = u;
            options.push({ label, value });
        })
    })
    return options;
})(UnitConversionsMap)

const unitOptionsQuotient = [{ label: 'NONE', value: undefined }].concat(unitOptions);

const _unitConversion = {
    title: "Unit conversion",
    description: "Unit conversion",
    parameters: [
        { name: 'value', value: '1' },
        { separator: true },
        { name: 'from Unit', type: 'select', options: unitOptions },
        { name: 'from Exponent', value: 1 },
        { name: '/ Unit', type: 'select', options: unitOptionsQuotient },
        { name: '/ Exponent', value: 1 },
        { separator: true },
        { name: 'to Unit', type: 'select', options: unitOptions },
        { name: 'to Unit Exponent', value: 1 },
        { name: '/ Unit', type: 'select', options: unitOptionsQuotient },
        { name: '/ Exponent', value: 1 },
        { separator: true },
    ],
    func: unitConversion
}

const _chemicalElementInfo = {
    title: 'Element Info',
    description: 'Information for chemical element',
    parameters: [
        {
            name: 'Element symbol: ',
            type: 'select',
            options: chemicalElementsAlphabetically.map(element => ({ label: `${element.name} (${element.symbol})`, value: element.symbol }))
        }
    ],
    func: chemicalElementInfoUi
}

const _balanceChemicalEquation = {
    title: 'Balancing Chemical Equations',
    description: 'Example: KMnO4 + HCl = KCl + MnCl2 + H2O + Cl2',
    parameters: [
        { name: 'Max balancing factor', value: 20, size: 4 },
        { separator: true },
        { name: 'Chemical Equation', type: 'formula', cssClass: 'width700' },
    ],
    testValues: [
        [20, 'KMnO4 + HCl = KCl + MnCl2 + H2O + Cl2']
    ],
    func: balanceChemicalEquation
}

const _molarMass = {
    title: 'Molar Mass Calculator',
    description: '',
    parameters: [
        { name: 'Chemical Formula', type: 'formula', cssClass: 'width500' }
    ],
    func: molarMassUi
}

const _stoichiometry = {
    title: 'Stoichiometry - Find limiting/excess reactant',
    description: '',
    parameters: [
        { name: 'Max balancing factor', value: 20, size: 4 },
        { separator: true },
        { name: 'Chemical Equation', type: 'formula', cssClass: 'width700' },
    ],
    func: stoichiometryFindLimitingReactant
}

const _stoichiometryMissingQuantity = {
    title: 'Stoichiometry - Missing quantities questions',
    description: 'Starting from a (balanced) equation, find missing reactant or product terms',
    parameters: [
        { name: 'Max balancing factor', value: 20, size: 4 },
        { separator: true },
        { name: 'Chemical Equation', type: 'formula', cssClass: 'width700' },
    ],
    func: stoichiometryMissingQuantities
}

const _chemicalQuery = {
    title: 'Lookup Chemical Compound/Element',
    description: 'Enter name of chemical compound or element to lookup formula and other properties',
    parameters: [
        { name: 'Element or compound', value: '', size: 50 },
        { separator: true }
    ],
    func: chemicalQuery
}

const _gasLaws = {
    title: 'Gas Laws',
    description: 'Select Gas law and determine missing values.',
    parameters: [],
    func: gasLaws
}

const _lewisStructureWidget = {
    title: 'Lewis Structure',
    description: '',
    parameters: [],
    func: lewisStructureWidget,
}

const _solutionConcentration = {
    title: 'Solution concentration formulas',
    description: 'Calculate Molarity, molality, mole fraction, dilution of solutions',
    parameters: [],
    func: solutionConcentrationUI,
}

const _electronegativity = {
    title: 'Electronegativity of Chemical Formula',
    description: 'Lookup electronegativity for the elements in the given chemical formula',
    parameters: [
        { name: 'Formula', type: 'formula', cssClass: 'width500' }
    ],
    testValues: [['NaCl'], ['SO2'], ['CO2'], ['Al2S3'], ['MgO'], ['MgCl2']],
    func: electronegativityUI
}

const _equilibrium = {
    title: 'Equilibrium',
    description: `Equilibrium questions based on reaction equation; state information can be added to the components,
    e.g. <kbd>NH3(g) + H2O(l) ⇋ NH4(aq) + OH(aq)</kbd>`,
    parameters: [
        { name: 'Max balancing factor', value: 20, size: 4 },
        { separator: true },
        { name: 'Chemical equation', type: 'formula', cssClass: 'width700' },
        { separator: true },
        { name: 'Molarities/Equilibrium', type: 'dynamic', func: equilibriumGetDynamicParameters },
        { separator: true },
    ],
    func: equilibrium,
    testValues: [
        { label: 'Q11a', values: [20, 'H2(g) + I2(g) = HI(g)']},
        { label: 'Q11b', values: [20, 'NH4Cl(s) = NH3(g) + HCl(g)']},
        { label: 'Q11c', values: [20, 'SnO2(s) + 2CO(g) = Sn(s) + 2CO2(g)']},
        { label: 'Q11d', values: [20, 'CO2(g) + H2(g) = CO(g) + H2O(l)']},
        { label: 'Q12', values: [20, 'NH3(g) + H2O(l) ⇋ NH4(aq) + OH(aq)', '', '6.82e-3', '3.50e-4', '3.50e-4']},
        { label: 'Q13', values: [20, '2SO2(g) + O2(g) = 2SO3(g)', '', '0.344', '0.172', '0.056']},
        { label: 'Q14', values: [20, 'N2(g) + 3H2(g) = 2NH3 (g)', '.080', '0.600', '0.420', '']},
        { label: 'Q15', values: [20, 'N2(g) + O2(g) = 2NO(g)', '0.0025', '0.81', '0.75', '0.030']},
        { label: 'Q16', values: [20, '2CO(g) = C(s) + CO2(g)', '7.7e-15', '0.034', '3.6e-17']},
        { label: 'Q17', values: [20, 'N2O4(g) = 2NO2(g)', '0.2', '2.0', '0.2']},
    ]
}

const _pHpOHCalculations_ = {
    title: 'pH/pOH from molarity of acid/base',
    description: 'Determine missing values between molarity of a acid or base, ph, or pOH value',
    parameters: [
        { name: _fwl('Name/Formula', 150), value: '', cssClass: 'width500' },
        { separator: true },
        { 
            name: _fwl('Acid or Base'), 
            type: 'select', 
            options: [
                { label: 'Auto detect using name/formula', value: 'auto' },
                { label: 'Acid', value: 'acid' },
                { label: 'Base', value: 'base' },
            ]
        },
        { separator: true },
        { name: _fwl('Molarity'), value: '', cssClass: 'big-input', noEval: true },
        { separator: true },
        { name: _fwl('pH'), value: '' },
        { separator: true },
        { name: _fwl('pOH'), value: '' },
        { separator: true },
    ],
    func: pHpOHCalculations,
    testValues: [
        ['Hydrochloric acid', 'auto', '0.023']
    ]
}

const _pHpOHCalculations = {
    title: 'pH/pOH from molarity of acid/base',
    description: 'Determine missing values between molarity of a acid or base, ph, or pOH value',
    parameters: [
        { name: _fwl('Formula', 150), value: '', cssClass: 'width500' },
        { separator: true },
        /*{ 
            name: _fwl('Acid or Base'), 
            type: 'select', 
            options: [
                { label: 'Auto detect using name/formula', value: 'auto' },
                { label: 'Acid', value: 'acid' },
                { label: 'Base', value: 'base' },
            ]
        },*/
        { separator: true },
        { name: _fwl('Molarity'), value: '', cssClass: 'big-input', noEval: true },
        { separator: true },
        { name: _fwl('pH'), value: '' },
        { separator: true },
        { name: _fwl('pOH'), value: '' },
        { separator: true },
    ],
    func: pHpOHCalculations,
    testValues: [
        ['HCl', '0.023'],
        ['HNO3', '6.6e-6'],
        ['KOH', '0.0334'],
        ['H3As','1e-5'],
        ['Al(OH)3','2.23e-2'],
        ['Mg(OH)2','0.000901'],
        ['H2S','7.23e-5'],
        ['HCl','2.58e-6'],
        ['NaOH','0.000469'],
        ['H2SO4','0.000896'],
        ['Sr(OH)2','0.0010'],
        ['Al(OH)3','0.0050'],
        ['Ca(OH)2','0.000675'],
        ['Ca(OH)2','', '', '2.87'],
        ['Ca(OH)2','', '11.13', ''],
    ]
}

const _pHFromToConcentration = {
    title: 'pH/pOH <-> [H3O+]/[OH-]',
    description: 'determine H3O+ and OH- concentration from pH/pOH and vice versa; enter only one of the values, the rest will be calculated.',
    parameters: [
        { name: _fwl('pH', 80), value: '', noEval: true },
        { separator: true },
        { name: _fwl('pOH'), value: '', noEval: true },
        { separator: true },
        { name: _fwl('[H3O+]'), value: '', noEval: true },
        { separator: true },
        { name: _fwl('[OH-]'), value: '', noEval: true },
        { separator: true },
    ],
    func: pHFromToConcentration,
    testValues: [
        ['', '', '0.0032', '']
    ]
}

const topicObjects = [
    _pHFromToConcentration,
    _pHpOHCalculations,
    '-------------',
    _equilibrium,
    '-------------',
    _solutionConcentration,
    _lewisStructureWidget,
    _electronegativity,
    '-------------',
    _gasLaws,
    _chemicalQuery,
    '-------------',
    _unitConversion,
    _chemicalElementInfo,
    _molarMass,
    _balanceChemicalEquation,
    _stoichiometry,
    _stoichiometryMissingQuantity,
];
