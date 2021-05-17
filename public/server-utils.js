const ajaxErrorFunction = outputElem => (err => {
    var errmsg = JSON.stringify(err, null, 2);
    const rtext = err.responseText;
    if (rtext) {
        try {
            const errObj = JSON.parse(rtext);
            if (typeof errObj.error === 'string') {
                errmsg = errObj.error;
            }
            if (typeof errObj.error.message === 'string') {
                errmsg = errObj.error.message;
            }
        } catch (_err) {
        }
    } else {
    }
    _addErrorElement(outputElem, `*** ${errmsg}`);
});