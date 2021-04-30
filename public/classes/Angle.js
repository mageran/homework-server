/**
 * class representing an angle
 */

class Angle {

    constructor(degree, doNotRound = false) {
        this.degree = doNotRound ? degree : Math.round(degree);
    }

    static fromPIFactor(piFactor) {
        if (piFactor instanceof Fraction) {
            return Angle.fromDegree(piFactor.numerator * 180 / piFactor.denominator);
        }
        return Angle.fromRadians(piFactor * pi);
    }

    static fromRadians(radians, doNotRound = false) {
        var angle = Angle.reverseLookupRadiansToUnitCircleAngle(radians);
        if (!angle) {
            angle = new Angle(radians * 180.0 / pi, doNotRound);
        }
        return angle;
    }

    static fromDegree(degree, doNotRound = false) {
        return new Angle(degree, doNotRound);
    }

    get inverseAngle() {
        return Angle.fromDegree(-this.degree);
    }

    get asNegativeAngle() {
        if (this.degree <= 0) return this;
        const k = Math.trunc(this.degree / 360) + 1;
        const ndegree = this.normalize().degree;
        return Angle.fromDegree(ndegree - k * 360);
    }

    get radians() {
        return this.degree * pi / 180;
    }

    get radiansDecimal() {
        return _d(this.degree).mul(_d(pi)).div(_d(180));
    }

    get piFactor() {
        return new Fraction(this.degree, 180);
    }

    get referenceAngle() {
        if (this.degree >= 0 && this.degree <= 90) {
            return this.clone();
        }
        if (this.degree > 90 && this.degree <= 180) {
            return new Angle(180 - this.degree);
        }
        if (this.degree > 180 && this.degree <= 270) {
            return new Angle(this.degree - 180);
        }
        if (this.degree > 270 && this.degree <= 360) {
            return new Angle(360 - this.degree);
        }
        return this.normalize().referenceAngle;
    }

    get quadrant() {
        var quadrant, xsign, ysign;
        if (this.degree >= 0 && this.degree <= 90) {
            quadrant = 1;
            xsign = 1;
            ysign = 1;
        }
        else if (this.degree > 90 && this.degree <= 180) {
            quadrant = 2;
            xsign = -1;
            ysign = 1;
        }
        else if (this.degree > 180 && this.degree <= 270) {
            quadrant = 3;
            xsign = -1;
            ysign = -1;
        }
        else if (this.degree > 270 && this.degree <= 360) {
            quadrant = 4;
            xsign = 1;
            ysign = -1;
        }
        else {
            return this.normalize().quadrant;
        }
        return { quadrant, xsign, ysign };
    }

    getXY() {
        const rangle = this.referenceAngle;
        const { xsign, ysign } = this.quadrant;
        const tanSign = ysign / xsign;
        var xcoord, ycoord, tan, sec, csc, cot;
        if (rangle.degree === 0) {
            xcoord = 1 * xsign;
            ycoord = 0;
            tan = 0;
            cot = 'undefined';
            sec = xcoord;
            csc = 'undefined';
        }
        else if (rangle.degree === 30) {
            xcoord = fraction(sqrt(3, xsign), 2);
            ycoord = fraction(ysign, 2);
            tan = fraction(sqrt(3, tanSign), 3);
            cot = sqrt(3, tanSign);
            sec = fraction(sqrt(3, 2 * xsign), 3);
            csc = ysign * 2;
        }
        else if (rangle.degree === 45) {
            xcoord = fraction(sqrt(2, xsign), 2);
            ycoord = fraction(sqrt(2, ysign), 2);
            tan = tanSign * 1;
            cot = tan;
            sec = sqrt(2, xsign);
            csc = sqrt(2, ysign);
        }
        else if (rangle.degree === 60) {
            xcoord = fraction(xsign, 2);
            ycoord = fraction(sqrt(3, ysign), 2);
            tan = sqrt(3, tanSign);
            cot = fraction(sqrt(3, tanSign), 3);
            sec = xsign * 2;
            csc = fraction(sqrt(3, 2 * ysign), 3);
        }
        else if (rangle.degree === 90) {
            xcoord = 0;
            ycoord = ysign;
            tan = 'undefined';
            cot = 0;
            sec = 'undefined';
            csc = ysign;

        }
        else {
            throw 'not supported angle'
        }
        return { xcoord, ycoord, xsign, ysign, tan, sec, csc, cot };
    }

    getCosSinTan() {
        const { xcoord, ycoord, xsign, ysign, tan, sec, csc, cot } = this.getXY();
        const cos = xcoord;
        const sin = ycoord;
        return { cos, sin, tan, sec, csc, cot };
    }

