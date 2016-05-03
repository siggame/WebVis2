// This script is the very first called when the page loads. It creates the
// global WebVis object that is attached to window and then fills the dom with
// async loaded views. When those are completed, every function that was passed
// to WebVis.ready() will be executed in the order they were included in the
// index.html
WebVis = {};

(function() {

    var readyEvents = [];
    var domReady = false;
    var delegates = {};

    // because jquery hasn't been included yet, I am making my own easy,
    // deferred class
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

    // this function takes an html filename of a file on the server, obtains it
    // and passes the text data to the callback.
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

    // this is called to load a delegate, which is a view that isn't
    // injected into the dom just yet, but which a controller can use to create
    // a dom element later. (Ex: Used within the debug table)
    var loadDelegate = function(name, filename) {
        return gethtml(filename, function(html) {
            delegates[name] = html;
        });
    };

    // this is invoked to load a view and than find the corresponding element
    // in the dom and replace that element with the contents of the html file.
    // This is for async loading purposes.
    var loadIncludedHtml = function(id, filename) {
        return gethtml(filename, function(html) {
            var elem = document.getElementById(id);
            elem.innerHTML = html;
        });
    };

    // this is the use of deferreds. So you create an array of deferreds by
    // calling the functions that create them, and then the when funtion will
    // invoke the callback when all the deferreds are completed.
    // the callback iterates over all the ready events that were created with
    // WebVis.ready and calls them sequentially in the order they were received.
    when([
        loadIncludedHtml("menu", "/views/menu.html"),
        loadIncludedHtml("playback", "/views/playback.html"),
        loadDelegate("tree-elem", "/views/tree-elem.html"),
        loadDelegate("text-option", "/views/text-option.html"),
        loadDelegate("checkbox-option", "/views/checkbox-option.html")
    ], function() {
        domReady  = true;
        for(var callback of readyEvents) {
            callback();
        }
    });

    // This functions is exposed to the rest of the webvis. you pass a callback
    // that is invoked when the dom has been completed rendered.
    var ready = function(func) {
        if(domReady) {
            func();
        } else  {
            readyEvents.push(func);
        }
    };

    // This function is exposed to the rest of the webvis. you pass a type:
    //    "success", "info", "warning", "danger"
    // and a message to display and an animated alert bar is placed over the
    // playback field.
    var alert = function(type, message) {
        var $alert = $(document.createElement('div'))
        .addClass("webvis-alert webvis-alert-enter alert");
        $alert.text(message);
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

    // attach the list of delegates as well as the ready and alert functions.
    WebVis = {
        ready: ready,
        delegates: delegates,
        alert: alert
    };

})();
