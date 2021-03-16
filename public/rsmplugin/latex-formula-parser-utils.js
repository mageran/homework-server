/**
 * Functions on latex formula parser structures, see latex-formula-parser.pegjs
 */

 const parseLatexFormula = formulaLatex => {
    console.log(`formula: ${formulaLatex}`);
    formulaLatex = formulaLatex
      .replace(/\\ /g, ' ')
      .replace(/\\left/g,'')
      .replace(/\\right/g,'');
    console.log(`formula: ${formulaLatex}`);
    const ast = latexFormulaParser.parse(formulaLatex, { createFractionObjects: true });
    console.log(`parsed: ${JSON.stringify(ast, null, 2)}`);
    return ast;
 }


 const parseChemicalFormula = formulaLatex => {
  console.log(`formula: ${formulaLatex}`);
  formulaLatex = formulaLatex
    .replace(/→/g,'=')
    .replace(/\\ /g, ' ')
    .replace(/\\rightarrow/g,'=')
    .replace(/\\left/g,'')
    .replace(/\\right/g,'')
    .replace(/\\[a-z]+/g,'')
    .replace(/\{/g,'')
    .replace(/\}/g,'')
    .replace(/_/g,'')
    .replace(/\\\$/g,'')
    .replace(/$/g,'')
    ;
  console.log(`formula: ${formulaLatex}`);
  const ast = chemicalFormulaParser.parse(formulaLatex);
  console.log(`parsed: ${JSON.stringify(ast, null, 2)}`);
  return ast;
}