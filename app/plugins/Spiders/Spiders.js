//# sourceURL=Spiders.js

(function() {
    var Spider = function(birth, death, initx, inity) {
        var self = this;
        self.__proto__ = new WebVis.plugin.Entity;

        self.rect = new WebVis.renderer.Rect();
        self.rect.pos.x = initx;
        self.rect.pos.y = inity;
        self.rect.pos.z = 0;
        self.rect.color.setColor(1.0, 0.0, 0.0, 1.0);

        self.sprite = new WebVis.renderer.Sprite();
        self.sprite.pos.x = 0;
        self.sprite.pos.y = 0;
        self.sprite.pos.z = 0;
        self.sprite.texture = "building";

        self.line = new WebVis.renderer.Line();
        self.line.p1.x = 2;
        self.line.p1.y = 0;
        self.line.p2.x = 2;
        self.line.p2.y = 2;
        self.line.color.setColor(0.0, 1.0, 0.0, 1.0);

        self.text = new WebVis.renderer.Text();
        self.text.pos.x = 3;
        self.text.pos.y = 3;
        self.text.value = "Blah";
        self.text.maxWidth = 1;
        self.text.size = 25;
        self.text.color.setColor(1.0, 1.0, 1.0, 1.0);

        self.circle = new WebVis.renderer.Circle();
        self.circle.center.x = 5;
        self.circle.center.y = 3;
        self.circle.radius = 0.5;
        self.circle.color.setColor(0.0, 0.0, 1.0, 1.0);

        self.draw = function(context) {
            context.drawRect(self.rect);
            context.drawSprite(self.sprite);
            context.drawLine(self.line);
            context.drawText(self.text);
            context.drawCircle(self.circle);
        };
    }

    var Spiders = function() {
        this.__proto__ = new WebVis.plugin.Base;

        this.loadGame = function(data) {
            WebVis.renderer.context.resizeWorld(40, 20);
            var blah = new Spider(0, 10, 1, 1);
            this.entities["blah"] = blah;
        };
    };

    WebVis.plugin.addPlugin("Spiders", new Spiders);
})();
