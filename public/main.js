var currentInputElements = [];

const _imageOnly = (title, imageFile) => {
    const description = `<img src="${imageFile}"/>`;
    return { title, description };
}

const init = () => {
    const select = document.getElementById('content-select');
    const idObjectMap = {};
    var idCnt = 0;
    topicObjects.forEach(tobj => {
        const option = document.createElement('option');
        if (typeof tobj === 'string') {
            option.innerHTML = tobj;
        } else {
            const idstr = `id_${idCnt++}`;
            idObjectMap[idstr] = tobj;
            option.setAttribute('value', idstr);
            option.innerHTML = tobj.title;
        }
        select.appendChild(option);
    });
    select.addEventListener('change', (event) => {
        const id = select.value;
        const tobj = idObjectMap[id];
        if (!tobj) return;
        populate(tobj);
    });
    const hideSelectMenus = () => {
        const selectMenus = document.getElementsByClassName('select-menu-container');
        for (let m of selectMenus) {
            if (m.style.display !== 'none') {
                //console.log('hideSelectMenu...');
                m.style.display = 'none';
            }
        }
    }
    document.addEventListener("click", hideSelectMenus);
    document.addEventListener("keydown", event => {
        //console.log(`event keycode: ${event.key}`);
        if (event.key === "Escape") {
            hideSelectMenus();
        }
    })
};

const _clearHeader = () => {
    ['content-select', 'topic-title', 'topic-description', 'topic-inputs'].forEach(elemId => {
        try {
            document.getElementById(elemId).style.display = "none";
        } catch (err) { }
    })
}

const _clearTopicArea = () => {
    ['topic-title', 'topic-description', 'topic-inputs', 'topic-output'].forEach(elemId => {
        try {
            document.getElementById(elemId).innerHTML = ""
        } catch (err) {

        }
    });
}

const populate = tobj => {
    const createInputElement = param => {
        var inpElem;
        if (param.type === 'select') {
            inpElem = document.createElement('select');
            if (Array.isArray(param.options)) {
                param.options.forEach(option => {
                    const optionElem = document.createElement('option');
                    optionElem.value = option.value;
                    optionElem.innerHTML = option.label;
                    inpElem.appendChild(optionElem);
                });
            }
            inpElem.__defineGetter__('value', function () {
                const strval = this.selectedOptions[0].value
                const val = Number(strval);
                if (isNaN(val)) {
                    return strval;
                }
                return val;
            })
        }
        else if (param.type === 'formula') {
            let displayOptions = {};
            if (param.cssClass) {
                displayOptions.cssClass = param.cssClass;
            }
            inpElem = document.createElement('p');
            addMathResult(inpElem, ({ mathField, textDiv }) => {
                inpElem.mathField = mathField;
                if (typeof param.value === 'string') {
                    mathField.latex(param.value);
                }
            }, { isInput: true, notext: true }, displayOptions);
        }
        else {
            inpElem = document.createElement('input');
            inpElem.value = param.value !== null ? param.value : "";
            inpElem.initialValue = inpElem.value;
            if (typeof param.size === 'number') {
                inpElem.setAttribute('size', param.size);
            }
            if (param.noEval) {
                inpElem.noEval = true;
            }
            inpElem.addEventListener('focus', () => {
                console.log('focus');
                inpElem.select();
            });
        }
        inputElements.push(inpElem);
        return inpElem;
    }
    _clearTopicArea();
    document.getElementById('topic-title').innerHTML = tobj.title;
    document.getElementById('topic-description').innerHTML = tobj.description;
    const inputs = document.getElementById('topic-inputs');
    const inputElements = [];
    var parametersExist = false;
    if (tobj.parameters && tobj.parameters.length > 0) {
        parametersExist = true;
        tobj.parameters.forEach(param => {
            const cont = document.createElement('div');
            if (param.separator) {
                cont.style.display = 'block';
                inputs.appendChild(cont);
                return;
            }
            if (param.html) {
                if (typeof param.html === 'string') {
                    cont.innerHTML = param.html;
                } else {
                    let { tag, style, className, innerHTML } = param.html;
                }
                inputs.appendChild(cont);
                return;
            }
            cont.style.display = 'inline-block';
            cont.style.padding = '10px';
            const label = document.createElement('div');
            label.innerHTML = `${param.name}:`;
            label.style.display = 'inline-block';
            cont.appendChild(label);
            const inpElem = createInputElement(param);
            cont.appendChild(inpElem);
            inputs.appendChild(cont);
        });
    }
    const doExecute = (testValues) => {
        if (typeof tobj.func !== 'function') {
            return;
        }
        if (tobj.hideHeader) {
            _clearHeader();
        }
        if (typeof testValues === 'function') {
            testValues = testValues.call();
        }
        var hasTestValues = Array.isArray(testValues);
        if (hasTestValues && testValues.length !== inputElements.length) {
            console.error(`testValues ignored; exactly ${inputElements.length} required; given ${testValues.length}`);
            hasTestValues = false;
        }
        const outputElement = document.getElementById('topic-output');
        outputElement.innerHTML = "";
        const tvalues = testValues ? testValues.slice() : [];
        let args = inputElements.map(inpElem => {
            let res;
            if (inpElem.mathField) {
                if (hasTestValues) {
                    let latex = tvalues.shift();
                    inpElem.mathField.latex(latex);
                    return latex;
                }
                return inpElem.mathField.latex();
            }
            if (hasTestValues) {
                res = tvalues.shift();
                inpElem.value = res;
                if (inpElem.tagName.toUpperCase() === 'SELECT') {
                    inpElem.noEval = true;
                    for (let i = 0; i < inpElem.children.length; i++) {
                        let option = inpElem.children[i];
                        if (option.tagName.toUpperCase() !== 'OPTION') continue;
                        if (option.value === res) {
                            option.selected = true;
                            break;
                        }
                    }
                }
            } else {
                res = inpElem.value;
            }
            if (!inpElem.noEval) {
                try {
                    res = eval(inpElem.value);
                } catch (err) {
                    //console.error(err);
                }
            }
            inpElem.style.background = "white";
            return res;
        });
        console.log(args);
        //console.log(`#input elements: ${inputElements.length}`);
        let output = "no output generated";
        try {
            currentInputElements = inputElements;
            output = tobj.func.call(outputElement, ...args);
        } catch (err) {
            output = err;
            console.error(err);
        }
        if (typeof output === 'string') {
            outputElement.innerHTML = output;
        }
    }
    if (typeof (tobj.func) === 'function') {
        let button = document.createElement('input');
        button.className = 'main-button';
        button.type = 'button';
        button.value = 'Go';
        button.style.backgroundColor = "lightgreen";
        button.style.padding = "10px";
        button.addEventListener('click', () => {
            doExecute();
        });
        if (parametersExist) {
            inputs.appendChild(button);
        }
    }
    const addClearButton = parametersExist;
    if (addClearButton) {
        let button = _htmlElement('input', inputs, null, 'main-button');
        button.type = 'button';
        button.value = 'Clear Input Fields';
        button.style.marginLeft = "500px";
        button.addEventListener('click', () => {
            inputElements.map(inpElem => {
                if (inpElem.mathField) {
                    inpElem.mathField.latex('');
                }
                else {
                    inpElem.value = inpElem.initialValue ? inpElem.initialValue : '';
                }
                inpElem.style.background = "white";
            });
        });
    }
    if (tobj.testValues && parametersExist) {
        let cdiv = _collapsibleSection(inputs, "Run with test values...", {
            noBorder: true,
            initialStateCollapsed: true,
            width: "100%"
        });
        let cont = _htmlElement('div', cdiv);
        elemStyle(cont, {
            margin: '20px 0',
            padding: '10px',
            backgroundColor: '#f8f8f8',
            border: '1px dashed black',
            borderRadius: '8px'
        })
        tobj.testValues.forEach(testValueList => {
            var buttonTitle = 'Run';
            if (typeof testValueList === 'function') {
                buttonTitle = 'Run with generated values'
            } else {
                buttonTitle = `Run with values ${testValueList.join(', ')}`;
            }
            const b = _htmlElement('input', cont, null, 'main-button');
            b.type = 'button';
            b.value = buttonTitle;
            elemStyle(b, {
                fontSize: '12pt',
                marginLeft: '10px'
            })
            b.addEventListener('click', () => {
                doExecute(testValueList);
                //cdiv.collapse();
            })
        })
    }
    MathJax.typeset();
    if (!parametersExist) {
        doExecute();
    }
};

