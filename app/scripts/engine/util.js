WebVis.ready(function() {

    var buildStatesFromJson = function(data) {
        var interpolateDeltas = function(prev, next) {
            for(var prop in prev) {
                if(!prev.hasOwnProperty(prop)) return;

                if(typeof prev[prop] === "object" && next.hasOwnProperty(prop)) {
                    interpolateDeltas(prev[prop], next[prop]);
                } else {
                    if(!next.hasOwnProperty(prop)) {
                        next[prop] = prev[prop];
                    }
                }
            }
        };

        var turnNum = 0;
        var turns = [];
        for(var i = 1; i < data.deltas.length; i++) {
            if(data.deltas[i].game === undefined) {
                data.deltas[i].game = data.deltas[i - 1].game;
            }
            interpolateDeltas(data.deltas[i - 1].game, data.deltas[i].game);
            if(data.deltas[i].type === "finished") {
                turns[turnNum++] = i;
            }
        }
        data.turns = turns;
    };

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
        buildStatesFromJson: buildStatesFromJson,
        defined: defined,
        assert: assert
    };

});