    getTrigFunctionValuesAsDecimals() {
        const _dx = val => {
            if (typeof val === 'number') {
                return _d(val);
            }
            if (val instanceof Numeric) {
                return val.decimalxValue();
            }
            return val;
        }
        const { cos, sin, tan, sec, csc, cot } = this.getCosSinTan();
        return {
            cos: _dx(cos),
            sin: _dx(sin),
            tan: _dx(tan),
            sec: _dx(sec),
            csc: _dx(csc),
            cot: _dx(cot)
        };
    }

    get cos() { return this.getCosSinTan().cos; }
    get sin() { return this.getCosSinTan().sin; }
    get tan() { return this.getCosSinTan().tan; }
    get sec() { return this.getCosSinTan().sec; }
    get csc() { return this.getCosSinTan().csc; }
    get cot() { return this.getCosSinTan().cot; }

    get sinDecimal() {
        return this.radiansDecimal.sin();
    }

    get cosDecimal() {
        return this.radiansDecimal.cos();
    }

    get tanDecimal() {
        return this.radiansDecimal.tan();
    }

    normalize(inPlace = false) {
        const { degree } = this;
        var ndegree = degree % 360;
        if (ndegree < 0) {
            ndegree += 360;
        }
        if (inPlace) {
            this.degree = ndegree;
            return this;
        }
        return new Angle(ndegree);
    }

    isNormalized() {
        return this.degree >= 0 && this.degree <= 360;
    }

    coterminal(inPlace = true) {
        const { degree } = this;
        var ndegree = degree % 360;
        ndegree = ndegree < 0 ? 360 + ndegree : ndegree - 360;
        if (inPlace) {
            this.degree = ndegree;
            return this;
        }
        return new Angle(ndegree);
    }

    absoluteAngle() {
        return new Angle(Math.abs(this.degree));
    }

    _modulo(deg) {
        if (this.degree < deg) {
            return { angle: this, k: 0 };
        }
        var k = Math.trunc(this.degree / deg);
        var d = this.degree % deg;
        if (d === 0) {
            d = deg;
            k--;
        }
        const angle = new Angle(d);
        return { angle, k };

    }

    moduloPi() {
        return this._modulo(180);
    }

    modulo2Pi() {
        return this._modulo(360);
    }

    modulo180() {
        return this._modulo(180);
    }

    modulo360() {
        return this._modulo(360);
    }

    equals(angle) {
        return this.degree === angle.degree;
    }

    clone(doNotRound = false) {
        return new Angle(this.degree, doNotRound);
    }

    toLatex(mode = 'degree') {
        if (mode === 'degree') {
            return '' + this.degree + "{^\\circle}";
        }
        if (this.degree === 0) {
            return "0";
        }
        const { numerator, denominator } = this.piFactor;
        const sign = Math.sign(numerator) / Math.sign(denominator);
        const signSymbol = sign < 0 ? '-' : ''
        if (numerator === 0) {
            return "0";
        }
        if (Math.abs(denominator) === 1) {
            if (Math.abs(numerator) === 1) {
                return `${signSymbol}\\pi`;
            }
            return `${signSymbol}${Math.abs(numerator)}\\pi`
        } else {
            var nstr = Math.abs(numerator) === 1 ? `\\pi` : `${Math.abs(numerator)}\\pi`;
            return `${signSymbol}\\frac{${nstr}}{${Math.abs(denominator)}}`;
        }
    }

    /**
     * given a decimal checks whether it matches the value of one of the 6 trig functions applied to this angle.
     * @param {*} decimalValue 
     * @returns [trigFunction] list of trigFunctions which results in the given value for this angle
     */
    reverseLookupTrigFunctions(decimalValue, precision = 5) {
        const { cos, sin, tan, sec, csc, cot } = this.getTrigFunctionValuesAsDecimals();
        const trigValues = [cos, sin, tan, sec, csc, cot];
        const trigNames = ['cos', 'sin', 'tan', 'sec', 'csc', 'cot'];
        const trigFunctions = [];
        try {
            const valx = _d(decimalValue).toPrecision(precision);
            for (let i = 0; i < trigValues.length; i++) {
                let tval = trigValues[i];
                if (tval instanceof Decimalx) {
                    if (tval.toPrecision(precision) == valx) {
                        trigFunctions.push(trigNames[i]);
                    }
                }
            }
        } catch (err) {

        }
        return trigFunctions;
    }

