// compile into rsm_grammar.js using
// pegjs -e parser --format globals rsm_grammar.pegjs


Equation
  = _ lhs:Expression rhs:(_ "=" _ Expression)? _ {
    return rhs?{ op: 'equation', operands: [lhs, rhs[3]] }:lhs;
  }

Expression
  = head:Term? tail:(_ ("+" / "-") _ Term)* {
  	  const operands = head?[head]:[0];
      const op = "+";
      tail.forEach(elements => {
      	const d = elements[1] === '+' ? 1 : -1;
        const t = elements[3];
        if (typeof t === 'number') {
        	operands.push(d*t);
        } else {
        	if (d < 0) {
	      		operands.push({ op: 'uminus', operands: [t]});
        	} else {
        		operands.push(t);
        	}
        }
      });
      if (operands.length === 1) {
      	return operands[0];
      }
      return { op, operands }
    }

Term
  = head:Factor tail:(_ ("*" / "/" / "") _ Factor)* {
  	  const operands = [head];
      const op = "*";
      tail.forEach(elements => {
      	const isMult = elements[1] === '*' || elements[1] === '';
        const t = elements[3];
        if (typeof t === 'number') {
        	operands.push(isMult?t:new Fraction(1,t));
        } else {
        	if (!isMult) {
	      		operands.push({ op: 'reciprocal', operands: [t]});
        	} else {
        		operands.push(t);
        	}
        }
      });
      if (operands.length === 1) {
      	return operands[0];
        }
      return { op, operands }
    }

Factor
  = head:PTerm tail:(_ '^' _ PTerm)* {
      return tail.reduce(function(result, element) {
		return { op: element[1], operands: [result, element[3]] };
      }, head);
    }

PTerm
  = "(" _ expr:Expression _ ")" { return expr; }
  / wholeNumber:(Integer)? _ "$fraction(" _ expr1:Expression _ "," _ expr2:Expression _ ")" {
        return { wholeNumber: wholeNumber, op: 'fraction', numerator: expr1, denominator: expr2 }
     }
  / functionName: FunctionName "(" head:Expression tail:(_ ',' _ Expression)* ")" {
    const op = 'BUILTIN';
    const operands = [head, ...(tail.map(te => te[3]))];
    return { op, functionName, operands};
  } 
  / p:Prim { return p; }
  
  
Prim
  = Integer
  / Identifier


Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

Identifier "identifier"
  = [A-Za-z] { return text(); }

FunctionName
  = [A-Z][A-Z]+ { return text(); }

_ "whitespace"
  = [ \t\n\r\u00A0]*