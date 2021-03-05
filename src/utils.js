const colors = require('colors/safe');

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

module.exports = {
    levelIndent,
    llog
}