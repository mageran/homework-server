const { parse } = require('./src/parser/latex-formula-grammar');
const { processAst } = require('./src/ast');

const latex = '(\\frac{6}{(-n^{-4})(n^{-\\frac{1}{3}})})^{|-2|}'
const ast = parse(latex);
console.log(JSON.stringify(ast, null, 2));
const term = processAst(ast);
//console.log(JSON.stringify(term, null, 2));
console.log(term.toTermString());
