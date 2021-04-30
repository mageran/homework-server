
var _toFixedAngles = 1;
var _toFixedSides = 2;

class Triangle extends GeometricShape {

    constructor(nameA, angleA, sideA, nameB, angleB, sideB, nameC, angleC, sideC, doNotInitialize = false) {
        super();
        if (!doNotInitialize) {
            this.sidePairs = [
                new TriangleSideAnglePair(this, nameA, angleA, sideA),
                new TriangleSideAnglePair(this, nameB, angleB, sideB),
                new TriangleSideAnglePair(this, nameC, angleC, sideC)
            ]
            this.initDrawOptions();
            this.getProblemCategory();
        }
    }

    get shapeName() {
        return 'Triangle';
    }

    /**
     * create triangle from the given triangleObject. The keys of the object are used as 
     * side names, each value can have keys "side" and "angle", for example:
     * 
     * { 
     *   a: { side: 5 },
     *   b: { angle: 60 }, 
     *   c: { side: 7 }
     * }
     * 
     * @param {*} triangleObject
     */
    static createTriangleFromObject(triangleObject) {
        const parameters = [];
        var keys = Object.keys(triangleObject);
        if (keys.length === 2) {
            //add missing empty angle/side pair
            let ids = ['a', 'b', 'c'];
            for (let i = 0; i < ids.length; i++) {
                let id = ids[i];
                if (!keys.includes(id)) {
                    triangleObject[id] = {};
                    break;
                }
            }
            keys = Object.keys(triangleObject);
        }
        if (keys.length !== 3) {
            throw `malformed input; expected 3 angle/side pairs; given ${keys.length}`;
        }
        keys.forEach(name => {
            const { side, angle } = triangleObject[name];
            parameters.push(name, angle, side);
        })
        return new Triangle(...parameters);
    }

    static createFromOneLineString = (inputString) => {
        const { identifierAssignments } = evalLatexFormulaWithContext(inputString, /\s*[;,]\s*/);
        console.log(identifierAssignments);
        const triangleObject = {};
        Object.keys(identifierAssignments).forEach(name => {
            const id = name.toLowerCase();
            const prop = name.match(/^[A-Z].*$/) ? 'angle' : 'side';
            if (!triangleObject[id]) {
                triangleObject[id] = {};
            }
            triangleObject[id][prop] = Number(identifierAssignments[name]);
        })
        console.log(triangleObject);
        const triangle = Triangle.createTriangleFromObject(triangleObject);
        return triangle;
    }

    _clonePropertiesTo(triangle) {
        triangle.sidePairs = this.sidePairs.map(sp => sp.clone(triangle));
        triangle.fakeCoords = this.fakeCoords;
        triangle.drawOptions = this.drawOptions;
        triangle.area = this.area;
        triangle.needsSolving = this.needsSolving;
    }

    clone() {
        const triangle = new Triangle(null, null, null, null, null, null, null, null, null, true);
        this._clonePropertiesTo(triangle);
        return triangle;
    }

    reset() {
        this.sidePairs.forEach(sp => sp.reset());
    }

    get isRightTriangle() {
        return this.sidePairs.some(sp => sp.isRightAngle);
    }

