WebVis.ready(function() {
    var version = "2.0.0";

    // forward declarations
    var resize = null;

    var evalPlaying;

    var initPluginFromLog = function(file) {
        var gameObject = JSON.parse(file.data);
        var $progress = $('#webvis-progress-bar').css('width', '0%');
        $('#webvis-load-background').removeClass("hidden");
        $('#webvis-progress-bar-background').removeClass("hidden");
        var data;

        var finish = function() {
            if(data.deltas !== undefined && data.deltas[0] !== undefined) {
                WebVis.game.playing = false;
                WebVis.game.currentTurn = 0;
                WebVis.game.setMaxTurn(data.deltas.length - 1);
                WebVis.setDebugData(data.deltas[0].game);
                if(WebVis.options.getOptionValue("arena-mode")) {
                    WebVis.game.playing = true;
                    WebVis.game.speed = 5;
                    evalPlaying();
                    $("#turn-slider").slider('value', parseInt(WebVis.game.speed));
                    $("#turn-slider-text").text("5x");
                }
            }
        }

        var onLoadGame = function(message, percent) {
            switch(message) {
                case "update":
                    var txt = 50 + parseInt(percent * 50) + "%";
                    $progress.css('width', txt);
                    $progress.text(txt);
                    break;
                case "finish":
                    $progress.css('width', '100%');
                    $progress.text('100%');
                    $('#webvis-load-background').addClass("hidden");
                    $('#webvis-progress-bar-background').addClass("hidden");
                    finish();
                    break;
            }
        };

        var flattenHandler = function(obj) {
            var obj = obj.data;
            switch(obj.message) {
                case "update":
                    var txt = parseInt(obj.data * 50) + "%";
                    $progress.css('width', txt);
                    $progress.text(txt);
                    break;
                case "finish":
                    var txt = "50%"
                    $progress.css('width', txt);
                    $progress.text(txt);
                    data = obj.data
                    WebVis.plugin.loadGame(obj.data, onLoadGame);
                    break;
            }
        };

        var onChangePlugin = function() {
            var flattenWorker = new Worker("/scripts/engine/flatten.js");
            flattenWorker.addEventListener("message", flattenHandler);
            flattenWorker.postMessage(gameObject);
        };

        WebVis.plugin.changePlugin(gameObject.gameName, onChangePlugin);
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
        console.log("dropped?");
        WebVis.fileLoader.loadFile(event.target.files, initPluginFromLog);
        inputTag.val(null);
    });

    //-------------------------------------------------
    // Attach a click handler to the canvas and call plugins
    //-------------------------------------------------
    $('#canvas').click(function(e) {
        console.log("called");
        var offset = $(this).offset();
        var pagex = e.pageX - offset.left;
        var pagey = e.pageY - offset.top;
        WebVis.plugin.selectEntity(pagex, pagey);
    });

    var getLogFromArena = function() {
        var url = "http://" + WebVis.options.getOptionValue("arena-url") + "/api/next_game/";
        $.ajax({
            dataType: "text",
            url: url,
            data: null,
            crossDomain: true,
            success: function(data) {
                WebVis.fileLoader.loadFromUrl(data, initPluginFromLog);
            },
            error: function() {
                WebVis.alert("danger", "could not find " + url);
            }
        });
    }

    WebVis.options.optionOnClick("arena-mode", function() {
        console.log("arena mode click");
        if(WebVis.options.getOptionValue("arena-mode")) {
            getLogFromArena();
        }
    });

    //-------------------------------------------------
    // attach the time slider to it's element
    //-------------------------------------------------
    $('#turn-slider').slider({
        animate: false,
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
    evalPlaying = function() {
        var $elem = $("#play-button");
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
    var sizeChange = false;
    var updateFullScreen = function() {
        var elem = document.getElementById('playback');
        if(sizeChange) {
            $(elem).removeClass('col-lg-9 col-md-9 col-sm-12 col-xs-12 ');
            $(elem).addClass('col-md-12 col-lg-12 col-xs-12 col-sm-12');
        } else {
            $(elem).removeClass('col-md-12 col-lg-12 col-xs-12 col-sm-12');
            $(elem).addClass('col-lg-9 col-md-9 col-sm-12 col-xs-12 ');
        }
    }

    $('#fullscreen-toggle').click(function() {
        var elem = document.getElementById('playback');
        var fullscreenMode = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        if(!fullscreenMode)
        {
            if(elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if(elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if(elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if(elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
            $(elem).removeClass('col-lg-9 col-md-9 col-sm-12 col-xs-12');
            $(elem).addClass('col-md-12 col-lg-12 col-xs-12 col-sm-12');
            sizeChange = true;
        } else {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            $(elem).removeClass('col-md-12 col-lg-12 col-xs-12 col-sm-12');
            $(elem).addClass('col-lg-9 col-md-9 col-sm-12 col-xs-12 ');
            sizeChange = false;
        }
        // TODO: Find a way to actually attach callback to the end of the fullscreen css
        // transition rather than just waiting an arbitrary time for it to finish.
        // This type of thing is just disgusting, (THANKS AGAIN W3 -_-)
        setTimeout(resize, 500);
    });

    $(document).on('mozfullscreenchange webkitfullscreenchange fullscreenchange', function() {
        sizeChange = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        updateFullScreen();
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

        console.log("files have been dropped.");
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
        if(parseInt(WebVis.game.currentTurn) === WebVis.game.maxTurn) {
            console.log(WebVis.game.currentTurn + " " + WebVis.game.maxTurn);
            if(WebVis.options.getOptionValue("arena-mode")) {
                setTimeout(getLogFromArena, 3000);
            }
        }
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

    //---------------------------------------------------------
    //  Canvas setup and window resize bindingbinding
    //---------------------------------------------------------
    var updateCanvasSize = function() {
        var $canvas = $('#canvas');
        $canvas.get(0).width = $canvas.parent().width();
        $canvas.get(0).height = $canvas.parent().height();
    };

    var resize = function() {
        updateCanvasSize();
    };

    $(window).resize(resize);

    window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
        WebVis.alert("danger", errorMsg)
        return false;
    };

    //=-------------------------------------------------------
    // Initial page configuration
    //--------------------------------------------------------
    (function() {
        WebVis.renderer.init(canvas, 20, 20);
        updateCanvasSize();

        var uri = WebVis.util.getUrlParams();
        if(uri.logUrl !== undefined) {
            console.log("have uri, getting gamelog");
            WebVis.fileLoader.loadFromUrl(decodeURI(uri.logUrl), initPluginFromLog);
        }
    })();

});
