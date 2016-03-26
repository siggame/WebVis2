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

    //---------------------------------------------------
    // parse the uri and check for load url
    //---------------------------------------------------
    var getUrlParams = function() {
        var params = {};
        var query = window.location.href.split("?")[1];
        if(query !== undefined) {
            var pairs = query.split("&");
            for(var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                if(pair.length < 2) return;
                if(params[pair[0]] !== undefined) {
                    if(typeof(params[pair[0]]) === 'string') {
                        var arr = [params[pair[0]], pair[1]];
                        params[pair[0]] = arr;
                    } else {
                        params[pair[0]].push(pair[1]);
                    }
                } else {
                    params[pair[0]] = pair[1];
                }
            }
        }
        return params
    };

    WebVis.util = {
        defined: defined,
        assert: assert,
        getUrlParams: getUrlParams
    };

});
