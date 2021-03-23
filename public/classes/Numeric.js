/**
 * super class for numeric types 
 */

class Numeric {

    constructor() {
    }

    decimalValue() {
    }

    simplify() {
        return this;
    }

    negate() {
        return this.multiply(-1);
    }

    multiply(factor) {
        return this;
    }

    needParenthesis(context) {
        return false;
    }

    getParenthesis(context) {
        const np = !!context && this.needParenthesis(context);
        const open = np ? "(" : "";
        const close = np ? ")" : "";
        return { open, close };
    }

    toString() {
    }

    toLatex() {
    }

    clone() {
        return new Numeric();
    }
}

class Decimal extends Numeric {
    constructor(number) {
        super();
        this.number = number;
    }

    decimalValue() {
        return this.number;
    }

    multiply(factor) {
        const res = this.clone();
        res.number *= factor;
        return this;
    }

    power(exponent) {
        const res = this.clone();
        res.number = Math.pow(res.number, exponent);
        return this;
    }

    toString() {
        return String(this.number);
    }

    toLatex() {
        return String(this.number);
    }

    clone() {
        return new Decimal(this.number);
    }
}

class Variable extends Numeric {
    constructor(identifier) {
        super();
        this.identifier = identifier;
    }

    decimalValue() {
        throw `decimal value for identifier ${this.identifier} not set`;
    }

    isSameVariable(x) {
        return (x instanceof Variable) && this.identifier === x.identifier;
    }

    toString() {
        return this.identifier;
    }

    toLatex() {
        return this.identifier;
    }
}

class Constant extends Variable {
    constructor(identifier, value) {
        super(identifier);
        this.value = value;
    }

    decimalValue() {
        return this.value;
    }

    toString() {
        return this.identifier;
    }

    toLatex() {
        return this.identifier;
    }
}

class PiConstant extends Constant {
    constructor() {
        super('pi', Math.PI);
    }

    toLatex() {
        return '\\pi{}';
    }

}

class Sum extends Numeric {
    constructor(...operands) {
        super();
        this.operands = operands;
    }

    addOperands(...operands) {
        this.operands.push(...operands);
    }

    decimalValue() {
        return this.operands.map(operand => operand.decimalValue()).reduce((aggr, v) => aggr + v, 0);
    }

    _summarizeDecimals() {
        const newOperands = [];
        var decimalSum = 0;
        this.operands.forEach(operand => {
            if (operand instanceof Decimal) {
                decimalSum += operand.decimalValue();
            } else {
                newOperands.push(operand);
            }
        })
        if (decimalSum !== 0) {
            newOperands.push(new Decimal(decimalSum));
        }
        this.operands = newOperands;
    }

    simplify() {
        this.operands = this.operands.map(operand => operand.simplify());
        this._summarizeDecimals();
        if (this.operands.length === 1) {
            return this.operands[0];
        }
        return this;
    }

    needParenthesis(context) {
        return !(context instanceof Sum);
    }

    toString(context) {
        const { open, close } = this.getParenthesis(context);
        const sumString = this.operands.map(operand => operand.toString(this)).join(" + ");
        return open + sumString + close;
    }

    toLatex(context) {
        const { open, close } = this.getParenthesis(context);
        const sumString = this.operands.map(operand => operand.toLatex(this)).join(" + ");
        return open + sumString + close;
    }
}

class Product extends Numeric {
    constructor(...operands) {
        super();
        this.operands = operands;
    }

    addOperands(...operands) {
        this.operands.push(...operands);
    }

    decimalValue() {
        if (this.operands.length === 0) {
            throw `product with no operands`;
        }
        return this.operands.map(operand => operand.decimalValue()).reduce((aggr, v) => aggr * v, 1);
    }

    _summarizeDecimals() {
        const newOperands = [];
        var decimalProduct = 1;
        this.operands.forEach(operand => {
            if (operand instanceof Decimal) {
                decimalProduct *= operand.decimalValue();
            } else {
                newOperands.push(operand);
            }
        })
        if (decimalProduct !== 1) {
            newOperands.push(new Decimal(decimalProduct));
        }
        this.operands = newOperands;
    }

