
var MQ;


function getQuestion() {
    console.log('RSM');
    const outputElements = document.getElementsByTagName('output');
    console.log(`found ${outputElements.length} <output/> element in page.`);
    for (let i = 0; i < outputElements.length; i++) {
        let element = outputElements[i]; 1
        console.log(element.outerHTML);
    };
    let len = outputElements.length;
    if (len > 0) {
        return { result: outputElements[len - 1].innerHTML };
    }
    return { result: 'no question found' }
}


const processFormula = fstring => {
    const ta = document.getElementById('ta');
    ta.value = fstring + '\n';
    try {
        let ast = parser.parse(fstring);
        console.log(`ast: ${JSON.stringify(ast, null, 2)}`);
        let formula = simplifyFormula(ast);
        ta.value += JSON.stringify(formula, null, 2);
        ta.value += '\n' + printFormula(formula);
    } catch (err) {
        ta.value += err.message || `*** ${err}`;
    }
}

const doProcessFormulaInInputField = () => {
    const testInput = document.getElementById('test-input');
    if (testInput.value.length > 0) {
        console.log(`processing test input: ${testInput.value}`);
        clearMathResult();
        //ta.style.color = 'blue';
        //ta.style.background = 'orange';
        processFormula(testInput.value);
        return true;
    }
    return false;
}

const click = event => {
    const qelem = document.getElementById('question-repeat');
    const ta = document.getElementById('ta');
    const testInput = document.getElementById('test-input');
    clearMathResult();
    parseSelectionFromWebpage(parsedSelection => {
        if (parsedSelection) {
            testInput.value = parsedSelection;
            doProcessFormulaInInputField();
            return;
        }
        if (doProcessFormulaInInputField()) {
            return;
        }
        const domParser = new DOMParser();
        if (!qelem) {
            console.error('question-repeat element not found in popup');
            return;
        }
        chrome.tabs.executeScript({
            code: `(${getQuestion})()`
        }, ([res] = []) => {
            let html = res.result;
            console.log(typeof html);
            qelem.innerHTML = html;
            //ta.value = parseHTML(qelem);
            let h = domParser.parseFromString(html, "text/html");
            console.log(h.body);
            let fstring = parseFormula(h.body);
            testInput.value = fstring;
            doProcessFormulaInInputField();
        });
    });
}


document.addEventListener('DOMContentLoaded', function (event) {
    MQ = MathQuill.getInterface(2);
    var input = document.getElementById("theButton");
    input.addEventListener('click', click);
    input = document.getElementById("close");
    input.addEventListener('click', function () {
        window.close();
    });
    const ta = document.getElementById('ta');
    const testInput = document.getElementById('test-input');
    var evalTimer = null;
    if (testInput) {
        testInput.addEventListener('keydown', event => {
            console.log('keypress');
            if (evalTimer) {
                clearTimeout(evalTimer);
            }
            evalTimer = setTimeout(doProcessFormulaInInputField, 500);
        })
    }
});

const addMathResult = callback => {
    const cont = document.getElementById('output-math-container');
    const formulaContainer = document.createElement('div');
    formulaContainer.className = 'formula-container';
    const span = document.createElement('span');
    span.className = 'formula-content';
    const mathField = MQ.MathField(span);
    const pspan = document.createElement('span');
    pspan.className = 'formula-content formula-content-previous';
    const previousMathField = MQ.MathField(pspan);
    const textDiv = document.createElement('div');
    textDiv.className = 'formula-text';
    formulaContainer.appendChild(textDiv);
    const formulaContentContainer = document.createElement('div');
    formulaContentContainer.appendChild(pspan);
    formulaContentContainer.appendChild(span);
    formulaContainer.appendChild(formulaContentContainer);
    cont.appendChild(formulaContainer);
    if (typeof callback === 'function') {
        callback({ mathField, previousMathField, textDiv });
    }
}

const clearMathResult = () => {
    document.getElementById('output-math-container').innerHTML = "";
}

console.hlog = msg => {
    console.log(`%c${msg}`, 'color:green');
}