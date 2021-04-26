
const _toFixedAngles = 1;
const _toFixedSides = 2;

class Triangle {

    constructor(nameA, angleA, sideA, nameB, angleB, sideB, nameC, angleC, sideC, doNotInitialize = false) {
        if (!doNotInitialize) {
            this.sidePairs = [
                new TriangleSideAnglePair(this, nameA, angleA, sideA),
                new TriangleSideAnglePair(this, nameB, angleB, sideB),
                new TriangleSideAnglePair(this, nameC, angleC, sideC)
            ]
        }
    }

    clone() {
        const triangle = new Triangle(null, null, null, null, null, null, null, null, null, true);
        triangle.sidePairs = this.sidePairs.map(sp => sp.clone(triangle));
        return triangle;
    }

    get isRightTriangle() {
        return this.sidePairs.some(sp => sp.isRightAngle);
    }

    getGivenStatus() {
        const statusList = [];
        this.sidePairs.forEach(sp => {
            statusList.push(...sp.getGivenStatus());
        })
        statusList.sort((a, b) => a > b ? -1 : a < b ? 1 : 0);
        return statusList;
    }

    getGivenAngles() {
        return this.sidePairs.filter(sp => sp.angle).map(sp => sp.angle.degree);
    }

    getMissingAngleObject() {
        return this.sidePairs.filter(sp => !sp.angle)[0];
    }

    addAngleSideSuffix(sideName, suffix) {
        const sname = sideName.toLowerCase();
        this.sidePairs.filter(sp => sp.sideName === sname).forEach(sp => sp.addSuffix(suffix));
    }

    _disp(x, toFixedNum = null) {
        let num, defaultToFixed;
        if (x instanceof Angle) {
            num = _d(x.degree);
            defaultToFixed = _toFixedAngles;
        } else {
            num = _d(x);
            defaultToFixed = _toFixedSides;
        }
        let tf = (typeof toFixedNum === 'number') ? toFixedNum : defaultToFixed;
        return Number(num.toFixed(tf));
    }

    solve() {
        const status = this.getGivenStatus();
        if (status.length < 3) {
            throw `not enough information to solve triangle; add ${3 - status.length} entry/ies`;
        }
        if (status.length > 3) {
            throw `too many parameters given; remove ${status.length - 3} entry/ies`;
        }
        if (this.isRightTriangle && !this.forceOblique) {
            return this.solveRightTriangle(status);
        }
        return this.solveObliqueTriangle(status);
    }

