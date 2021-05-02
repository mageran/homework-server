function chemicalQuery(queryString) {
    const o = this;
    o.style.fontSize = '18pt';
    try {
        const url = `/api/chemicalQuery?query=${escape(queryString)}`;
        const loadingImg = _htmlElement('img', o);
        loadingImg.src = 'images/loading.gif';
        const success = response => {
            loadingImg.style.display = 'none';
            //console.log(`response: ${JSON.stringify(response, null, 2)}`);
            var resObj = response;
            try {
                resObj = JSON.parse(response);
            } catch (err) {
                console.error(err);
            }
            var table = _htmlElement('table', o, null, 'chemical-properties-table');
            Object.keys(resObj).forEach(prop => {
                const value = resObj[prop];
                const tr = _htmlElement('tr', table);
                const td1 = _htmlElement('td', tr, prop);
                const td2 = _htmlElement('td', tr);
                const varray = Array.isArray(value) ? value : [value];
                varray.forEach(value => {
                    if (['formula', 'Hill formula'].includes(prop)) {
                        addLatexElement(td2, value);
                    } else {
                        _htmlElement('span', td2, value);
                    }
                })
            });
            //_htmlElement('pre', o, JSON.stringify(resObj, null, 2));
        }
        $.ajax({
            type: "get",
            url: url,
            success: success,
            error: errorResponse => {
                loadingImg.style.display = 'none';
                console.log(errorResponse);
                const fun = ajaxErrorFunction(o);
                fun(errorResponse);
            }
        });

    } catch (err) {
        _addErrorElement(o, err);
    }
}

const chemicalQueryPromise = queryString => {
    const url = `/api/chemicalQuery?query=${escape(queryString)}`;
    return new Promise((resolve, reject) => {
        
    })
}

function lewisStructureWidget() {
    const widget = document.getElementById('lewis-structure-widget');
    jQuery.browser = {};
    console.log(`lewis structure div: %o`, widget);
    if (widget) {
        elemStyle(widget, { display: 'block' });
    }
}