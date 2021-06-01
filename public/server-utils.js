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

const callServerService = (serviceName, data, responseCallback, errorCallback) => {
    const errorFunction = error => {
        console.error(error);
        if (typeof errorCallback === 'function') {
            errorCallback.call(null, error);
        }
    }
    try {
        const url = `/api/${serviceName}`;
        //const data = { equation: formulaLatex, variable: 'x' };
        const success = response => {
            const steps = [];
            console.log(`response: ${JSON.stringify(response, null, 2)}`);
            var resObj = response;
            try {
                resObj = JSON.parse(response);
                console.log(`response from server: %o`, resObj);
            } catch (err) {
                console.error(err);
            }
            if (typeof responseCallback === 'function') {
                responseCallback.call(null, resObj);
            }
        }
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            success: success,
            error: errorFunction
        });
    } catch (err) {
        errorFunction(err);
        //throw err;
    }
}
