self.addEventListener("message", function(data) {
    data = data.data;

    var interpolateDeltas = function(prev, next) {
        for(var prop in prev) {
            if(!prev.hasOwnProperty(prop)) continue;
            if(next === null) continue;

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
        self.postMessage({message: "update", data: i/data.deltas.length});
    }
    data.turns = turns;
    self.postMessage({message: "finish", data: data});
}, false);
