WebVis.ready(function() {

    var defined = function(name, value) {
        if(typeof value === "undefined") {
            console.error("\""+name+"\" is not defined");
            return false;
        }
        return true;
    }

    var assert = function(booleanValue, callback) {
        if(!booleanValue) {
            if(callback !== undefined) {
                callback();
            }
            throw "Regression Test Fail!";
        }
    };

    WebVis.util = {
        defined: defined,
        assert: assert
    };

});
