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

