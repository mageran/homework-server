const Decimal = require('./decimal');
const colors = require('colors/safe');
const Terms = require('./term');

const levelIndent = (level = 0, multiplier = 4) => {
    if (level === 0) return "";
    const a = new Array(level * multiplier);
    a.fill(" ");
    return a.join("");
}

const llog = (level = 0, msg) => {
    console.log(`${levelIndent(level)}${msg}`);
}

const colorNames = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
    'gray', 'grey', 'brightRed', 'brightGreen', 'brightYellow', 'brightBlue',
    'brightMagenta', 'brightCyan', 'brightWhite', 'rainbow', 'zebra', 'america', 'trap', 'random'];

colorNames.forEach(cname => {
    console.log[cname] = msg => {
        console.log(colors[cname](msg));
    }
})

const _d = x => {
    if (x === null || ((typeof x === 'string') && x.trim().length === 0)) {
        return null;
    }

    if (x instanceof Decimal) {
        return x;
    }

    return new Decimal(x);
}

const isNumeric = x => {
    return x instanceof Decimal;
}

const logTerm = (...args) => {
    var str = "";
    if (args.length === 2) {
        str = args.shift() + " ";
    }
    term = args.shift();
    console.log(str + term.toTermString());
}

const logTerms = (...args) => {
    var str = "";
    if (args.length === 2) {
        str = args.shift() + " ";
    }
    terms = args.shift();
    console.log(str + terms.map(t => t.toTermString()).join(", "));
}

module.exports = {
    levelIndent,
    llog,
    logTerm,
    logTerms,
    _d,
    isNumeric
}