var waitFor = function waitFor(cond, onSuccess, onFail, timeout) {
    var maxTimeout = timeout ? timeout : 3000,
        start = Date.now(),
        condition = (typeof(cond) === "string" ? eval(cond) : cond()),
        interval = setInterval(function() {
            if ( (Date.now() - start < maxTimeout) && !condition ) {
                condition = (typeof(cond) === "string" ? eval(cond) : cond());
            } else {
                if(!condition) {
                    typeof(onFail) === "string" ? eval(onFail) : onFail();
                } else {
                    typeof(onSuccess) === "string" ? eval(onSuccess) : onSuccess();
                    clearInterval(interval);
                }
            }
        }, 250);
};

module.exports = waitFor;