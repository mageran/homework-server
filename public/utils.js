const productToString = (a, b) => {
    if ((typeof a === 'number') && (typeof b === 'number')) {
        return a * b;
    }
    if (typeof a === 'number') {
        if (a === 0) {
            return 0;
        }
        if (a === 1) {
            return b;
        }
    }
    if (typeof b === 'number') {
        if (b === 0) {
            return 0;
        }
        if (b === 1) {
            return a;
        }
    }
    return `${a}*${b}`;
}

const sumToString = (a, b) => {
    if ((typeof a === 'number') && (typeof b === 'number')) {
        return a + b;
    }
    if (typeof a === 'number') {
        if (a === 0) {
            return b;
        }
    }
    if (typeof b === 'number') {
        if (b === 0) {
            return a;
        }
        if (b < 0) {
            return `${a}-${Math.abs(b)}`;
        }
    }
    return `${a}+${b}`
}

const factorsOf = n => {
    const factors = [];
    n = Math.abs(n);
    for (let i = 1; i <= n / 2; i++) {
        if (n % i === 0) {
            factors.push(i);
        }
    }
    factors.push(n);
    return factors;
}

const findFactorPair = (n, cfun) => {
    const isPositive = Math.sign(n) === 1;
    n = Math.abs(n);
    for (let i = 1; i <= n; i++) {
        if (n % i === 0) {
            let cands;
            let f0 = i;
            let f1 = n / i;
            if (isPositive) {
                cands = [[f0, f1], [-f0, -f1]];
            } else {
                cands = [[f0, -f1], [-f0, f1]];
            }
            for(let cindex = 0; cindex < cands.length; cindex++) {
                let pair = cands[cindex];
                if (typeof cfun === 'function') {
                    if (cfun(...pair)) {
                        console.log(`found solution: ${pair[0]}, ${pair[1]}`);
                        return pair;
                    }
                }
            }
            console.log(cands);
        }
    }
    return null;
}

const addTableRow = (table, ...cellContents) => {
    const tr = document.createElement('tr');
    cellContents.forEach(cell => {
        let td = document.createElement('td');
        if (typeof cell === 'string') {
            td.innerHTML = cell;
        } else {
            console.log(cell);
            td.appendChild(cell);
        }
        tr.appendChild(td);
    });
    table.appendChild(tr);
}

const _collapsibleSection = (cont, title) => {
    const outer = document.createElement('div');
    outer.className = 'section-container';
    const headerDiv = document.createElement('div');
    headerDiv.className = 'xsection-header';
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('checked', 'true');
    headerDiv.appendChild(checkbox);
    const titleSpan = document.createElement('span');
    titleSpan.className = 'xsection-header-title';
    titleSpan.innerHTML = title;
    headerDiv.appendChild(titleSpan);
    outer.appendChild(headerDiv);
    const cdiv = document.createElement('div');
    cdiv.className = 'xsection-content';
    checkbox.addEventListener('change', event => {
        cdiv.style.display = checkbox.checked ? 'block' : 'none';
    });
    outer.appendChild(cdiv);
    cont.appendChild(outer);
    return cdiv;
}

const _addErrorElement = (cont, errmsg) => {
    const div = document.createElement('div');
    div.style.margin = "20px";
    const div1 = document.createElement('div');
    div1.style.display = 'inline-block';
    div.appendChild(div1);
    div1.className = "error-element";
    div1.innerHTML = errmsg;
    cont.appendChild(div);
}

/**
 * tries to convert the given latex string into a numeric value
 * throws an exception if it can't be evaluated as a number
 * @param {string} latexString 
 */
const _latexToNumber = latexString => {
    const num = Number(latexString);
    if (isNaN(num)) {
        throw `"${latexString}" cannot be evaluated as number`;
    }
    return num;
}

const _forceFraction = numeric => (numeric instanceof Fraction) ? numeric : new Fraction(numeric, 1);

const assert = (cond, errorString) => {
    if (!cond) throw errorString;
}

/**
 * returns all combinations for numbers from min to max and list length
 * @param {Number} min 
 * @param {Number} max 
 * @param {Number} length 
 */
function* allCombinations(min, max, length) {
    const a = new Array(length);
    a.fill(min);
    yield a;
    for(;;) {
        for(let i = 0; i < length; i++) {
            if (a[i] < max) {
                a[i]++;
                break;
            } else {
                if (i === length - 1) {
                    return;
                }
                for(let j = 0; j <= i; j++) {
                    a[j] = min;
                }
            }
        }
        yield a;
    }
}