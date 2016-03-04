WebVis.ready(function() {

    var fillHeight = function() {
        $('.fill-height').each(function(index, elem){
            var $elem = $(elem);
            var offset = 0;
            var children = $elem.parent().children().not($elem);
            children.each(function(i, otherelem) {
                var $otherelem = $(otherelem);
                offset += $otherelem.outerHeight();
            });

            $elem.outerHeight($elem.parent().height() - offset);
        });
    };

    var fillWidth = function() {
        $('.fill-width').each(function(index, elem){
            var $elem = $(elem);
            var offset = 0;
            var children = $elem.parent().children().not($elem);
            children.each(function(i, otherelem) {
                var $otherelem = $(otherelem);
                if(!$otherelem.hasClass('ret')) {
                    offset += $otherelem.outerWidth();
                }
            });

            $elem.outerWidth($elem.parent().width() - offset);
        });
    };

    $(window).resize(fillWidth);
    $(window).resize(fillHeight);
    fillWidth();
    fillHeight();

    //-------------------------------------------------
    // attach the time slider to it's element
    //-------------------------------------------------
    $('#turn-slider').slider({
        animate: true,
        min: 0,
        max: WebVis.game.maxTurn,
        slide: function(event, ui) {
            WebVis.game.currentTurn = ui.value;
        }
    });

    //-------------------------------------------------
    // attach the speed slider to it's element
    //-------------------------------------------------
    $('#speed-slider').slider({
        animate: true,
        max: 10,
        min: 0,
        slide: function(event, ui) {
            WebVis.game.speed = ui.value;
        }
    })

    //-------------------------------------------------
    // attach the step back button
    //-------------------------------------------------
    $('#back-button').click(function() {
        if(WebVis.game.currentTurn > 1) {
            WebVis.game.currentTurn = parseInt(WebVis.game.currentTurn - 1);
        } else {
            WebVis.game.currentTurn = 0;
            WebVis.game.playing = false;
        }
        $("#turn-slider").slider('value', parseInt(WebVis.game.currentTurn));
    });

    //-------------------------------------------------
    // attach the play/pause button
    //-------------------------------------------------
    var evalPlaying = function() {
        var $elem = $("#play-button");
        console.log("blah");
        if(!WebVis.game.playing) {
            $elem.children("span")
            .addClass("glyphicon-play")
            .removeClass("glyphicon-pause");
        } else {
            $elem.children("span")
            .addClass("glyphicon-pause")
            .removeClass("glyphicon-play");
        }
    };

    $('#play-button').click(function() {
        var $elem = $(this);
        if(!WebVis.game.playing) {
            WebVis.game.play();
        } else {
            WebVis.game.pause();
        }
        $("#turn-slider").slider('value', parseInt(WebVis.game.currentTurn));
    });

    //-------------------------------------------------
    // attach the step forward button
    //-------------------------------------------------
    $('#forward-button').click(function() {
        if(WebVis.game.currentTurn < WebVis.game.maxTurn - 1) {
            WebVis.game.currentTurn = parseInt(WebVis.game.currentTurn + 1);
        } else {
            WebVis.game.currentTurn = WebVis.game.maxTurn;
            WebVis.game.playing = false;
        }
        $("#turn-slider").slider('value', parseInt(WebVis.game.currentTurn));
    });

    //--------------------------------------------------
    // attach the turn by turn/ move by move mode
    //--------------------------------------------------
    var evalTurnToggle = function() {
        var $elem = $('#turn-toggle');
    };

    $('#turn-toggle').click(function() {
        evalTurnToggle();
    });

    //--------------------------------------------------
    // Attach the drag and drop event
    //--------------------------------------------------
    $('body').bind('dragover', function(event) {
        event.stopPropagation();
        event.preventDefault();
    });

    var initPluginFromLog = function(file) {
        var gameObject = JSON.parse(file.data);
        console.log("Loading plugin \""+gameObject.gameName+"\"");
        WebVis.plugin.changePlugin(gameObject.gameName, function() {
            //WebVis.util.buildStatesFromJson(gameObject);
            var flattenWorker = new Worker("/scripts/engine/flatten.js");
            flattenWorker.addEventListener("message", function(obj) {
                obj = obj.data;
                switch(obj.message) {
                    case "update":
                        console.log(obj.data);
                        break;
                    case "finish":
                        WebVis.setDebugData(obj.data);
                        WebVis.plugin.loadGame(obj.data);
                        break;
                }
            });

            flattenWorker.postMessage(gameObject);
        });
    };

    $('body').bind('drop', function(event) {
        event.stopPropagation();
        event.preventDefault();
        var files = event.originalEvent.dataTransfer.files;

        WebVis.fileLoader.loadFile(files, initPluginFromLog);
    });

    // -------------------------------------------------
    // Initialize game state callbacks
    // -------------------------------------------------
    WebVis.game.onPlay(function() {
        evalPlaying();
    });

    WebVis.game.onPause(function() {
        evalPlaying();
    });

    WebVis.game.onCurrentTurnChange(function() {
        $("#turn-slider").slider('value', parseInt(WebVis.game.currentTurn));
    });

    WebVis.game.onMaxTurnChange(function() {
        $("#turn-slider").slider('max', parseInt(WebVis.game.maxTurn));
    });

    //---------------------------------------------------
    // parse the uri and check for load url
    //---------------------------------------------------
    var getUrlParams = function() {
        var params = {};
        var query = window.location.hash.split("?")[1];
        if(query !== undefined) {
            var pairs = query.split("&");
            for(var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                if(pair.length < 2) return;
                if(params[pair[0]] !== undefined) {
                    params[pair[0]] = pair[1];
                } else if(typeof(params[pair[0]]) === 'string') {
                    var arr = [params[pair[0]], pair[1]];
                    params[pair[0]] = arr;
                } else {
                    params[pair[0]].push(pair[1]);
                }
            }
        }
        return params
    };

    var uri = getUrlParams();
    if(uri.logUrl !== undefined) {
        WebVis.fileLoader.loadFromUrl(uri.logUrl, initPluginFromLog);
    }

    //---------------------------------------------------------
    //  Canvas setup and binding
    //---------------------------------------------------------
    (function() {
        var $canvas = $('#canvas');
        var canvas = $canvas.get(0);
        WebVis.renderer.init(canvas, 20, 20);
        $(window).resize(function() {
            $('#canvas').get(0).width = $('#canvas').width();
            $('#canvas').get(0).height = $('#canvas').height();
        });

        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    })();

    WebVis.fillWidth = fillWidth;
    WebVis.fillHeight = fillHeight;
});
