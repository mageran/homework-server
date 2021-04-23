

class Triangle {

    constructor(nameA, angleA, sideA, nameB, angleB, sideB, nameC, angleC, sideC) {
        this.sidePairs = [
            new TriangleSideAnglePair(this, nameA, angleA, sideA),
            new TriangleSideAnglePair(this, nameB, angleB, sideB),
            new TriangleSideAnglePair(this, nameC, angleC, sideC)
        ]
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

    solve() {
        const status = this.getGivenStatus();
        if (status.length < 3) {
            throw `not enough information to solve triangle; add ${3 - status.length} entry/ies`;
        }
        if (status.length > 3) {
            throw `too many parameters given; remove ${status.length - 3} entry/ies`;
        }
        if (this.isRightTriangle) {
            return this.solveRightTriangle(status);
        }
        return this.solveObliqueTriangle(status);
    }

    solveRightTriangle(status) {
        const steps = [];
        const statusStr = status.join('');
        if (statusStr === 'SAA') {
            let missingAngleObject = this.getMissingAngleObject();
            let missingAngleName = missingAngleObject.angleName;
            let givenAngles = this.getGivenAngles();
            let result = givenAngles.reduce((val, degree) => val - degree, 180);
            steps.push({
                text: `Determine missing angle ${missingAngleName}:`,
                latex: `${missingAngleName} = 180 - ${givenAngles.join(' - ')} = ${result.toFixed(2)}`
            })
            this.sidePairs.forEach(sp => {
                const steps0 = sp.solveRightTriangle();
                if (steps0) {
                    steps.push(...steps0);
                }
            })
            missingAngleObject.angle = Angle.fromDegree(result, true);
        }
        else if (statusStr === 'SSA') {
            steps.push({ text: 'Determining missing side using pythagoras:' });
            let givenPairs = this.sidePairs.filter(sp => sp.side);
            let missingPair = this.sidePairs.filter(sp => !sp.side)[0];
            if (missingPair.isHypotenuse()) {
                let [a, b] = givenPairs;
                let c = missingPair;
                let cResult = a.side.pow(2).add(b.side.pow(2)).sqrt().toFixed(2);
                steps.push({
                    latex: `${c.sideName}^2 = ${a.sideName}^2 + ${b.sideName}^2\\Rightarrow ${c.sideName} = \\sqrt{${a.side}^2 + ${b.side}^2} = ${cResult}`
                })
                steps.push({ test: 'Determining missing angles:' });
                let aAngleResult = a.side.div(b.side).atan().mul(180 / Math.PI).toFixed(2);
                steps.push({
                    latex: `tan ${a.angleName} = \\frac{${a.sideName}}{${b.sideName}}` +
                        `\\Rightarrow ${a.angleName} = tan^{-1}(\\frac{${a.side}}{${b.side}})` +
                        ` = ${aAngleResult}`
                })
                let bAngleResult = b.side.div(a.side).atan().mul(180 / Math.PI).toFixed(2);
                steps.push({
                    latex: `tan ${b.angleName} = \\frac{${b.sideName}}{${a.sideName}}` +
                        `\\Rightarrow ${b.angleName} = tan^{-1}(\\frac{${b.side}}{${a.side}})` +
                        ` = ${bAngleResult}`
                })
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
                let bResult = c.side.pow(2).sub(a.side.pow(2)).sqrt().toFixed(2);
                steps.push({
                    latex: `${b.sideName}^2 = ${c.sideName}^2 - ${a.sideName}^2\\Rightarrow ` +
                        `${b.sideName} = \\sqrt{${c.side}^2 - ${a.side}^2} = ${bResult}`
                })
                steps.push({ test: 'Determining missing angles:' });
                let aAngleResult = a.side.div(c.side).asin().mul(180 / Math.PI).toFixed(2);
                let bAngleResult = a.side.div(c.side).acos().mul(180 / Math.PI).toFixed(2);
                steps.push({
                    latex: `sin ${a.angleName} = \\frac{${a.side}}{${c.side}} \\Rightarrow ` +
                        `${a.angleName} = sin^{-1}(\\frac{${a.side}}{${c.side}}) = ${aAngleResult}`
                })
                steps.push({
                    latex: `cos ${b.angleName} = \\frac{${a.side}}{${c.side}} \\Rightarrow ` +
                        `${b.angleName} = cos^{-1}(\\frac{${a.side}}{${c.side}}) = ${bAngleResult}`
                })
            }
        }
        else {
            throw 'this combination of parameters is not supported.'
        }
        return steps;
    }

    solveObliqueTriangle(status) {
        const steps = [];
        const statusStr = status.join('');
        if (statusStr === 'SAA') {
            let missingAngleObject = this.getMissingAngleObject();
            let missingAngleName = missingAngleObject.angleName;
            let givenAngles = this.getGivenAngles();
            let result = givenAngles.reduce((val, degree) => val - degree, 180);
            steps.push({
                text: `Determine missing angle ${missingAngleName}:`,
                latex: `${missingAngleName} = 180 - ${givenAngles.join(' - ')} = ${result}`
            })
            steps.push({ text: 'Determining missing sides:' });
            missingAngleObject.angle = Angle.fromDegree(result, true);
            let a = this.sidePairs.filter(sp => sp.side)[0];
            a.getOtherPairs().forEach(b => {
                const bResult = a.side.mul(b.angle.sinDecimal).div(a.angle.sinDecimal).toFixed(2);
                var latex = `\\frac{sin ${a.angle.degree}}{${a.side}} `
                    + `= \\frac{sin ${b.angle.degree}}{${b.sideName}}`
                    + `\\Rightarrow ${b.sideName} = `
                    + `\\frac{${a.side}\\cdot sin ${b.angle.degree}}{sin ${a.angle.degree}}`
                    + `= ${bResult}`;
                console.log(latex);
                steps.push({ latex });
            })
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
                let B1Value = _d(B1.degree).toFixed(2);
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
                    let _stepsToFindC = (bAngle, i=1) => {
                        steps.push(`Triangle ${i}:`)
                        const cAngleName = `${c.angleName}_${i}`;
                        const cSideName = `${c.sideName}_${i}`;
                        const cAngle = Angle.fromDegree(180 - a.angle.degree - bAngle.degree, true);
                        const cAngleDegree = cAngle.degree.toFixed(2);
                        steps.push({
                            latex: `${cAngleName} = 180 - ${a.angle.degree} - ${bAngle.degree.toFixed(2)} = ${cAngle.degree.toFixed(2)}`
                        })
                        const cSide = a.side.mul(cAngle.sinDecimal).div(a.angle.sinDecimal).toFixed(2);
                        steps.push({
                            latex: `\\frac{sin ${cAngleDegree}}{${cSideName}} = \\frac{sin ${a.angle.degree}}{${a.side}} ` +
                            `\\Rightarrow ${cSideName} = \\frac{${a.side}\\cdot sin ${cAngleDegree}}{sin ${a.angle.degree}} `
                        })
                        steps.push({
                            latex: `${cSideName} \\approx ${cSide}`
                        })
                    }
                    if (angleSum >= 180) {
                        steps.push({
                            latex: `\\text{check:&nbsp;} ${B2Value} + ${a.angle.degree} \\geq 180 \\text{&nbsp;not possible}`
                        })
                        steps.push('only 1 triangle!')
                        _stepsToFindC(B1, 1);
                    } else {
                        steps.push({
                            latex: `\\text{check:&nbsp;} ${B2Value} + ${a.angle.degree} < 180 \\text{&nbsp;ok!}`
                        })
                        steps.push('2 triangles!')
                        _stepsToFindC(B1, 1);
                        _stepsToFindC(B2, 2);
                    }
                }
            } else {
                console.log(`given angle and side are in different pairs: ${givenAngle.angleName}, ${givenSides.map(sp => sp.sideName).join(', ')}`);
                throw `this combination (given angle doesn't have a given side) is not supported`;
            }
        }
        else {
            throw 'this combination of parameters is not supported';
        }
        return steps;
    }

}


