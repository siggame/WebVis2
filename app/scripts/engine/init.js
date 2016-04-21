WebVis = {};

(function() {

    var readyEvents = [];
    var domReady = false;
    var delegates = {};

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

    var gethtml = function(filename, callback) {
        var xhttp = new XMLHttpRequest();
        var deferred = new Deferred();

        xhttp.onreadystatechange = function() {
            if(xhttp.readyState === 4 & xhttp.status === 200) {
                callback(xhttp.responseText);
                deferred.done = true;
                deferred.callback();
            }
        };

        xhttp.open("GET", filename, true);
        xhttp.send();
        return deferred;
    };

    var loadDelegate = function(name, filename) {
        return gethtml(filename, function(html) {
            delegates[name] = html;
        });
    };

    var loadIncludedHtml = function(id, filename) {
        return gethtml(filename, function(html) {
            var elem = document.getElementById(id);
            elem.innerHTML = html;
        });
    };

    when([
        loadIncludedHtml("menu", "/views/menu.html"),
        loadIncludedHtml("playback", "/views/playback.html"),
        loadDelegate("tree-elem", "/views/tree-elem.html")
    ], function() {
        domReady  = true;
        for(var callback of readyEvents) {
            callback();
        }
    });

    var ready = function(func) {
        if(domReady) {
            func();
        } else  {
            readyEvents.push(func);
        }
    };

    var alert = function(type, message) {
        var $alert = $(document.createElement('div'))
        .addClass("webvis-alert webvis-alert-enter alert");
        switch(type) {
            case "success":
                $alert.addClass("alert-success");
            case "info":
                $alert.addClass("alert-info");
            case "warning":
                $alert.addClass("alert-warning");
            case "danger":
                $alert.addClass("alert-danger");
        }
        $alert.on('webkitAnimationEnd oAnimationEnd oAnimationEnd msAnimationEnd animationend', function() {
            setTimeout(function() {
                $alert.removeClass("webvis-alert-enter").addClass("webvis-alert-leave");
                $alert.one('webkitAnimationEnd oAnimationEnd oAnimationEnd msAnimationEnd animationend', function() {
                    $(this).remove();
                });
            }, 4000);
        });
        var $webvis = $('.webvis-main');
        $('#playback').append($alert);
    };

    WebVis = {
        ready: ready,
        delegates: delegates,
        alert: alert
    };

})();
