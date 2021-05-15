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
    const embeddedWidgetsDiv = document.getElementById('embedded-widgets');
    if (embeddedWidgetsDiv) {
        for (let i = 0; i < embeddedWidgetsDiv.children.length; i++) {
            let widgetElement = embeddedWidgetsDiv.children[i];
            elemStyle(widgetElement, { display: 'none' });
        }
    }
}

const populate = tobj => {
    const createInputElement = param => {
        const isTextarea = !!param.rows;
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
            inpElem.addChangeListenerFunction = func => {
                inpElem.addEventListener('change', () => {
                    func.call();
                });
            }
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
            inpElem.addChangeListenerFunction = func => {
                inpElem.mathField.config({
                    handlers: {
                        edit: func
                    }
                })
            };
        }
        else {
            let tagName = isTextarea ? 'textarea' : 'input'
            inpElem = document.createElement(tagName);
            inpElem.value = param.value !== null ? param.value : "";
            inpElem.initialValue = inpElem.value;
            if (typeof param.size === 'number') {
                inpElem.setAttribute(isTextarea ? 'cols' : 'size', param.size);
            }
            if (typeof param.rows === 'number') {
                inpElem.setAttribute('rows', param.rows);
            }
            if (param.noEval) {
                inpElem.noEval = true;
            }
            if (param.type === 'decimal') {
                inpElem.isDecimal = true;
            }
            inpElem.addEventListener('focus', () => {
                console.log('focus');
                inpElem.select();
            });
            if (param.codeEditor) {
                inpElem.init = () => {
                    let codeEditor = CodeMirror.fromTextArea(inpElem, {
                        lineNumbers: true
                    });
                    inpElem.__defineGetter__('value', () => {
                        return codeEditor.getValue();
                    })
                    inpElem.__defineSetter__('value', val => {
                        codeEditor.setValue(val);
                    })
                }
            }
            inpElem.addChangeListenerFunction = func => {
                inpElem.addEventListener('change', () => {
                    func.call();
                });
            }
        }
        //inputElements.push(inpElem);
        return inpElem;
    }
    _clearTopicArea();
    document.getElementById('topic-title').innerHTML = tobj.title;
    document.getElementById('topic-description').innerHTML = tobj.description;

    const _getArgsFromInputElement = (inpElem, hasTestValues, tvalues) => {
        let res;
        let inpElems;
        if (Array.isArray(inpElem.inputElements)) {
            inpElems = inpElem.inputElements || [];
        } else {
            inpElems = [inpElem];
        }
        return inpElems.map(ielem => {
            if (ielem.mathField) {
                if (hasTestValues) {
                    let latex = tvalues.shift();
                    ielem.mathField.latex(latex);
                    return latex;
                }
                return ielem.mathField.latex();
            }
            if (hasTestValues) {
                res = tvalues.shift();
                if (typeof res === 'undefined') {
                    res = '';
                }
                ielem.value = res;
                if (ielem.tagName.toUpperCase() === 'SELECT') {
                    ielem.noEval = true;
                    for (let i = 0; i < ielem.children.length; i++) {
                        let option = ielem.children[i];
                        if (option.tagName.toUpperCase() !== 'OPTION') continue;
                        if (option.value === res) {
                            option.selected = true;
                            break;
                        }
                    }
                }
            } else {
                res = ielem.value;
            }
            if (!ielem.noEval) {
                try {
                    res = eval(ielem.value);
                } catch (err) {
                    //console.error(err);
                }
            }
            if (ielem.isDecimal) {
                try {
                    res = _d(res);
                } catch (err) {
                    res = _d(0);
                }
            }
            ielem.style.background = "white";
            return res;
        });
    }

    const _getArgsFromInputElements = (inputElements, hasTestValues, tvalues) => {
        const args = [];
        inputElements.forEach(inpElem => {
            const argsForInpElem = _getArgsFromInputElement(inpElem, hasTestValues, tvalues);
            if (Array.isArray(argsForInpElem)) {
                args.push(...argsForInpElem);
            } else {
                args.push(argsForInpElem);
            }
        })
        return args;
    }

    const _createInputElementsForParameters = (inputsContainer, parameters) => {
        const inputElements = [];
        if (parameters && parameters.length > 0) {
            parameters.forEach(param => {
                let isTextarea = !!param.rows;
                const cont = document.createElement('div');
                if (param.separator) {
                    cont.style.display = 'block';
                    inputsContainer.appendChild(cont);
                    return;
                }
                if (param.html) {
                    if (typeof param.html === 'string') {
                        cont.innerHTML = param.html;
                    } else {
                        let { tag, style, className, innerHTML } = param.html;
                    }
                    inputsContainer.appendChild(cont);
                    return;
                }
                if (param.type === 'dynamic') {
                    let fun = param.func;
                    if (typeof fun !== 'function') {
                        console.error('ignoring parameter entry %o: "func" property is missing.', param);
                        return;
                    }
                    const subInputsObject = {
                        inputElements: []
                    }
                    const b = _htmlElement('input', cont, null, null, { marginBottom: '10px' });
                    b.type = 'button';
                    b.value = `Generate inputs for ${param.name}` || 'generate dynamic inputs';
                    const clb = _htmlElement('input', cont, null, null, { marginLeft: '10px', marginBottom: '10px' });
                    clb.type = 'button';
                    clb.value = `Clear dynamic fields...`;
                    const inputElementsForDynamicField = inputElements.slice();
                    const dynamicSectionDiv = _htmlElement('div', cont);
                    const clearDynamicSection = () => {
                        dynamicSectionDiv.innerHTML = "";
                    }
                    const populateDynamicSection = () => {
                        clearDynamicSection();
                        try {
                            const parametersSoFar = _getArgsFromInputElements(inputElementsForDynamicField);
                            console.log(`args for creating dynamic section: %o`, parametersSoFar);
                            const dynamicParameters = fun.call(null, ...parametersSoFar);
                            console.log('calculated dynamic parameters: %o', dynamicParameters);
                            const dynamicInputsElements = _createInputElementsForParameters(dynamicSectionDiv, dynamicParameters);
                            subInputsObject.inputElements = dynamicInputsElements;
                        } catch (err) {
                            console.log(`error generating dynamic section: ${err}`);
                        }
                    }
                    b.addEventListener('click', populateDynamicSection);
                    clb.addEventListener('click', clearDynamicSection);
                    inputElementsForDynamicField.forEach(ielem => {
                        let f = ielem.addChangeListenerFunction;
                        if (typeof f === 'function') {
                            console.log('addChangeListenerFunction found for input element');
                            f(populateDynamicSection);
                        }
                    });
                    inputsContainer.appendChild(cont);
                    inputElements.push(subInputsObject);
                    return;
                }
                cont.style.display = 'inline-block';
                cont.style.padding = '10px';
                const label = document.createElement('div');
                label.className = 'topic-input-label';
                label.innerHTML = `${param.name}:`;
                label.style.display = isTextarea ? 'block' : 'inline-block';
                cont.appendChild(label);
                const inpElem = createInputElement(param);
                cont.appendChild(inpElem);
                inputsContainer.appendChild(cont);
                if (typeof inpElem.init === 'function') {
                    inpElem.init();
                }
                if (isTextarea) {
                    // insert a "newline"
                    _htmlElement('div', inputsContainer);
                }
                inputElements.push(inpElem);
            });
        }
        return inputElements;
    }

    const inputs = document.getElementById('topic-inputs');
    const inputElements = _createInputElementsForParameters(inputs, tobj.parameters);
    const parametersExist = inputElements.length > 0;


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
            //console.error(`testValues ignored; exactly ${inputElements.length} required; given ${testValues.length}`);
            //hasTestValues = false;
        }
        const outputElement = document.getElementById('topic-output');
        outputElement.innerHTML = "";
        const tvalues = testValues ? testValues.slice() : [];


        let args = _getArgsFromInputElements(inputElements, hasTestValues, tvalues);

       
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
            let tvalues = testValueList;
            var buttonTitle = 'Run';
            var buttonTitleSet = false;
            if (!(Array.isArray(testValueList)) && (typeof testValueList !== 'function')) {
                if (typeof testValueList.label === 'string') {
                    buttonTitle = testValueList.label;
                    buttonTitleSet = true;
                }
                if (Array.isArray(testValueList.values) || (typeof testValueList.values === 'function')) {
                    tvalues = testValueList.values;
                } else {
                    console.error(`ignoring test-values entry %o, either use list of values or an object with format { label, values }`, testValueList);
                    return;
                }
            }
            if (!buttonTitleSet) {
                if (typeof tvalues === 'function') {
                    buttonTitle = 'Run with generated values'
                } else {
                    buttonTitle = `Run with values ${tvalues.join(', ')}`;
                }
            }
            const b = _htmlElement('input', cont, null, 'main-button');
            b.type = 'button';
            b.value = buttonTitle;
            elemStyle(b, {
                fontSize: '12pt',
                marginLeft: '10px'
            })
            b.addEventListener('click', () => {
                doExecute(tvalues);
                //cdiv.collapse();
            })
        })
    }
    MathJax.typeset();
    if (!parametersExist) {
        doExecute();
    }
    DO_EXECUTE = doExecute;
};

