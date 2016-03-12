//# sourceURL=Anarchy.js

(function() {
    var Anarchy = function() {
        this.__proto__ = new WebVis.plugin.Base;

        var Test = function(birth, death, initx, inity) {
            var self = this;
            self.__proto__ = new WebVis.plugin.Entity;
            self.sprite = new WebVis.renderer.Sprite();
            self.sprite.pos.x = 0;
            self.sprite.pos.y = 0;
            self.sprite.texture = "building";

            self.rect = new WebVis.renderer.Rect();
            self.rect.pos.x = 0;
            self.rect.pos.y = 0;
            self.rect.color.setColor(1.0, 0.0, 0.0, 1.0);

            var visAnim = function(begin, end) {
                return new WebVis.plugin.Animation(begin, end, function(completion) {
                    if(completion < 1.0) {
                        self.sprite = visible;
                    } else {
                        self.sprite = visible;
                    }
                });
            };

            self.smoothMoveAnim = function(begin, end, fromx, fromy, tox, toy) {
                return new WebVis.plugin.Animation(begin, end, function(completion) {
                    self.sprite.pos.x = fromx + ((tox - fromx) * completion);
                    self.sprite.pos.y = fromy + ((toy - fromy) * completion);
                });
            };

            self.addChannel({
                name: "movement",
                start: function() {
                    self.sprite.pos.x = 0;
                    self.sprite.pos.y = 0;
                }
            });

            self.addChannel({
                name: "visibility",
                start: function() {
                    self.sprite.visible = false;
                }
            });

            self.addAnim({
                channel: "visibility",
                anim: visAnim([self.sprite], birth, death)
            });

            self.draw = function(context) {
                context.drawRect(self.rect);
                context.drawSprite(self.sprite);
            };
        };

        this.loadGame = function(data) {
            var blah = new Test(0, 10, 5, 5);
            blah.addAnim({
                channel: "movement",
                anim: blah.smoothMoveAnim(2, 4, 5, 5, 10, 10)
            });

            this.entities["blah"] = blah;
        };
    };

    WebVis.plugin.addPlugin("Anarchy", new Anarchy);

})();
