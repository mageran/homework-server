
const r = 'red';
const b = 'blue';
const g = 'green';
const y = 'yellow';

const drawToken = (lbl, ...colors) => {
    const len = Math.sqrt(colors.length);
    const div = document.createElement('div');
    div.style.display = 'inline-block';
    div.style.padding = '5px';
    const table = document.createElement('table');
    table.setAttribute("cellspacing", "0");
    table.setAttribute("cellpadding", "1");
    table.style.border = "1px solid black";
    table.style.backgroundColor = "#eee";
    var index = 0;
    for (var i = 0; i < len; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < len; j++) {
            let td = document.createElement('td');
            let div = document.createElement('div');
            let color = colors[index++];
            div.style.backgroundColor = color;
            div.style.width = '12px';
            div.style.height = '12px';
            div.style.display = 'inline-block';
            div.style.borderRadius = '3px';
            div.style.textAlign = "center";
            div.style.padding = "3px";
            if (i == 0 && j == 0 &&  lbl !== null) {
                div.innerHTML = lbl + "";
            } else {
                div.innerHTML = "&nbsp;";
            }
            td.appendChild(div);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    div.appendChild(table);
    return div;
}


const init = () => {
    const main = document.getElementById('main');
    var h = document.createElement('h2');
    h.innerHTML = "a)";
    main.appendChild(h);
    allCombinations(null, r, b);
    h = document.createElement('h2');
    h.innerHTML = "b)";
    main.appendChild(h);
    allCombinations((c1, c2, c3, c4) => {
        const hmp = {}
        hmp[c1] = true;
        hmp[c2] = true;
        hmp[c3] = true;
        hmp[c4] = true;
        return hmp[r] && hmp[b] && hmp[y];
    }, r, b, y);
    h = document.createElement('h2');
    h.innerHTML = "c)";
    main.appendChild(h);
    allCombinations((c1,c2,c3,c4) => {
        const hmp = {}
        hmp[c1] = true;
        hmp[c2] = true;
        hmp[c3] = true;
        hmp[c4] = true;
        return hmp[r] && hmp[b] && hmp[y] && hmp[g];

    }, r, b, y, g);
}

const allCombinations = (checkCombination, ...colors) => {
    const main = document.getElementById('main');
    console.log(colors);
    const len = colors.length;
    var cnt = 0;
    for (let f1 = 0; f1 < len; f1++) {
        for (let f2 = 0; f2 < len; f2++) {
            for (let f3 = 0; f3 < len; f3++) {
                for (let f4 = 0; f4 < len; f4++) {
                    let combination = [colors[f1], colors[f2], colors[f3], colors[f4]];
                    let elem = null;
                    if (typeof checkCombination === 'function') {
                        if (checkCombination(...combination)) {
                            elem = drawToken((++cnt), ...combination);
                        }
                    } else {
                        elem = drawToken((++cnt), ...combination);
                    }
                    if (elem) {

                        main.appendChild(elem);
                    }
                }
            }
        }
    }
}