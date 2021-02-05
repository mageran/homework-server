// compile into latex-formula-grammar.js using
// pegjs -e latexFormulaParser --format globals latex-formula-grammar.pegjs
// then use variable "latexFormulaParser" in the code like this:
// latexFormulaParser.parse(string);
{

  const Decimal = require('../decimal');

  const trigFunctionNames = {
    '\\sin': 'sin',
    '\\cos': 'cos',
    '\\tan': 'tan',
    '\\cot': 'cot',
    '\\sec': 'sec',
    '\\csc': 'csc'
  };

  const simplifyUminus = t => {
    console.log(`simplifyUminus: ${JSON.stringify(t)}`);
    if (typeof t === 'number') {
      console.log(`...simplifyUminus: ${-t}`);
      return -t;
    }
    if (t.op === 'fraction' && t.wholeNumber === null) {
      let res = { op: 'fraction', wholeNumber: null, numerator: simplifyUminus(t.numerator), denominator: t.denominator };
      console.log(`...simplifyUminus: ${JSON.stringify(res)}`);
      return res;
    }
    if (t.op === '*') {
      let res = _pullUminusIntoProduct(t);
      console.log(`...simplifyUminus: ${JSON.stringify(res)}`);
      return res;
    }
    return { op: 'uminus', operands: [t] };
  }

  const _pullUminusIntoProduct = productTerm => {
    assert(productTerm.op === '*', `"_pullUminusIntoProduct" called on non-product term ${JSON.stringify(productTerm)}`);
    const [factor0,...factors] = productTerm.operands;
    const operands = [simplifyUminus(factor0),...factors];
    return { op: '*', operands };
  }

  const _attachUnaryMinusToFirstFactor = term => {
    try {
      let { op, operands: [ mult ]} = term;
      if (op !== 'uminus') throw '';
      if (mult.op === '*') {
        let { op, operands: [factor0, ...factors]} = mult;
        const newFactor0 = simplifyUminus(factor0);
        return { op, operands: [ newFactor0, ...factors ]};
      } else {
        return simplifyUminus(mult);
      }
    } catch (e) {
      console.error(e);
    }
    return term;
  }

  const _detectTrigFunctions = operands => {
    const newOperands = [];
    var i = 0;
    while (i < operands.length) {
      let t = operands[i];
      let trigFunctionName = trigFunctionNames[t];
      if (typeof trigFunctionName === 'string') {
        if (i === operands.length - 1) {
          throw `argument to trig function "${trigFunctionName} missing"`;
        }
        let trigOperand;
        if (i === operands.length - 2) {
          trigOperand = operands[i+1];
        } else {
          let newProductOperands = operands.reduce((ops, t, index) => index > i ? ops.concat(t) : ops, []);
          trigOperand = { op: '*', operands: newProductOperands };
        }
        let newOp = { op: trigFunctionName, isTrigFunction: true, operands: [ trigOperand ] };
        newOperands.push(newOp);
        break;
      } else {
        newOperands.push(t);
      }
      i++;
    }
    return newOperands;
  }

  console.log(`parser called with options: ${JSON.stringify(options)}`);

}


Equation
  = _ lhs:Expression rhs:(_ "=" _ Expression)? _ {
    return rhs?{ op: 'equation', operands: [lhs, rhs[3]] }:lhs;
  }

Expression
  = head:Term? tail:(_ ("+" / "-") _ Term)* {
      var operands = head?[head]:[new Decimal(0)];
      console.log(`head: ${head} ${typeof head}`);
      const op = "+";
      tail.forEach(elements => {
      	const d = elements[1] === '+' ? 1 : -1;
        const t = elements[3];
        if (typeof t === 'number') {
        	operands.push(d*t);
        } else {
        	if (d < 0) {
            let uminusTerm = { op: 'uminus', operands: [t]};
	      		operands.push(_attachUnaryMinusToFirstFactor(uminusTerm));
        	} else {
        		operands.push(t);
        	}
        }
      });
      operands = operands.filter(t => t !== 0);
      if (operands.length === 1) {
      	return operands[0];
      }
      if (operands.length === 0) {
        return 0;
      }

      return { op, operands };
    }

Term
  = head:Factor tail:(_ ("*" / "/" / "") _ Factor)* {
  	  var operands = [head];
      const op = "*";
      tail.forEach(elements => {
      	const isMult = elements[1] === '*' || elements[1] === '';
        const t = elements[3];
        if (typeof t === 'number') {
        	operands.push(isMult?t:new Fraction(1,t));
        } else {
        	if (!isMult) {
	      		operands.push({ op: 'fraction', numerator: new Decimal(1), denominator: t });
        	} else {
        		operands.push(t);
        	}
        }
      });
      if (op === '*') {
        operands = _detectTrigFunctions(operands);
      }
      if (operands.length === 1) {
      	return operands[0];
      }
      return { op, operands }
    }

Factor
  = head:PTerm tail:(_ '^' _ MaybeCurlyExpression)* {
      return tail.reduce(function(result, element) {
		return { op: element[1], operands: [result, element[3]] };
      }, head);
    }

PTerm
  = "(" _ expr:Expression _ ")" { return expr; }
  / wholeNumber:(Integer)? _ "\\frac{" _ expr1:Expression _ "}{" _ expr2:Expression _ "}" {
        const fractionObj = { wholeNumber: wholeNumber, op: 'fraction', numerator: expr1, denominator: expr2 };
        return fractionObj;
     }
  / "\\sqrt" degree:("[" Expression "]")? "{" radicand:Expression "}" {
    const obj = { op: 'sqrt', degree: degree? degree[1] : 2, radicand };
    return obj;
  }
  / "|" _ expr:Expression _ "|" { return { op: 'abs', operands: [expr] }; }
  / p:Prim { return p; }
  
MaybeCurlyExpression
  = "{" expr:Expression "}" { return expr; }
  / expr:Expression { return expr; }
  
Prim
  = Float
  / Integer
  / Identifier
  / LatexIdentifier

TrigFunction
  = "\\sin" / "\\cos" / "\\tan" / "\\cot" / "\\sec" / "\\csc" { return text() };

Integer "integer"
  = _ [0-9]+ { return new Decimal(text()); }

Float "float"
  = [0-9]+ "." [0-9]+ { return new Decimal(text()); }

Identifier "identifier"
  = [A-Za-z] { return text(); }

LatexIdentifier
= "\\" [a-z]+ { return text(); }

ChemicalElement
= [A-Z][a-z]* {
    const obj = { symbol: text(), chemicalElement: chemicalElement(text()) };
    return obj; 
  }

_ "whitespace"
  = [ \t\n\r\u00A0]*