class TriangleSideAnglePair {

    constructor(triangle, name, angle, side) {
        this.triangle = triangle;
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
    }

    getGivenStatus() {
        const givenStatus = [];
        if (this.side) {
            givenStatus.push('S');
        }
        if (this.angle) {
            givenStatus.push('A');
        }
        this.initialGivenStatus = givenStatus;
        return givenStatus;
    }

    isHypotenuse() {
        return this.angle && this.angle.degree === 90;
    }

    getOtherPairs() {
        return this.triangle.sidePairs.filter(sp => sp !== this);
    }

    solveRightTriangle() {
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
            let bResult = a.side.div(a.angle.tanDecimal).toFixed(2);
            let cResult = a.side.div(a.angle.sinDecimal).toFixed(2);
            steps.push({ latex: `tan ${a.angleName} = \\frac{${a.sideName}}{${b.sideName}} \\Rightarrow ${b.sideName} = \\frac{${a.sideName}}{tan ${a.angleName}} = ${bResult}` });
            steps.push({ latex: `sin ${a.angleName} = \\frac{${a.sideName}}{${c.sideName}} \\Rightarrow ${c.sideName} = \\frac{${a.sideName}}{sin ${a.angleName}} = ${cResult}` });
        }
        else if (notHypPair.side) {
            let a = this;
            let b = notHypPair;
            let c = hypPair;
            let aResult = b.side.mul(a.angle.tanDecimal).toFixed(2);
            let cResult = b.side.div(a.angle.cosDecimal).toFixed(2);
            steps.push({ latex: `tan ${a.angleName} = \\frac{${a.sideName}}{${b.sideName}} \\Rightarrow ${a.sideName} = ${b.sideName}\\cdot tan ${a.angleName} = ${aResult}` });
            steps.push({ latex: `cos ${a.angleName} = \\frac{${b.sideName}}{${c.sideName}} \\Rightarrow ${c.sideName} = \\frac{${b.sideName}}{cos ${a.angleName}} = ${cResult}` });
        }
        else if (hypPair.side) {
            let a = this;
            let b = notHypPair;
            let c = hypPair;
            let aResult = c.side.mul(a.angle.sinDecimal).toFixed(2);
            let bResult = c.side.mul(a.angle.cosDecimal).toFixed(2);
            steps.push({ latex: `sin ${a.angleName} = \\frac{${a.sideName}}{${c.sideName}} \\Rightarrow ${a.sideName} = ${c.sideName}\\cdot sin ${a.angleName} = ${aResult}` });
            steps.push({ latex: `cos ${a.angleName} = \\frac{${b.sideName}}{${c.sideName}} \\Rightarrow ${b.sideName} = ${c.sideName}\\cdot cos ${a.angleName} = ${bResult}` });
        }
        return steps;
    }

}
