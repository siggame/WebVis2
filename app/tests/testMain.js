var assert = function(booleanValue, callback) {
    if(!booleanValue) {
        if(callback !== undefined) {
            callback();
        }
        throw "Regression Test Fail!";
    }
};
