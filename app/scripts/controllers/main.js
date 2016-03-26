WebVis.ready(function() {

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
                        WebVis.game.setMaxTurn(obj.data.deltas.length);
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
        $("#turn-slider").slider('option', {'max': parseInt(WebVis.game.maxTurn)});
    });

    //--------------------------------------------------------------
    // Functions for handling fillWidth and fillHeight dom elements
    //--------------------------------------------------------------
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

    //---------------------------------------------------------
    //  Canvas setup and window resize bindingbinding
    //---------------------------------------------------------
    var updateCanvasSize = function() {
        var $canvas = $('#canvas');
        $canvas.get(0).width = $canvas.parent().width();
        $canvas.get(0).height = $canvas.parent().height();
    }

    $(window).resize(function() {
        setTimeout(function(){
            fillWidth();
            fillHeight();
            updateCanvasSize();
        }, 400);
    });

    //=-------------------------------------------------------
    // Initial page configuration
    //--------------------------------------------------------
    (function() {
        WebVis.renderer.init(canvas, 20, 20);

        setTimeout(function() {
            fillWidth();
            fillHeight();
            updateCanvasSize();
        }, 400);

        var uri = WebVis.util.getUrlParams();
        if(uri.logUrl !== undefined) {
            console.log("in here");
            WebVis.fileLoader.loadFromUrl(uri.logUrl, initPluginFromLog);
        }
    })();

    WebVis.fillWidth = fillWidth;
    WebVis.fillHeight = fillHeight;
});