    getProblemCategory() {
        const getCategory = () => {
            const status = this.getGivenStatus().join('');
            if (status === 'SSS') {
                return status;
            }
            if (status === 'SSA') {
                let anglePair = this.sidePairs.filter(sp => sp.angle)[0];
                return anglePair.side ? 'SSA' : 'SAS';
            }
            if (status === 'SAA') {
                let sidePair = this.sidePairs.filter(sp => sp.side)[0];
                return sidePair.angle ? 'SAA' : 'ASA';
            }
            return '[unsupported]';
        }
        if (!this.$problemCategory) {
            this.$problemCategory = getCategory();
        }
        return this.$problemCategory;
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

    solveAdditional() {
        return [];
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
            steps.push(...this.solveAdditional());
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
                steps.push(...this.solveAdditional());
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
                let bResult0 = c.side.pow(2).sub(a.side.pow(2)).sqrt();
                let bResult = bResult0.toFixed(_toFixedSides);
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
                b.side = bResult0;
                a.angle = Angle.fromDegree(aAngleResult, true);
                b.angle = Angle.fromDegree(bAngleResult, true);
                steps.push(...this.solveAdditional());
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
                steps.push(...this.solveAdditional());
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
                        steps.push(...this.solveAdditional());
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
                steps.push(...this.solveAdditional());
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
            steps.push(...this.solveAdditional());
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

    solveArea(toFixedForResult = null) {
        const { _disp, sidePairs } = this;
        const cat = this.getProblemCategory();
        const steps = [];
        steps.push(`Determine triangle area:`);
        const _solveSSS = () => {
            steps.push(`&nbsp;&nbsp;Using formula for SSS triangles:`);
            const [a, b, c] = sidePairs;
            const s = (a.side.add(b.side).add(c.side)).div(_d(2));
            const k = (s.mul(s.sub(a.side)).mul(s.sub(b.side)).mul(s.sub(c.side))).sqrt();
            steps.push({
                latex: `s = \\frac{1}{2}(${a.sideName} + ${b.sideName} + ${c.sideName})`
                    + ` = \\frac{1}{2}(${_disp(a.side)} + ${_disp(b.side)} + ${_disp(c.side)}) = ${_disp(s, toFixedForResult)}`
            });
            console.log(`s = ${s}`);
            steps.push({
                latex: `K = \\sqrt{s(s - ${a.sideName})(s - ${b.sideName})(s - ${c.sideName})} `
                    + `= \\sqrt{${_disp(s)}\\cdot ${_disp(s.sub(a.side))}\\cdot ${_disp(s.sub(b.side))}\\cdot ${_disp(s.sub(c.side))}}`
                    + ` = ${_disp(k, toFixedForResult)}`
            });
            this.area = k;
        }
        if (cat === 'SAS') {
            steps.push(`&nbsp;&nbsp;Using formula for ${cat} triangles:`);
            let a = sidePairs.filter(sp => sp.angleIsGiven)[0];
            let [b, c] = sidePairs.filter(sp => sp.sideIsGiven);
            const k = (b.side.mul(c.side).mul(a.angle.sinDecimal)).div(2);
            steps.push({
                latex: `K = \\frac{1}{2}${b.sideName}${c.sideName}\\cdot sin ${a.angleName} = `
                    + `\\frac{1}{2}\\cdot ${_disp(b.side)}\\cdot ${_disp(c.side)}\\cdot sin ${_disp(a.angle)}`
                    + `= ${_disp(k, toFixedForResult)}`
            })
            this.area = k;
        }
        else if (cat === 'SSS') {
            _solveSSS();
        }
        else {
            steps.push(`area calculation for triangles of type ${cat} is not supported`);
            if (sidePairs.every(sp => sp.side)) {
                _solveSSS();
            } else {
                this.needsSolving = this.sidePairs.filter(sp => !sp.side).map(sp => sp.sideName);
                this.solve();
                _solveSSS();
            }
        }
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

    initDrawOptions() {
        this.drawOptions = {};
    }

    getDrawOptionValue(id) {
        if (typeof this.drawOptions[id] === 'object') {
            return this.drawOptions[id].value;
        }
        return null;
    }

    draw(cont, canvas = null, legendTableForRedraw = null) {
        console.log(`draw: this: ${this.constructor.name}`);
        const { _disp, fakeCoords } = this;
        const canvasSize = 800.0;
        const maxSideLength = _d(Math.max(...this.sidePairs.map(sp => sp.side.toNumber())));
        var scaleFactor = canvasSize / maxSideLength;
        console.log(`max side length: ${maxSideLength}`);
        const cv = canvas ? canvas : document.createElement('canvas');
        const xoff = canvasSize / 8;
        const yoff = canvasSize / 4;
        const ctx = cv.getContext('2d');
        var shiftUp = 0;
        const legendEntries = [];
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
        const _drawArc = (centerPoint, radius, startAngleDegree, endingAngleDegree, counterclockwise) => {
            const startAngle = Angle.fromDegree(startAngleDegree, true);
            const endingAngle = Angle.fromDegree(endingAngleDegree, true);
            const { x, y } = _cc(centerPoint);
            ctx.arc(x, y, radius, startAngle.radians, endingAngle.radians, counterclockwise);
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
        const _addLegend = (color, text) => {
            legendEntries.push({ color, text });
        }
        elemStyle(cv, {
            backgroundColor: '#efefef',
            borderRadius: '8px',
            boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)'
        });
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
        this.drawAdditional({ ctx, _cc, _drawLine, _drawArc, _cornerLabel, scaleFactor, aCoords, bCoords, cCoords, _addLegend });

        const redrawLegendTable = (legendTable) => {
            legendTable.innerHTML = '';
            legendEntries.forEach(({ color, text }) => {
                const tr = _htmlElement('tr', legendTable);
                var td = _htmlElement('td', tr);
                td.setAttribute('valign', 'middle');
                const cspan = _htmlElement('div', td);
                elemStyle(cspan, {
                    width: '50px',
                    height: '5px',
                    backgroundColor: color
                })
                td = _htmlElement('td', tr);
                td.setAttribute('valign', 'middle');
                td.innerHTML = text;
            })
        }
        if (legendTableForRedraw) {
            redrawLegendTable(legendTableForRedraw);
        }
        if (canvas) return;
        let table = _htmlElement('table', cont);
        let tr = _htmlElement('tr', table);
        let td = _htmlElement('td', tr);
        td.setAttribute("valign", "top");
        td.appendChild(cv);
        td = _htmlElement('td', tr);
        elemStyle(td, { paddingLeft: "15px" });
        td.setAttribute("valign", "top");

        const optionsContainer = _htmlElement('div', td);
        elemStyle(optionsContainer, { padding: '20px 0' });
        Object.keys(this.drawOptions).forEach(key => {
            const { label, value } = this.drawOptions[key];
            const div = _htmlElement('div', optionsContainer);
            const cb = _htmlElement('input', div);
            cb.type = 'checkbox';
            elemStyle(cb, { width: '40px', height: '40px', verticalAlign: 'middle' });
            const labelElement = _htmlElement('div', div, label);
            elemStyle(labelElement, { verticalAlign: 'middle', display: 'inline-block' });
            cb.checked = !!value;
            cb.addEventListener('change', () => {
                const newValue = cb.checked;
                this.drawOptions[key].value = newValue;
                redrawCanvas();
            })
        });

        let legendTable = _htmlElement('table', _htmlElement('div', td));
        redrawLegendTable(legendTable);
        let drawOptionsContainer = _htmlElement('div', td);
        const redrawCanvas = () => {
            ctx.clearRect(0, 0, cv.width, cv.height);
            this.draw(null, cv, legendTable);
        }
        let redrawButton = _htmlElement('input', td, null, 'main-button');
        redrawButton.type = 'button';
        redrawButton.value = "Redraw";
        redrawButton.addEventListener('click', redrawCanvas);
    }

}


class TriangleSideAnglePair {

    constructor(triangle, name, angle, side, doNotInitialize = false) {
        this.triangle = triangle;
        if (!doNotInitialize) {
            this.sideName = name.toLowerCase();
            this.angleName = name.toUpperCase();
            if ((typeof angle === 'number') || (angle instanceof Decimalx)) {
                this.angle = Angle.fromDegree(Number(angle), true);
            }
            else if (typeof angle === 'undefined') {
            }
            else if (angle instanceof Angle) {
                this.angle = Angle;
            }
            else {
                throw `unrecognized angle format: ${angle}`;
            }
            if ((typeof side == 'number') || (side instanceof Decimalx)) {
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
        this._defineGettersInTriangleObject();
    }

    _defineGettersInTriangleObject() {
        const runSolveFor = vname => {
                console.log(`${vname} is still undefined`);
                this.triangle.solve();
                if (!Array.isArray(this.triangle.needsSolving)) {
                    this.triangle.needsSolving = [];
                }
                this.triangle.needsSolving.push(vname);

        }
        this.triangle.constructor.prototype.__defineGetter__(this.sideName, () => {
            if (typeof this.side === 'undefined') {
                runSolveFor(this.sideName);
            }
            return this.side;
        });
        this.triangle.constructor.prototype.__defineGetter__(this.angleName, () => {
            if (typeof this.angle === 'undefined') {
                runSolveFor(this.angleName);
            }
            return this.angle;
        });
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

    reset() {
        if (!this.sideIsGiven) {
            this.side = undefined;
        }
        if (!this.angleIsGiven) {
            this.angle = undefined;
        }
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

    get sideIsGiven() {
        return this.initialGivenStatus.includes('S');
    }

    get angleIsGiven() {
        return this.initialGivenStatus.includes('A');
    }

    isHypotenuse() {
        return this.angle && this.angle.degree === 90;
    }

    getOtherPairs() {
        return this.triangle.sidePairs.filter(sp => sp !== this);
    }

    solveRightTriangle() {
        const { _disp } = this.triangle;
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
            ` = ${_disp(tmpValue, 4)}`,
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
