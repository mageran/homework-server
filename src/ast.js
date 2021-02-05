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
    if (typeof ast === 'string') {
        const m = ast.match(/^[A-Z]/);
        return m ? new Variable(ast) : new Terms.Identifier(ast);
    }
    const { op } = ast;
    const opClass = _operatorClass(op);
    switch (op) {
        case '+':
        case '*':
        case '^':
        case '=':
        case 'uminus':
        case 'abs':
        case 'seq':
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
            return Terms.Equation;
        case 'uminus':
            return Terms.UMinus;
        case 'abs':
            return Terms.Abs;
        case 'seq':
            return Terms.Seq;
        default:
            throw `unknown op "${op}"`;
    }
}

module.exports = { processAst };
