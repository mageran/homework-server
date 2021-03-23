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
            //var sign = evenodd === 'odd' ? '-' : '';
            var sign = '';
            dstr = aangle.toLatex(mode);
            if (angle.degree !== aangle.degree) {
                sign = evenodd === 'odd' ? '-' : '';
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

function configurableUnitCircle() {
    const outputElem = this;
    try {
        const options = { showAngleLabels: { keys: ['radians', 'cos'], k: 0 } }
        const configDiv = _htmlElement('div', outputElem);
        configDiv.style.fontSize = '18pt';
        var kInput;
        const _sh = (cname, doShow) => {
            //console.log(`${doShow ? 'showing' : 'hiding'} ${cname}`);
            var elems = document.getElementsByClassName(cname);
            for (let i = 0; i < elems.length; i++) {
                let elem = elems[i];
                elem.style.visibility = doShow ? 'visible' : 'hidden';
            }
        }
        const labelDisplayCheckboxes = {};
        const table = _htmlElement('table', configDiv, null, 'unit-circle-config-table');
        const tableRows = [];
        ['Radians labels', 'Degree labels', 'Trig function values', '&nbsp;'].forEach(label => {
            let tr = _htmlElement('tr', table);
            _htmlElement('td', tr, label);
            let td = _htmlElement('td', tr);
            let table0 = _htmlElement('table', td);
            let tr0 = _htmlElement('tr', table0);
            tableRows.push(tr0);
        });
        //tr = _htmlElement('tr', table);
        //_htmlElement('td', tr, 'Degrees labels:');
        //tableRows.push(tr);
        //tr = _htmlElement('tr', table);
        //_htmlElement('td', tr, 'Trig function values:');
        //tableRows.push(tr);
        Object.keys(AngleLabelKeys).forEach(key => {
            const { name, mutuallyExclusiveGroup, group } = AngleLabelKeys[key];
            const index = (typeof group === 'number')
                ? group : (typeof mutuallyExclusiveGroup === 'number') ? mutuallyExclusiveGroup : 0;
            const tr = tableRows[index];
            const isChecked = options.showAngleLabels.keys.includes(key);
            var td = _htmlElement('td', tr);
            td.setAttribute('valign', 'middle');
            const cb = _htmlElement('input', td, null, 'big-checkbox');
            cb.type = 'checkbox';
            cb.checked = isChecked;
            td = _htmlElement('td', tr);
            td.setAttribute('valign', 'middle');
            const lb = _htmlElement('span', td, name);
            lb.style.marginRight = "20px";
            cb.addEventListener('change', event => {
                const doShow = cb.checked;
                const cssClass = getUnitCircleLabelCssClass(key, kInput.value);
                _sh(cssClass, doShow);
                if (doShow) {
                    const mekeys = Object.keys(AngleLabelKeys).filter(otherKey =>
                        key != otherKey &&
                        AngleLabelKeys[otherKey].mutuallyExclusiveGroup === mutuallyExclusiveGroup
                    );
                    console.log(`other mutually exclusive keys: ${mekeys}`);
                    mekeys.forEach(k => {
                        const otherCheckbox = labelDisplayCheckboxes[k];
                        otherCheckbox.checked = false;
                        otherCheckbox.dispatchEvent(new Event('change'));
                    })
                }
            })
            labelDisplayCheckboxes[key] = cb
        })
        tr = _htmlElement('tr', table);
        _htmlElement('td', tr, 'Multiplier (k):')
        var td = _htmlElement('td', tr);
        td.setAttribute('valign', 'middle');
        kInput = _htmlElement('input', td, null, 'big-input');
        kInput.setAttribute('type', 'number');
        kInput.setAttribute('min', '0');
        kInput.setAttribute('max', '5');
        kInput.value = 0
        kInput.addEventListener('change', event => {
            const k = event.target.value;
            if (k < 0) {
                event.target.value = 0;
                k = 0;
            }
            if (k > 5) {
                event.target.value = 5;
                k = 5;
            }
            Object.keys(labelDisplayCheckboxes).forEach(key => {
                const isShown = labelDisplayCheckboxes[key].checked;
                if (!isShown) return;
                const cssClassAll = getUnitCircleLabelCssClass(key);
                _sh(cssClassAll, false);
                const cssClass = getUnitCircleLabelCssClass(key, k);
                _sh(cssClass, true);
            })
        });
        const loadingDiv = _htmlElement('img', outputElem);
        loadingDiv.src = 'images/loading.webp';
        setTimeout(() => {
            drawUnitCircle(outputElem, options);
            loadingDiv.style.display = 'none';
        }, 100);
    } catch (err) {
        _addErrorElement(outputElem, err);
    }
}


const AngleLabelKeys = {
    radians: {
        name: 'radians',
        relativePosition: 0.85,
        createLabel: aobj => aobj.toLatex('radians'),
        mutuallyExclusiveGroup: 0
    },
    degrees: {
        name: 'degrees',
        relativePosition: 0.5,
        createLabel: aobj => aobj.toLatex(),
        mutuallyExclusiveGroup: 1
    },
    negativeRadians: {
        name: 'negative radians',
        relativePosition: 0.85,
        createLabel: aobj => aobj.asNegativeAngle.toLatex('radians'),
        mutuallyExclusiveGroup: 0
    },
    negativeDegrees: {
        name: 'negative degrees',
        relativePosition: 0.5,
        createLabel: aobj => aobj.asNegativeAngle.toLatex(),
        mutuallyExclusiveGroup: 1
    },
    radiansTopNegativeBottom: {
        name: 'positive/negative radians',
        relativePosition: 0.85,
        createLabel: aobj => {
            const ndegree = aobj.normalize().degree;
            return ndegree <= 180 ? aobj.toLatex('radians') : aobj.asNegativeAngle.toLatex('radians');
        },
        mutuallyExclusiveGroup: 0
    },
    cos: {
        name: 'cos',
        relativePosition: 1.15,
        createLabel: aobj => numericToLatex(aobj.getCosSinTan().cos),
        mutuallyExclusiveGroup: 2,
        group: 2
    },
    sin: {
        name: 'sin',
        relativePosition: 1.15,
        createLabel: aobj => numericToLatex(aobj.getCosSinTan().sin),
        mutuallyExclusiveGroup: 2,
        group: 2
    },
    tan: {
        name: 'tan',
        relativePosition: 1.15,
        createLabel: aobj => numericToLatex(aobj.getCosSinTan().tan),
        mutuallyExclusiveGroup: 2,
        group: 2
    },
    sec: {
        name: 'sec',
        relativePosition: 1.15,
        createLabel: aobj => numericToLatex(aobj.getCosSinTan().sec),
        mutuallyExclusiveGroup: 2,
        group: 3
    },
    csc: {
        name: 'csc',
        relativePosition: 1.15,
        createLabel: aobj => numericToLatex(aobj.getCosSinTan().csc),
        mutuallyExclusiveGroup: 2,
        group: 3
    },
    cot: {
        name: 'cot',
        relativePosition: 1.15,
        createLabel: aobj => numericToLatex(aobj.getCosSinTan().cot),
        mutuallyExclusiveGroup: 2,
        group: 3
    },
    coordinates: {
        name: '(cos x, sin x)',
        relativePosition: 1.15,
        createLabel: aobj => {
            const cos = numericToLatex(aobj.getCosSinTan().cos);
            const sin = numericToLatex(aobj.getCosSinTan().sin);
            return `\\left(${cos},${sin}\\right)`;
        },
        mutuallyExclusiveGroup: 2,
        group: 2,
    }
}

const TrigValuesKeys = {
}

const getUnitCircleLabelCssClass = (angleLabelKey, k = null) => {
    return k === null ? `unit-circle-angle-${angleLabelKey}` : `unit-circle-angle-${angleLabelKey}-${k}`;
};

// ---------------------------------------------------------------
const drawUnitCircle = (cont, optionsIn = {}) => {
    const _d = x => new Decimalx(x);
    const w = 1000;
    const options = {
        width: w,
        containerWidth: w * 1.2,
        showAngleLabels: { keys: ['radians'], k: 0 }
    }
    mergeWith(options, optionsIn);
    const { width, containerWidth } = options;
    const contWidth = _d(containerWidth);
    const contMarginWidth = (contWidth.sub(width)).div(2);
    const ccenter = _d(contWidth).div(2);
    const radius = _d(width).div(2);
    const udivCont = _htmlElement('div', cont, null, 'unit-circle-container');
    const udiv = _htmlElement('div', udivCont, null, 'unit-circle');
    mergeWith(udivCont.style, {
        position: "relative",
        width: `${containerWidth}px`,
        height: `${containerWidth}px`,
        backgroundColor: 'white'
    });
    mergeWith(udiv.style, {
        position: 'absolute',
        left: `${contMarginWidth}px`,
        top: `${contMarginWidth}px`,
        width: `${width}px`,
        height: `${width}px`,
        border: '2px solid black',
        borderRadius: `${radius}px`,
        backgroundColor: 'transparent'
    });
    const getPositionAtAngle = (angle, radiusFraction) => {
        if (!(angle instanceof Angle)) {
            throw "internal error: angle must be an Angle object"
        }
        const iobj = angle.inverseAngle;
        const r = radius.mul(_d(radiusFraction));
        const x = r.mul(iobj.cosDecimal);
        const y = r.mul(iobj.sinDecimal);
        const top = ccenter.add(y);
        const left = ccenter.add(x);
        return {
            top: `${top}px`,
            left: `${left}px`
        };
    }
    const angleLine = (angle, k = 0) => {
        const aobj = Angle.fromDegree(angle + k * 360);//.normalize();
        const iobj = aobj.inverseAngle;
        const line = _htmlElement('span', udivCont, null, 'unit-circle-angle-line');
        mergeWith(line.style, {
            position: 'absolute',
            left: `${ccenter}px`,
            top: `${ccenter}px`,
            width: `${radius}px`,
            height: '1px',
            backgroundColor: '#888',
            transform: `rotate(${iobj.degree}deg)`,
            transformOrigin: '0% 0%'
        });
        const createAngleLabel = (angleLabelKey, hash = AngleLabelKeys) => {
            const { relativePosition, createLabel } = hash[angleLabelKey];
            const cssClassname = `${getUnitCircleLabelCssClass(angleLabelKey, k)} ${getUnitCircleLabelCssClass(angleLabelKey)} unit-circle-angle-label`;
            const angleLabelDiv = _htmlElement('span', udivCont, null, cssClassname);
            const translateX = radius.div(-10);
            const translateY = translateX;
            mergeWith(angleLabelDiv.style, {
                position: 'absolute',
                transform: `translate(${translateX}px,${translateY}px)`
            });
            if (k === options.showAngleLabels.k && options.showAngleLabels.keys.includes(angleLabelKey)) {
                angleLabelDiv.style.visibility = 'visible';
            }
            mergeWith(angleLabelDiv.style, getPositionAtAngle(aobj, relativePosition));
            addLatexElement(angleLabelDiv, createLabel(aobj));
        }
        Object.keys(AngleLabelKeys).forEach(key => {
            createAngleLabel(key);
        })
        Object.keys(TrigValuesKeys).forEach(key => {
            createAngleLabel(key, TrigValuesKeys);
        })
    }
    for (let k = 0; k <= 5; k++) {
        for (let i = 0; i < 360; i += 90) {
            angleLine(i, k);
            angleLine(i + 30, k);
            angleLine(i + 45, k);
            angleLine(i + 60, k);
        }
    }
}