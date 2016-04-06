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

        this.pc = new WebVis.renderer.Circle();
        this.pc.center.x = initx;
        this.pc.center.y = inity;
        this.pc.center.z = 0;
        this.pc.rotation = Math.PI/4;
        this.pc.resolution = 8;
        this.pc.percentage = 0.25;
        this.pc.color.setColor(0.0, 1.0, 0.0, 1.0);

        this.draw = function(context) {
            context.drawCircle(this.pc);
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
