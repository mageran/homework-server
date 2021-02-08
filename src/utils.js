const levelIndent = (level = 0, multiplier = 4) => {
    if (level === 0) return "";
    const a = new Array(level * multiplier);
    a.fill(" ");
    return a.join("");
}

const llog = (level = 0, msg) => {
    console.log(`${levelIndent(level)}${msg}`);
}

module.exports = {
    levelIndent,
    llog
}