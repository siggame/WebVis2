(function(){
    var plugins = {};

    WebVis.plugins = {
        Plugin: (function() {
            var constructor = function() {
                this.entities = {};
            }

            constructor.prototype.clear = function() {
                this.entities = {};
            }

            constructor.prototype.loadGame = function() {
                throw {message: "The loadGame function has not been implemented.\n"};
            };

            return constructor;
        })(),

        currentPlugin : null,
        changePlugin: function(gameName, callback) {
            if(plugins[gameName] !== undefined) {
                currentPlugin = plugins[gameName];
                callback();
                return;
            } else {
                var success = function() {
                    console.log("plugin successfully loaded.");
                    plugins[gameName] = WebVis.plugins[gameName];
                    delete WebVis.plugins[gameName];
                    WebVis.plugins.currentPlugin = plugins[gameName];
                    callback();
                };

                var error = function(jqXHR, textStatus, errorThrown) {
                    console.error("Could not find a plugin that could play the specified file.");
                    console.error(textStatus);
                };

                $.ajax({
                    type: "GET",
                    dataType: "script",
                    url: 'plugins/' + gameName + '/' + gameName + '.js',
                    success: success,
                    error: error
                });
            }
        }
    };

})();