    solveRightTriangle(status) {
        const { _disp } = this;
        const steps = [];
        const statusStr = status.join('');
        if (statusStr === 'SAA') {
            let missingAngleObject = this.getMissingAngleObject();
            let missingAngleName = missingAngleObject.angleName;
            let givenAngles = this.getGivenAngles();
            let result = givenAngles.reduce((val, degree) => val - degree, 180);
            steps.push({
                text: `Determine missing angle ${missingAngleName}:`,
                latex: `${missingAngleName} = 180 - ${givenAngles.join(' - ')} = ${result.toFixed(_toFixedAngles)}`
            })
            this.sidePairs.forEach(sp => {
                const steps0 = sp.solveRightTriangle();
                if (steps0) {
                    steps.push(...steps0);
                }
            })
            missingAngleObject.angle = Angle.fromDegree(result, true);
            steps.push({ drawTriangle: this.clone() });
        }
        else if (statusStr === 'SSA') {
            steps.push({ text: 'Determining missing side using pythagoras:' });
            let givenPairs = this.sidePairs.filter(sp => sp.side);
            let missingPair = this.sidePairs.filter(sp => !sp.side)[0];
            if (missingPair.isHypotenuse()) {
                let [a, b] = givenPairs;
                let c = missingPair;
                let cResult = a.side.pow(2).add(b.side.pow(2)).sqrt();
                steps.push({
                    latex: `${c.sideName}^2 = ${a.sideName}^2 + ${b.sideName}^2\\Rightarrow ${c.sideName} = \\sqrt{${a.side}^2 + ${b.side}^2} = ${_disp(cResult)}`
                })
                steps.push({ test: 'Determining missing angles:' });
                let aAngleResult = a.side.div(b.side).atan().mul(180 / Math.PI).toFixed(_toFixedAngles);
                steps.push({
                    latex: `tan ${a.angleName} = \\frac{${a.sideName}}{${b.sideName}}` +
                        `\\Rightarrow ${a.angleName} = tan^{-1}(\\frac{${a.side}}{${b.side}})` +
                        ` = ${aAngleResult}`
                })
                let bAngleResult = b.side.div(a.side).atan().mul(180 / Math.PI).toFixed(_toFixedAngles);
                steps.push({
                    latex: `tan ${b.angleName} = \\frac{${b.sideName}}{${a.sideName}}` +
                        `\\Rightarrow ${b.angleName} = tan^{-1}(\\frac{${b.side}}{${a.side}})` +
                        ` = ${bAngleResult}`
                })
                a.angle = Angle.fromDegree(aAngleResult, true);
                b.angle = Angle.fromDegree(bAngleResult, true);
                c.side = cResult;
                steps.push({ drawTriangle: this.clone() });
            } else {
                let a, c;
                if (givenPairs[0].isHypotenuse()) {
                    a = givenPairs[1];
                    c = givenPairs[0];
                } else {
                    a = givenPairs[0];
                    c = givenPairs[1];
                }
                let b = missingPair;
                let bResult = c.side.pow(2).sub(a.side.pow(2)).sqrt().toFixed(_toFixedSides);
                steps.push({
                    latex: `${b.sideName}^2 = ${c.sideName}^2 - ${a.sideName}^2\\Rightarrow ` +
                        `${b.sideName} = \\sqrt{${c.side}^2 - ${a.side}^2} = ${bResult}`
                })
                steps.push({ test: 'Determining missing angles:' });
                let aAngleResult = a.side.div(c.side).asin().mul(180 / Math.PI).toFixed(_toFixedAngles);
                let bAngleResult = a.side.div(c.side).acos().mul(180 / Math.PI).toFixed(_toFixedAngles);
                steps.push({
                    latex: `sin ${a.angleName} = \\frac{${a.side}}{${c.side}} \\Rightarrow ` +
                        `${a.angleName} = sin^{-1}(\\frac{${a.side}}{${c.side}}) = ${aAngleResult}`
                })
                steps.push({
                    latex: `cos ${b.angleName} = \\frac{${a.side}}{${c.side}} \\Rightarrow ` +
                        `${b.angleName} = cos^{-1}(\\frac{${a.side}}{${c.side}}) = ${bAngleResult}`
                })
                b.side = bResult;
                a.angle = Angle.fromDegree(aAngleResult, true);
                b.angle = Angle.fromDegree(bAngleResult, true);
                steps.push({ drawTriangle: this.clone() });
            }
        }
        else {
            throw 'this combination of parameters is not supported.'
        }
        return steps;
    }