const addMathResult = (cont, callback, { notext, isInput } = {}, displayOptions) => {
    const formulaContainer = document.createElement('div');
    var cssClassNames = 'formula-container' + (isInput ? '-input' : '');
    if (displayOptions && displayOptions.cssClass) {
        cssClassNames += ` ${displayOptions.cssClass}`;
    }
    //console.log(displayOptions);
    formulaContainer.className = cssClassNames;
    const span = document.createElement('span');
    span.className = 'formula-content';
    const mathField = MQ.MathField(span);
    mathField.config({ charsThatBreakOutOfSupSub: '+-=<>' });
    var textDiv = null;
    if (!notext) {
        textDiv = document.createElement('div');
        textDiv.className = 'formula-text';
        formulaContainer.appendChild(textDiv);
    }
    const formulaContentContainer = document.createElement('div');
    formulaContentContainer.appendChild(span);
    formulaContainer.appendChild(formulaContentContainer);
    cont.appendChild(formulaContainer);
    if (typeof callback === 'function') {
        callback({ mathField, textDiv }, cont);
    }
}

const addMathElement = (cont, callback, options = {}) => {
    const div = document.createElement('div');
    cont.appendChild(div);
    addMathResult(div, callback, options);
}

const addLatexElement = (cont, latex, text = null) => {
    const notext = !text;
    addMathElement(cont, ({ mathField, textDiv }) => {
        if (text) {
            textDiv.innerHTML = text;
        }
        mathField.latex(latex);
    }, { notext });
}

const addJsonAsPreElement = (cont, obj) => {
    const pre = document.createElement('pre');
    pre.innerHTML = JSON.stringify(obj, null, 2);
    cont.appendChild(pre);
}

const createProgressIndicator = cont => {
    const pdiv = document.createElement('div');
    const w = 300;
    const h = 20;
    pdiv.style.width = `${w}px`;
    pdiv.style.height = `${h}px`
    pdiv.style.padding = 0;
    pdiv.style.border = "1px solid black";
    pdiv.style.margin = "10px";
    const idiv = document.createElement('div');
    idiv.style.position = "relative";
    idiv.style.top = 0;
    idiv.style.left = 0;
    idiv.style.height = `${h}px`;
    idiv.style.width = 0;
    idiv.style.backgroundColor = "blue";
    pdiv.appendChild(idiv);
    cont.appendChild(pdiv);
    pdiv.update = p => {
        if (p > 1) p = p / 100;
        const iw = w * p;
        idiv.style.width = `${iw}px`;
    }
    return pdiv;
}