const addMathResult = (cont, callback, { notext, isInput } = {}, options = {}) => {
    const formulaContainer = document.createElement('div');
    var cssClassNames = 'formula-container' + (isInput ? '-input' : '');
    if (options && options.cssClass) {
        cssClassNames += ` ${options.cssClass}`;
    }
    formulaContainer.className = cssClassNames;
    const span = document.createElement('span');
    span.className = 'formula-content';
    const mathField = MQ.MathField(span, options.mathFieldConfig);
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

const addLatexElement = (cont, latex, text = null, mathFieldConfig = {}) => {
    const notext = !text;
    addMathElement(cont, ({ mathField, textDiv }) => {
        if (text) {
            textDiv.innerHTML = text;
        }
        mathField.latex(latex);
    }, { notext, mathFieldConfig });
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

function debugUI(code, latex, mode, functor) {
    const o = this;
    elemStyle(o, { fontSize: '18pt' });
    try {
        const url = '/api/parse_match_latex';
        const data = { code, latex, mode, functor };
        const success = response => {
            //console.log(`response: ${JSON.stringify(response, null, 2)}`);
            var resObj = response;
            try {
                resObj = JSON.parse(response);
            } catch (err) {
                console.error(err);
            }
            _htmlElement('pre', o, JSON.stringify(resObj, null, 2));
        }
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: success,
            error: ajaxErrorFunction(o)
        });
    } catch (err) {
        _addErrorElement(o, err);
    }
}