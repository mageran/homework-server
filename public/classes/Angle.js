/**
 * class representing an angle
 */

class Angle {

    constructor(degree) {
        this.degree = Math.round(degree);
    }

    static fromPIFactor(piFactor) {
        if (piFactor instanceof Fraction) {
            return Angle.fromDegree(piFactor.numerator * 180 / piFactor.denominator);
        }
        return Angle.fromRadians(piFactor * pi);
    }

    static fromRadians(radians) {
        return new Angle(radians * 180 / pi);
    }

    static fromDegree(degree) {
        return new Angle(degree);
    }

    get radians() {
        return this.degree * pi / 180;
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
        const tanSign = ysign/xsign;
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
            tan = fraction(tanSign * 1,2);
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
            return { angle: this, k: 0};
        }
        var k = Math.trunc(this.degree/deg);
        var d = this.degree % deg;
        if (d === 0) {
            d = deg;
            k--;
        }
        const angle = new Angle(d);
        return { angle, k};

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

    clone() {
        return new Angle(this.degree);
    }

    toLatex(mode = 'degree') {
        if (mode === 'degree') {
            return '' + this.degree;
        }
        return this.piFactor.toLatex(true) + "\\pi";
    }

}

const pi = Math.PI;

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
        obj.theta = Angle.fromRadians(S/r);
        return obj;
    }

}

class CircleArea {
    
    constructor() {

    }

    static fromAngleAndRadius(theta, r) {
        if (theta instanceof Angle) {
            const obj = new CircleArea()
            obj.theta = theta;
            obj.r = r
            obj.A = theta.radians * Math.pow(r,2) * 0.5;
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
            obj.r = Math.sqrt((A * 2)/theta.radians);
            return obj;
        } else {
            throw "angle must be an Angle object"
        }
    }

    static fromSectorAreaAndRadius(A, r) {
        const obj = new CircleArea()
        obj.A = A;
        obj.r = r;
        obj.theta = Angle.fromRadians((A*2)/Math.pow(r,2));
        return obj;
    }

}