    solveObliqueTriangle(status) {
        const { _disp } = this;
        const steps = [];
        const statusStr = status.join('');
        if (statusStr === 'SAA') {
            let missingAngleObject = this.getMissingAngleObject();
            let missingAngleName = missingAngleObject.angleName;
            let givenAngles = this.getGivenAngles();
            let result = givenAngles.reduce((val, degree) => val - degree, 180);
            steps.push({
                text: `Determine missing angle ${missingAngleName}:`,
                latex: `${missingAngleName} = 180 - ${givenAngles.join(' - ')} = ${_disp(result)}`
            })
            if (result <= 0) {
                steps.push(`this combination of values doesn't yield a valid triangle!`);
            } else {
                steps.push({ text: 'Determining missing sides:' });
                missingAngleObject.angle = Angle.fromDegree(result, true);
                let a = this.sidePairs.filter(sp => sp.side)[0];
                a.getOtherPairs().forEach(b => {
                    const bResult = a.side.mul(b.angle.sinDecimal).div(a.angle.sinDecimal).toFixed(_toFixedSides);
                    var latex = `\\frac{sin ${a.angle.degree}}{${a.side}} `
                        + `= \\frac{sin ${b.angle.degree}}{${b.sideName}}`
                        + `\\Rightarrow ${b.sideName} = `
                        + `\\frac{${a.side}\\cdot sin ${b.angle.degree}}{sin ${a.angle.degree}}`
                        + `= ${bResult}`;
                    console.log(latex);
                    steps.push({ latex });
                    b.side = _d(bResult);
                })
                steps.push({ drawTriangle: this.clone() });
                steps.push(...this.solveHeights());
            }
        }
        else if (statusStr === 'SSA') {
            const givenSides = this.sidePairs.filter(sp => sp.side);
            const givenAngle = this.sidePairs.filter(sp => sp.angle)[0];
            if (givenAngle.side) {
                console.log(`given angle and side are in the same pair: ${givenAngle.angleName}, ${givenAngle.sideName}`);
                let onlySideGiven = givenSides.filter(sp => !sp.angle)[0];
                let missing = this.sidePairs.filter(sp => !sp.side && !sp.angle)[0];
                let a = givenAngle;
                let b = onlySideGiven;
                let c = missing;
                let B1 = Angle.fromRadians((b.side.mul(a.angle.sinDecimal).div(a.side)).asin(), true);
                let B1Value = _d(B1.degree).toFixed(_toFixedAngles);
                let B2Value = _d(180).sub(B1Value);
                let B2 = Angle.fromDegree(B2Value, true);
                let tmpValue = b.side.mul(a.angle.sinDecimal).div(a.side).toFixed(4);
                steps.push({
                    text: `Determine angle ${b.angleName}:`,
                    latex: `\\frac{sin ${a.angle.degree}}{${a.side}} = \\frac{sin ${b.angleName}}{${b.side}}` +
                        `\\Rightarrow ${b.angleName} = sin^{-1}(\\frac{${b.side}\\cdot sin ${a.angle.degree}}{${a.side}}) ` +
                        `= sin^{-1}(${tmpValue})`
                })
                if (isNaN(B1Value)) {
                    steps.push(`not defined: no triangle is possible with this combination of sides/angle`);
                } else {
                    steps.push({
                        latex: `${b.angleName}_1 \\approx ${B1Value}`
                    })
                    steps.push('check for 2nd triangle:');
                    steps.push({
                        latex: `${b.angleName}_2 = 180 - ${B1Value} = ${B2Value}`
                    })
                    let angleSum = B2Value.add(a.angle.degree);
                    let _stepsToFindC = (bAngle, i = 1, addSuffixes = false) => {
                        steps.push('&nbsp;');
                        steps.push(`Triangle ${i}:`)
                        const cAngleName = `${c.angleName}_${i}`;
                        const cSideName = `${c.sideName}_${i}`;
                        const cAngle = Angle.fromDegree(180 - a.angle.degree - bAngle.degree, true);
                        const cAngleDegree = cAngle.degree.toFixed(_toFixedSides);
                        steps.push({
                            latex: `${cAngleName} = 180 - ${a.angle.degree} - ${bAngle.degree.toFixed(1)} = ${cAngle.degree.toFixed(1)}`
                        })
                        const cSide = a.side.mul(cAngle.sinDecimal).div(a.angle.sinDecimal).toFixed(_toFixedSides);
                        steps.push({
                            latex: `\\frac{sin ${cAngleDegree}}{${cSideName}} = \\frac{sin ${a.angle.degree}}{${a.side}} ` +
                                `\\Rightarrow ${cSideName} = \\frac{${a.side}\\cdot sin ${cAngleDegree}}{sin ${a.angle.degree}} `
                        })
                        steps.push({
                            latex: `${cSideName} \\approx ${cSide}`
                        })
                        b.angle = bAngle;
                        c.angle = cAngle;
                        c.side = _d(cSide);
                        const triangle = this.clone();
                        if (addSuffixes) {
                            triangle.addAngleSideSuffix(b.sideName, String(i));
                            triangle.addAngleSideSuffix(c.sideName, String(i));
                        }
                        steps.push({ drawTriangle: triangle });
                        steps.push(...triangle.solveHeights());
                    }
                    if (angleSum >= 180) {
                        steps.push({
                            latex: `\\text{check:&nbsp;} ${B2Value} + ${a.angle.degree} \\geq 180 \\text{&nbsp;not possible}`
                        })
                        steps.push('only 1 triangle!')
                        _stepsToFindC(B1, 1, false);
                    } else {
                        steps.push({
                            latex: `\\text{check:&nbsp;} ${B2Value} + ${a.angle.degree} < 180 \\text{&nbsp;ok!}`
                        })
                        steps.push('2 triangles!')
                        _stepsToFindC(B1, 1, true);
                        _stepsToFindC(B2, 2, true);
                    }
                }
            } else {
                console.log(`given angle and side are in different pairs: ${givenAngle.angleName}, ${givenSides.map(sp => sp.sideName).join(', ')}`);
                //throw `this combination (given angle doesn't have a given side) is not supported`;
                this.sidePairs.forEach(sp => {
                    const steps0 = sp.solveForSideUsingLawOfCosine();
                    if (steps0) {
                        steps.push(...steps0);
                    }
                })
                this.sidePairs.forEach(sp => {
                    const steps0 = sp.solveForAngle();
                    if (steps0) {
                        steps.push(...steps0);
                    }
                })
                steps.push({ drawTriangle: this.clone() });
                steps.push(...this.solveHeights());
            }
        }
        else if (statusStr === 'SSS') {
            this.sidePairs.forEach(sp => {
                const steps0 = sp.solveForAngle();
                if (steps0) {
                    steps.push(...steps0);
                }
            })
            steps.push({ drawTriangle: this.clone() });
            steps.push(...this.solveHeights());
        }
        else {
            throw 'this combination of parameters is not supported';
        }
        return steps;
    }

