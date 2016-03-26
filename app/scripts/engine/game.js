WebVis.ready(function() {

    var lastAnimTime = new Date();
    var onPlay = function() {};
    var onPause = function() {};
    var onCurrentTurnChange = function() {};
    var onMaxTurnChange = function() {};

    var updateTime = function() {
        var currentDate = new Date();
        var currentTime = currentDate.getTime();
        var dtSeconds = (currentTime - lastAnimTime)/1000;

        if(WebVis.game.playing) {
            var prevCurrentTurn = WebVis.game.currentTurn;
            WebVis.game.currentTurn += Math.pow(2, WebVis.game.speed) * dtSeconds;

            // handle reaching/exceeding max turn
            if(WebVis.game.currentTurn >= WebVis.game.maxTurn) {
                WebVis.game.playing = false;
                WebVis.game.currentTurn = WebVis.game.maxTurn;
                onPause();
            }

            // handle turn change
            if(parseInt(prevCurrentTurn) < parseInt(WebVis.game.currentTurn) ||
               parseInt(prevCurrentTurn) > parseInt(WebVis.game.currentTurn)) {
                onCurrentTurnChange();
            }

        }

        lastAnimTime = currentTime;
        return dtSeconds
    };

    var anim = function() {
        window.requestAnimationFrame(anim);
        var dt = updateTime();

        if(WebVis.renderer.context !== null) {
            var context = WebVis.renderer.context;
            WebVis.plugin.predraw(context);
            context.begin();

            var entities = WebVis.plugin.getEntities();
            for(var prop in entities) {
                if(!entities.hasOwnProperty(prop)) return;
                var ent = entities[prop];

                ent.animate(context, WebVis.game.currentTurn, dt);
                ent.draw(context);
            }

            context.end();
            WebVis.plugin.postdraw(context);
        }
    };

    WebVis.game = {
        // publics
        currentTurn: 0,
        maxTurn: 10,
        speed: 0,
        playing: false,
        turnMode: false,

        // methods
        play: function() {
            lastAnimTime = new Date();
            WebVis.game.playing = true;
            onPlay();
        },

        pause: function() {
            WebVis.game.playing = false;
            onPause();
        },

        togglePlayMode: function() {
            WebVis.game.playing
        },

        setMaxTurn: function(maxturn) {
            WebVis.game.maxTurn = maxturn;
            onMaxTurnChange(maxturn);
        },

        // events
        onPlay: function(callback) {
            onPlay = callback;
        },

        onPause: function(callback) {
            onPause = callback;
        },

        onCurrentTurnChange: function(callback) {
            onCurrentTurnChange = callback;
        },

        onMaxTurnChange: function(callback) {
            onMaxTurnChange = callback;
        }
    };

    window.requestAnimationFrame(anim);

});
