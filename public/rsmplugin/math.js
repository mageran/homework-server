const gcd = (x, y) => {
    const xsign = Math.sign(x);
    const ysign = Math.sign(y);
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
        var t = y;
        y = x % y;
        x = t;
    }
    //return xsign === ysign ? x : -x;
    return x;
}

//gcf is the same as gcd, onl that it takes any number of arguments
const gcf = (...nums) => {
    if (nums.length === 0) {
        throw "gcd called on empty number list";
    }
    const terms = nums.concat([]);
    const term0 = terms.shift();
    const gcf = terms.reduce((gcfSoFar, num) => gcd(gcfSoFar,num), term0);
    return gcf;
}

const lcm = (...nums) => {
    const allDivisible = (nums, n) => {
        for(let i = 0; i < nums.length; i++) {
            if (n % nums[i] === 0) continue;
            return false;
        }
        return true;
    }
    const anums = nums.map(n => Math.abs(n));
    const max = anums.reduce((res, n) => Math.max(res,n), 0);
    const fnums = anums.filter(n => n !== max);
    for(var lcm = max; ; lcm += max) {
        if (allDivisible(fnums,lcm)) {
            return lcm;
        }
    }
}

const simplifyToFraction = decimal => {
    var numerator = decimal;
    var denominator = 1;
    while(Math.trunc(numerator) != numerator) {
        numerator *= 10;
        denominator *= 10;
    }
    return { numerator, denominator };
}

const _isSquareNumber = n => {
    if (n < 0) return false;
    const sroot = Math.sqrt(n);
    return Math.trunc(sroot) === sroot;
}

const _simplyfySquareRoot = n => {
    if (n !== Math.trunc(n)) {
        return [1,n];
    }
    var result = [1, n];
    var m = 2;
    while (Math.pow(m, 2) <= n) {
        const sqm = Math.pow(m, 2);
        if (n % sqm === 0) {
            result = [m, n/sqm];
        }
        m++;
    }
    return result;
}

const _absNumeric = term => {
    if (term instanceof Fraction) {
        return new Fraction(Math.abs(term.numerator), Math.abs(term.denominator));
    }
    return Math.abs(term);
}

const precision = (num, p = 2) => {
    const f = Math.pow(10,p);
    return Math.round(num * f)/f;
}

const findFraction = num => {
    var numerator = num;
    var denominator = 1;
    var isRealFraction = false;
    for(let i = 1; i < 1000; i++) {
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

const findFractionWithSquareRoot = num => {
    var numx = _d(num);
    var numeratorRadicand = numx.pow(_d(2));
    var denominator = _d(1);
    var isRealFraction = false;
    for(let i = 1; i < 1000; i++) {
        let p = numx.mul(_d(i));
        let pSquare = _d(p.pow(2).toPrecision(10));
        console.log(`pSquare: ${pSquare}`);
        if (pSquare.eq(pSquare.trunc())) {
            numeratorRadicand = pSquare.toNumber();
            denominator = i;
            isRealFraction = true;
            break;
        }
    }
    return { numeratorRadicand, denominator, isRealFraction };
}