    simplify() {
        this.operands = this.operands.map(operand => operand.simplify());
        this._summarizeDecimals();
        if (this.operands.length === 1) {
            return this.operands[0];
        }
        return this;
    }

    needParenthesis(context) {
        return !(context instanceof Sum);
    }

    toString(context) {
        const { open, close } = this.getParenthesis(context);
        const sumString = this.operands.map(operand => operand.toString(this)).join(" + ");
        return open + sumString + close;
    }

    toLatex(context) {
        const { open, close } = this.getParenthesis(context);
        const sumString = this.operands.map(operand => operand.toLatex(this)).join(" + ");
        return open + sumString + close;
    }
}

class NthRoot extends Numeric {

    constructor(radicand, exponent = 2, factor = 1) {
        super();
        this.radicand = radicand;
        this.exponent = exponent;
        this.factor = factor;
        if (radicand < 0) {
            throw "negative radicand ${radicand} not (yet) supported";
        }
    }

    clone() {
        return new NthRoot(this.radicand, this.exponent, this.factor);
    }

    decimalValue() {
        var value;
        if (exponent === 2) {
            value = Math.sqrt(radicand);
        } else if (exponent === 0) {
            value = 1;
        } else {
            value = Math.pow(radicand, 1 / exponent);
        }
        value *= this.factor;
        return value;
    }

    simplify() {
        const { radicand, factor, exponent } = this;
        let [newFactor, newRadicand] = _simplyfySquareRoot(radicand);
        this.factor = newFactor * this.factor;
        this.radicand = newRadicand;
        if (this.radicand === 0) {
            return new Decimal(0);
        }
        if (Math.abs(this.radicand) === 1) {
            //return new Decimal(this.factor * this.radicand);
            return this.factor * this.radicand;
        }
        if (this.exponent === 1) {
            return this.factor * this.radicand;
        }
        return this;
    }

    multiply(factor) {
        const res = this.clone();
        res.factor *= factor;
        return res;
    }

    power(exponent) {
        if (exponent === 0) {
            return 1;
        }
        const res = this.clone();
        res.exponent = res.exponent / exponent;
        res.factor = powerNumeric(res.factor, exponent);
        return res.simplify();
    }

    toString(latex = false) {
        var s = "";
        if (this.radicand === 0) {
            return '0';
        }
        if (this.plusMinus) {
            s += latex ? '\\pm' : '\u00b1';
        }
        if (Math.sign(this.factor) < 0) {
            s += '-'
        }
        const f = Math.abs(this.factor);
        if (f !== 1) {
            s += `${f}`;
            s += latex ? '\\cdot ' : '* ';
        }
        if (latex) {
            let expstr = this.exponent === 2 ? '' : `[${this.exponent}]`;
            s += `\\sqrt${expstr}{${this.radicand}}`;
        } else {
            let rootFun = this.exponent === 2 ? 'sqrt' : 'nthroot';
            let expstr = this.exponent === 2 ? '' : `, ${this.exponent}`;
            s += `${rootFun}(${this.radicand}${expstr})`;
        }
        return s;
    }

    toLatex() {
        return this.toString(true);
    }
}

class SquareRoot extends NthRoot {
    constructor(radicand, factor = 1, plusMinus = false) {
        super(radicand, 2, factor, plusMinus);
    }

    clone() {
        return new SquareRoot(this.radicand, this.factor, this.plusMinus);
    }
}

class Fraction2 extends Numeric {
    constructor(numerator, denominator, keepNumerator = false) {
        super();
        this.numerator = numerator;
        this.denominator = denominator;
        if ((typeof numerator) === 'number' && (typeof denominator === 'number')) {
            this.fractionObject = new Fraction(numerator, denominator);
        }
    }

    expand(factor) {
        if (this.fractionObject) {
            return;
        }
    }

    reduce(divisor) {
        if (this.fractionObject) {
            return;
        }

    }