    solveHeights() {
        const { _disp, skipHeightCalculationSteps } = this;
        const steps = [];
        if (skipHeightCalculationSteps) return steps;
        const [a, b, c] = this.sidePairs;
        const haResult = c.side.mul(b.angle.sinDecimal);
        const hbResult = c.side.mul(a.angle.sinDecimal);
        const hcResult = b.side.mul(a.angle.sinDecimal);
        steps.push('Determining heights:');
        steps.push({
            latex: `\\frac{sin 90}{${c.sideName}} = \\frac{sin ${b.angleName}}{h_{${a.sideName}}} ` +
                `\\Rightarrow h_{${a.sideName}} = ${c.sideName}\\cdot sin ${b.angleName} = ` +
                `${_disp(c.side)} \\cdot sin ${_disp(b.angle)} = ${_disp(haResult)}`
        })
        steps.push({
            latex: `\\frac{sin 90}{${c.sideName}} = \\frac{sin ${a.angleName}}{h_{${b.sideName}}} ` +
                `\\Rightarrow h_{${b.sideName}} = ${c.sideName}\\cdot sin ${a.angleName} = ` +
                `${_disp(c.side)} \\cdot sin ${_disp(a.angle)} = ${_disp(hbResult)}`
        })
        steps.push({
            latex: `\\frac{sin 90}{${b.sideName}} = \\frac{sin ${a.angleName}}{h_{${c.sideName}}} ` +
                `\\Rightarrow h_{${c.sideName}} = ${b.sideName}\\cdot sin ${a.angleName} = ` +
                `${_disp(b.side)} \\cdot sin ${_disp(a.angle)} = ${_disp(hcResult)}`
        })
        return steps;
    }

    getDrawClockWise() {
        return false;
    }

