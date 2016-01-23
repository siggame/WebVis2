(function() {
    var lastAnimTime = new Date();

    WebVis.game.play = function() {
        WebVis.game.playing = true;
    };

    var updateTime = function() {
        var currentDate = new Date();
        var currentTime = currentDate.getTime();
        var dtSeconds = (currentTime - lastAnimTime)/1000;

        if(WebVis.game.playing) {
            WebVis.game.currentTurn += WebVis.game.speed * dtSeconds;
            // TODO: handle end of log stop
        }

        lastAnimateTime = currentTime;
        return dtSeconds
    };

    WebVis.game.anim = function() {
        window.requestAnimationFrame(WebVis.game.anim);
        var dt = updateTime();

        // TODO: handle rendering
    };
    window.requestAnimationFrame(WebVis.game.anim);

}).call(this);