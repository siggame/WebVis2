WebVis = {};
WebVis.delegates = {};

(function() {

    var readyEvents = [];
    var domReady = false;

    var Deferred = function() {
        this.callback = function(){};
        this.done = false;
    };

    var when = function(deferreds, callback) {
        var numfinished = 0;
        var deferred = new Deferred();

        var updateNumFinished = function() {
            numfinished++;
            if(numfinished === deferreds.length) {
                callback();
                deferred.callback();
                deferred.done = true;
                return;
            }
        }

        for(var each of deferreds) {
            if(each.done) {
                numfinished++;
            } else {
                each.callback = updateNumFinished;
            }
        }

        return deferred;
    }

    var loadDelegate = function(filename) {
        var xhttp = new XMLHttpRequest();
    };

    var loadIncludedHtml = function(id, filename) {
        var xhttp = new XMLHttpRequest();
        var deferred = new Deferred();

        xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    var elem = document.getElementById(id);
                    elem.innerHTML = xhttp.responseText;
                    deferred.done = true;
                    deferred.callback();
                }
        };

        xhttp.open("GET", filename, true);
        xhttp.send();

        return deferred;
    }

    var ready = function(func) {
        if(domReady) {
            func();
        } else  {
            readyEvents.push(func);
        }
    };

    when([
        loadIncludedHtml("menu", "/views/menu.html"),
        loadIncludedHtml("playback", "/views/playback.html")
    ], function() {
        domReady  = true;
        for(var callback of readyEvents) {
            callback();
        }
    });

    WebVis = {
        ready: ready
    };

})();