    getSidePairsForDrawing() {
        const sidePairs = this.sidePairs.slice();
        const [a, b, c] = sidePairs.sort((sp1, sp2) => {
            if (sp1.isRightAngle) {
                return -1;
            }
            if (sp2.isRightAngle) {
                return 1;
            }
            return 0;
        });
        return [a, b, c];
    }

    getCornerCoords(a, b, c) {
        var aCoords = { x: 0, y: 0 };
        var bCoords = { x: c.side.toNumber(), y: 0 }
        // determine c coordinates as offset to b coordinates
        const h = a.side.mul(b.angle.sinDecimal);
        const k = a.side.mul(b.angle.cosDecimal);
        var cCoords = { x: bCoords.x - k.toNumber(), y: bCoords.y + h.toNumber() };
        return { aCoords, bCoords, cCoords };
    }

    drawAdditional(env) {

    }

    draw(cont, fakeCoords = true) {
        console.log(`draw: this: ${this.constructor.name}`);
        const { _disp } = this;
        const canvasSize = 800.0;
        const maxSideLength = _d(Math.max(...this.sidePairs.map(sp => sp.side.toNumber())));
        var scaleFactor = canvasSize / maxSideLength;
        console.log(`max side length: ${maxSideLength}`);
        const cv = _htmlElement('canvas', cont);
        const xoff = canvasSize / 8;
        const yoff = canvasSize / 8;
        const ctx = cv.getContext('2d');
        var shiftUp = 0;
        const drawClockWise = this.getDrawClockWise();
        const _cc = p => {
            let x = (xoff + p.x * scaleFactor);
            let y = canvasSize + yoff - p.y * scaleFactor - shiftUp;
            if (drawClockWise) {
                y = yoff + p.y * scaleFactor;
            }
            return { x, y };
        }
        const _drawLine = (p1, p2) => {
            const c1 = _cc(p1);
            const c2 = _cc(p2);
            ctx.moveTo(c1.x, c1.y);
            ctx.lineTo(c2.x, c2.y);
            console.log(`drawing line (${c1.x},${c1.y}) --> (${c2.x},${c2.y})`)
        }
        const _cornerLabel = (sp, { x, y }, dx, dy) => {
            const distance = 20 / scaleFactor;
            const cp = _cc({
                x: x + dx * distance,
                y: y + dy * distance
            });
            var label = sp.angleName;
            if (sp.initialGivenStatus.includes('A')) {
                label += `=${_disp(sp.angle.degree)}`;
            } else {
                label += `=${_disp(sp.angle)}*`;
            }
            console.log(`corner label ${label} at (${cp.x},${cp.y})`);
            ctx.strokeText(label, cp.x, cp.y);
        }
        const _sideLabel = (sp, aCoords, bCoords, dx, dy) => {
            const distance = 20 / scaleFactor;
            const aXoffset = (bCoords.x - aCoords.x) / 2;
            const aYoffset = (bCoords.y - aCoords.y) / 2;
            const cp = _cc({
                x: aCoords.x + aXoffset + dx * distance,
                y: aCoords.y + aYoffset + dy * distance
            });
            var label = sp.sideName;
            if (sp.initialGivenStatus.includes('S')) {
                label += `=${sp.side}`;
            } else {
                label += `=${_disp(sp.side)}*`;
            }
            console.log(`side label ${label} at (${cp.x},${cp.y})`);
            ctx.strokeText(label, cp.x, cp.y);
        }
        elemStyle(cv, {
            backgroundColor: '#efefef',
            borderRadius: '8px',
            boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)'
        });
        //ctx.scale(scaleFactor, scaleFactor);
        /*
        const sidePairs = this.sidePairs.slice();
        const [a, b, c] = sidePairs.sort((sp1, sp2) => {
            if (sp1.isRightAngle) {
                return -1;
            }
            if (sp2.isRightAngle) {
                return 1;
            }
            return 0;
        });
        */
        /*
        var aCoords = { x: 0, y: 0 };
        var bCoords = { x: c.side.toNumber(), y: 0 }
        // determine c coordinates as offset to b coordinates
        const h = a.side.mul(b.angle.sinDecimal);
        const k = a.side.mul(b.angle.cosDecimal);
        var cCoords = { x: bCoords.x - k.toNumber(), y: bCoords.y + h.toNumber() };
        */
        const [a, b, c] = this.getSidePairsForDrawing();
        var { aCoords, bCoords, cCoords } = this.getCornerCoords(a, b, c);

