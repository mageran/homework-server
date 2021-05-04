/**
 * A BearingAngleTriangle is a triangle defined by two Bearing angles and two side lengths.
 * It's used to solve navigation style question, for instance:
 *   "After leaving an airport, a plane flies for 1.5 h at a speed of 200 km/h on a course of 200 degree. 
 *   Then on a course of 340 degree, the plane flies for 2 h at a speed of 250 km/h. At that time,
 *   how far is the plane from the airport? Draw and label a diagram. (332 km)"
 * 
 * In this case the two bearing angle are 200 and 340, the two side lengths are 1.5*200 = 300 and 2*250 = 500
 *
 */

class BearingAngleTriangle extends Triangle {

    constructor(bearingAngle1, bearingAngle2, side1, side2) {
        const constructorArguments = [bearingAngle1, bearingAngle2, side1, side2];
        const _initBearingAngle = bearingAngle =>
            (bearingAngle instanceof BearingAngle) ? bearingAngle : new BearingAngle(bearingAngle);
        const bearingAngle1Object = _initBearingAngle(bearingAngle1);
        const bearingAngle2Object = _initBearingAngle(bearingAngle2);
        // initialize parameters to solve the triangle:
        const cSide = side1;
        const aSide = side2
        const angleB = Math.abs(180 - Math.abs(bearingAngle1Object.trueBearing - bearingAngle2Object.trueBearing));
        super('a', undefined, aSide, 'b', angleB, undefined, 'c', undefined, cSide);
        this.bearingAngle1 = bearingAngle1Object;
        this.bearingAngle2 = bearingAngle2Object;
        this.givenAsTrueBearing = this.bearingAngle1.givenAsTrueBearing;
        this.constructorArguments = constructorArguments;
    }

    _clonePropertiesTo(t) {
        super._clonePropertiesTo(t);
        t.finalBearing = this.finalBearing;
        t.isRightTurn = this.isRightTurn;
        t.drawFinalBearingAsTrueBearing = this.drawFinalBearingAsTrueBearing;
    }

    clone() {
        const t = new BearingAngleTriangle(...this.constructorArguments);
        this._clonePropertiesTo(t);
        return t;
    }

    _angleBCalculationSteps() {
        const [_, b, __] = this.sidePairs;
        const bAngle = Number(_d(b.angle.degree).toFixed(1));
        //const angle1 = this.givenAsTrueBearing ? this.bearingAngle1.trueBearing : this.bearingAngle1.compassBaering.angle;
        //const angle2 = this.givenAsTrueBearing ? this.bearingAngle2.trueBearing : this.bearingAngle2.compassBaering.angle;
        const angle1 = this.bearingAngle1.compassBaering.angle;
        const angle2 = this.bearingAngle2.compassBaering.angle;
        const angle1Str = this.bearingAngle1.compassBearingString;
        const angle2Str = this.bearingAngle2.compassBearingString;
        console.log(`trying to find calculation for angle B = ${bAngle} using bearing angle values ${angle1Str} and ${angle2Str}...`)
        for (let [add180, angle1Positive, angle2Positive] of allCombinations(0, 1, 3)) {
            let value = 0;
            let latex = '';
            if (!add180) {
                value += 180;
                latex += '180';
            }
            if (!angle1Positive) {
                value += angle1;
                if (latex.length > 0) {
                    latex += '+';
                }
                latex += angle1;
            } else {
                value -= angle1;
                latex += `- ${angle1}`;
            }
            let opsym = angle2Positive ? ' + ' : ' - ';
            value += (angle2Positive ? 1 : -1) * angle2;
            latex += opsym + angle2;
            console.log(`value: ${value}, latex: ${latex}`);
            value = Number(_d(value).toFixed(2));
            if (value === bAngle) {
                console.log('found calculation!');
                return [{
                    text: `Determining turn angle ${b.angleName} using bearing angles ${angle1Str} and ${angle2Str}:`,
                    latex: `${b.angleName} = ${latex} = ${bAngle}`
                }]
            }
        }
        return [];
    }

    getDrawClockWise() {
        return false;
    }

    /**
     * determine the bearing of the point reached after making the turns
     * with respect to the starting point.
     */
    solveFinalBearing() {
        const { _disp, sidePairs } = this;
        const a = sidePairs[0];
        const aDegreeValue = Number(_d(a.angle.degree).toFixed(_toFixedAngles));
        const d1 = this.bearingAngle1.trueBearing;
        var latex = '\\text{final_bearing} = ';
        const steps = [];
        steps.push(`<h4>Bearing to end point wrt to start point:</h4>`)
        var finalTrueBearing;
        this.drawFinalBearingAsTrueBearing = true;
        if (!this.givenAsTrueBearing) {
            steps.push('&nbsp;Convert compass bearings in true bearings:');
            steps.push({ latex: `\\text{${this.bearingAngle1.compassBearingString}} = \\text{${this.bearingAngle1.trueBearingString}}` });
            //steps.push({ latex: `\\text{${this.bearingAngle2.compassBearingString}} = \\text{${this.bearingAngle2.trueBearingString}}` });
        }
        if (this.isRightTurn) {
            finalTrueBearing = d1 + aDegreeValue;
            latex += `${this.bearingAngle1.trueBearingString} + ${aDegreeValue} = `
        } else {
            finalTrueBearing = d1 - aDegreeValue;
            if (finalTrueBearing < 0) {
                finalTrueBearing += 360
                latex += `360 - ${aDegreeValue} + ${this.bearingAngle1.trueBearingString} = `;
                this.drawFinalBearingAsTrueBearing = false;
            } else {
                latex += `${this.bearingAngle1.trueBearingString} - ${aDegreeValue} = `
            }
        }
        this.finalBearing = new BearingAngle(finalTrueBearing);
        var bstr = this.finalBearing.trueBearingString;
        if (!this.givenAsTrueBearing) {
            bstr += ` = \\text{${this.finalBearing.compassBearingString}}`;
        }
        latex += bstr;
        const text = `Calculation:`;
        steps.push({ text, latex });
        return steps;
    }

