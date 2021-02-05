
const _transformedFunctionToString = (a, b, h, k) => {
  const t0 = sumToString("x", -h);
  const p1 = productToString(b, t0);
  const p2 = productToString(a, `f(${p1})`);
  return sumToString(p2, k);
}


/**
 *
 * describes the function transformation given a starting function
 * f(x) and target function a * f(b*(x - h)) + k
 */
const describeTransformation = (a = 1, b = 1, h = 0, k = 0) => {
  var output = "";
  output += (`<p>describe transformations for ${_transformedFunctionToString(a, b, h, k)}:<p>`);
  const steps = [];
  if (a < 0) {
    steps.push('reflection over x-axis');
  }
  a = Math.abs(a);
  if (b < 0) {
    steps.push('reflection over y-axis');
  }
  b = Math.abs(b);
  if (a !== 1) {
    if (a < 1) {
      steps.push(`vertical compression with factor ${1 / a}`);
    } else {
      steps.push(`vertical stretch with factor ${a}`);
    }
  }
  if (b !== 1) {
    if (b < 1) {
      steps.push(`horizontal stretch with factor ${1 / b}`);
    } else {
      steps.push(`horizontal compression with factor ${b}`);
    }
  }
  if (h !== 0) {
    steps.push(`horizontal translation ${h < 0 ? "left" : "right"} ${Math.abs(h)} units`)
  }
  if (k != 0) {
    steps.push(`vertical translation ${k > 0 ? "up" : "down"} ${Math.abs(k)} units`)
  }
  if (steps.length === 0) {
    output += 'no transformations';
  } else {
    output += "<ol>";
    for (let i = 0; i < steps.length; i++) {
      output += (`<li>${steps[i]}</li>`)
    }
    output += "</ol>";
  }
  return output;
}

/*
 * given a point [x,y] on f(x) or (list of points)
 * and transformed function a * f(b(x-h)) + k
 * what point is on the transformed function
 */
const whatPointIsOnGraph = (points, a, b, h, k, returnObject = false, headerForPoints = '') => {
  var output = "";
  output += '<p>' + describeTransformation(a, b, h, k) + '</p>';
  //const fstr = _transformedFunctionToString(a, b, h, k);
  //console.log(`transformed function: ${fstr}`)
  if (b === 1) {
    output += '<p>Formula for point on transformed function: <span style="color:green">(x + h, ay + k)</span> </p>'
  } else {
    output += '<p>Formula for point on transformed function: <span style="color:green">(x/b + h, ay + k)</span> </p>'
  }
  if (headerForPoints.length > 0) {
    output += `<p>${headerForPoints}</p>`;
  }
  if (!Array.isArray(points[0])) points = [points];
  tpoints = points.map(([x, y]) => {
    const tx = x / b + h;
    const ty = a * y + k;
    output += (`<p>(${x},${y}) => (${tx},${ty})</p>`)
    return [tx, ty];
  })
  if (returnObject) {
    return { output, tpoints }
  }
  return output;
}

//describeTransformation(-5, 1, -7, 4);
//describeTransformation(5,1,-3,6);

//whatPointIsOnGraph([-1,2],1,1/3,0,0)
//whatPointIsOnGraph([-1,2],-3,1,-1,0)
//whatPointIsOnGraph([-1,2],1,2,4,3)
/*
var points = [[-4,-2],[-2,2],[0,2],[4,0]];
whatPointIsOnGraph(points,1,1,0,3)
whatPointIsOnGraph(points,1,1,1,0)
whatPointIsOnGraph(points,-1,1,0,0)
whatPointIsOnGraph(points,0.5,1,0,0)
whatPointIsOnGraph(points,1,-1,0,0)
whatPointIsOnGraph(points,1,2,0,0)
whatPointIsOnGraph(points,1,1,-3,-1)
*/


const _maybeAddZero = term => {
  if (term.op !== '+') {
    return { op: '+', operands: [term, 0] }
  }
  return term;
}

const _checkAndRemoveUminus = term => {
  if (term.op === 'uminus') {
    return { uminus: true, term1: term.operands[0] };
  } else {
    return { uminus: false, term1: term };
  }
}

const _checkAndRemoveSquare = term => {
  if (term.op === '^' && term.operands[1] === 2) {
    return { squared: true, term2: term.operands[0] }
  }
  return { squared: false, term2: term };
}

const _maybeMultiplyOne = term => {
  if (term.op !== '*') {
    return { op: '*', operands: [term, 1] };
  }
  return term;
}


