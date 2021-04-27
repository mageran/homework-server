/**
 * class representing True Bearings and Compass Bearings, in degree
 */
class BearingAngle {

    constructor(angleString) {
        if (this.parseAsTrueBearing(angleString)) {
            return;
        }
        if (this.parseAsCompassBearing(angleString)) {
            return;
        }
        throw `unrecognized format of bearing angle: ${angleString}`;
    }

    get opposite() {
        return new BearingAngle((this.trueBearing + 180) % 360);
    }

    parseAsTrueBearing(angleString) {
        if (isNaN(Number(angleString))) {
            return false;
        }
        const tb = Number(angleString % 360);
        var ns, angle, ew;
        if (tb <= 90) {
            ns = 'N';
            angle = tb;
            ew = 'E';
        }
        else if (tb <= 180) {
            ns = 'S';
            angle = 180 - tb;
            ew = 'E';
        }
        else if (tb <= 270) {
            ns = 'S';
            angle = tb - 180;
            ew = 'W';
        }
        else if (tb <= 360) {
            ns = 'N';
            angle = 360 - tb;
            ew = 'W'
        }
        else {
            return false;
        }
        this.trueBearing = tb;
        this.compassBaering = { ns, angle, ew };
        this.givenAsTrueBearing = true;
        return true;
    }

    parseAsCompassBearing(angleString) {
        const re = /^\s*([NS])\s*([0-9\\.]+)\s*([EW])\s*$/;
        const m = String(angleString).match(re);
        if (!m) {
            return false;
        }
        const [_, ns, angleStr, ew] = m;
        const angle = Number(angleStr);
        if (angle > 90) {
            return false;
        }
        var tb;
        this.compassBaering = { ns, angle, ew };
        if (ns === 'N') {
            if (ew === 'E') {
                tb = angle;
            } else {
                tb = 360 - angle;
            }
        } else {
            if (ew === 'E') {
                tb = 180 - angle;
            } else {
                tb = angle + 180;
            }
        }
        this.trueBearing = tb;
        this.givenAsTrueBearing = false;
        return true;
    }

    get trueBearingString() {
        return String(Number(_d(this.trueBearing).toFixed(1)));
    }

    get compassBearingString() {
        const { ns, angle, ew } = this.compassBaering;
        return `${ns}${Number(_d(angle).toFixed(1))}${ew}`;
    }

    /**
     * returns true, if this angle is between the given angles in clockwise direction
     * For instance,
     * - 20 would be between angles [300, 50]
     * - 70 woud *not* be between angles [300,50]           
     * @param {*} bearingAngle1 
     * @param {*} bearingAngle2 
     */
    isBetweenBearingAngles(bearingAngle1, bearingAngle2) {
        const tb = this.trueBearing;
        const tb1 = bearingAngle1.trueBearing;
        const tb2 = bearingAngle2.trueBearing;
        if (tb1 < tb2) {
            return tb > tb1 && tb < tb2
        }
        // Zero angle (N) is within the range:
        return tb > tb1 || tb < tb2;
    }

    /**
     * Determine whether this angle represents a right turn with respect to the initial bearing given as argument.
     * For instance, if initialBearing is N55E then
     * - S60E would be a right turn:
     *       /\
     *      /  \
     *     /    \
     *    /      \
     * initial  this
     *
     * - N30W would be a left turn:
     * 
     *   this
     *      \
     *       \
     *        \
     *         \
     *        /
     *       /
     *      /
     *     /
     * initial
     * 
     * @param {BearingAngle} initialBearing 
     */
    isRightTurn(initialBearing) {
        return this.isBetweenBearingAngles(initialBearing, initialBearing.opposite);
    }

    /**
     * Calculates the end point for a line that starts at the given
     * startPoint and has this bearing as direction.
     * 
     * @param {x: Number, y: Number} startPoint 
     * @param {Number} sideLength 
     */
    getEndPoint(startPoint, sideLength) {
        var alpha, xsign, ysign;
        const { x, y } = startPoint;
        const tb = this.trueBearing;
        if (tb <= 90) {
            alpha = 90 - tb;
            xsign = 1;
            ysign = 1;
        }
        else if (tb <= 180) {
            alpha = tb - 90;
            xsign = 1;
            ysign = -1;
        }
        else if (tb <= 270) {
            alpha = 270 - tb;
            xsign = -1;
            ysign = -1;
        }
        else {
            alpha = tb - 270;
            xsign = -1;
            ysign = 1;
        }
        const side = _d(sideLength);
        const angle = Angle.fromDegree(alpha, true);
        const dx = angle.cosDecimal.mul(side);
        const dy = angle.sinDecimal.mul(side);
        const endPoint = {
            x: _d(x).add(dx.mul(xsign)).toNumber(),
            y: _d(y).add(dy.mul(ysign)).toNumber()
        }
        return endPoint;
    }