        if (fakeCoords) {
            aCoords.x = 0;
            aCoords.y = 0;
            bCoords.x = canvasSize - xoff;
            bCoords.y = 0;
            if (this.isRightTriangle) {
                cCoords.x = 0;
                cCoords.y = canvasSize - yoff;
            } else {
                cCoords.x = canvasSize / 2;
                cCoords.y = canvasSize - yoff;
            }
            scaleFactor = 1;
        }

        const allCoords = [aCoords, bCoords, cCoords];
        const minX = Math.min(...allCoords.map(p => p.x));
        const minY = Math.min(...allCoords.map(p => p.y));
        if (minX < 0) allCoords.forEach(p => { p.x = p.x - minX });
        if (minY < 0) allCoords.forEach(p => { p.y = p.y - minY });
        console.log(allCoords);
        const minPointInCanvas = {
            x: Math.min(...allCoords.map(p => _cc(p).x)),
            y: Math.min(...allCoords.map(p => _cc(p).y))
        };
        const maxPointInCanvas = {
            x: Math.max(...allCoords.map(p => _cc(p).x)),
            y: Math.max(...allCoords.map(p => _cc(p).y))
        };
        console.log(`scaleFactor: ${scaleFactor}`);
        console.log(`%cminPointInCanvas: (${minPointInCanvas.x},${minPointInCanvas.y})`, 'color:blue');
        console.log(`%cmaxPointInCanvas: (${maxPointInCanvas.x},${maxPointInCanvas.y})`, 'color:blue');
        shiftUp = minPointInCanvas.y * 0.7;
        //ctx.translate(0, -shiftUp);
        cv.setAttribute("width", canvasSize + xoff * 2);
        //cv.setAttribute("height", canvasSize + yoff * 2);
        cv.setAttribute("height", canvasSize + yoff * 2 - shiftUp);
        ctx.font = '12pt Courier New';
        ctx.strokeStyle = "black";
        ctx.beginPath();
        _drawLine(aCoords, bCoords);
        _drawLine(bCoords, cCoords);
        _drawLine(aCoords, cCoords);
        ctx.stroke();
        ctx.strokeStyle = "green";
        _cornerLabel(a, aCoords, -1, -1);
        _cornerLabel(b, bCoords, 1, -1);
        _cornerLabel(c, cCoords, 0, 1);
        ctx.strokeStyle = "blue";
        _sideLabel(a, bCoords, cCoords, 1, 1);
        _sideLabel(b, aCoords, cCoords, -1.5, 1);
        _sideLabel(c, aCoords, bCoords, 0, -1);

        ctx.strokeStyle = "green";
        ctx.beginPath();
        //_drawLine({ x: 0, y: 0 }, { x: 150/scaleFactor, y: 300/scaleFactor });
        ctx.stroke();
        this.drawAdditional({ ctx, _cc, _drawLine, _cornerLabel, scaleFactor, aCoords, bCoords, cCoords })
    }

}


class TriangleSideAnglePair {

    constructor(triangle, name, angle, side, doNotInitialize = false) {
        this.triangle = triangle;
        if (!doNotInitialize) {
            this.sideName = name.toLowerCase();
            this.angleName = name.toUpperCase();
            if (typeof angle === 'number') {
                this.angle = Angle.fromDegree(angle, true);
            }
            else if (typeof angle === 'undefined') {
            }
            else if (angle instanceof Angle) {
                this.angle = Angle;
            }
            else {
                throw `unrecognized angle format: ${angle}`;
            }
            if (typeof side == 'number') {
                this.side = _d(side);
            }
            else if (typeof side === 'undefined') {
                this.side = side;
            }
            else {
                throw `triangle side must be a number, found ${side}`;
            }
            this.isRightAngle = this.angle && this.angle.degree === 90;
            this.initialGivenStatus = this.getGivenStatus();
        }
    }

