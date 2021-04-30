/**
 * represent a circle sector defined by an angle and a radius
 */

class CircleSector extends GeometricShape {

    constructor(angle, radius, sectorLength) {
        super();
        this._initParameters(angle, radius, sectorLength);
    }

    get shapeName() {
        return 'Sector';
    }

    _initParameters(angle, radius, sectorLength) {
        if (angle) this.angle = angle instanceof Angle ? angle : Angle.fromDegree(Number(angle), true);
        if (radius) this.radius = _d(radius);
        if (sectorLength) this.sectorLength = _d(sectorLength);
    }

    static fromAngleAndRadius(theta, r) {
        if (theta instanceof Angle) {
            const obj = new CircleSector()
            obj.theta = theta;
            obj.r = r
            obj.S = theta.radians * r;
            obj._initParameters(obj.theta, obj.r, obj.S);
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
            obj._initParameters(obj.theta, obj.r, obj.S);
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
        obj._initParameters(obj.theta, obj.r, obj.S);
        return obj;
    }

    solveArea() {
        const { _disp } = this;
        this.area = _d(this.angle.degree).div(360).mul(_d(Math.PI)).mul(this.radius.pow(2));
        return [
            `Area of circle sector:`,
            {
                latex: `A = \\frac{\\theta}{360}\\pi r^2 = \\frac{${_disp(this.angle)}}{360}\\pi\\cdot (${_disp(this.radius)})^2 = ${_disp(this.area)}`
            }
        ]
    }

}
