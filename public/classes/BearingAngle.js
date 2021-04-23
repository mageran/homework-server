/**
 * class representing True Bearings and Compass Bearings, in degree
 */
class BearingAngle {

    constructor(angleString) {
        if (this.parseAsTrueBearing(angleString))  {
            return;
        }
        if (this.parseAsCompassBearing(angleString)) {
            return;
        }
        throw `unrecognized format of bearing angle: ${angleString}`;
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
        const re = /^\s*([NS])\s*([0-9]+)\s*([EW])\s*$/;
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
        return String(this.trueBearing);
    }

    get compassBearingString() {
        const { ns, angle, ew } = this.compassBaering;
        return `${ns}${angle}${ew}`;
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
        var pi2 = _d(-Math.PI/2);
        var startAngle = pi2.toNumber();
        var endAngle = angle;
        var counterClockwise = false;
        if (!givenAsTrueBearing) {
            const { ns, ew} = compassBaering;
            if (ns === 'N') {
                counterClockwise = ew === 'W';
            } else {
                startAngle = Math.PI/2;
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