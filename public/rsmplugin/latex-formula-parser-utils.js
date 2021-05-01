/**
 * Functions on latex formula parser structures, see latex-formula-parser.pegjs
 */

const _preprocessLatex = formulaLatex => {
  return formulaLatex
    .replace(/\\ /g, ' ')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\cdot/g, '*')
    ;
}

const parseLatexFormula = formulaLatex => {
  console.log(`formula: ${formulaLatex}`);
  formulaLatex = _preprocessLatex(formulaLatex);
  console.log(`formula: ${formulaLatex}`);
  const ast = latexFormulaParser.parse(formulaLatex, { createFractionObjects: true });
  console.log(`parsed: ${JSON.stringify(ast, null, 2)}`);
  return ast;
}



const evalLatexFormula = formulaLatex => {
  const ast = parseLatexFormula(formulaLatex);
  const value = evalAst(ast);
  return { ast, value };
}

const evalLatexFormulaWithContext = (formulaLatex, sepSymRe) => {
  const latexParts = formulaLatex.split(sepSymRe ? sepSymRe : ';');
  const formulaToEvaluate = latexParts.splice(latexParts.length - 1)[0];
  const identifierAssignments = {};
  latexParts.forEach(latex => {
    console.log(`latex part: "${latex}"`);
    const ast = parseLatexFormula(latex);
    evalAst(ast, identifierAssignments);
  });
  console.log(`identifier assignments: ${JSON.stringify(identifierAssignments, null, 2)}`);
  const ast = parseLatexFormula(formulaToEvaluate);
  const value = evalAst(ast, identifierAssignments);
  return { ast, value, identifierAssignments };
}


const parseChemicalFormula = formulaLatex => {
  console.log(`formula: ${formulaLatex}`);
  formulaLatex = formulaLatex
    .replace(/→/g, '=')
    .replace(/\\ /g, ' ')
    .replace(/\\rightarrow/g, '=')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\[a-z]+/g, '')
    .replace(/\{/g, '')
    .replace(/\}/g, '')
    .replace(/_/g, '')
    .replace(/\\\$/g, '')
    .replace(/$/g, '')
    ;
  console.log(`formula: ${formulaLatex}`);
  const ast = chemicalFormulaParser.parse(formulaLatex);
  console.log(`parsed: ${JSON.stringify(ast, null, 2)}`);
  return ast;
}

const evalAst = (ast, identifierAssignments = {}, options = {}) => {
  const angleModeDegree = (typeof options.angleModeDegree !== 'undefined') ? options.angleModeDegree : true;
  const _e = x => evalAst(x, identifierAssignments);
  if (ast === "\\pi") {
    return _d(Math.PI);
  }
  if ((typeof ast === 'number') || (ast instanceof Decimalx)) {
    return _d(ast);
  }
  if (ast instanceof Angle) {
    console.log(`evalAst: angle found: ${ast.degree}`);
    return angleModeDegree ? _d(ast.degree) : _d(ast.radians);
  }
  if (typeof ast === 'string' && Object.keys(identifierAssignments).includes(ast)) {
    let val = identifierAssignments[ast];
    console.log(`returning value for ${ast} = ${val}`);
    return val;
  }
  if (ast.op === '+') {
    return ast.operands.reduce((res, operand) => res.add(_e(operand)), _d(0));
  }
  if (ast.op === '*') {
    return ast.operands.reduce((res, operand) => res.mul(_e(operand)), _d(1));
  }
  if (ast.op === '^') {
    let [op0, ...restOperands] = ast.operands;
    return restOperands.reduce((res, operand) => res.pow(_e(operand)), _e(op0));
  }
  if (ast.op === 'fraction') {
    let { wholeNumber, numerator, denominator } = ast;
    let res = _e(numerator).div(_e(denominator));
    if (typeof wholeNumber === 'number') {
      res = res.add(_d(wholeNumber));
    }
    return res;
  }
  if (ast.op === 'sqrt') {
    return _e(ast.radicand).sqrt();
  }
  if (ast.op === 'nthroot') {
    let dg = _e(ast.degree);
    let rd = _e(ast.radicand);
    if (dg === 3) {
      return rd.cubeRoot();
    }
    let exp = _d(1).div(dg);
    return rd.pow(exp);
  }
  if (ast.op === 'uminus') {
    return _e(ast.operands[0]).negated();
  }
  if (ast.op === 'equation') {
    let lhs = ast.operands[0];
    let res = _e(ast.operands[1]);
    if (typeof lhs === 'string') {
      identifierAssignments[lhs] = res;
    }
    return res;
  }
  if (ast.op === 'fieldAccess') {
    let [recordId, id] = ast.operands;
    if (!Object.keys(identifierAssignments).includes(recordId)) {
      throw `object ${recordId} not found.`;
    }
    let record = identifierAssignments[recordId];
    console.log("record:");
    console.log(record);
    if (typeof record[id] === 'undefined') {
      throw `field ${id} not found for object ${recordId}`;
    }
    let value = record[id];
    console.log(`evalAst: fieldAccess ${recordId}.${id} = %o`, value);
    return _e(value);
  }
  if (ast.isTrigFunction) {
    let [operand] = ast.operands;
    let trigFunction = ast.op;
    let eop = _e(operand);
    var method;
    var useReciprocal = false;
    switch (trigFunction) {
      case 'sec':
        useReciprocal = true;
      case 'cos':
        method = eop.cos;
        break;
      case 'csc':
        useReciprocal = true;
      case 'sin':
        method = eop.sin;
        break;
      case 'cot':
        useReciprocal = true;
      case 'tan':
        method = eop.tan;
        break;
    }
    var res = method.call(eop);
    if (useReciprocal) {
      res = _d(1).div(res);
    }
    return res;
  }
}