/**
 * super class for geometric shapes (Triangle, Rectangle, CircleSector)
 */
class GeometricShape {

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

    /**
     * reset shape back to the state before solve was called
     */
    reset() {

    }

    solve() {
        return null;
    }

    get shapeName() {
        return '[unknown shape]';
    }

    solveArea() {
        throw `implementation missing for ${this.constructor.name}.solveArea()`;
    }

}