    getParametersForDrawingOnCanvas(asTrueBearing, returnAsList) {
        const { ns, angle, ew} = this.compassBaering;
        const direction = `${ns}${ew}`;
        var startAngleDegree;
        var endingAngleDegree;
        var counterclockwise;
        if (direction === 'NE') {
            startAngleDegree = 270;
            endingAngleDegree = angle + 270;
            counterclockwise = false;
        }
        else if (direction === 'SE') {
            startAngleDegree = 90;
            endingAngleDegree = 90 - angle;
            counterclockwise = true;
        }
        else if (direction === 'SW') {
            startAngleDegree = 90;
            endingAngleDegree = angle + 90;
            counterclockwise = false;
        }
        else if (direction === 'NW') {
            startAngleDegree = 270;
            endingAngleDegree = 270 - angle;
            counterclockwise = true;
        }
        if (asTrueBearing) {
            startAngleDegree = 270;
            counterclockwise = false;
        }
        if (returnAsList) {
            return [startAngleDegree, endingAngleDegree, counterclockwise];
        }
        return { startAngleDegree, endingAngleDegree, counterclockwise };
    }

}

class BearingAngleHtml {

    constructor(angleInput) {
        if (angleInput instanceof BearingAngle) {
            this.bearingAngle = angleInput;
        }
        else if ((typeof angleInput === 'string') || (typeof angleInput === 'number')) {
            this.bearingAngle = new BearingAngle(angleInput);
        }
        else {
            throw `unrecognized format for Bearing Angle ${angleInput}`;
        }
    }

    addCanvas(cont) {
        const y = x => x + 40;
        const f = 60;
        const { trueBearing, compassBaering, givenAsTrueBearing } = this.bearingAngle;
        const c = document.createElement('canvas');
        c.setAttribute("width", 200);
        c.setAttribute("height", 200);
        cont.appendChild(c);
        var ctx = c.getContext("2d");
        var degree = 90 - trueBearing;
        var angle = _d(-degree * Math.PI / 180);
        ctx.font = '18pt Courier New';
        ctx.strokeText('E', 165, y(80));
        ctx.strokeText('W', 30, y(80));
        ctx.strokeText('S', 93, y(155));
        ctx.strokeText('N', 93, y(10));
        ctx.strokeStyle = "black";
        ctx.beginPath();
        var pi2 = _d(-Math.PI / 2);
        var startAngle = pi2.toNumber();
        var endAngle = angle;
        var counterClockwise = false;
        if (!givenAsTrueBearing) {
            const { ns, ew } = compassBaering;
            if (ns === 'N') {
                counterClockwise = ew === 'W';
            } else {
                startAngle = Math.PI / 2;
                counterClockwise = ew === 'E';
            }
        }
        drawArcedArrow(ctx, 100, y(75), 30, startAngle, endAngle, counterClockwise, 3, 2);
        //ctx.moveTo(100, y(75));
        //ctx.lineTo(160, y(75));
        ctx.beginPath();
        ctx.moveTo(100, y(75));
        const xcoord = angle.cos().mul(f).toNumber();
        const ycoord = angle.sin().mul(f).toNumber();
        console.log(`xcoord: ${xcoord}, ycoord: ${ycoord}`);
        //ctx.lineTo(100 - 20, y(75) - 20);
        ctx.lineTo(100 + xcoord, y(75) + ycoord);
        ctx.stroke();
        ctx.moveTo(100, y(75));
        ctx.beginPath();
        ctx.strokeStyle = "#bbb";
        ctx.moveTo(40, y(75));
        ctx.lineTo(160, y(75));
        ctx.moveTo(100, y(135));
        ctx.lineTo(100, y(15));
        ctx.stroke();
    }

}