    getAngleWithSameTrigValueInRangeOfInverseTrig(trigFunction) {
        const tvalue = this.getTrigFunctionValuesAsDecimals()[trigFunction];
        //console.log(`tvalue: ${tvalue}`);
        if (tvalue === null) {
            return null;
        }
        const invTrigFunction = `arc${trigFunction}`;
        const ttEntry = TrigTable[invTrigFunction];
        //console.log(ttEntry);
        if (!ttEntry) {
            return null;
        }
        const checkValue = ttEntry.angleIsInRange;
        if (checkValue(this)) {
            return this;
        }
        const trigFunctionValues = Angle.reverseLookupTrigFunctions(tvalue, true);
        //console.log(trigFunctionValues);
        const angles = trigFunctionValues[trigFunction];
        //console.log(`angles: ${angles.map(a => a.radiansDecimal)}`);
        if (!Array.isArray(angles)) {
            return null;
        }
        for (let i = 0; i < angles.length; i++) {
            let angle = angles[i];
            if (checkValue(angle)) {
                return angle;
            }
        }
        return null;
    }

    /**
     * checks for the angles of the unit circle (0, 30, 45, 60, 90, ...) the trig-function
     * values and returns all those that match the given decimal value to the result list
     * @param {*} decimalValue 
     * @param {*} precision 
     * @returns [{ trigFunction:('cos'|'sin'|...), angle:{Angle} }]
     */
    static reverseLookupTrigFunctions(decimalValue, addNegativeAngles = false, precision = 5) {
        const res = {};
        for (let angle of unitCircleAngles()) {
            let trigFunctions = angle.reverseLookupTrigFunctions(decimalValue, precision);
            trigFunctions.forEach(trigFunction => {
                if (!res[trigFunction]) {
                    res[trigFunction] = [];
                }
                res[trigFunction].push(angle);
                if (addNegativeAngles) {
                    res[trigFunction].push(angle.asNegativeAngle);
                }
            });
        }
        return res;
    }

    static reverseLookupRadiansToUnitCircleAngle = (radians, precision = 10) => {
        const radiansGiven = _d(radians).toPrecision(precision);
        for (let k = -5; k <= 5; k++) {
            for (let angle of unitCircleAngles(k)) {
                let radx = angle.radiansDecimal.toPrecision(precision);
                if (radx === radiansGiven) {
                    return angle;
                }
            }
        }
        return null;
    }

}

function* unitCircleAngles(k = 0) {
    const qangles = [0, 30, 45, 60];
    for (let quadrant = 0; quadrant <= 4; quadrant++) {
        for (let i = 0; i < qangles.length; i++) {
            let d = qangles[i];
            let degree = quadrant * 90 + d;
            let angle = Angle.fromDegree(degree + k * 360);
            yield angle;
        }
    }
}

const pi = Math.PI;

/* copied to CircleSector.js */
/*
class CircleSector {

    constructor() {

    }

    static fromAngleAndRadius(theta, r) {
        if (theta instanceof Angle) {
            const obj = new CircleSector()
            obj.theta = theta;
            obj.r = r
            obj.S = theta.radians * r;
            return obj;
        } else {
            throw "angle must be an Angle object"
        }
    }

    static fromSectorLengthAndAngle(S, theta) {
        if (theta instanceof Angle) {
            const obj = new CircleSector()
            obj.theta = theta;
            obj.S = S;
            obj.r = S / theta.radians;
            return obj;
        } else {
            throw "angle must be an Angle object"
        }
    }

    static fromSectorLengthAndRadius(S, r) {
        const obj = new CircleSector()
        obj.S = S;
        obj.r = r;
        obj.theta = Angle.fromRadians(S / r);
        return obj;
    }

}
*/

class CircleArea {

    constructor() {

    }

    static fromAngleAndRadius(theta, r) {
        if (theta instanceof Angle) {
            const obj = new CircleArea()
            obj.theta = theta;
            obj.r = r
            obj.A = theta.radians * Math.pow(r, 2) * 0.5;
            return obj;
        } else {
            throw "angle must be an Angle object"
        }
    }

    static fromSectorAreaAndAngle(A, theta) {
        if (theta instanceof Angle) {
            const obj = new CircleArea()
            obj.theta = theta;
            obj.A = A;
            obj.r = Math.sqrt((A * 2) / theta.radians);
            return obj;
        } else {
            throw "angle must be an Angle object"
        }
    }

    static fromSectorAreaAndRadius(A, r) {
        const obj = new CircleArea()
        obj.A = A;
        obj.r = r;
        obj.theta = Angle.fromRadians((A * 2) / Math.pow(r, 2));
        return obj;
    }

}