    clone(triangle) {
        const sp = new TriangleSideAnglePair(triangle, null, null, null, true);
        sp.sideName = this.sideName;
        sp.angleName = this.angleName;
        if (this.angle) {
            sp.angle = this.angle.clone(true);
        }
        if (this.side) {
            sp.side = _d(this.side);
        }
        sp.isRightAngle = this.isRightAngle;
        sp.initialGivenStatus = this.initialGivenStatus;
        return sp;
    }

    addSuffix(suffix) {
        this.sideName += `_${suffix}`;
        this.angleName += `_${suffix}`;
    }

    getGivenStatus() {
        const givenStatus = [];
        if (this.side) {
            givenStatus.push('S');
        }
        if (this.angle) {
            givenStatus.push('A');
        }
        return givenStatus;
    }

    isHypotenuse() {
        return this.angle && this.angle.degree === 90;
    }

    getOtherPairs() {
        return this.triangle.sidePairs.filter(sp => sp !== this);
    }

    solveRightTriangle() {
        const { _disp } = this;
        if (this.isHypotenuse()) {
            return null;
        }
        if (!this.angle) {
            return null;
        }
        const steps = [];
        // solve right triangle using this angle
        // there's exactly one more side given
        steps.push({ text: `Determining missing sides using angle ${this.angleName}:` });
        const otherPairs = this.getOtherPairs();
        let notHypPair = otherPairs.filter(sp => !sp.isHypotenuse())[0];
        let hypPair = otherPairs.filter(sp => sp.isHypotenuse())[0];
        if (this.side) {
            let a = this;
            let b = notHypPair;
            let c = hypPair;
            let bResult = a.side.div(a.angle.tanDecimal);
            let cResult = a.side.div(a.angle.sinDecimal);
            steps.push({ latex: `tan ${a.angleName} = \\frac{${a.sideName}}{${b.sideName}} \\Rightarrow ${b.sideName} = \\frac{${a.sideName}}{tan ${a.angleName}} = ${_disp(bResult)}` });
            steps.push({ latex: `sin ${a.angleName} = \\frac{${a.sideName}}{${c.sideName}} \\Rightarrow ${c.sideName} = \\frac{${a.sideName}}{sin ${a.angleName}} = ${_disp(cResult)}` });
            b.side = bResult;
            c.side = cResult;
        }
        else if (notHypPair.side) {
            let a = this;
            let b = notHypPair;
            let c = hypPair;
            let aResult = b.side.mul(a.angle.tanDecimal);
            let cResult = b.side.div(a.angle.cosDecimal);
            steps.push({ latex: `tan ${a.angleName} = \\frac{${a.sideName}}{${b.sideName}} \\Rightarrow ${a.sideName} = ${b.sideName}\\cdot tan ${a.angleName} = ${_disp(aResult)}` });
            steps.push({ latex: `cos ${a.angleName} = \\frac{${b.sideName}}{${c.sideName}} \\Rightarrow ${c.sideName} = \\frac{${b.sideName}}{cos ${a.angleName}} = ${_disp(cResult)}` });
            a.side = aResult;
            c.side = cResult;
        }
        else if (hypPair.side) {
            let a = this;
            let b = notHypPair;
            let c = hypPair;
            let aResult = c.side.mul(a.angle.sinDecimal);
            let bResult = c.side.mul(a.angle.cosDecimal);
            steps.push({ latex: `sin ${a.angleName} = \\frac{${a.sideName}}{${c.sideName}} \\Rightarrow ${a.sideName} = ${c.sideName}\\cdot sin ${a.angleName} = ${_disp(aResult)}` });
            steps.push({ latex: `cos ${a.angleName} = \\frac{${b.sideName}}{${c.sideName}} \\Rightarrow ${b.sideName} = ${c.sideName}\\cdot cos ${a.angleName} = ${_disp(bResult)}` });
            a.side = aResult;
            b.side = bResult;
        }
        return steps;
    }

