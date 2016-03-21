//# sourceURL=Spiders.js

(function() {
    var Spider = function(birth, death, initx, inity) {
        var self = this;
        self.__proto__ = new WebVis.plugin.Entity;

        self.rect = new WebVis.renderer.Rect();
        self.rect.pos.x = 0;
        self.rect.pos.y = 0;
        self.rect.pos.z = -1;
        self.rect.color.setColor(1.0, 0.0, 0.0, 1.0);

        self.draw = function(context) {
            context.drawRect(self.rect);
        };
    }

    var Spiders = function() {
        this.__proto__ = new WebVis.plugin.Base;

        this.loadGame = function(data) {
            var blah = new Spider(0, 10, 1, 1);
            this.entities["blah"] = blah;
        };
    };

    WebVis.plugin.addPlugin("Spiders", new Spiders);
})();
