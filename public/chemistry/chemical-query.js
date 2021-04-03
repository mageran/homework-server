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
            if (resObj.formula) {
                addLatexElement(o, resObj.formula, 'Formula:');
            }
            if (resObj['atomic symbol']) {
                addLatexElement(o, resObj['atomic symbol'], 'Atomic Symbol');
            }

            var table = _htmlElement('table', o, null, 'chemical-properties-table');
            Object.keys(resObj).forEach(prop => {
                const value = resObj[prop];
                const tr = _htmlElement('tr', table);
                const td1 = _htmlElement('td', tr, prop);
                if (['formula', 'Hill formula'].includes(prop)) {
                    const td2 = _htmlElement('td', tr);
                    addLatexElement(td2, value);

                } else {
                    const td2 = _htmlElement('td', tr, value);
                }
            })
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