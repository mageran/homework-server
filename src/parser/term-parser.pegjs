{
    const Decimal = require('../decimal');
    const Terms = require('../term');
    const assert = require('assert');
    const ParseContext = require('../parse-context');

    const findFunctorClass = functor => {
        const fclass = Object.keys(Terms).filter(
            className => className.toLowerCase() === functor 
                        && (typeof Terms[className] === 'function')
            ).map(className => Terms[className])[0];
        if (!fclass) {
            //throw `no functor class found for ${functor}`;
            return null;
        }
        return fclass;
    }

    const constructFunctorTerm = (functor, allTerms) => {
        var fclass = findFunctorClass(functor);
        if (fclass) {
            return new fclass(allTerms);
        }
        const functorId = new Terms.Identifier(functor);
        return new Terms.Functor([functorId, ...allTerms]);
    }

    const getNextVariableId = () => {
        const context = options;
        return context.getNextVariableId();
    }

    const findVariableInContext = (id, asNumberVariable) => {
        const context = options;
        return context.findVariableInContext(id, asNumberVariable);
    }

    const constructTermOrApply = (functor, allTerms) => {
        if (functor[0] === '$') {
            if (!Array.isArray(allTerms)) {
                throw `executable functor ${functor} called with no arguments`;
            }
            if (allTerms.length < 1) {
                throw `executable functor ${functor} called with no arguments`;
            }
            const functorId = new Terms.Identifier(functor);
            return new Terms.Apply([functorId, ...allTerms]);
        }
        //const fclass = findFunctorClass(functor);
        //return new fclass(allTerms);
        return constructFunctorTerm(functor, allTerms);
    }

}

RulesTermsList
= _ head:RuleOrTerm (".")? _ tail:(RuleOrTerm "." _ ?)* {
    if (tail.length === 0) {
        return head;
    }
    return [head, ...tail.map(telem => telem[0])];
}

RuleOrTerm
= term:Term ruleContinuation:( _ "=>" _ Term (_ "," _ Term)* )? {
    if (ruleContinuation) {
        var rhsTerm = ruleContinuation[3];
        const termTail = ruleContinuation[4];
        if (Array.isArray(termTail)) {
            console.log(`rhs of rule has ${termTail.length + 1} terms`);
            const elements = [rhsTerm, ...termTail.map(telem => telem[3])];
            rhsTerm = new Terms.Seq(elements);
        }
        return new Terms.Rule([term, rhsTerm]);
    }
    return term;
}

Term
=  functor:Functor "(" term: Term terms:("," Term _)* ")" {
    const allTerms = [term].concat(terms.map(t => t[1]));
    //const fclass = findFunctorClass(functor);
    //return new fclass(allTerms);
    return constructTermOrApply(functor, allTerms);
}
/ functor:Functor "(" ")" {
    //const fclass = findFunctorClass(functor);
    //return new fclass();
    return constructFunctorTerm(functor, []);
}
/ BooleanLiteral
/ id:Identifier {
    return new Terms.Identifier(id);
}
/ id:NumberVariable {
    assert.ok(options instanceof ParseContext, 'term uses variables, but context is undefined/null');
    return findVariableInContext(id, true);
}
/ id:Variable {
    assert.ok(options instanceof ParseContext, 'term uses variables, but context is undefined/null');
    return findVariableInContext(id);
}
/ AnyVariable {
    assert.ok(options instanceof ParseContext, 'term uses variables, but context is undefined/null');
    const uniqueId = getNextVariableId();
    return new Terms.AnyVariable(uniqueId);
}
/ num:Number {
    return new Terms.Num(num);
}

Functor
= dollarSign:("$")? id:LowerCaseIdentifier {
    return dollarSign ? `$${id}` : id;
}

Identifier
= LowerCaseIdentifier

Variable
= UpperCaseIdentifier

Number
= Float
/ Integer

BooleanLiteral
= "true" { return Terms.TrueTerm; }
/ "false" { return new Terms.FalseTerm; }

NumberVariable
= [A-Z][A-Za-z_]* "#" { return text(); }

LowerCaseIdentifier
= [a-z][A-Za-z_]* { return text(); }

UpperCaseIdentifier
= [A-Z][A-Za-z_]* { return text(); }

AnyVariable
= "_" { return text(); }

Integer "integer"
  = _ ("-")? [0-9]+ { return new Decimal(text()); }

Float "float"
  = ("-")? [0-9]+ "." [0-9]+ { return new Decimal(text()); }

_ "whitespace"
  = [ \t\n\r\u00A0]*
