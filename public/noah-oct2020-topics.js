const _anaylzeStatistics = list => {
    const numbers = String(list).trim().split(/\s+/)
        .filter(numberstr => {
            const number = Number(numberstr);
            return !isNaN(number);
        })
        .map(numberstr => Number(numberstr));
    var output = "";
    output += frequencyTable(numbers);
    const ordered = numbers.concat([]);
    ordered.sort(nsort);
    output += originalList(numbers);
    output += ranking(ordered);
    output += minMaxSpan(ordered);
    output += median(ordered);
    output += average(ordered);
    return output;
}

const nsort = (a, b) => a > b ? 1 : a < b ? -1 : 0;
const sumReduce = (sum, num) => sum += num;

const _getFrequencies = (numbers, returnAsList = false) => {
    const fmap = {};
    numbers.forEach(num => {
        if (!fmap[num]) {
            fmap[num] = 1;
        } else {
            fmap[num]++;
        }
    });
    if (returnAsList) {
        const values = Object.keys(fmap).map(Number);
        values.sort(nsort);
        return values.map(value => [Number(value), fmap[value]]);
    }
    return fmap
}

const originalList = numbers => {
    var output = "";
    output += "<h2>Urliste</h2>";
    output += `<pre>${numbers.join('&nbsp;&nbsp;&nbsp;')}</pre>`;
    return output;
}

const frequencyTable = numbers => {
    var output = "";
    const freqs = _getFrequencies(numbers, true);
    output += "<h2>H&auml;ufigkeitstabelle</h2>";
    //output += JSON.stringify(freqs);
    output += "<table>";
    output += '<tr><td>Werte:</td>';
    freqs.forEach(freq => {
        output += `<td>${freq[0]}</td>`;
    });
    output += '</tr>'
    output += '<tr><td>H&auml;ufigkeit:</td>';
    freqs.forEach(freq => {
        output += `<td>${freq[1]}</td>`;
    });
    output += '</tr>';
    output += "</table>";
    return output;
}

const ranking = ordered => {
    var output = "";
    output += "<h2>Rangliste</h2>";
    output += "<pre>";
    output += ordered.join("&nbsp;&nbsp;");
    output += "</pre>";
    return output;
}

const minMaxSpan = ordered => {
    const min = ordered[0];
    const max = ordered[ordered.length - 1]
    return `<pre>Minimum: ${min}, Maximum: ${max}, Spannweite: ${max - min}
    </pre>`
}

const median = ordered => {
    var output = "";
    output += "<h2>Zentralwert (Median)</h2>";
    if (ordered.length % 2 === 1) {
        let index = Math.trunc(ordered.length / 2);
        output += `<p>Anzahl der Werte ist ${ordered.length}, also ungerade, d.h. der Zentralwert ist der Wert an Stelle ${index + 1} der Rangliste:</p>`;
        output += `<pre>Zentralwert: ${ordered[index]}</pre>`
    } else {
        let index1 = ordered.length / 2;
        let index0 = index1 - 1;
        let val0 = ordered[index0];
        let val1 = ordered[index1];
        output += `<p>Anzahl der Werte ist ${ordered.length}, also gerade,
        d.h. der Zentralwert ist der Durchschnitt der Werte in der
        Mitte der Rangliste (Positionen ${index0} und ${index1}):</p>`;
        output += `<pre>Zentralwert: (${val0} + ${val1})&divide;2 = ${(val0 + val1) / 2}</pre>`

    }
    return output;
}

const average = ordered => {
    var output = "";
    var sum = ordered.reduce(sumReduce, 0);
    var len = ordered.length;
    var average = sum / len;
    output += "<h2>Durchschnitt (Mittelwert)</h2>";
    output += `<pre>Summe aller Werte: ${sum}
Anzahl der Werte: ${ordered.length}
Durchschnitt: ${sum}&divide;${len} = ${average.toFixed(2)}</pre>`;
    return output;
}

function _drawChart(valuePairString) {
    const parseValuePairString = () => {

    }
    const cwidth = 300;
    const cheight = 300;
    const outputElem = this;
    const div = document.createElement('div');
    outputElem.appendChild(div);
    const canvas = document.createElement('canvas');
    canvas.setAttribute("width", cwidth);
    canvas.setAttribute("height", cheight)
    div.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "darkblue";
    ctx.lineWidth = 5;
    ctx.beginPath();
    handDrawRectangle(ctx, 0, cheight-120, 50, 120);
    ctx.stroke();
}


const _statistics = {
    title: "Werte analysieren mit Statistik",
    description: `Gegeben eine Liste von Werte, bestimme Spannweite, Mittelwert, Durchschnitt usw.
    Gebe die Werte mit Leerzeichen getrennt ein.`,
    parameters: [
        { name: 'Werteliste', value: '', size: 40 },
    ],
    func: _anaylzeStatistics,
    hideHeader: true
}

const roundingBases = [
    { label: "Zehner", value: 10 },
    { label: "Hunderter", value: 100 },
    { label: "Tausender", value: 1000 },
    { label: "Zehntausender", value: 10000 },
    { label: "Hunderttausender", value: 100000 },
    { label: "eine Million", value: 1000000 },
    { label: "zehn Millionen", value: 10000000 },
    { label: "hundert Millionen", value: 100000000 },
    { label: "eine Milliarde", value: 1000000000 },
    { label: "zehn Milliarden", value: 10000000000 },
    { label: "hundert Milliarden", value: 100000000000 },
];

const _displayBigNumber = num => {
    if (num === 0) return "0";
    var cnt = 0;
    var s = "";
    while (Math.abs(num) > 0) {
        let digit = String(num % 10);
        s = `${digit}${cnt++ % 3 === 0 && cnt > 1 ? '.' : ''}${s}`;
        num = Math.trunc(num / 10);
    }
    return s;
}

const _rounding = {
    title: "Grosse Zahlen runden",
    description: "Gebe eine Zahl ein und die Stelle, auf die diese gerundet werden soll.",
    parameters: [
        { name: 'Zahl', value: 0 },
        {
            name: 'Runden auf',
            type: 'select',
            options: roundingBases
        }
    ],
    func: (number, roundingBase) => {
        const roundingBaseToText = rb => {
            const index = roundingBases.findIndex(entry => entry.value === rb);
            if (index >= 0) {
                return roundingBases[index].label;
            }
            return "??";
        }
        var output = "";
        output += `<div>
        ${_displayBigNumber(number)} gerundet auf ${roundingBaseToText(roundingBase)} is
        </div>
        <div style="font-size:30pt">
${_displayBigNumber(Math.round(number / roundingBase) * roundingBase)}
        </div>`
        return output;
    }
}

const _chart = {
    title: "S&auml;ulen- oder Balkendiagramm f&uuml;r statistische Werte",
    description: "",
    parameters: [
        { name: "Wert:Zahl Paare", value: "rot:4, blau:5, orange:2" }
    ],
    func: _drawChart,
}


const topicObjects = [
    _statistics,
    _rounding,
    _chart
];

