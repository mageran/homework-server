const ajaxErrorFunction = outputElem => (err => {
    var errmsg = err;
    const rtext = err.responseText;
    if (rtext) {
        try {
            errmsg = JSON.parse(rtext).error.message;
        } catch (_err) {
        }
    }
    _addErrorElement(outputElem, errmsg);
});