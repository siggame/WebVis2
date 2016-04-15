//# sourceURL=Spiders.js

(function() {

    var Nest = function(initx, inity, initz, radius) {
        this.__proto__ = new WebVis.plugin.Entity;
        var self = this;

        this.circles = [];
        this.counters = []
        this.background = new WebVis.renderer.Circle();

        for(var i = 0; i < 6; i++) {
            var piece = new WebVis.renderer.Circle();

            piece.visible = false;
            piece.center.x = initx;
            piece.center.y = inity;
            piece.center.z = initz;
            piece.radius = radius;
            this.circles.push(piece);
        }

        for(var i = 0; i < 6; i++) {
            var text = new WebVis.renderer.Text();
            text.visible = true;
            last = 3*Math.PI/2 - (1/3 * Math.PI * i) - (1/6 * Math.PI);
            text.pos.x = initx + (Math.cos(last) * radius * 1.5);
            text.pos.y = inity + (Math.sin(last) * radius * 1.5);
            text.pos.z = 0;
            text.value = "";
            text.maxWidth = 100;
            text.alignment = "center"
            text.baseline = "middle";
            text.color.setColor(1.0, 1.0, 1.0, 1.0);
            this.counters.push(text);
        }

        this.background.center.x = initx;
        this.background.center.y = inity;
        this.background.center.z = initz - 1;
        this.background.radius = radius;
        this.background.resolution = 16;
        this.background.color.setColor(0.5, 0.5, 0.5, 1.0);

        this.circles[0].color.setColor(0.0, 0.0, 1.0, 1.0);
        this.circles[1].color.setColor(0.0, 1.0, 0.0, 1.0);
        this.circles[2].color.setColor(1.0, 0.0, 0.0, 1.0);
        this.circles[3].color.setColor(1.0, 0.0, 1.0, 1.0);
        this.circles[4].color.setColor(1.0, 1.0, 0.0, 1.0);
        this.circles[5].color.setColor(0.0, 1.0, 1.0, 1.0);

        this.counters[0].color.setColor(0.0, 0.0, 1.0, 1.0);
        this.counters[1].color.setColor(0.0, 1.0, 0.0, 1.0);
        this.counters[2].color.setColor(1.0, 0.0, 0.0, 1.0);
        this.counters[3].color.setColor(1.0, 0.0, 1.0, 1.0);
        this.counters[4].color.setColor(1.0, 1.0, 0.0, 1.0);
        this.counters[5].color.setColor(0.0, 1.0, 1.0, 1.0);

        this.addChannel({
            name: "pies",
            start: function() {
                for(var i = 0; i < 6; i++) {
                    var piece = self.circles[i];
                    piece.percentage = (1/6);
                    piece.rotation = (5/6 * Math.PI) + (((1/6) * 2*Math.PI) * i);
                }
            }
        });

        this.pieFunc = function(gameobjects, data) {
            var p1s1 = 0, p1s2 = 0, p1s3 = 0, p2s1 = 0, p2s2 = 0, p2s3 = 0;

            for(var prop in data.spiders) {
                if(!data.spiders.hasOwnProperty(prop)) return;
                if(prop === "&LEN") continue;
                var spider = data.spiders[prop];
                spider = gameobjects[spider.id];
                if(typeof spider === "undefined") continue;
                if(spider.gameObjectName === "BroodMother") continue;

                if(spider.owner.id === "0") {
                    if(spider.gameObjectName === "Spitter") {
                        p1s1++;
                    } else if(spider.gameObjectName === "Weaver") {
                        p1s2++;
                    } else if(spider.gameObjectName === "Cutter") {
                        p1s3++;
                    }
                } else {
                    if(spider.gameObjectName === "Spitter") {
                        p2s1++;
                    } else if(spider.gameObjectName === "Weaver") {
                        p2s2++;
                    } else if(spider.gameObjectName === "Cutter") {
                        p2s3++;
                    }
                }

            }

            var total1 = p1s1 + p1s2 + p1s3;
            var total2 = p2s1 + p2s2 + p2s3;
            var percents = [];
            var rotations = [];

            if(total1 !== 0) {
                percents[0] = ((0.5) * (p1s1 / total1));
                percents[1] = ((0.5) * (p1s2 / total1));
                percents[2] = ((0.5) * (p1s3 / total1));
                rotations[0] = 3*Math.PI/2;
                rotations[1] = rotations[0] - (percents[0] * 2*Math.PI);
                rotations[2] = rotations[1] - (percents[1] * 2*Math.PI);
            }

            var last = Math.PI/2;
            if(total2 !== 0) {
                percents[3] = ((0.5) * (p2s1 / total2));
                percents[4] = ((0.5) * (p2s2 / total2));
                percents[5] = ((0.5) * (p2s3 / total2));
                rotations[3] = Math.PI/2;
                rotations[4] = rotations[3] - (percents[3] * 2*Math.PI);
                rotations[5] = rotations[4] - (percents[4] * 2*Math.PI);

            }

            return function() {
                if(total1 === 0) {
                    for(var i = 0; i < 3; i++) {
                        self.circles[i].visible = false;
                        self.counters[i].visible = false;
                    }
                } else {
                    for(var i = 0; i < 3; i++) {
                        self.counters[i].visible = true;
                        self.circles[i].visible = true;
                        self.circles[i].percentage = percents[i];
                        self.circles[i].rotation = rotations[i];
                    }
                    self.counters[0].value = "" + p1s1;
                    self.counters[1].value = "" + p1s2;
                    self.counters[2].value = "" + p1s3;
                }

                if(total2 === 0) {
                    for(var i = 3; i < 6; i++) {
                        self.circles[i].visible = false;
                        self.counters[i].visible = false;
                    }
                } else {
                    for(var i = 3; i < 6; i++) {
                        self.circles[i].visible = true;
                        self.counters[i].visible = true;
                        self.circles[i].percentage = percents[i];
                        self.circles[i].rotation = rotations[i];
                    }
                    self.counters[3].value = "" + p2s1;
                    self.counters[4].value = "" + p2s2;
                    self.counters[5].value = "" + p2s3;
                }
            }

        };

        this.draw = function(context) {
            context.drawCircle(this.background);
            for(var circle of this.circles) {
                context.drawCircle(circle);
            }
            for(var text of this.counters) {
                context.drawText(text);
            }
        };
    };

    var Web = function(p1, p2) {
        this.__proto__ = new WebVis.plugin.Entity;

        this.line = new WebVis.renderer.Line;
        this.line.p1 = p1;
        this.line.p2 = p2;
        this.line.color.setColor(1.0, 1.0, 1.0, 1.0);

        this.draw = function(context) {
            context.drawLine(this.line);
        }
    };

    var Gui = function() {
        this.__proto__ = new WebVis.plugin.Entity;

        //this.bg = new WebVis.renderer.Sprite();
        this.bg = new WebVis.renderer.Rect();

        this.draw = function(context) {
            context.drawRect(this.bg);
        };
    };

    // The plugin object for the engine
    var Spiders = function() {
        this.__proto__ = new WebVis.plugin.Base;
        this.projection = new WebVis.renderer.Matrix4x4();
        this.worldLeft = 0;
        this.worldRight = 0;
        this.worldUp = 0;
        this.worldDown = 0;
        this.worldWidth = 40;
        this.worldHeight = 20;
        this.guiStart;

        this.turnChange = function(turn) {
            console.log("updating debug table");
            WebVis.setDebugData(this.data.deltas[parseInt(turn)].game);
        }

        this.predraw = function(context) {
            // aspect ratio management
            //var worldRatio = this.worldWidth / this.worldHeight;
            //var screenSize = context.getScreenSize();
            //var screenRatio = screenSize.width / screenSize.height;
            var guiHeight = this.worldHeight / 4;
            this.projection.ortho(this.worldLeft, this.worldRight, this.worldUp, this.worldDown + guiHeight, 0.001, 1000);

            /*
            if((worldRatio / screenRatio) > 1) {
                this.projection.ortho(this.worldLeft, this.worldRight, this.worldTop, this.worldHeight * ( worldRatio / screenRatio), 0.001, 1000);
            } else {
                this.projection.ortho(this.worldLeft, this.worldRight * (worldRatio / screenRatio), this.worldUp, this.worldDown, 0.001, 1000);
            }
            */
            context.push(this.projection);
        };

        this.postdraw = function(context) {
            context.pop();
        };

        this.loadGame = function(data) {
            this.data = data;
            var i = 0;
            for(var state of data.deltas) {
                i++;
                if(state.type === "start") {
                    this.startFunc(state);
                } else {
                    this.otherFunc(i, state);
                }
            }
        };

        this.startFunc = function(state) {
            var leftBound = 99999999999999;
            var rightBound = 0;
            var topBound = 999999999999999;
            var bottomBound = 0;
            var numNests = 0;
            var numWebs = 0;
            var gui = new Gui();

            // iterate once over the nest to determine the world bounds
            for(var prop in state.game.gameObjects) {
                if(!state.game.gameObjects.hasOwnProperty(prop)) continue;
                var obj  = state.game.gameObjects[prop];

                if(obj.gameObjectName === "Nest") {
                    if(obj.x < leftBound) {
                        leftBound = obj.x;
                    }
                    if(obj.x > rightBound) {
                        rightBound = obj.x;
                    }
                    if(obj.y < topBound) {
                        topBound = obj.y;
                    }
                    if(obj.y > bottomBound) {
                        bottomBound = obj.y;
                    }
                }
            }
            var nestWidth = (rightBound - leftBound)/35;
            this.worldLeft = leftBound - nestWidth;
            this.worldRight = rightBound + nestWidth;
            this.worldUp = topBound - nestWidth;
            this.worldDown = bottomBound + nestWidth;
            this.worldWidth = this.worldRight - this.worldLeft;
            this.worldHeight = this.worldDown - this.worldUp;
            gui.bg.pos = new WebVis.renderer.Point(this.worldLeft, this.worldUp + this.worldHeight + nestWidth, 0); //guistart is just worldHeight though
            gui.bg.width = this.worldWidth;
            gui.bg.height = this.worldHeight / 4;
            gui.bg.color = new WebVis.renderer.Color(1.0, 1.0, 1.0, 1.0);
            this.entities["Gooey"] = gui;


            // iterate over the game objects again to instantiate their entities
            for(var prop in state.game.gameObjects) {
                if(!state.game.gameObjects.hasOwnProperty(prop)) continue;
                var obj = state.game.gameObjects[prop];

                if(obj.gameObjectName === "Nest") {
                    var nest = new Nest(obj.x, obj.y, 0, nestWidth);
                    this.entities[obj.id] = nest;
                    numNests++;
                }

                if(obj.gameObjectName === "Web") {
                    var nesta = state.game.gameObjects[obj.nestA.id];
                    var nestb = state.game.gameObjects[obj.nestB.id];
                    var p1 = new WebVis.renderer.Point(nesta.x, nesta.y, 0);
                    var p2 = new WebVis.renderer.Point(nestb.x, nestb.y, 0);
                    var web = new Web(p1, p2);
                    this.entities[obj.id] = web;
                    numWebs++;
                }
            }

            console.log("Nests: " + numNests);
            console.log("Webs: " + numWebs);

            console.log("leftbound: " + this.worldLeft);
            console.log("rightbound: " + this.worldRight);
            console.log("topbound: " + this.worldUp);
            console.log("bottomBound: " + this.worldDown);
        };

        this.otherFunc = function(turn, state) {
            for(var prop in state.game.gameObjects) {
                if(!state.game.gameObjects.hasOwnProperty(prop)) return;
                var obj = state.game.gameObjects[prop];

                if(obj.gameObjectName === "Nest") {
                    var animFunc = this.entities[obj.id].pieFunc(state.game.gameObjects, obj);
                    this.entities[obj.id].addAnim({
                        channel: "pies",
                        anim : new WebVis.plugin.Animation(turn, turn + 1, animFunc)
                    });
                }
            }

        };
    };

    WebVis.plugin.addPlugin("Spiders", new Spiders);
})();
