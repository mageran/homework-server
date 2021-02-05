class AngleHtml {

    constructor(angle) {
        this.angle = angle;
    }

    addValueTable(cont, title) {
        if (title) {
            const hd = document.createElement('h3');
            hd.innerHTML = title;
            cont.appendChild(hd);
        }
        const table = document.createElement('table');
        table.className = "angle-value-table";
        //table.setAttribute('border', '1');
        var tr = document.createElement('tr');
        const headers = ['Degrees', 'Radians (PI)', 'Radians (decimal)', 'Graph'];
        headers.forEach(hd => {
            var th = document.createElement('th');
            th.innerHTML = hd;
            tr.appendChild(th);
        })
        table.appendChild(tr);
        tr = document.createElement('tr');
        const values = [{ v: this.angle.degree }, { v: this.angle.piFactor, addpi: true }, { v: this.angle.radians, toFixed: 2 }];
        values.forEach(val => {
            var td = document.createElement('td');
            var value = val.v;
            if (typeof val.toFixed === 'number') {
                value = value.toFixed(val.toFixed);
            }
            let ltx = numericToLatex(value);
            if (val.addpi) {
                ltx += "\\pi";
            }
            addLatexElement(td, ltx);
            tr.appendChild(td);
        })
        var td = document.createElement('td');
        this.addCanvas(td);
        tr.appendChild(td);
        table.appendChild(tr);
        cont.appendChild(table);
    }

    addCanvas(cont) {
        const c = document.createElement('canvas');
        c.setAttribute("width", 200);
        c.setAttribute("height", 150);
        cont.appendChild(c);
        var ctx = c.getContext("2d");
        var degree = this.angle.degree;
        var angle = -degree * Math.PI / 180;
        ctx.beginPath();
        drawArcedArrow(ctx, 100, 75, 30, 0, angle, angle < 0, 3, 2);
        ctx.moveTo(100, 75);
        ctx.lineTo(160, 75);
        ctx.moveTo(100, 75);
        ctx.lineTo(100 + 60 * Math.cos(angle), 75 + 60 * Math.sin(angle));
        ctx.stroke();
        ctx.moveTo(100, 75);
        ctx.beginPath();
        ctx.strokeStyle = "#bbb";
        ctx.arc(100, 75, 50, 0, 2 * Math.PI)
        ctx.moveTo(40, 75);
        ctx.lineTo(160, 75);
        ctx.moveTo(100, 135);
        ctx.lineTo(100, 15);
        ctx.stroke();
    }

    addQuadrantInfo(cont) {
        const hd = document.createElement('h3');
        hd.innerHTML = "Quadrant";
        cont.appendChild(hd);
        const div = document.createElement('div');
        const { quadrant, xsign, ysign } = this.angle.quadrant;
        const xsignStr = xsign < 0 ? "-" : "+";
        const ysignStr = ysign < 0 ? "-" : "+";
        div.innerHTML = `Q${quadrant}, signs: (${xsignStr}, ${ysignStr})`;
        div.style.fontSize = "18pt";
        cont.appendChild(div);
    }

    addXYCoordInfo(cont) {
        const hd = document.createElement('h3');
        hd.innerHTML = "X/Y Coordinate Info";
        cont.appendChild(hd);
        const div = document.createElement('div');
        try {
            const { xcoord, ycoord } = this.angle.getXY();
            addLatexElement(div, numericToLatex(xcoord), 'X-coordinate:');
            addLatexElement(div, numericToLatex(ycoord), 'Y-coordinate:');
        } catch (e) {
            div.innerHTML = "not available, " + e;
        }
        cont.appendChild(div);
    }

}


