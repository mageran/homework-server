class GeometricalShapeParserHelper {

    constructor() {
        this.definitions = [];
    }

    parse(inputString, isExpression = false) {
        console.log(`formula: ${inputString}`);
        inputString = _preprocessLatex(inputString);
        console.log(`formula: ${inputString}`);
        const ast = isExpression
            ? geometricalShapesExpressionParser.parse(inputString)
            : geometricalShapesParser.parse(inputString);
        console.log(`parsed: ${JSON.stringify(ast, null, 2)}`);
        return ast;
    }

    createShapeObject(artifactId, identifierAssignments) {
        const prefix = artifactId.toUpperCase()[0];
        if (prefix === 'T') {
            console.log(`creating triangle for id "${artifactId}"`);
            let triangleObject = {};
            Object.keys(identifierAssignments).forEach(name => {
                const id = name.toLowerCase();
                const prop = name.match(/^[A-Z].*$/) ? 'angle' : 'side';
                if (!triangleObject[id]) {
                    triangleObject[id] = {};
                }
                const value = identifierAssignments[name];
                if (value !== null) {
                    triangleObject[id][prop] = value;
                }
            })
            console.log(triangleObject);
            const t = Triangle.createTriangleFromObject(triangleObject);
            t.skipHeightCalculationSteps = true;
            console.log(t);
            return t;
        }
        if (prefix === 'R') {
            console.log(`creating rectangle for id "${artifactId}"`);
            let { width, height } = identifierAssignments;
            if (!width || !height) {
                throw `please use "width" and "height" for rectangles; missing for "${artifactId}"`;
            }
            const rect = new Rectangle(width, height);
            console.log(rect);
            return rect;
        }
        if (prefix === 'S' || prefix === 'C') {
            console.log(`creating circle sector for id "${artifactId}"`);
            let { angle, radius } = identifierAssignments;
            if (!angle || !radius) {
                throw `please use "angle" and "radius" for circle sectors; missing for "${artifactId}"`;
            }
            const s = new CircleSector(angle, radius);
            console.log(s);
            return s;
        }
        else {
            throw `unsupported prefix for shape; ${prefix}; use "T" for triangle, "S" for circle sector, "R" for rectangle`
        }
    }

    getIdentifierAssignmentsFromShapeObjectsMapUsingField(shapeObjects, fieldName) {
        const identifierAssignments = {};
        Object.keys(shapeObjects).forEach(id => {
            const shape = shapeObjects[id];
            if (!(shape instanceof GeometricShape)) return;
            identifierAssignments[id] = shape[fieldName];
        });
        return identifierAssignments;
    }

    parseDefinitions(inputString) {
        const { definitions } = this.parse(inputString, false);
        const toplevelIdentifierAssignments = {};
        definitions.forEach(({ artifactId, assignments }) => {
            const missingNames = [];
            const reduceFun = (identifierAssignments, { id, expr }) => {
                if (typeof expr === 'undefined') {
                    missingNames.push(id);
                    return identifierAssignments;
                }
                const idAssignments = shallowCopy(identifierAssignments);
                mergeWith(idAssignments, toplevelIdentifierAssignments);
                const num = evalAst(expr, idAssignments);
                identifierAssignments[id] = num;
                return identifierAssignments;
            }
            const identifierAssignments = assignments.reduce(reduceFun, {});
            //console.log(identifierAssignments);
            missingNames.forEach(name => { identifierAssignments[name] = null; });
            const shape = this.createShapeObject(artifactId, identifierAssignments);
            toplevelIdentifierAssignments[artifactId] = shape;
        });
        return toplevelIdentifierAssignments;
    }

    parseTriangleDefinition(inputString) {
        const triangleName = 'T';
        const shapeSpec = `${triangleName}: ${inputString};`;
        const shapesMap = this.parseDefinitions(shapeSpec);
        const triangle = shapesMap[triangleName];
        if (!triangle) {
            throw `something went wrong while trying to create triangle object using "${inputString}"`;
        }
        triangle.reset();
        return triangle;
    }

    parseExpresion(inputString, shapeObjectsMap) {
        const identifierAssignments = this.getIdentifierAssignmentsFromShapeObjectsMapUsingField(shapeObjectsMap, 'area');
        const ast = this.parse(inputString, true);
        const num = evalAst(ast, identifierAssignments);
        console.log(`${inputString} = ${num}`);
        return [{
            latex: `${inputString} = ${_disp(num)}`
        }];
    }


}