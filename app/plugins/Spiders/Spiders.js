//# sourceURL=Spiders.js

(function() {

    var Nest = function(initx, inity, initz, radius) {
        this.__proto__ = new WebVis.plugin.Entity;

        this.circles = [];
        this.background = new WebVis.renderer.Circle();

        for(var i = 0; i < 6; i++) {
            var piece = new WebVis.renderer.Circle();

            piece.center.x = initx;
            piece.center.y = inity;
            piece.center.z = initz;
            piece.radius = radius;
            piece.percentage = (1/6);
            piece.rotation = (5/6 * Math.PI) + (((1/6) * 2*Math.PI) * i);
            piece.resolution = 4;
            this.circles.push(piece);
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

        this.draw = function(context) {
            context.drawCircle(this.background);
            for(var circle of this.circles) {
                context.drawCircle(circle);
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
            for(var state of data.deltas) {
                if(state.type === "start") {
                    this.startFunc(state);
                }

                // TODO: start making animations with subsequent deltas
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
            gui.bg.pos = new WebVis.renderer.Point(this.worldLeft, this.worldHeight, 0); //guistart is just worldHeight though
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

        }
    };

    WebVis.plugin.addPlugin("Spiders", new Spiders);
})();