function angleInfo(degree, piFactor, radians) {
    const outputElem = this;
    var angle = null;
    var conversionFromDegrees = true;
    if (degree.trim().length > 0) {
        try {
            let pres = latexFormulaParser.parse(degree);
            pres = simplifyFormula(pres, 0, () => { });
            if (typeof pres === 'number') {
                angle = Angle.fromDegree(pres);
            }
        } catch (e) { }
    }
    if (!angle && radians.trim().length > 0) {
        try {
            let pres = latexFormulaParser.parse(radians);
            pres = simplifyFormula(pres, 0, () => { });
            if (typeof pres === 'number') {
                angle = Angle.fromRadians(pres);
            }
            conversionFromDegrees = false;
        } catch (e) { }
    }
    if (!angle && piFactor.trim().length > 0) {
        try {
            let pres = latexFormulaParser.parse(piFactor);
            pres = simplifyFormula(pres, 0, () => { });
            console.log(`pres: ${pres}`);
            angle = Angle.fromPIFactor(pres);
            conversionFromDegrees = false;
        } catch (e) { }
    }
    if (!angle) {
        _addErrorElement(outputElem, "no input found.");
        return;
    }
    var clatex = '';
    if (conversionFromDegrees) {
        clatex = `\\text{radians} = \\text{degrees} \\cdot \\frac{\\pi}{180^o} = ${numericToLatex(angle.degree)}^o \\cdot \\frac{\\pi}{180^o} = ${numericToLatex(angle.piFactor)}\\pi`;
    } else {
        clatex = `\\text{degrees} = \\text{radians} \\cdot \\frac{180^o}{\\pi} = ${numericToLatex(angle.piFactor)}\\pi \\cdot \\frac{180^o}{\\pi} = ${numericToLatex(angle.degree)}^o`;
    }
    addLatexElement(outputElem, clatex);

    const ahtml = new AngleHtml(angle);
    ahtml.addValueTable(outputElem, "Original");

    var nangle = angle;
    var nhtml = ahtml;
    if (!angle.isNormalized()) {
        nangle = angle.normalize();
        nhtml = new AngleHtml(nangle);
        nhtml.addValueTable(outputElem, "Normalized");
    }

    const cangle = nangle.coterminal(false);
    const chtml = new AngleHtml(cangle);
    chtml.addValueTable(outputElem, "Coterminal");

    const rangle = angle.referenceAngle;
    const rhtml = new AngleHtml(rangle);
    rhtml.addValueTable(outputElem, "Reference Angle");

    nhtml.addQuadrantInfo(outputElem);

    ahtml.addXYCoordInfo(outputElem);

    var hd = document.createElement('h3');
    hd.innerHTML = "Trig Function values";
    outputElem.appendChild(hd);
    const cos = precision(Math.cos(angle.radians), 5);
    const sec = precision(1 / cos, 5);
    const sin = precision(Math.sin(angle.radians), 5);
    const csc = precision(1 / sin, 5);
    const tan = precision(Math.tan(angle.radians), 5);
    const cot = precision(1 / tan, 5);
    addLatexElement(outputElem, `cos \\theta = ${cos.toFixed(3)}`);
    addLatexElement(outputElem, `sec \\theta = ${sec.toFixed(3)}`);
    addLatexElement(outputElem, `sin \\theta = ${sin.toFixed(3)}`);
    addLatexElement(outputElem, `csc \\theta = ${csc.toFixed(3)}`);
    addLatexElement(outputElem, `tan \\theta = ${tan.toFixed(3)}`);
    addLatexElement(outputElem, `cot \\theta = ${cot.toFixed(3)}`);

    hd = document.createElement('h3');
    hd.innerHTML = "Transformation of trig functions using even/odd and periodic properties";
    outputElem.appendChild(hd);

    const aangle = angle.absoluteAngle();
    const moduloPi = angle.moduloPi();
    const modulo2Pi = angle.modulo2Pi();

    const trigFunctionsMap = {
        "cos": { evenodd: 'even', period: 360 },
        "sin": { evenodd: 'odd', period: 360 },
        "sec": { evenodd: 'even', period: 360 },
        "csc": { evenodd: 'odd', period: 360 },
        "tan": { evenodd: 'odd', period: 180 },
        "cot": { evenodd: 'odd', period: 180 }
    };

    Object.keys(trigFunctionsMap).forEach(trigFunction => {
        const h = document.createElement('h4');
        h.innerHTML = trigFunction;
        outputElem.appendChild(h);
        ['factorOfPi', 'degree'].forEach(mode => {
            const { evenodd, period } = trigFunctionsMap[trigFunction];
            var dstr = angle.toLatex(mode);
            var latex = `${trigFunction}(${dstr})`;
            const sign = evenodd === 'odd' ? '-' : '';
            dstr = aangle.toLatex(mode);
            if (angle.degree !== aangle.degree) {
                latex += ` = ${sign}${trigFunction}(${dstr})`;
            }
            const pinfo = aangle._modulo(period);
            const c = mode === 'degree' ? period : ((period === 360 ? 2 : '') + '\\pi');
            latex += ` = ${sign}${trigFunction}(${pinfo.angle.toLatex(mode)} + ${pinfo.k}\\cdot ${c})`;
            if (pinfo.k !== 0) {
                latex += ` = ${sign}${trigFunction}(${pinfo.angle.toLatex(mode)})`
            }
            try {
                const tinfo = aangle.getCosSinTan();
                const tval = tinfo[trigFunction];
                if (tval || tval === 0) {
                    latex += ` = ${sign}(${numericToLatex(tval)})`;
                }
                //addLatexElement(div, numericToLatex(xcoord), 'X-coordinate:');
                //addLatexElement(div, numericToLatex(ycoord), 'Y-coordinate:');
            } catch (e) {
                console.error(e);
            }
            latex += ` , k = ${pinfo.k}`;
            addLatexElement(outputElem, latex);
        })
    });

    //addLatexElement(outputElem, `${modulo2Pi.angle.piFactor.toLatex()}\\pi + ${modulo2Pi.k}\\cdot 2\\pi, k = ${modulo2Pi.k}`, "for cos, sin, sec, csc");
    //addLatexElement(outputElem, `${moduloPi.angle.piFactor.toLatex()}\\pi + ${moduloPi.k}\\cdot\\pi, k = ${moduloPi.k}`, "for tan, cot");

}

