/**
 * represent a rectangle
 */

 class Rectangle extends GeometricShape {

    constructor(width, height) {
        super();
        this.width = _d(width);
        this.height = _d(height);
    }

    get shapeName() {
        return 'Rectangle';
    }

    solveArea() {
        const { _disp, width, height } = this;
        this.area = width.mul(height);
        return [{
            latex: `A = \\text{width}\\cdot\\text{height} = ${_disp(width)}\\cdot ${_disp(height)} = ${_disp(this.area)}`
        }]
    }

}