    solveForAngleUsingSumOfAngles() {
        const { _disp, sidePairs } = this.triangle;
        if (this.angle) return null;
        const sidesWithAngles = sidePairs.filter(sp => sp.angle);
        if (sidesWithAngles.length !== 2) {
            return null;
        }
        const a = this;
        const [b, c] = sidesWithAngles;
        a.angle = Angle.fromDegree(180 - b.angle.degree - c.angle.degree, true);
        return [
            `Determining angle ${a.angleName} using sum of angles:`,
            {
                latex: `${a.angleName} = 180 - ${_disp(b.angle)} - ${_disp(c.angle)} = ${_disp(a.angle)}`
            }
        ]
    }

    solveForAngleUsingLawOfCosine() {
        const { _disp } = this.triangle;
        // check whether law of cosine is applicable here:
        // all sides of he triangle must be given and this angle must be unset
        if (this.angle) return null;
        if (this.triangle.sidePairs.some(sp => !sp.side)) {
            console.log(`law of cosine can't be used to determine ${this.angleName}`);
            return null;
        }
        const steps = [];
        const a = this;
        const [b, c] = this.getOtherPairs();
        const tmpValue = ((b.side.pow(2)).add(c.side.pow(2)).sub(a.side.pow(2))).div(_d(2).mul(b.side).mul(c.side));
        const angleResult = Angle.fromRadians(tmpValue.acos(), true);
        a.angle = angleResult;
        var formulas = [];
        const plus = '+'; // because syntax highlighting breaks otherwise...
        formulas.push(`cos ${a.angleName} = \\frac{${b.sideName}^2 ${plus} ${c.sideName}^2 - ${a.sideName}^2}{2${b.sideName}${c.sideName}}` +
            `= \\frac{${_disp(b.side)}^2 ${plus} ${_disp(c.side)}^2 - ${_disp(a.side)}^2}{2\\cdot ${_disp(b.side)}\\cdot ${_disp(c.side)}}` +
            ` = ${_disp(tmpValue)}`,
            `${a.angleName} = cos^{-1}(${Number(tmpValue.toFixed(4))}) = ${_disp(angleResult)}`);
        steps.push(`Determining angle ${a.angleName} using Law of Cosine:`);
        steps.push(...formulas.map(latex => ({ latex })));
        return steps;
    }

    solveForAngle() {
        var steps = this.solveForAngleUsingSumOfAngles();
        if (steps) {
            return steps;
        }
        return this.solveForAngleUsingLawOfCosine();
    }

    solveForSideUsingLawOfCosine() {
        const { _disp, sidePairs } = this.triangle;
        const a = this;
        const [b, c] = this.getOtherPairs();
        if (a.side) return null;
        if (!a.angle) return null;
        if (!b.side || !c.side) return null;
        const steps = [];
        steps.push(`Determining side ${a.sideName} using Law of Cosine:`);
        const aSquare = (b.side.pow(2)).add(c.side.pow(2)).sub(_d(2).mul(b.side).mul(c.side).mul(a.angle.cosDecimal));
        a.side = aSquare.sqrt();
        const formulas = [
            `${a.sideName}^2 = ${b.sideName}^2 + ${c.sideName}^2 - 2\\cdot ${b.sideName}\\cdot ${c.sideName}\\cdot cos ${a.angleName}`
            + ` = ${_disp(b.side)}^2 + ${_disp(c.side)}^2 - 2\\cdot ${_disp(b.side)}\\cdot ${_disp(c.side)}\\cdot cos ${_disp(a.angle)} = ${_disp(aSquare, 4)}`,
            `${a.sideName} \\approx ${_disp(a.side)}`
        ]
        steps.push(...formulas.map(latex => ({ latex })));
        return steps;
    }

}
