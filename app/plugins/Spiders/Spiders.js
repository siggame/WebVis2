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

    var Nest = function(initx, inity) {
        this.__proto__ = new WebVis.plugin.Entity;

        this.rect = new WebVis.renderer.Rect();
        this.rect.pos.x = initx + 1;
        this.rect.pos.y = inity + 1;
        this.rect.pos.z = 0;
        this.rect.color.setColor(1.0, 0.0, 0.0, 1.0);

        this.rect2 = new WebVis.renderer.Rect();
        this.rect2.pos.x = initx + 2;
        this.rect2.pos.y = inity + 2;
        this.rect2.pos.z = 0;
        this.rect2.color.setColor(1.0, 0.0, 1.0, 1.0);

        this.sprite = new WebVis.renderer.Sprite();
        this.sprite.pos.x = 0;
        this.sprite.pos.y = 0;
        this.sprite.pos.z = 0;
        this.sprite.texture = "building";

        this.sprite2 = new WebVis.renderer.Sprite();
        this.sprite2.pos.x = 1;
        this.sprite2.pos.y = 1;
        this.sprite2.pos.z = 0;
        this.sprite2.texture = "building";

        this.line = new WebVis.renderer.Line();
        this.line.p1.x = 2;
        this.line.p1.y = 0;
        this.line.p2.x = 2;
        this.line.p2.y = 2;
        this.line.color.setColor(0.0, 1.0, 0.0, 1.0);

        this.line2 = new WebVis.renderer.Line();
        this.line2.p1.x = 3;
        this.line2.p1.y = 0;
        this.line2.p2.x = 3;
        this.line2.p2.y = 3;
        this.line2.color.setColor(1.0, 0.0, 1.0, 1.0);

        this.circle = new WebVis.renderer.Circle();
        this.circle.center.x = initx;
        this.circle.center.y = inity;
        this.circle.center.z = 0;
        this.circle.rotation = Math.PI/4;
        this.circle.resolution = 8;
        this.circle.percentage = 0.25;
        this.circle.color.setColor(0.0, 1.0, 0.0, 1.0);

        this.circle2 = new WebVis.renderer.Circle();
        this.circle2.center.x = initx + 3;
        this.circle2.center.y = inity + 3;
        this.circle2.center.z = 0;
        this.circle2.rotation = Math.PI/4;
        this.circle2.resolution = 8;
        this.circle2.percentage = 0.25;
        this.circle2.color.setColor(1.0, 0.0, 0.0, 1.0);

        this.draw = function(context) {
            context.drawRect(this.rect);
            context.drawRect(this.rect2);
            context.drawSprite(this.sprite);
            context.drawSprite(this.sprite2);
            context.drawLine(this.line);
            context.drawLine(this.line2);
            context.drawCircle(this.circle);
            context.drawCircle(this.circle2);
        };
    };

    var Spiders = function() {
        this.__proto__ = new WebVis.plugin.Base;
        this.projection = new WebVis.renderer.Matrix4x4();
        this.worldWidth = 40;
        this.worldHeight = 20;

        this.predraw = function(context) {
            // aspect ratio management
            var worldRatio = this.worldWidth / this.worldHeight;
            var screenSize = context.getScreenSize();
            var screenRatio = screenSize.width / screenSize.height;

            if((worldRatio / screenRatio) > 1) {
                this.projection.ortho(0, this.worldWidth, 0, this.worldHeight * ( worldRatio / screenRatio), 0.001, 1000);
            } else {
                this.projection.ortho(0, this.worldWidth * (worldRatio / screenRatio), 0, this.worldHeight, 0.001, 1000);
            }
            context.push(this.projection);
        };

        this.postdraw = function(context) {
            context.pop();
        };

        this.loadGame = function(data) {
            var newEnt = new Nest(7, 5);
            this.entities["myOwnId"] = newEnt;

            /*
            for(var state of data.deltas) {
                // if(state.type )
            }
            */

        };
    };

    WebVis.plugin.addPlugin("Spiders", new Spiders);
})();