    simplify() {
        if (this.fractionObject) {
            return this;
        }
        this.numerator = simplifyNumeric(this.numerator);
        this.denominator = simplifyNumeric(this.denominator);
        if ((this.denominator instanceof SquareRoot) && (typeof this.numerator === 'number')) {
            const { radicand, factor } = this.denominator;
            this.numerator = sqrt(radicand, multiplyNumeric(this.numerator, Math.sign(factor)));
            this.denominator = Math.abs(factor) * radicand;
        }
        if ((this.denominator instanceof SquareRoot) && (this.numerator instanceof SquareRoot)) {
            console.log(`numerator and denominator are square roots`);
            const { radicand, factor } = this.denominator;
            this.numerator = sqrt(radicand * this.numerator.radicand, multiplyNumeric(this.numerator.factor, Math.sign(factor)));
            this.denominator = Math.abs(factor) * radicand;
        }
        if (typeof this.denominator === 'number' && Math.abs(this.denominator) === 1) {
            if (Math.sign(this.denominator) < 0) {
                return multiplyNumeric(this.numerator, -1);
            } else {
                return this.numerator;
            }
        }
        return this;
    }

    multiply(factor) {
        const res = this.clone();
        if (res.fractionObject) {
            res.fractionObject.multiply(factor);
        } else {
            res.numerator = multiplyNumeric(res.numerator, factor);
        }
        return res;
    }

    power(exponent) {
        const res = this.clone();
        if (res.fractionObject) {
            res.fractionObject.power(exponent);
        } else {
            res.numerator = powerNumeric(res.numerator, exponent);
            res.denominator = powerNumeric(res.denominator, exponent);
        }
        return res;
    }

    toString(latex = false) {
        if (latex) {
            return this.toLatex(this.keepNumerator);
        }
        if (this.fractionObject) {
            this.fractionObject.normalize();
            return this.fractionObject.toString(this.keepNumerator);
        }
        return `${numericToString(this.numerator)}/${numericToString(this.denominator)}`;
    }

    toLatex(keepNumerator = true) {
        if (this.fractionObject) {
            this.fractionObject.normalize();
            return this.fractionObject.toLatex(keepNumerator);
        }
        return `\\frac{${numericToLatex(this.numerator)}}{${numericToLatex(this.denominator)}}`;
    }


    clone() {
        return new Fraction2(this.numerator, this.denominator);
    }
}

// -----------------------------------------------------------------------------------------
// Generic dispatch functions
// -----------------------------------------------------------------------------------------

const ensureNumeric = obj => {
    if (obj instanceof Numeric) {
        return obj;
    }
    if (obj instanceof Fraction) {
        return new Fraction2(obj.numerator, obj.denominator);
    }
    if (typeof obj !== 'number') {
        throw `cannot convert "${obj}" into a numeric object`;
    }
    return new Decimal(obj);
}

const simplifyNumeric = obj => {
    if (obj instanceof Numeric) {
        return obj.simplify();
    }
    return obj;
}

const multiplyNumeric = (obj, factor) => {
    if (obj instanceof Numeric) {
        return obj.multiply(factor);
    }
    if (typeof obj === 'number') {
        return factor * obj;
    }
    throw `trying to apply multiplication to a non-numeric object ${obj}`;
}

const powerNumeric = (obj, exponent) => {
    if (obj instanceof Numeric) {
        return obj.power(exponent);
    }
    if (typeof obj === 'number') {
        return Math.pow(obj, exponent);
    }
    throw `trying to apply power operation to a non-numeric object ${obj}`;
}

const numericToString = (obj, latex = false) => {
    if (obj instanceof Fraction) {
        return latex ? obj.toLatex(true) : obj.toString();
    }
    if (obj instanceof Numeric) {
        return obj.toString(latex);
    }
    if (latex && (obj instanceof FactorOfPi)) {
        return obj.toLatex();
    }
    return String(obj);
}

const numericToLatex = obj => {
    return numericToString(obj, true);
}

const sqrt = (...args) => new SquareRoot(...args);
const fraction = (...args) => new Fraction2(...args);
const minus = obj => {
    if (typeof obj === 'number') {
        return -obj;
    }
    if (obj instanceof Numeric) {
        return obj.negate();
    }
    throw `trying to negate a non-numeric object ${obj}`;
}

const PI = new PiConstant();
