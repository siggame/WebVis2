//# sourceURL=Spiders.js

(function() {

    var SpidersEntity = function(id, type) {
            this.__proto__ = new WebVis.plugin.Entity;
            this.id = id;
            this.type = type;
            this.select = function(x, y) {};
    };

    var Nest = function(id, initx, inity, initz, radius) {
        this.__proto__ = new SpidersEntity(id, "nest");
        var self = this;

        this.select = function(x, y) {
            var r = Math.sqrt(Math.pow(initx - x, 2) + Math.pow(inity - y,2));
            if(r < radius) {
                return true;
            } else {
                return false;
            }
        }

        this.circles = [];
        this.counters = []
        this.background = new WebVis.renderer.Circle();

        for(var i = 0; i < 6; i++) {
            var piece = new WebVis.renderer.Circle();

            piece.visible = false;
            piece.center = new WebVis.renderer.Point(initx, inity, initz);
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

        this.background.center = new WebVis.renderer.Point(initx, inity, initz - 1);
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
            start: function() {}
        });

        this.pieChange = function(turn, pieCalc) {
            var p1s1 = pieCalc.p1s1;
            var p1s2 = pieCalc.p1s2;
            var p1s3 = pieCalc.p1s3;
            var p2s1 = pieCalc.p2s1;
            var p2s2 = pieCalc.p2s2;
            var p2s3 = pieCalc.p2s3;

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
                percents[3] = ((0.5) * (p2s3 / total2));
                percents[4] = ((0.5) * (p2s2 / total2));
                percents[5] = ((0.5) * (p2s1 / total2));
                rotations[3] = Math.PI/2;
                rotations[4] = rotations[3] - (percents[3] * 2*Math.PI);
                rotations[5] = rotations[4] - (percents[4] * 2*Math.PI);

            }

            this.addAnim({
                channel: "pies",
                anim: new WebVis.plugin.Animation(turn, turn, function() {
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
                        self.counters[3].value = "" + p2s3;
                        self.counters[4].value = "" + p2s2;
                        self.counters[5].value = "" + p2s1;
                    }
                })
            });
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

    var Web = function(id, p1, p2) {
        this.__proto__ = new SpidersEntity(id, "web");
        var self = this;

        this.line = new WebVis.renderer.Line;
        this.line.p1 = p1;
        this.line.p2 = p2;
        this.line.color.setColor(1.0, 1.0, 1.0, 1.0);

        this.addChannel({
            name: "alive",
            start: function() {
                self.line.visible = false;
            }
        })

        this.aliveAnim = function() {
            return function(completion) {
                if(completion === 1) {
                    self.line.visible = false;
                } else {
                    self.line.visible = true;
                }
            };
        }

        this.draw = function(context) {
            context.drawLine(this.line);
        }

//base plugin.js, main.js
        this.select = function(x3, y3)
        {
            var u = ((x3 - p1.x) * (p2.x - p1.x) ) + ((y3 - p1.y) * (p2.y - p1.y) );
            var t_point = new WebVis.renderer.Point (p1.x - p2.x, p1.y - p2.y);
            var normsqrd = (t_point.x * t_point.x) + (t_point.y * t_point.y);
            u /= normsqrd;
            var t_x = p1.x + u * (p2.x - p1.x);
            var t_y = p1.y + u * (p2.y - p1.y);

            var t_distance = Math.sqrt(((t_x - x3) * (t_x - x3)) + ((t_y - y3) * (t_y - y3)));
            //need some sort of global constant for clicking distance
            if(t_distance <= .5)
            {
                return true;
            }
            return false;
        }
    };

    var BroodMother = function(id, initx, inity, radius) {
        this.__proto__ = new SpidersEntity(id, "BroodMother");

        this.rect = new WebVis.renderer.Rect();
        this.rect.pos.x = initx - radius/4;
        this.rect.pos.y = inity - radius/4;
        this.rect.pos.z = 2;
        this.rect.width = radius/2;
        this.rect.height = radius/2;
        this.rect.color.setColor(0.0, 0.0, 0.0, 1.0);

        this.draw = function(context) {
            context.drawRect(this.rect);
        }
    };

    var Gui = function(p1name, p2name, worldLeft, worldUp, worldRight, worldDown, worldWidth, worldHeight) {
        this.__proto__ = new SpidersEntity(null, "gui");
        var self = this;
        this.bg = new WebVis.renderer.Rect();

        var guiUnit = worldWidth/100;
        var guiStartX = worldLeft;
        var guiStartY = worldUp + worldHeight;
        var guiUnitW = worldWidth/100;
        var guiUnitH = worldHeight/4/20;
        var healthBarMaxWidth = 46 * guiUnitW;
        var healthBarHeight = 6 * guiUnitH;

        this.bg.pos = new WebVis.renderer.Point(worldLeft, worldUp + worldHeight, 0);
        this.bg.width = worldWidth;
        this.bg.height = worldHeight / 4;
        this.bg.color = new WebVis.renderer.Color(1.0, 1.0, 1.0, 1.0);

        this.p1name = new WebVis.renderer.Text();
        this.p1name.size = 36;
        this.p1name.maxWidth = 1500;
        this.p1name.value = p1name;
        this.p1name.color = new WebVis.renderer.Color(1, 0.6, 0, 1.0);
        this.p1name.pos = new WebVis.renderer.Point(worldLeft + 2 * (worldWidth/100), this.bg.pos.y + (this.bg.height / 5), 0);
        this.p1name.maxWidth = worldWidth / 5;

        this.p2name = new WebVis.renderer.Text();
        this.p2name.color = new WebVis.renderer.Color(0.3, 0.6, 0.1, 1.0);
        this.p2name.size = 36;
        this.p2name.maxWidth = 1500;
        this.p2name.value = p2name;
        this.p2name.pos = new WebVis.renderer.Point(worldRight - 2 * (worldWidth/100), this.bg.pos.y + (this.bg.height / 5), 0);
        this.p2name.alignment = "right";

        // Health Bars
        this.p1HealthGreen = new WebVis.renderer.Rect();
        this.p1HealthRed = new WebVis.renderer.Rect();
        this.p2HealthGreen = new WebVis.renderer.Rect();
        this.p2HealthRed = new WebVis.renderer.Rect();

        this.p1HealthGreen.color.setColor(0.0, 1.0, 0.0, 1.0);
        this.p1HealthRed.color.setColor(1.0, 0.0, 0.0, 1.0);
        this.p2HealthGreen.color.setColor(0.0, 1.0, 0.0, 1.0);
        this.p2HealthRed.color.setColor(1.0, 0.0, 0.0, 1.0);

        this.p1HealthRed.width = healthBarMaxWidth;
        this.p2HealthRed.width = healthBarMaxWidth;
        this.p1HealthGreen.width = healthBarMaxWidth; // needs to be set to the current health for player 1
        this.p2HealthGreen.width = healthBarMaxWidth; // needs to be set to the current health for player 2

        this.p1HealthRed.height = healthBarHeight;
        this.p2HealthRed.height = healthBarHeight;
        this.p1HealthGreen.height = healthBarHeight;
        this.p2HealthGreen.height = healthBarHeight;

        this.p1HealthGreen.pos.x = guiStartX + (2 * guiUnitW);
        this.p1HealthGreen.pos.y = guiStartY + (6 * guiUnitH);

        this.p1HealthRed.pos.x = guiStartX + (2 * guiUnitW);
        this.p1HealthRed.pos.y = guiStartY + (6 * guiUnitH);

        this.p2HealthGreen.pos.x = guiStartX + (52 * guiUnitW);
        this.p2HealthGreen.pos.y = guiStartY + (6 * guiUnitH);

        this.p2HealthRed.pos.x = guiStartX + (52 * guiUnitW);
        this.p2HealthRed.pos.y = guiStartY + (6 * guiUnitH);

        this.p1HealthAmount = new WebVis.renderer.Text();
        this.p1HealthAmount.color.setColor(0.0, 0.0, 0.0, 1.0);
        this.p1HealthAmount.size = 14;
        this.p1HealthAmount.maxWidth = 100;
        this.p1HealthAmount.pos.x = this.p1HealthRed.pos.x + healthBarMaxWidth/2;
        this.p1HealthAmount.pos.y = this.p1HealthRed.pos.y + healthBarHeight/2;
        this.p1HealthAmount.alignment = "center"
        this.p1HealthAmount.baseline = "middle";

        this.p2HealthAmount = new WebVis.renderer.Text();
        this.p2HealthAmount.color.setColor(0.0, 0.0, 0.0, 1.0);
        this.p2HealthAmount.size = 14;
        this.p2HealthAmount.maxWidth = 100;
        this.p2HealthAmount.pos.x = this.p2HealthRed.pos.x + healthBarMaxWidth/2;
        this.p2HealthAmount.pos.y = this.p2HealthRed.pos.y + healthBarHeight/2;
        this.p2HealthAmount.alignment = "center"
        this.p2HealthAmount.baseline = "middle";

        var maxBroodHealth = 0;
        this.addChannel({
            name: "p1healthbar",
            start: function() {
                self.p1HealthGreen.width = healthBarMaxWidth;
                self.p1HealthAmount.value = "" + maxBroodHealth + "/" + maxBroodHealth;
            }
        });

        this.addChannel({
            name: "p2healthbar",
            start: function() {
                self.p2HealthGreen.width = healthBarMaxWidth;
                self.p2HealthAmount.value = "" + maxBroodHealth + "/" + maxBroodHealth;
            }
        });

        this.setMaxBroodHealth = function(maxHealth) {
            maxBroodHealth = maxHealth;
        };

        this.p1healthChange = function(turn, p1brood) {
            this.addAnim({
                channel: 'p1healthbar',
                anim: new WebVis.plugin.Animation(turn, turn, function(completion) {
                    self.p1HealthGreen.width = healthBarMaxWidth * (p1brood.health / maxBroodHealth);
                    self.p1HealthAmount.value = "" + p1brood.health + "/" + maxBroodHealth;
                })
            });
        };

        this.p2healthChange = function(turn, p2brood) {
            this.addAnim({
                channel: 'p2healthbar',
                anim: new WebVis.plugin.Animation(turn, turn, function(completion) {
                    self.p2HealthGreen.width = healthBarMaxWidth * (p2brood.health / maxBroodHealth);
                    self.p2HealthAmount.value = "" + p2brood.health + "/" + maxBroodHealth;
                })
            });
        };

        this.draw = function(context) {
            context.drawRect(this.bg);
            context.drawRect(this.p1HealthGreen);
            context.drawRect(this.p1HealthRed);
            context.drawRect(this.p2HealthGreen);
            context.drawRect(this.p2HealthRed);
            context.drawText(this.p1name);
            context.drawText(this.p2name);
            context.drawText(this.p1HealthAmount);
            context.drawText(this.p2HealthAmount);
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
        this.currentSelection = null;

        this.turnChange = function(turn) {
            // console.log("updating debug table");
            if(this.currentSelection === null) {
                WebVis.setDebugData(this.data.deltas[parseInt(turn)].game);
            } else {
                WebVis.setDebugData(this.data.deltas[parseInt(WebVis.game.currentTurn)].game.gameObjects[this.currentSelection]);
            }
        };

        this.selectEntity = function(x, y) {
            console.log(x + " " + y);
            var screenSize = WebVis.renderer.context.getScreenSize();
            var nx = x / screenSize.width;
            var ny = y / screenSize.height;
            var worldx = this.worldLeft + (nx * this.worldWidth);
            var worldy = this.worldUp + (ny * (this.worldHeight + this.entities["Gooey"].bg.height));

            var selectionMade = false;
            for(var prop in this.entities) {
                if(!this.entities.hasOwnProperty(prop)) continue;
                var ent = this.entities[prop];

                if(ent.select(worldx, worldy)) {
                    this.currentSelection = ent.id;
                    WebVis.setDebugData(this.data.deltas[parseInt(WebVis.game.currentTurn)].game.gameObjects[ent.id]);
                    selectionMade = true;
                    break;
                }
            }
            if(!selectionMade) {
                WebVis.setDebugData(this.data.deltas[parseInt(WebVis.game.currentTurn)].game);
            }
        };

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

        this.loadGame = function(data, callback) {
            var self = this;
            this.data = data;
            var i = 0;

            var leftBound = 99999999999999;
            var rightBound = 0;
            var topBound = 999999999999999;
            var bottomBound = 0;
            var p1name, p2name;

            // iterate once over the nest to determine the world bounds
            for(var prop in data.deltas[0].game.gameObjects) {
                if(!data.deltas[0].game.gameObjects.hasOwnProperty(prop)) continue;
                var obj  = data.deltas[0].game.gameObjects[prop];
                if(obj.gameObjectName === "Player")
                {
                    if(obj.id < obj.otherPlayer.id)
                    {
                        p1name = obj.name;
                        p2name = data.deltas[0].game.gameObjects[obj.otherPlayer.id].name;
                    }
                }
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

            this.nestWidth = (rightBound - leftBound)/35;
            this.worldLeft = leftBound - this.nestWidth;
            this.worldRight = rightBound + this.nestWidth;
            this.worldUp = topBound - this.nestWidth;
            this.worldDown = bottomBound + this.nestWidth;
            this.worldWidth = this.worldRight - this.worldLeft;
            this.worldHeight = this.worldDown - this.worldUp;

            var gui = new Gui(p1name, p2name, this.worldLeft, this.worldUp, this.worldRight, this.worldDown, this.worldWidth, this.worldHeight);
            this.entities["Gooey"] = gui;

            // set the maxhealth of a brood mother
            var p1 = data.deltas[0].game.gameObjects[data.deltas[0].game.players[0].id];
            var brood1 = data.deltas[0].game.gameObjects[p1.broodMother.id];
            gui.setMaxBroodHealth(brood1.health);

            var pacingFunction = function() {
                var start = new Date().getTime();
                do {
                    self.handleDelta(i, data.deltas[i]);
                    i++;
                    callback("update", i/data.deltas.length);
                } while(i < data.deltas.length - 1 && (new Date().getTime() - start < 50));

                if(i < data.deltas.length - 1) {
                    setTimeout(pacingFunction, 10);
                } else {
                    callback("finish", null);
                }
            }
            pacingFunction();
            console.log("leftbound: " + this.worldLeft);
            console.log("rightbound: " + this.worldRight);
            console.log("topbound: " + this.worldUp);
            console.log("bottomBound: " + this.worldDown);
        };

        this.spiderlingCalc = function(obj, state) {
            var ret = {
                p1s1 : 0,
                p1s2 : 0,
                p1s3 : 0,
                p2s1 : 0,
                p2s2 : 0,
                p2s3 : 0
            };

            for(var prop in obj.spiders) {
                if(!obj.spiders.hasOwnProperty(prop)) return;
                if(prop === "&LEN") continue;

                var spider = state.game.gameObjects[obj.spiders[prop].id];

                if(typeof spider === "undefined") continue;
                if(spider.gameObjectName === "BroodMother") continue;

                if(spider.owner.id === "0") {
                    if(spider.gameObjectName === "Spitter") {
                        ret.p1s1++;
                    } else if(spider.gameObjectName === "Weaver") {
                        ret.p1s2++;
                    } else if(spider.gameObjectName === "Cutter") {
                        ret.p1s3++;
                    }
                } else {
                    if(spider.gameObjectName === "Spitter") {
                        ret.p2s1++;
                    } else if(spider.gameObjectName === "Weaver") {
                        ret.p2s2++;
                    } else if(spider.gameObjectName === "Cutter") {
                        ret.p2s3++;
                    }
                }
            }

            return ret;
        }

        this.handleDelta = function(turn, state) {
            if(state.game === undefined) return;

            // iterate over the game objects again to instantiate their entities
            for(var prop in state.game.gameObjects) {
                if(!state.game.gameObjects.hasOwnProperty(prop)) return;
                var obj = state.game.gameObjects[prop];

                if(obj.gameObjectName === "Nest") {
                    if(this.entities[obj.id] === undefined) {
                        var nest = new Nest(obj.id, obj.x, obj.y, 0, this.nestWidth);
                        this.entities[obj.id] = nest;
                    }

                    if(turn === 0) {
                        var calc = this.spiderlingCalc(obj, state);
                        this.entities[obj.id].pieChange(turn, calc);
                    } else {
                        var lastneststate = this.data.deltas[turn - 1].game.gameObjects[obj.id];
                        var laststate = this.data.deltas[turn -1];
                        var calc = this.spiderlingCalc(obj, state);
                        var calcLast = this.spiderlingCalc(lastneststate, laststate);

                        if(
                            calc.p1s1 !== calcLast.p1s1 ||
                            calc.p1s2 !== calcLast.p1s2 ||
                            calc.p1s3 !== calcLast.p1s3 ||
                            calc.p2s1 !== calcLast.p2s1 ||
                            calc.p2s2 !== calcLast.p2s2 ||
                            calc.p2s3 !== calcLast.p2s3
                        ) {
                            this.entities[obj.id].pieChange(turn, calc);
                        }

                    }
                }

                if(obj.gameObjectName === "BroodMother") {
                    if(this.entities[obj.id] === undefined) {
                        var nest = state.game.gameObjects[obj.nest.id];
                        var bm = new BroodMother(obj.id, nest.x, nest.y, this.nestWidth);
                        this.entities[obj.id] = bm;
                    }

                    if(turn > 0) {
                        var bm = this.entities[obj.id];
                        var lastbmstate = this.data.deltas[turn - 1].game.gameObjects[obj.id];
                        if(lastbmstate.health !== obj.health) {
                            if(obj.owner.id === "0") {
                                this.entities["Gooey"].p1healthChange(turn, obj);
                            } else {
                                this.entities["Gooey"].p2healthChange(turn, obj);
                            }
                        }
                    }
                }

                if(obj.gameObjectName === "Web" && this.entities[obj.id] === undefined) {
                    var nesta = state.game.gameObjects[obj.nestA.id];
                    var nestb = state.game.gameObjects[obj.nestB.id];
                    var p1 = new WebVis.renderer.Point(nesta.x, nesta.y, 0);
                    var p2 = new WebVis.renderer.Point(nestb.x, nestb.y, 0);
                    var web = new Web(obj.id, p1, p2);var webdied = false;
                    for(var i = turn; i < this.data.deltas.length; i++) {
                        var webstate = this.data.deltas[i].game.gameObjects[obj.id];
                        if(webstate.strength <= 0) {
                            web.addAnim({
                                channel: "alive",
                                anim: new WebVis.plugin.Animation(turn, i, web.aliveAnim())
                            });
                            webdied = true;
                            break;
                        } else if(i === this.data.deltas.length - 1) {
                            web.addAnim({
                                channel: "alive",
                                anim: new WebVis.plugin.Animation(turn, this.data.deltas.length, web.aliveAnim())
                            });
                        }
                    }
                    if(webdied === false) {
                        web.addAnim({
                            channel: "alive",
                            anim: new WebVis.plugin.Animation(turn, i, web.aliveAnim())
                        });
                    }
                    this.entities[obj.id] = web;
                }
            }
        };

    };

    WebVis.plugin.addPlugin("Spiders", new Spiders);
})();
