const Terms = require('./term');
const Decimal = require('./decimal');

/**
 * 
 * @param {*} ast 
 * @param {*} context 
 */
const processAst = (ast, context = {}) => {
    if (ast instanceof Decimal) {
        return new Terms.Num(ast);
    }
    if (typeof ast === 'number') {
        return new Terms.Num(new Decimal(ast));
    }
    if (typeof ast === 'string') {
        const m = ast.match(/^[A-Z]/);
        return m ? new Terms.Variable(ast) : new Terms.Identifier(ast);
    }
    const { op } = ast;
    //console.log(`ast = ${JSON.stringify(ast)}`)
    const opClass = _operatorClass(op);
    switch (op) {
        case '+':
        case '*':
        case '^':
        case '=':
        case 'abs':
        case 'seq':
        case 'equation':
            const { operands } = ast;
            const processedOperands = operands.map(processAst);
            return new opClass(processedOperands);
        case 'fraction':
            const { numerator, denominator } = ast;
            const pnumerator = processAst(numerator);
            const pdenominator = processAst(denominator);
            return new Terms.Fraction([pnumerator, pdenominator]);
        case 'sqrt':
            const { degree, radicand } = ast;
            const pdegree = processAst(degree);
            const pradicand = processAst(radicand);
            return new Terms.Sqrt([pdegree, pradicand]);
        case 'uminus':
            const productOperands = [new Decimal(-1), ...ast.operands];
            const pOperands = productOperands.map(processAst);
            return new Terms.Product(pOperands);
        default:
            throw `unknown AST object: ${JSON.stringify(ast, null, 2)}, op: ${op}`;
    }
}

const _operatorClass = op => {
    switch (op) {
        case '+':
            return Terms.Sum;
        case '*':
            return Terms.Product;
        case '^':
            return Terms.Power;
        case 'fraction':
            return Terms.Fraction;
        case 'sqrt':
            return Terms.Sqrt;
        case '=':
        case 'equation':
            return Terms.Equation;
        case 'uminus':
            return Terms.Product;
        case 'abs':
            return Terms.Abs;
        case 'seq':
            return Terms.Seq;
        default:
            throw `unknown op "${op}"`;
    }
}

module.exports = { processAst };
