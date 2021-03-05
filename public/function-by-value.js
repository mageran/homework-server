function functionByValue(fvalues, gvalues, applyValue, includeInverses) {
    const outputElem = this;
    const parsePointlist = pointlistAsString => {
        if (pointlistAsString.trim().length === 0) {
            return null;
        }
        const pointStrings = pointlistAsString.replace(/^\s*\(/, '')
            .replace(/\)\s*$/, '')
            .split(/\)\s*,\s*\(/);
        return pointStrings.map(pointString => {
            const errmsg = `point coordinates "${pointString}" could not be parsed into 2 numbers`;
            const coords = pointString.split(/\s*,\s*/);
            if (coords.length !== 2) {
                throw errmsg;
            }
            if (coords.some(x => isNaN(Number(x)))) {
                throw errmsg;
            }
            return coords.map(x => Number(x));
        });
    }

    const _addGraph = (fpoints, gpoints, invfpoints, invgpoints) => {
        const _pointsStr = points => {
            if (typeof points === 'string') {
                return points;
            }
            const plist = points.map(p => `(${p.join(',')})`);
            return plist.join(',');
        }
        const div = document.createElement('div');
        outputElem.appendChild(div);
        const width = "1000px";
        const calc = appendGraphingCalculator(div, { width });
        //calc.setExpression({ latex: ftermLatex });
        //calc.setExpression({ latex: `x = ${h}`, lineStyle: "DASHED", showLabel: true, lineColor: 'orange' });
        const pointlists0 = [fpoints, gpoints];
        const pointlists1 = [invfpoints, invgpoints];
        var colorIndex = 0;
        const colors = ['#2d70b3', '#fa7e19']
        pointlists0.forEach(points => {
            if (points) {
                calc.setExpression({ latex: _pointsStr(points), color: colors[colorIndex++], showLabel: true, lines: true });
            }
        });
        colorIndex = 0;
        pointlists1.forEach(points => {
            if (points) {
                calc.setExpression({ latex: _pointsStr(points), color: colors[colorIndex++], lineStyle: 'DASHED', showLabel: true, lines: true });
            }
        });

        return calc;
    }

    const _makeATable = points => {
        const table = _htmlElement('table', outputElem, null, "make-a-table");
        const xtr = _htmlElement('tr', table);
        const ytr = _htmlElement('tr', table);
        _htmlElement('td', xtr, 'x');
        _htmlElement('td', ytr, 'y');
        points.forEach(([x, y]) => {
            _htmlElement('td', xtr, String(x));
            _htmlElement('td', ytr, String(y));
        })
    }

    const getInverse = (points, errmsgFun) => {
        if (!points) return null;
        const map = {};
        const ipoints = [];
        for (let i = 0; i < points.length; i++) {
            let [x, y] = points[i];
            if (typeof (map[y]) === 'number') {
                console.log(`function doesn't have an inverse, duplicate values for ${y}`);
                errmsgFun(y);
                return null;
            }
            map[y] = x;
            ipoints.push([y, x]);
        }
        return ipoints;
    }

    const applyFunction = (points, x) => {
        for (let i = 0; i < points.length; i++) {
            let [x0, y0] = points[i];
            if (x0 === x) {
                return y0;
            }
        }
        return null;
    }

    try {
        const fpoints = parsePointlist(fvalues);
        const gpoints = parsePointlist(gvalues);

        if (fpoints) {
            _htmlElement('h3',outputElem, "Value table for f");
            _makeATable(fpoints);
        }
        if (gpoints) {
            _htmlElement('h3',outputElem, "Value table for g");
            _makeATable(gpoints);
        }

        const num = Number(applyValue);

        var invfpoints = null;
        var invgpoints = null;

        if (includeInverses) {
            invfpoints = getInverse(fpoints, y => { _htmlElement('div', outputElem, `"f" doesn't have an inverse, duplicate value for ${y}`); });
            invgpoints = getInverse(gpoints, y => { _htmlElement('div', outputElem, `"g" doesn't have an inverse, duplicate value for ${y}`); });
        }
        const funs = [];
        if (fpoints) funs.push({ latex: 'f', points: fpoints, result: applyFunction(fpoints, num) });
        if (gpoints) funs.push({ latex: 'g', points: gpoints, result: applyFunction(gpoints, num) });
        if (invfpoints) funs.push({ latex: 'f^{-1}', points: invfpoints, result: applyFunction(invfpoints, num) });
        if (invgpoints) funs.push({ latex: 'g^{-1}', points: invgpoints, result: applyFunction(invgpoints, num) });

        console.log(JSON.stringify(funs, null, 2));

        funs.forEach(fun => {
            const res = (typeof fun.result === 'number') ? fun.result : "\\text{not defined}";
            const latex = `${fun.latex}(${num}) = ${res}`
            addLatexElement(outputElem, latex);
        })

        for (let indexes of allCombinations(0, funs.length - 1, 2)) {
            let [fun0, fun1] = indexes.map(index => funs[index]);
            let resnum = null;
            let inum = fun1.result;
            if (typeof inum === 'number') {
                resnum = applyFunction(fun0.points, inum);
            }
            if (typeof resnum === 'number') {
                let iresLatex = `${fun0.latex}(${inum})`
                let latex = `${fun0.latex} \\circ ${fun1.latex} = ${fun0.latex}(${fun1.latex}(${num})) = ${iresLatex} = ${resnum}`;
                addLatexElement(outputElem, latex);
            }
        }

        _addGraph(fpoints, gpoints, invfpoints, invgpoints);

    } catch (err) {
        _addErrorElement(outputElem, err);
    }
}