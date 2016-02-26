WebVis.ready(function(){
    
    var plugins = {};
    var currentPlugin = null;
    var util = WebVis.util;

    var Base = (function() {
        var constructor = function() {
            this.entities = {};
        }

        constructor.prototype.clear = function() {
            this.entities = {};
        }

        constructor.prototype.getEntities = function() {
            return this.entities;
        }

        constructor.prototype.loadGame = function() {
            throw "The loadGame function has not been implemented.\n";
        };

        return constructor;
    })();

    var Animation = (function() {
        var constructor = function(start, end, func) {
            if(!util.defined("start", start)) return;
            if(!util.defined("end", end)) return;
            if(!util.defined("func", func)) return;

            this.start = 0;
            this.end = 0;
            this.func = func;
        };

        constructor.prototype.anim = function(completion) {
            if(!checkdef("completion", completion)) return;

            this.func(completion);
        };
    })();

    var Entity = (function() {
        var constructor = function() {
            this.channels = {};
        };

        constructor.prototype.addChannel = function(init) {
            if(!util.defined("init.name", init.name));
            if(!util.defined("init.channel", init.channel));
            if(this.channels[init.channel] !== undefined) {
                console.error("a channel with the name" + init.channel + " already exists");
                return;
            }

            this.channels[init.name] = [];
            this.channels[init.name].push(new Animation(0, 0, init.start));
        }

        constructor.prototype.addAnim = function(init) {
            if(this.channels[init.channel] === undefined) {
                console.error("the specified channel does not exist");
                return;
            }
            for(var otheranim of this.channels[init.channel]) {
                if((otheranim.start <= init.anim.start && init.anim.start <= otheranim.end) ||
                (otheranim.start <= init.anim.end && init.anim.end <= otheranim.end)) {
                    console.error("the animation would intersect with another in channel " + init.channel);
                    return;
                }
            }

            this.channels[init.channel].push(init.anim);
        };

        constructor.prototype.animate = function(context, currentturn) {
            if(!util.defined("context", context)) return;
            if(!util.defined("currentturn", currentturn)) return;

            for(var prop in this.channels) {
                if(!this.channels.hasOwnProperty(prop)) continue;
                var channel = this.channels[prop];
                for(var anim of channel) {
                    // if the animation intersects with the current turn
                    // compute how far through the anim you are then break
                    if(anim.start <= currentturn && currentturn <= anim.end) {
                        var completion = (currentturn - anim.start)/(anim.end - anim.start);
                        anim.func(completion);
                        break;
                    }

                    // if no anim intersects, then select the closest anim in the channel
                    // and animate at max completion
                    if(currentturn >= anim.end) {
                        anim.func(1.0);
                        break;
                    }
                }
            }
        };

        constructor.prototype.draw = function(context) {
            throw "Function not implemented";
        };

        return constructor;
    })();

    var addPlugin = function(gameName, plugin) {
        if(!util.defined("gameName", gameName)) return;
        if(!util.defined("plugin", plugin)) return;

        plugins[gameName] = plugin;
    };

    var changePlugin = function(gameName, callback) {
        if(!util.defined("gameName", gameName)) return;
        if(!util.defined("callback", callback)) return;

        if(plugins[gameName] !== undefined) {
            currentPlugin = plugins[gameName];
            currentPlugin.clear();
            callback();
            return;
        } else {
            var success = function() {
                console.log("plugin successfully loaded.");
                currentPlugin = plugins[gameName];
                callback();
            };

            var error = function(jqXHR, textStatus, errorThrown) {
                console.error("Could not find a plugin that could play the specified file.");
                console.error(textStatus + " " + errorThrown);
            };

            $.ajax({
                type: "GET",
                dataType: "script",
                url: 'plugins/' + gameName + '/' + gameName + '.js',
                success: success,
                error: error
            });
        }
    };

    var loadGame = function(data) {
        if(!util.defined("data", data)) return;

        if(currentPlugin !== null) {
            currentPlugin.loadGame(data);
        }
    };

    var getEntities = function() {
        if(currentPlugin !== null) {
            return currentPlugin.getEntities();
        } else {
            return [];
        }
    };

    WebVis.plugin = {
        Base: Base,
        Animation: Animation,
        Entity: Entity,
        addPlugin: addPlugin,
        changePlugin: changePlugin,
        loadGame: loadGame,
        getEntities: getEntities
    };

});