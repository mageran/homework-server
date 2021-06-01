/**
 * super class for numeric types 
 */

class Numeric {

    constructor() {
    }

    decimalValue() {
        if (this.decimalxValue()) {
            return this.decimalxValue().toNumber();
        }
    }

    decimalxValue() {
        return _d(0);
    }

    simplify() {
        return this;
    }

    inverse() {
        return fraction(1, this);
    }


    negate() {
        return this.multiply(-1);
    }

    multiply(factor) {
        return this;
    }

    abs() {
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

    toNumber() {
        return this.decimalValue();
    }

    static get precision() {
        return 10;
    }

    static _p(value) {
        return _d(_d(value).toPrecision(Numeric.precision));
    }

    static findFraction(num) {
        var numerator = num;
        var denominator = 1;
        var isRealFraction = false;
        for (let i = 1; i < 1000; i++) {
            let p = num * i;
            if (Math.trunc(p) === p) {
                numerator = p;
                denominator = i;
                isRealFraction = true;
                break;
            }
        }
        return { numerator, denominator, isRealFraction };
    }

    static findFractionWithConstant(num, constant = Math.PI) {
        const numx = _d(num);
        const cval = _d(constant);
        var numerator = num;
        var denominator = 1;
        var isRealFraction = false;
        for (let i = 1; i < 1000; i++) {
            let p = numx.mul(_d(i)).div(cval);
            let pp = _d(p.toPrecision(Numeric.precision - 2));
            if (pp.eq(pp.trunc())) {
                numerator = pp.toNumber();
                denominator = i;
                isRealFraction = true;
                break;
            }
        }
        return { numerator, denominator, constant, isRealFraction };
    }

    static findFractionWithPi(num) {
        return Numeric.findFractionWithConstant(num, Math.PI);
    }

    static _findFractionWithSquareRoot(num) {
        var numx = _d(num);
        var sign = Math.sign(num);
        var numeratorRadicand = numx.pow(_d(2));
        var denominator = _d(1);
        var isRealFraction = false;
        for (let i = 1; i < 1000; i++) {
            let p = numx.mul(_d(i));
            let pSquare = _d(p.pow(_d(2)).toPrecision(Numeric.precision - 2));
            if (pSquare.eq(pSquare.trunc())) {
                numeratorRadicand = pSquare.toNumber();
                denominator = i;
                isRealFraction = true;
                break;
            }
        }
        return { sign, numeratorRadicand, denominator, isRealFraction };
    }

    static findFractionWithSquareRoot(num) {
        const candidates = [];
        const res0 = Numeric._findFractionWithSquareRoot(num);
        if (res0.isRealFraction) {
            //return res0;
            let sqrtRes = Math.sqrt(res0.numeratorRadicand);
            if (Math.trunc(sqrtRes) === sqrtRes) {
                return res0;
            }
            candidates.push(shallowCopy(res0));
        }
        //console.log(`findFractionWithSquareRoot(${num})...`);
        for (let smd = -100; smd <= 100; smd++) {
            if (smd === 0) continue;
            let summand = smd;
            let num0 = summand - Number(num);
            //console.log(`${summand} - (${num}): num0 = ${num0}`);
            let res = Numeric._findFractionWithSquareRoot(num0);
            if (res.isRealFraction) {
                res.summand = summand;
                res.operation = '-';
                //return res;
                candidates.push(shallowCopy(res));
            }
            num0 = Number(num) - summand;
            //console.log(`${num} - (${summand}): num0 = ${num0}`);
            res = Numeric._findFractionWithSquareRoot(num0);
            if (res.isRealFraction) {
                res.summand = summand;
                res.operation = '+';
                candidates.push(shallowCopy(res));
                //return res;
            }
        }
        if (candidates.length === 0) {
            return res0;
        }
        const sortFun = (a, b) => {
            //if (!a.summand && b.summand) return -1;
            //if (!b.summand && a.summand) return 1;
            const aq = Math.abs(Math.sqrt(a.numeratorRadicand)) + Math.abs(a.denominator);
            const bq = Math.abs(Math.sqrt(b.numeratorRadicand)) + Math.abs(b.denominator);
            return aq < bq ? -1 : bq < aq ? 1 : 0;
        }
        candidates.sort(sortFun)
        //console.log(candidates);
        return candidates[0];
    }

    static createFromValue(value, forceFraction = false, returnAll = false, info = {}) {
        if (value instanceof Numeric) {
            return value;
        }
        const precision = Numeric.precision;
        const retValue = val => {
            if (forceFraction && !(val instanceof Fraction2)) {
                return fraction(val, 1);
            } else {
                return val;
            }
        }
        const valx = Numeric._p(value);
        if (valx.eq(Math.trunc(valx))) {
            info.success = true;
            return retValue(new Decimal(valx));
        }
        {
            let { numerator, denominator, isRealFraction } = Numeric.findFraction(valx);
            if (isRealFraction) {
                info.success = true;
                return retValue(fraction(numerator, denominator));
            }
        }
        if (!Numeric.doNotAttemptToCreateValueWithPi) {
            let { numerator, denominator, isRealFraction } = Numeric.findFractionWithPi(valx);
            if (isRealFraction) {
                let numerator0 = new Product(numerator, PI);
                let res = retValue(fraction(numerator0, denominator));
                //console.log(`returning fraction of PI: ${JSON.stringify(res, null, 2)}`);
                //console.log(res.toLatex());
                //console.log('----');
                info.success = true;
                return res;
            }
        }
        {
            let findFractionWithSquareRootResult = Numeric.findFractionWithSquareRoot(valx);
            //console.log(JSON.stringify(findFractionWithSquareRootResult, null, 2));
            let { numeratorRadicand, denominator, sign, isRealFraction, constant, summand, operation } = findFractionWithSquareRootResult;
            if (isRealFraction) {
                let numerator = sqrt(numeratorRadicand, sign);
                numerator.simplify();
                info.success = true;
                const _mayAddSummand = v => {
                    if (typeof summand === 'number') {
                        const vv = operation === '-' ? v.negate() : v;
                        return new Sum(summand, vv);
                    }
                    return v;
                }
                if (denominator == 1) {
                    return retValue(_mayAddSummand(numerator));
                }
                return retValue(_mayAddSummand(fraction(numerator, denominator).simplify()));
            }
        }
        info.success = false;
        return retValue(new Decimal(value));
    }

}

class Decimal extends Numeric {
    constructor(number) {
        super();
        this.number = number;
    }

