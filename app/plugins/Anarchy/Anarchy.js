(function() {
    var Anarchy = function() {
        this.__proto__ = new WebVis.plugin.Base;

        var Building = function(startPos) {
            this.__proto__ = new WebVis.plugin.Entity;
            var self = this;
            self.sprite = new WebVis.renderer.Sprite;
            self.start = 0;
            self.end = 0;
            self.startPos = startPos;

            self.addChannel({
                name: "movement",
                start: function() {
                    self.sprite.pos.x = self.startPos.x;
                    self.sprite.pos.y = self.startPos.y;
                }
            });

            self.addChannel({
                name: "rotation",
                start: function() {
                    self.sprite.rotation = 0;
                }
            });

            self.draw = function(currentTurn, context) {
                if(self.start <= currentTurn && currentTurn <= self.end) {
                    context.drawSprite(self.sprite);
                }
            };
        };

        this.loadGame = function(data) {
            for(var delta of data.deltas) {
                for(var prop in delta.game.gameObjects) {
                    if(!delta.game.gameObjects.hasOwnProperty(prop)) return;
                    var obj = delta.game.gameObjects[prop];

                    if(type !== "Warehouse" &&
                       type !== "WeatherStation" &&
                       type !== "PoliceDepartment" &&
                       type !== "FireDepartment")
                }
            }
        };
    };

    WebVis.plugin.addPlugin("Anarchy", new Anarchy);
})();