const analyzeFunctionTermForTransformations = (outputElem, term) => {
  const origTerm = term;
  var k;
  term = _maybeAddZero(term);
  console.log(`after _maybeAddZero: ${JSON.stringify(term)}`);
  if (term.operands.length !== 2) {
    throw "term is not in the expected format (operands length !== 2";
  }
  const [op1, op2] = term.operands;
  var xterm;
  if (_isNumeric(op1)) {
    k = op1;
    xterm = op2;
  }
  else if (_isNumeric(op2)) {
    k = op2;
    xterm = op1;
  }
  else {
    throw "term is not in the expected format (no numeric operand found)";
  }
  console.log(`found: k = ${formulaToLatex(k)}`);
  const { uminus, term1 } = _checkAndRemoveUminus(xterm);
  if (term1.op !== 'fraction') {
    throw "not supported term; x-term must be a fraction";
  }
  const { numerator, denominator } = term1;
  if (!_isNumeric(numerator)) {
    throw "not supported term: numerator must be numeric";
  }
  var a = numerator;
  if (uminus) {
    a = multiplication(a, -1);
  }
  console.log(`found: a = ${formulaToLatex(a)}`);
  const { squared, term2 } = _checkAndRemoveSquare(denominator);
  const { operands } = _maybeAddZero(term2);
  if (operands.length !== 2) {
    throw " not in the expected format: number of operands is not 2";
  }
  const [xterm1, mh] = operands;
  if (!_isNumeric(mh)) {
    throw "second summand in denominator is not numeric";
  }
  var h = multiplication(mh, -1);
  var b = 1;
  var adiv
  adiv = document.createElement('p');
  adiv.style.fontSize = '14pt';
  addMathResult(adiv, ({mathField, textDiv}) => {
    textDiv.innerHTML = 'Horizontal Assymptote:';
    mathField.latex(`y = ${formulaToLatex(k)}`);
  });
  outputElem.appendChild(adiv);
  adiv = document.createElement('p');
  adiv.style.fontSize = '14pt';
  addMathResult(adiv, ({mathField, textDiv}) => {
    textDiv.innerHTML = 'Vertical Assymptote:';
    mathField.latex(`x = ${formulaToLatex(h)}`);
  });
  outputElem.appendChild(adiv);
  const parentFunctionLatex = `\\frac{1}{x${squared ? '^2' : ''}}`;
  addMathResult(outputElem, ({ mathField }) => {
    mathField.latex(`a = ${formulaToLatex(a)},\\ h = ${formulaToLatex(h)},\\ k = ${formulaToLatex(k)},\\ f(x) = ${parentFunctionLatex}`);
  }, { notext: true });
  //const tdiv = document.createElement('p');
  //tdiv.style.fontSize = '18pt';
  //outputElem.appendChild(tdiv);
  //tdiv.innerHTML = describeTransformation(a, 1, h, k);
  const keyPoints = squared ? [[1, 1], [-1, 1]] : [[1, 1], [-1, -1]];
  const kdiv = document.createElement('p');
  kdiv.style.fontSize = '18pt';
  outputElem.appendChild(kdiv);
  const { output, tpoints } = whatPointIsOnGraph(keyPoints, a, b, h, k, true, 'Key points:');
  kdiv.innerHTML = output;
  const div = document.createElement('div');
  outputElem.appendChild(div);
  const calc = appendGraphingCalculator(div);
  //const pterm = createPolynomial('x', ...coefficents);
  const ftermLatex = `R(x) = ${formulaToLatex(origTerm)}`;
  calc.setExpression( { latex: ftermLatex });
  tpoints.forEach(([tx, ty]) => {
    calc.setExpression( { latex: `(${tx}, ${ty})`, label: `(${tx}, ${ty})`, showLabel: true } );
  })
  calc.setExpression( { latex: `y = ${k}` , lineStyle: "DASHED", showLabel: true });
  calc.setExpression( { latex: `x = ${h}` , lineStyle: "DASHED", showLabel: true });
}

function describeFunctionBasedOnParentFunction(formulaLatex) {
  const outputElem = this;
  var formula;
  try {
    formulaLatex = formulaLatex
      .replace(/\\ /g, ' ')
      .replace(/\\left/g,'')
      .replace(/\\right/g,'');
    const ast = latexFormulaParser.parse(formulaLatex);
    console.log(`parsed: ${JSON.stringify(ast, null, 2)}`);
    formula = simplifyFormula(ast, 0, logStepFun);
    console.log(`simplified: ${JSON.stringify(formula, null, 2)}`);
    console.log('starting analysis...');
    analyzeFunctionTermForTransformations(outputElem, formula);
  } catch (e) {
    _addErrorElement(outputElem, `*** error while trying to parse formula: ${e}`);
    //throw e;
    return null;

  }
}