    inverse() {
        return fraction(1, this.number);
    }

    decimalxValue() {
        return _d(this.number);
    }

    decimalValue() {
        return this.decimalxValue().toNumber();
    }

    multiply(factor) {
        const res = this.clone();
        res.number *= factor;
        return this;
    }

    power(exponent) {
        const res = this.clone();
        res.number = Math.pow(res.number, exponent);
        return res;
    }

    abs() {
        return new Decimal(Math.abs(this.number));
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

    decimalxValue() {
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

    decimalxValue() {
        return _d(this.value);
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

    decimalxValue() {
        return this.operands.map(operand => operand.decimalxValue()).reduce((aggr, v) => aggr.add(v), _d(0));
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
        const sumString = this.operands.map(operand => ensureNumeric(operand).toString(this)).join(" + ");
        return open + sumString + close;
    }

    toLatex(context) {
        const { open, close } = this.getParenthesis(context);
        //const sumString = this.operands.map(operand => ensureNumeric(operand).toLatex(this)).join(" + ");
        var stringParts = [];
        this.operands.forEach(operand => {
            const operandLatex = ensureNumeric(operand).toLatex(this).trim();
            if (stringParts.length !== 0 && (operandLatex[0] !== '-')) {
                stringParts.push('+');
            }
            stringParts.push(operandLatex);
        })
        const sumString = stringParts.join('');
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

    decimalxValue() {
        if (this.operands.length === 0) {
            throw `product with no operands`;
        }
        return this.operands.map(operand => operand.decimalxValue()).reduce((aggr, v) => aggr.mul(v), _d(1));
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
        const sumString = this.operands.map(operand => operand.toString(this)).join(" * ");
        return open + sumString + close;
    }

    toLatex(context) {
        const { open, close } = this.getParenthesis(context);
        const sumString = this.operands.map(operand => ensureNumeric(operand).toLatex(context)).join("\\cdot");
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

    decimalxValue() {
        var value;
        if (this.exponent === 2) {
            value = _d(this.radicand).sqrt();
        } else if (this.exponent === 1) {
            value = _d(this.radicand);
        } else if (this.exponent === 0) {
            value = _d(1);
        } else {
            let exp = _d(1).div(_d(this.exponent));
            value = _d(this.radicand).pow(exp);
            //value = Math.pow(radicand, 1 / exponent);
        }
        //value *= this.factor;
        return value.mul(_d(this.factor));
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

    static findNthRoot(value, n) {
        const xvalue = _d(value);
        const num = xvalue.pow(n).toNumber();
        if (Math.trunc(num) === num) {
            if (n === 2) {
                return new SquareRoot(num);
            }
            return new NthRoot(num, n);
        }
        return null;
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

    static findSquareRoot(value, precision = 10) {
        return NthRoot.findNthRoot(value, 2);
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

    decimalxValue() {
        const { numerator, denominator } = this;
        return _d(numerator).div(_d(denominator));
    }

    inverse() {
        return fraction(this.denominator, this.numerator);
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

    flipSign() {
        const { numerator, denominator } = this;
        if (this.decimalValue() < 0) {
            console.log(`flipSign of ${this.toString()}...`);
            if (typeof numerator === 'number') {
                this.numerator = Math.abs(numerator);
            }
            else if (numerator instanceof Decimal) {
                this.numerator = numerator.abs();
            }
            else if (numerator instanceof NthRoot) {
                this.numerator = numerator.clone();
                this.numerator.factor = Math.abs(this.numerator.factor);
            }
            if (typeof denominator === 'number') {
                this.denominator = -Math.abs(denominator);
            }
            else if (denominator instanceof NthRoot) {
                this.denominator = denominator.clone();
                this.denominator.factor = -Math.abs(this.denominator.factor);
            }
        }
        return this;
    }

    _simplifyFactors() {
        if ((typeof this.denominator === 'number') && (this.numerator instanceof NthRoot)) {
            let numeratorFactor = this.numerator.factor;
            let fraction = new Fraction(numeratorFactor, this.denominator);
            this.denominator = fraction.denominator;
            this.numerator = this.numerator.clone();
            this.numerator.factor = fraction.numerator;
        }
    }

    simplify() {
        this.hasBeenSimplified = false;
        if (this.fractionObject) {
            //return this;
        }
        this.numerator = simplifyNumeric(this.numerator);
        this.denominator = simplifyNumeric(this.denominator);
        if ((this.denominator instanceof SquareRoot) && (typeof this.numerator === 'number')) {
            const { radicand, factor } = this.denominator;
            this.numerator = sqrt(radicand, multiplyNumeric(this.numerator, Math.sign(factor)));
            this.denominator = Math.abs(factor) * radicand;
            this.hasBeenSimplified = true;
        }
        if ((this.denominator instanceof SquareRoot) && (this.numerator instanceof SquareRoot)) {
            console.log(`numerator and denominator are square roots`);
            const { radicand, factor } = this.denominator;
            this.numerator = sqrt(radicand * this.numerator.radicand, multiplyNumeric(this.numerator.factor, Math.sign(factor)));
            this.denominator = Math.abs(factor) * radicand;
            this.hasBeenSimplified = true;
        }
        this._simplifyFactors();
        if (typeof this.denominator === 'number' && Math.abs(this.denominator) === 1) {
            this.hasBeenSimplified = true;
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
        const nstr = ensureNumeric(this.numerator).toString(latex);
        const dstr = ensureNumeric(this.denominator).toString(latex);
        return `${nstr}/${dstr}`;
    }

    toLatex(keepNumerator = true) {
        if (this.fractionObject) {
            this.fractionObject.normalize();
            return this.fractionObject.toLatex(keepNumerator);
        }
        const numeratorLatex = ensureNumeric(this.numerator).toLatex();
        const denominatorLatex = ensureNumeric(this.denominator).toLatex();
        return `\\frac{${numeratorLatex}}{${denominatorLatex}}`;
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
    if (obj instanceof Decimalx) {
        return new Decimal(obj.toNumber());
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
        return latex ? obj.toLatex() : obj.toString();
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
