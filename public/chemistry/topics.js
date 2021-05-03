

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
            options: chemicalElementsAlphabetically.map(element => ({ label: `${element.name} (${element.symbol})`, value: element.symbol}))
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

const topicObjects = [
    _solutionConcentration,
    _lewisStructureWidget,
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