    solveAdditional() {
        return this.solveFinalBearing();
    }

    solve() {
        console.log(`BearingAngleTriangle.draw: this: ${this.constructor.name}`);
        const steps = [];
        steps.push(...this._angleBCalculationSteps())
        this.isRightTurn = this.bearingAngle2.isRightTurn(this.bearingAngle1);
        steps.push(`<p><b>Direction change is a <span style="background-color:yellow">${this.isRightTurn ? 'right' : 'left'} turn</span>.</b></p>`);
        steps.push(...super.solve());
        //steps.push(...this.solveFinalBearing());
        return steps;
    }

    getSidePairsForDrawing() {
        return this.sidePairs;
    }

    getCornerCoords(a, b, c) {
        var aCoords = { x: 0, y: 0 };
        var bCoords = this.bearingAngle1.getEndPoint(aCoords, c.side);
        var cCoords = this.bearingAngle2.getEndPoint(bCoords, a.side);
        console.log(`corner coordinates: (${JSON.stringify(aCoords)}), (${JSON.stringify(bCoords)}), (${JSON.stringify(cCoords)})`);

        return { aCoords, bCoords, cCoords };
    }

    initDrawOptions() {
        super.initDrawOptions();
        this.drawOptions.showInitialBearingAngles = { label: 'show angles for initial bearing', value: true };
        this.drawOptions.showTurnBearingAngles = { label: 'show angles for second bearing', value: true };
        this.drawOptions.showFinalBearingAngles = { label: 'show angles for final bearing', value: false };
    }

    drawAdditional({ ctx, _cc, _drawLine, _drawArc, _cornerLabel, scaleFactor, aCoords, bCoords, cCoords, _addLegend }) {
        const { _disp } = this;
        const a = this.sidePairs[0];

        const showAnglesForInitialBearing = this.getDrawOptionValue('showInitialBearingAngles');
        const showAnglesForTurnBearing = this.getDrawOptionValue('showTurnBearingAngles');
        const showAnglesForFinalBearing = this.getDrawOptionValue('showFinalBearingAngles');

        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        const axisLength = 75 / scaleFactor;
        const _drawAxesAroundPoint = ({ x, y }) => {
            ctx.beginPath();
            _drawLine(
                { x: x - axisLength, y: y },
                { x: x + axisLength, y: y },
            )
            _drawLine(
                { x: x, y: y - axisLength },
                { x: x, y: y + axisLength },
            )
            ctx.stroke();
        }
        _drawAxesAroundPoint(aCoords);
        _drawAxesAroundPoint(bCoords);
        const arcRadius1 = 55;
        const arcRadius2 = 65;
        const arcRadius3 = 65;
        const arcRadius4 = 74;
        const arcRadius5 = 68;
        ctx.lineWidth = 4;
        var color;
        if (showAnglesForInitialBearing) {
            // bearing1
            color = "purple";
            ctx.strokeStyle = color;
            ctx.beginPath();
            _drawArc(aCoords, arcRadius1, ...this.bearingAngle1.getParametersForDrawingOnCanvas(false, true));
            ctx.stroke();
            ctx.beginPath();
            _drawArc(bCoords, arcRadius1, ...this.bearingAngle1.opposite.getParametersForDrawingOnCanvas(false, true));
            ctx.stroke();
            _addLegend(color, `initial bearing ${this.bearingAngle1.compassBearingString}`);
        }
        // bearing1 as true bearing
        if (this.bearingAngle1.trueBearing > 90 && this.drawFinalBearingAsTrueBearing && showAnglesForFinalBearing) {
            color = "#3A1561";
            ctx.strokeStyle = color;
            ctx.beginPath();
            _drawArc(aCoords, arcRadius5, ...this.bearingAngle1.getParametersForDrawingOnCanvas(true, true));
            ctx.stroke();
            _addLegend(color, `initial bearing as true bearing`);
        }
        if (showAnglesForTurnBearing) {
            // bearing2
            color = "magenta";
            ctx.strokeStyle = color;
            ctx.beginPath();
            _drawArc(bCoords, arcRadius2, ...this.bearingAngle2.getParametersForDrawingOnCanvas(false, true));
            ctx.stroke();
            _addLegend(color, `turn bearing ${this.bearingAngle2.compassBearingString}`);
        }
        if (showAnglesForFinalBearing) {
            // angle A
            color = "red";
            ctx.strokeStyle = color;
            ctx.beginPath();
            const arcAStartAngle = this.bearingAngle1.trueBearing - 90;
            const arcAEndingAngle = this.finalBearing.trueBearing - 90;
            const arcACounterClockwise = !this.isRightTurn;
            _drawArc(aCoords, arcRadius3, arcAStartAngle, arcAEndingAngle, arcACounterClockwise);
            _addLegend(color, `angle A = ${_disp(a.angle)}`);
            ctx.stroke();
            // final bearing
            color = "teal";
            ctx.strokeStyle = color;
            ctx.beginPath();
            const drawAsTrueBearing = this.drawFinalBearingAsTrueBearing;
            _drawArc(aCoords, arcRadius4, ...this.finalBearing.getParametersForDrawingOnCanvas(drawAsTrueBearing, true));
            ctx.stroke();
            _addLegend(color, `final bearing ${this.finalBearing.compassBearingString}`);
        }
    }

}