function circleSectorAndArea() {
    const outputElem = this;
    addLatexElement(outputElem, `S = \\frac{\\theta}{180^o}\\cdot\\pi r`, 'Sector length, angle given in degrees');
    addLatexElement(outputElem, `r = \\frac{S\\cdot 180^o}{\\theta\\pi}`);
    addLatexElement(outputElem, `\\theta = \\frac{S \\cdot 180^o}{\\pi r}`);

    addLatexElement(outputElem, `S = \\theta r`, 'Sector length, angle given in radians');
    addLatexElement(outputElem, `r = \\frac{S}{\\theta}`);
    addLatexElement(outputElem, `\\theta = \\frac{S}{r}`);

    addLatexElement(outputElem, `A = \\frac{\\theta}{360^o}\\cdot\\pi r^2`, 'Area, angle given in degrees');
    addLatexElement(outputElem, `r = \\sqrt{\\frac{A\\cdot 360^o}{\\theta\\pi}} = 6 \\cdot \\sqrt{\\frac{A\\cdot 10^o}{\\theta\\pi}}`);
    addLatexElement(outputElem, `\\theta = \\frac{A\\cdot 360^o}{\\pi \\cdot r^2}`);

    addLatexElement(outputElem, `A = \\frac{1}{2}\\theta r^2`, 'Area, angle given in radians');
    addLatexElement(outputElem, `r = \\sqrt{\\frac{A\\cdot 2}{\\theta}}`);
    addLatexElement(outputElem, `\\theta = \\frac{A\\cdot 2}{r^2}`);

} 