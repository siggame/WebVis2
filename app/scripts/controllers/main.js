WebVis.ready(function() {
    var version = "2.0.0";

    // forward declarations
    var resize = null;

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
                        if(obj.data.deltas !== undefined && obj.data.deltas[0] !== undefined) {
                            WebVis.setDebugData(obj.data.deltas[0].game);
                        }
                        WebVis.plugin.loadGame(obj.data);
                        WebVis.game.setMaxTurn(obj.data.deltas.length);
                        break;
                }
            });

            flattenWorker.postMessage(gameObject);
        });
    };

    //-------------------------------------------------
    // place the version of the engine in the name and attach
    // manual file loader
    //-------------------------------------------------
    $('#webvis-version-text').text(version);
    var formTag = $('#manual-open-btn').find('form');
    var inputTag = formTag.find("input[type='file']");
    $('#manual-open-btn').bind('click', function(event) {
        inputTag.click();
    });
    inputTag.click(function(event) {
        event.stopPropagation();
    });
    inputTag.change(function(event) {
        WebVis.fileLoader.loadFile(event.target.files, initPluginFromLog);
        inputTag.val(null);
    });

    //-------------------------------------------------
    // Attach a click handler to the canvas and call plugins
    //-------------------------------------------------
    $('#canvas').click(function(e) {
        var offset = $(this).offset();
        var pagex = e.pagex - offset.left;
        var pagey = e.pagey - offset.top;
        WebVis.plugin.makeSelection();
    });

    //-------------------------------------------------
    // attach the time slider to it's element
    //-------------------------------------------------
    $('#turn-slider').slider({
        animate: true,
        min: 0,
        max: WebVis.game.maxTurn,
        slide: function(event, ui) {
            WebVis.game.setCurrentTurn(ui.value);
        }
    });

    //-------------------------------------------------
    // attach the speed slider to it's element
    //-------------------------------------------------
    $('#speed-slider').slider({
        animate: true,
        max: 5,
        min: 0,
        slide: function(event, ui) {
            WebVis.game.speed = ui.value;
            $('#speed-slider-text').text(Math.pow(2, WebVis.game.speed) + "x");
        }
    });
    $('#speed-slider-text').text(Math.pow(2, WebVis.game.speed) + "x");

    //-------------------------------------------------
    // attach the step back button
    //-------------------------------------------------
    $('#back-button').click(function() {
        if(WebVis.game.currentTurn > 1) {
            WebVis.game.setCurrentTurn(parseInt(WebVis.game.currentTurn - 1));
        } else {
            WebVis.game.setCurrentTurn(0);
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
            WebVis.game.setCurrentTurn(parseInt(WebVis.game.currentTurn + 1));
        } else {
            WebVis.game.setCurrentTurn(WebVis.game.maxTurn);
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
    // Attach the fullscreen button
    //--------------------------------------------------
    $('#fullscreen-toggle').click(function() {
        var elem = document.getElementById('playback');
        if(document.fullscreenElement ||
           document.webkitFullscreenElement ||
           document.mozFullScreenElement ||
           document.msFullscreenElement)
        {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            $(elem).removeClass('col-md-12 col-lg-12 col-xs-12 col-sm-12');
            $(elem).addClass('col-md-9 col-lg-9 col-xs-9 col-sm-9');
        } else {
            if(elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if(elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if(elem.mozRequestFullscreen) {
                elem.mozRequestFullscreen();
            } else if(elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
            $(elem).removeClass('col-md-9 col-lg-9 col-xs-9 col-sm-9');
            $(elem).addClass('col-md-12 col-lg-12 col-xs-12 col-sm-12');
        }
        // TODO: Find a way to actually attach callback to the end of the fullscreen css
        // transition rather than just waiting an arbitrary time for it to finish.
        // This type of thing is just disgusting, (THANKS AGAIN W3 -_-)
        setTimeout(resize, 200);
    });

    //--------------------------------------------------
    // Attach the drag and drop event
    //--------------------------------------------------
    $('body').bind('dragover', function(event) {
        event.stopPropagation();
        event.preventDefault();
    });

    $('body').bind('drop', function(event) {
        event.stopPropagation();
        event.preventDefault();
        var files = event.originalEvent.dataTransfer.files;

        WebVis.fileLoader.loadFile(files, initPluginFromLog);
    });

    // -------------------------------------------------
    // Initialize game state callbacks
    // -------------------------------------------------
    var turnInvalidated = false;

    WebVis.game.onPlay(function() {
        evalPlaying();
    });

    WebVis.game.onPause(function() {
        evalPlaying();
    });

    WebVis.game.onCurrentTurnChange(function() {
        $("#turn-slider").slider('value', parseInt(WebVis.game.currentTurn));
        turnInvalidated = true;
    });

    WebVis.game.onMaxTurnChange(function() {
        $("#turn-slider").slider('option', {'max': parseInt(WebVis.game.maxTurn)});
    });

    setInterval(function() {
        if(turnInvalidated) {
            console.log("redrawn");
            WebVis.plugin.turnChange(WebVis.game.currentTurn);
            turnInvalidated = false;
        }
    }, 1000/2);

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

    var resize = function() {
        fillWidth();
        fillHeight();
        updateCanvasSize();
    }

    $(window).resize(resize);

    //=-------------------------------------------------------
    // Initial page configuration
    //--------------------------------------------------------
    (function() {
        WebVis.renderer.init(canvas, 20, 20);

        fillWidth();
        fillHeight();
        updateCanvasSize();

        var uri = WebVis.util.getUrlParams();
        if(uri.logUrl !== undefined) {
            console.log("in here");
            WebVis.fileLoader.loadFromUrl(uri.logUrl, initPluginFromLog);
        }
    })();

    WebVis.fillWidth = fillWidth;
    WebVis.fillHeight = fillHeight;
});
