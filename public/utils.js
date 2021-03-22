const mergeWith = (obj, values) => {
    Object.keys(values).forEach(key => {
        const val = values[key];
        obj[key] = val;
    })
    return obj;
}

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
            for (let cindex = 0; cindex < cands.length; cindex++) {
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
    for (; ;) {
        for (let i = 0; i < length; i++) {
            if (a[i] < max) {
                a[i]++;
                break;
            } else {
                if (i === length - 1) {
                    return;
                }
                for (let j = 0; j <= i; j++) {
                    a[j] = min;
                }
            }
        }
        yield a;
    }
}

const _htmlElement = (tag, parent, content, cssClass) => {
    const elem = document.createElement(tag);
    if (parent) {
        parent.appendChild(elem);
    }
    if (content) {
        if (content instanceof HTMLElement) {
            elem.appendChild(content);
        }
        else if (typeof content === 'string') {
            elem.innerHTML = content;
        }
        else if (Array.isArray(content)) {
            content.forEach(childElem => {
                elem.appendChild(childElem);
            });
        }
    }
    if (cssClass) {
        elem.className = cssClass;
    }
    return elem;
}

const _d = x => {
    if (typeof Decimalx !== 'undefined') {
        return new Decimalx(x);
    }
    return new Decimal(x);
}

const mo1 = () => {
    const sol = [];
    for (let x of allCombinations(0, 9, 7)) {
        if (x[0] + x[1] + x[2] + x[3] + x[4] + x[5] + x[6] === 60) {
            let f = 1;
            let num = 0;
            for (let i = 0; i < 7; i++) {
                num += x[i] * f;
                f *= 10;
            }
            sol.push(num);
            //console.log(num);
        }
    }
    const s = sol.sort();
    for (let i = 0; i < 8; i++) {
        console.log(String(s[i]).split(/\s*/).join(' '));
    }

}

const createSelectElement = (cont, optionsIn, selectHook, deselectHook) => {
    const options = optionsIn.map(({ label, value }) => ({ label, value }));
    const selectObj = {
        options: options
    }
    const outerContainer = _htmlElement('div', cont, null, 'select-outer-container');
    const menuImage = _htmlElement('img', outerContainer, null, 'select-menu-button');
    menuImage.src = "images/outline_menu_black_24dp.png";
    const isSelectedFun = (typeof isInitiallySelectedCondition === 'function') ? isInitiallySelectedCondition : () => false;
    var somethingIsSelected = false;

    const hideAllOptionSpans = () => {
        options.forEach(({ span }) => {
            if (span) {
                span.setAttribute("selected", "false");
            }
        })
    }

    const doSelect = option => {
        hideAllOptionSpans();
        option.span.setAttribute("selected", "true");
        if (typeof selectObj.selected === 'object') {
            if (typeof deselectHook === 'function') {
                deselectHook(selectObj.selected);
            }
            console.log(`"${selectObj.selected.label}" deselected`);
        }
        selectObj.selected = option;
        if (typeof selectHook === 'function') {
            selectHook(option);
        }
        try {
            outerContainer.style.width = `${option.span.offsetWidth + option.span.offsetLeft + 55}px`;
        } catch (e) {
            console.error(e);
        }
        console.log(`"${option.label}" selected`)
    }

    options.forEach((option) => {
        const { label, value } = option;
        var labelText = label;
        const labelIsFunction = typeof label === 'function';
        if (labelIsFunction) {
            labelText = null;
        }
        const span = _htmlElement('span', outerContainer, labelText, 'select-option-label');
        if (labelIsFunction) {
            labelIsFunction.call(this, span);
        }
        option.span = span;
        if (!somethingIsSelected) {
            span.setAttribute("selected", "true");
            doSelect(option);
            somethingIsSelected = true;
        }
    });
    const menuContainer = _htmlElement('div', outerContainer, null, 'select-menu-container');
    options.forEach(option => {
        const { label, value, span } = option;
        const menuEntryDiv = _htmlElement('div', menuContainer, label, 'select-menu-entry');
        menuEntryDiv.addEventListener('click', event => {
            //console.log(`selected: ${label}`);
            doSelect(option);
        });
    });
    menuImage.addEventListener('click', event => {
        const toggleDisplayValue = (!menuContainer.style.display || menuContainer.style.display === 'none') ? 'block' : 'none';
        menuContainer.style.display = toggleDisplayValue;
        event.stopPropagation();
        return true;
    })
    return selectObj;
}