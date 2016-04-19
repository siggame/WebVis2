WebVis.ready(function() {

    var Point = (function() {
        var constructor = function(x, y, z) {
            if(x !== undefined) {
                this.x = x;
            } else {
                this.x = 0;
            }
            if(y !== undefined) {
                this.y = y;
            } else {
                this.y = 0;
            }
            if(z !== undefined) {
                this.z = z;
            } else {
                this.z = 0;
            }

            this.w = 1;
        };

        constructor.prototype.cross = function(pOther) {
            var result = new Point();
            result.x = (this.y * pOther.z) - (this.z * pOther.y);
            result.y = (this.z * pOther.x) - (this.x * pOther.z);
            result.z = (this.x * pOther.y) - (this.y * pOther.x);

            return result;
        };

        constructor.prototype.normalize = function() {
            var mag = Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
            if(mag === 0) return;
            this.x /= mag;
            this.y /= mag;
            this.z /= mag;
        };

        return constructor;
    })();

    var Matrix4x4 = (function() {
        var constructor = function(param) {
            this.elements = new Float32Array(16);
            if(param === undefined) {
                // identity by default
                this.identity();
            } else {
                for(var i = 0; i < 16; i++) {
                    this.elements[i] = param.elements[i];
                }
            }
        };

        constructor.prototype.get = function(row, col) {
            if(row < 0 || row > 3 || col < 0 || col > 3) {
                console.error("Matrix out of bounds.");
                return;
            }
            return this.elements[row + col*4];
        };

        constructor.prototype.set = function(row, col, val) {
            if(row < 0 || row > 3 || col < 0 || col > 3) {
                console.error("Matrix out of bounds.");
                return;
            }
            this.elements[row + col*4] = val;
        };

        constructor.prototype.copy = function(mat) {
            for(var i = 0; i < 16; i++) {
                this.elements[i] = mat.elements[i];
            }
        };

        constructor.prototype.scale = function(sx, sy, sz) {
            var newmat = new Matrix4x4(this);

            // no need to do the bottom row on homogeneous matrices
            for(var i = 0; i < 4; i++) {
                newmat.set(0,i, this.get(0,i) * sx);
            }
            for(var i = 0; i < 4; i++) {
                newmat.set(1,i, this.get(1,i) * sy);
            }
            for(var i = 0; i < 4; i++) {
                newmat.set(2,i, this.get(2,i) * sz);
            }

            this.elements = newmat.elements;
        };

        constructor.prototype.rotate = function(rad) {
            var newmat = new Matrix4x4(this);
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);

            // rotations are only around the z axis, so only the first two rows change
            for(var i = 0; i < 4; i++) {
                newmat.set(0, i, (this.get(0, i) *cos) - (this.get(1, i) * sin));
            }

            for(var i = 0; i < 4; i++) {
                newmat.set(1, i, (this.get(0, i) *sin) + (this.get(1, i) * cos));
            }

            this.elements = newmat.elements;
        };

        constructor.prototype.translate = function(tx, ty, tz) {
            var newmat = new Matrix4x4(this);
            if(typeof tx === "undefined") tx = 0;
            if(typeof ty === "undefined") ty = 0;
            if(typeof tz === "undefined") tz = 0;
            newmat.set(0, 3, this.get(0,3) + tx);
            newmat.set(1, 3, this.get(1,3) + ty);
            newmat.set(2, 3, this.get(2,3) + tz);

            this.elements = newmat.elements;
        };

        constructor.prototype.mul = function(point, param2, param3) {
            var xt, yt, zt;
            if(typeof param2 === "undefined") {
                xt = point.x;
                yt = point.y;
                zt = point.z;
            } else {
                xt = point;
                yt = param2;
                zt = param3;
            }

            var x = (this.get(0, 0) * xt) +
                    (this.get(0, 1) * yt) +
                    (this.get(0, 2) * zt) +
                    this.get(0, 3);

            var y = (this.get(1, 0) * xt) +
                    (this.get(1, 1) * yt) +
                    (this.get(1, 2) * zt) +
                    this.get(1, 3);

            var z = (this.get(2, 0) * xt) +
                    (this.get(2, 1) * yt) +
                    (this.get(2, 2) * zt) +
                    this.get(2, 3);

            return {
              x: x,
              y: y,
              z: z
            };
        };

        constructor.prototype.mulmat = function(mat) {
            var newmat = new Matrix4x4();
            for(var row = 0; row < 4; row++) {
                for(var col = 0; col < 4; col++) {
                    var val = 0;
                    for(var k = 0; k < 4; k++) {
                        val += this.get(k, col) * mat.get(row, k);
                    }
                    newmat.set(row, col, val);
                }
            }
            return newmat;
        }

        constructor.prototype.identity = function() {
            for(var i = 0; i < 4; i++) {
                for(var j = 0; j < 4; j++) {
                    this.set(i, j, 0);
                }
            }

            for(var i = 0; i < 4; i++) {
                this.set(i, i, 1);
            }
        };

        constructor.prototype.ortho = function(l, r, t, b, n, f) {
            this.set(0, 0, 2/(r - l));
            this.set(1, 1, 2/(t - b));
            this.set(2, 2, -2/(f - n));
            this.set(0, 3, -(r + l)/(r - l));
            this.set(1, 3, -(t + b)/(t - b));
            this.set(2, 3, -(f + n)/(f - n));
        };

        return constructor;
    })();

    var Line = function(x1, y1, z1, x2, y2, z2) {
        this.visible = true;
        this.color = new Color();
        this.p1 = new Point(x1, y1, z1);
        this.p2 = new Point(x2, y2, z2);
    };

    var Color = (function() {
        var constructor = function(r, g, b, a) {
            this.visible = true;
            if(r !== undefined) {
                this.r = r;
            } else {
                this.r = 1.0;
            }

            if(g !== undefined) {
                this.g = g;
            } else {
                this.g = 1.0;
            }

            if(b !== undefined) {
                this.b = b;
            } else {
                this.b = 1.0;
            }

            if(a !== undefined) {
                this.a = a;
            } else {
                this.a = 1.0;
            }
        };

        constructor.prototype.setColor = function(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        };

        constructor.prototype.toCss = function() {
            var r = parseInt(this.r * 255);
            r = r.toString(16);
            if(r.length === 1) {
                r = "0" + r;
            }

            var g = parseInt(this.g * 255);
            g = g.toString(16);
            if(g.length === 1) {
                g = "0" + g;
            }

            var b = parseInt(this.b * 255);
            b = b.toString(16);
            if(b.length === 1) {
                b = "0" + b;
            }

            var a = parseInt(this.a * 255);
            a = a.toString(16);
            if(a.length === 1) {
                a = "0" + a;
            }
            return "#" + r + g + b;
        };

        return constructor;
    })();

    var Sprite = function() {
        this.visible = true;
        this.texture = null;
        this.frame = 0;
        this.pos = new Point(0, 0, 0.0);
        this.width = 1.0;
        this.height = 1.0;
        this.rotation = 0.0;
        this.centerx = 0.5;
        this.centery = 0.5;
        this.u1 = 0.0;
        this.v1 = 0.0;
        this.u2 = 1.0;
        this.v2 = 1.0;
        this.tileWidth = 1.0;
        this.tileHeight = 1.0;
        this.tileOffsetX = 0.0;
        this.tileOffsetY = 0.0;
        this.color = new Color(1.0, 1.0, 1.0, 1.0);
    };

    var Rect = function() {
        this.visible = true;
        this.pos = new Point(0, 0, 1.0);
        this.width = 1.0;
        this.height = 1.0;
        this.rotation = 0.0;
        this.centerx = 0.5;
        this.centery = 0.5;
        this.color = new Color(0, 0, 0, 1.0);
    };

    var Path = (function() {
        var constructor = function() {
            this.visible = true;
            this.curPos = new Point(0, 0, 0);
            this.points = [];
            this.strokeColor = new Color(0, 0, 0, 0);
        };

        constructor.prototype.moveTo = function(x, y) {
            this.curPos.x = x;
            this.curPos.y = y;
        };

        constructor.prototype.lineTo = function(x, y) {
            this.points.push(new Line(this.curPos,
                new Point(x,y)));
        };

        return constructor;
    })();

    var Text = function() {
        this.visible = true;
        this.font = "sans-serif";
        this.value = "";
        this.alignment = "left";
        this.baseline = "alphabetic"
        this.pos = new Point(0, 0, 0);
        this.maxWidth = 0.0;
        this.size = 12;
        this.color = new Color(0, 0, 0, 1.0);
    };

    var Circle = function() {
        this.visible = true;
        this.center = new Point(0, 0, 0);
        this.rotation = 0;
        this.radius = 1;
        this.color = new Color(0, 0, 0, 1.0);
        this.resolution = 16;
        this.percentage = 1.0;
    }

    var Camera = (function() {
        var constructor = function() {
            this.transform = new Matrix4x4();
        }

        constructor.prototype.lookat = function(pos, target) {
            var up = new Point(0, 1, 0)

            var forward = new Point(target.x - pos.x, target.y - pos.y, target.z - pos.z);
            forward.normalize();

            var right = up.cross(forward);
            right.normalize();

            if(right.x === 0 && right.y === 0 && right.z === 0) {
                right = new Point(0, 0, 1);
            }

            up = forward.cross(right);
            up.normalize();

            this.transform.set(0, 0, right.x);
            this.transform.set(1, 0, right.y);
            this.transform.set(2, 0, right.z);
            this.transform.set(0, 1, up.x);
            this.transform.set(1, 1, up.y);
            this.transform.set(2, 1, up.z);
            this.transform.set(0, 2, forward.x);
            this.transform.set(1, 2, forward.y);
            this.transform.set(2, 2, forward.z);
            this.transform.set(0, 3, pos.x);
            this.transform.set(1, 3, pos.y);
            this.transform.set(2, 3, pos.z);
        };

        return constructor;
    })();

    var BaseContext = (function() {
        var constructor = function(){};

        constructor.prototype.push = function(mat) {
            throw "Function not implemented.";
        }

        constructor.prototype.pop = function() {
            throw "Function not implemented.";
        }

        constructor.prototype.setCamera = function(camera) {
            throw "Function not implemented.";
        };

        constructor.prototype.resetCamera = function() {
            throw "Function not implemented.";
        };

        constructor.prototype.getScreenSize = function() {
            throw "Function not implemented.";
        };

        constructor.prototype.loadTextures = function(callback) {
            throw "Function not implemented.";
        };

        constructor.prototype.texturesLoaded = function() {
            throw "Function not implemented.";
        };

        constructor.prototype.setClearColor = function(color) {
            throw "Function not implemented.";
        };

        constructor.prototype.begin = function(color) {
            throw "Function not implemented.";
        };

        constructor.prototype.end = function() {
            throw "Function not implemented.";
        };

        constructor.prototype.drawRect = function(rect) {
            throw "Function not implemented.";
        };

        constructor.prototype.drawSprite = function(tex) {
            throw "Function not implemented.";
        };

        constructor.prototype.drawLine = function(line) {
            throw "Function not implemented.";
        };

        constructor.prototype.drawText = function(text) {
            throw "Function not implemented.";
        };

        constructor.prototype.drawCircle = function(circle) {
            throw "Function not implemented.";
        };

        return constructor;
    })();

    var WebGLContext = (function() {
        var constructor = function(canvas, worldWidth, worldHeight, readyAction) {
            var self = this;

            // create members
            this.canvas = null;
            this.textCanvas = null;
            this.gl = null;
            this.texturesLoaded = null;
            this.textures = null;
            this.sheetData = null;
            this.projection = null;
            this.currentCamera = null;
            this.rects = null;
            this.textures = null;
            this.lines = null;
            this.texts = null;
            this.FAR = 1000;
            this.NEAR = 0.001

            // hard coded orthograph initially
            this.projection = new Matrix4x4();
            this.projections = [];
            this.projections.push(this.projection);

            // set up the default camera
            var pos = new Point(0, 0, -10);
            var target = new Point();
            this.currentCamera = new Camera();
            this.currentCamera.lookat(pos, target);

            // obtain the necessary webgl context
            this.canvas = canvas;
            this.gl = this.canvas.getContext("webgl", {antialias: true, depth: true});
            if(this.context === undefined) {
                this.gl = this.canvas.getContext("experimental-webgl");
                if(this.gl === undefined) {
                    throw "This browser does not support webgl.";
                }
            }

            // specify webgl alpha blending and set clear color to white
            this.gl.enable(this.gl.BLEND);
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

            // create the canvas over the main canvas to contain text rendered with a 2d context
            this.textCanvas = document.createElement('canvas');
            var $textCanvas = $(this.textCanvas);
            $textCanvas.css('pointer-events', 'none');
            this.textCanvas.width = this.canvas.width;
            this.textCanvas.height = this.canvas.height;
            this.textCanvasCtx = this.textCanvas.getContext("2d");
            if(this.textCanvasCtx === undefined) {
                throw "This browser does not support HTML5 Canvas";
            }
            $(canvas).parent().append(this.textCanvas);
            $textCanvas.addClass("webvis-canvas-layer");

            // initialize the shared buffer
            this.drawBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.drawBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, 1000000, this.gl.DYNAMIC_DRAW);

            this.indexBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, 1000000, this.gl.DYNAMIC_DRAW);

            this.Buffer = function(vertex_size) {
                this.num = 0;           // number of vertices to draw
                this.offset = 0;
                this.vertex_size = vertex_size;   // number of floats in a vertex
                this.buffer = [];       // the current array of vertices to draw
                this.indexBuffer = [];  // the list of indices to use in order
            };

            // initialize the buffer holders
            var projElements = this.projection.elements;
            this.rects = {};
            this.sprites = {};
            this.lines = {};
            this.circles = {};

            // create and initialize shaders
            var getShader = function(shaderDesc, callback) {
                var vshaderSource = null;
                var fshaderSource = null;
                var promise = $.when(
                    $.get(shaderDesc.vs, function(text) {
                        vshaderSource = text;
                    }),
                    $.get(shaderDesc.fs, function(text) {
                        fshaderSource = text;
                    })
                ).then(function() {
                    var vshader = self.gl.createShader(self.gl.VERTEX_SHADER);
                    self.gl.shaderSource(vshader, vshaderSource);
                    self.gl.compileShader(vshader);
                    if(!self.gl.getShaderParameter(vshader, self.gl.COMPILE_STATUS)) {
                        console.error(self.gl.getShaderInfoLog(vshader));
                        throw "vertex shader did not compile correctly.";
                    }

                    var fshader = self.gl.createShader(self.gl.FRAGMENT_SHADER);
                    self.gl.shaderSource(fshader, fshaderSource);
                    self.gl.compileShader(fshader);
                    if(!self.gl.getShaderParameter(fshader, self.gl.COMPILE_STATUS)) {
                        console.error(self.gl.getShaderInfoLog(fshader));
                        throw "vertex shader did not compile correctly.";
                    }

                    var prog = self.gl.createProgram();
                    self.gl.attachShader(prog, vshader);
                    self.gl.attachShader(prog, fshader);
                    self.gl.linkProgram(prog);
                    if(!self.gl.getProgramParameter(prog, self.gl.LINK_STATUS)) {
                        throw "Shader program could not be linked.";
                    }

                    callback(prog);
                    return;
                });

                return promise;
            };

            $.when(
                getShader({
                    vs: "/scripts/shaders/colorShader.vs",
                    fs: "/scripts/shaders/colorShader.fs"
                }, function(prog) {
                    self.colorProg = prog;

                    // arrays
                    prog.aVertPos = self.gl.getAttribLocation(prog, "aVertPos");
                    prog.aVertColor = self.gl.getAttribLocation(prog, "aVertColor");

                    // uniforms
                    prog.uPMatrix = self.gl.getUniformLocation(prog, "uPMatrix");
                    prog.uVMatrix = self.gl.getUniformLocation(prog, "uVMatrix");
                }),
                getShader({
                    vs: "/scripts/shaders/textureShader.vs",
                    fs: "/scripts/shaders/textureShader.fs"
                }, function(prog) {
                    self.textureProg = prog;

                    // arrays
                    prog.aVertPos = self.gl.getAttribLocation(prog, "aVertPos");
                    prog.aTexCoord = self.gl.getAttribLocation(prog, "aTexCoord");

                    // uniforms
                    prog.uPMatrix = self.gl.getUniformLocation(prog, "uPMatrix");
                    prog.uVMatrix = self.gl.getUniformLocation(prog, "uVMatrix");
                    prog.uSampler = self.gl.getUniformLocation(prog, "uSampler");
                    prog.uTint = self.gl.getUniformLocation(prog, "uTint");
                })
            ).then(function() {
                readyAction();
            });
        };

        // attach the prototype basecontext prototype
        constructor.prototype = BaseContext;

        constructor.prototype.push = function(mat) {
            var newMat = mat.mulmat(this.projection);
            this.projections.push(newMat);
            this.projection = newMat;
        };

        constructor.prototype.pop = function() {
            this.projections.pop();
            this.projection = this.projections[this.projections.length - 1];
        };

        constructor.prototype.setCamera = function(camera) {
            this.currentCamera = camera;
        };

        constructor.prototype.resetCamera = function() {
            this.currentCamera = null;
        };

        constructor.prototype.getScreenSize = function() {
            return {
                width: this.canvas.clientWidth,
                height: this.canvas.clientHeight
            };
        };

        constructor.prototype.loadTextures = function(pluginName, callback) {
            var self = this;
            this.texturesLoaded = false;
            this.textures = {};
            this.sheetData = {};
            var u = "/plugins/" + pluginName + "/resources.json";

            var loadImage = function(url, callback) {
                var deferred = $.Deferred();

                // create a basic document image to populate
                var image = new Image();

                var unbindEvents = function() {
                    image.onload = null;
                    image.onerror = null;
                    image.onabort = null;
                };
                var loaded = function() {
                    unbindEvents();
                    callback(image);
                    deferred.resolve(image);
                };
                var errored = function() {
                    unbindEvents();
                    deferred.reject(image);
                };

                image.onload = loaded;
                image.onerror = errored;
                image.onabort = errored;
                image.src = url;
                return deferred.promise();
            };

            var getTextures = function(data) {
                if(data.resources.length === 0) {
                    this._texturesLoaded = true;
                }
                var deferreds = [];

                // for each texture in the resource list
                for(var resource of data.resources) {
                    // load the texture
                    var url = "/plugins/" + pluginName + "/images/" + resource.image;
                    self.textures[resource.id] = {
                        texture: null,
                        spriteSheet: null
                    };
                    var dat = self.textures[resource.id];

                    // callback to handle initializing the texture
                    var initTexture = function(data) {
                        return function(image) {
                            data.texture = self.gl.createTexture();
                            self.gl.bindTexture(self.gl.TEXTURE_2D, data.texture);
                            self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.gl.RGBA, self.gl.RGBA, self.gl.UNSIGNED_BYTE, image);
                            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_MAG_FILTER, self.gl.NEAREST);
                            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_MIN_FILTER, self.gl.NEAREST);
                            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_WRAP_S, self.gl.REPEAT);
                            self.gl.texParameteri(self.gl.TEXTURE_2D, self.gl.TEXTURE_WRAP_T, self.gl.REPEAT);
                            self.gl.bindTexture(self.gl.TEXTURE_2D, null);
                        };
                    };

                    // callback for initializing the sprite sheet
                    var initSpriteSheet = function(data) {
                        return function(sheet) {
                            data.spriteSheet = sheet;
                        };
                    };

                    // obtain the deferred for loading the image
                    deferreds.push(loadImage(url, initTexture(dat)));

                    // if it is an animation and has a corresponding sprite sheet
                    if(resource.spriteSheet !== null) {
                        var spriteSheetUrl = "/plugins/" + pluginName + "/images/" + resource.spriteSheet;

                        // obtain the deferred for loading the sprite sheet
                        deferreds.push($.ajax({
                            dataType: "json",
                            url: spriteSheetUrl,
                            data: null,
                            success : initSpriteSheet(dat)
                        }));
                    }

                    console.log("started loading texture");
                }

                // when everything is done, tell that all textures are loaded.
                $.when.apply($, deferreds)
                .then( function() {
                    self.texturesLoaded = true;
                    console.log("done");
                    callback();
                });
            };

            // start the load of the textures
            $.ajax({
                dataType : "json",
                url : u,
                data : null,
                success: getTextures
            });
        };

        constructor.prototype.isTexturesLoaded = function() {
            return this.texturesLoaded;
        };

        constructor.prototype.setClearColor = function(color) {
            this.gl.clearColor(color.r, color.g, color.b, color.a);
        };

        constructor.prototype.begin = function() {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.textCanvas.width = this.canvas.width;
            this.textCanvas.height = this.canvas.height;

            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.textCanvasCtx.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
            this.rects.num = 0;
        };

        constructor.prototype.end = function() {
            var self = this;
            var draw = function(prog, bo, method, setAttribs) {
                self.gl.useProgram(prog);
                self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawBuffer);
                self.gl.bufferSubData(self.gl.ARRAY_BUFFER, 0, new Float32Array(bo.buffer));
                var meh = new Matrix4x4();
                self.gl.uniformMatrix4fv(prog.uPMatrix, false, self.projection.elements);
                self.gl.uniformMatrix4fv(prog.uVMatrix, false, self.currentCamera.transform.elements);
                //self.gl.uniformMatrix4fv(prog.uVMatrix, false, meh.elements);

                setAttribs();
                self.gl.drawArrays(method, 0, bo.num* 5);
            };

            // draw rectangles in buffer
            for(var prop in self.rects) {
                if(!self.rects.hasOwnProperty(prop)) continue;
                var buffer = self.rects[prop];

                if(buffer.num > 0) {
                    self.gl.useProgram(self.colorProg);
                    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawBuffer);
                    self.gl.bufferSubData(self.gl.ARRAY_BUFFER, 0, new Float32Array(buffer.buffer));
                    self.gl.enableVertexAttribArray(self.colorProg.aVertPos);
                    self.gl.enableVertexAttribArray(self.colorProg.aVertColor);
                    self.gl.vertexAttribPointer(self.colorProg.aVertPos, 3, self.gl.FLOAT, false, 28, 0);
                    self.gl.vertexAttribPointer(self.colorProg.aVertColor, 4, self.gl.FLOAT, false, 28, 12);
                    self.gl.uniformMatrix4fv(self.colorProg.uPMatrix, false, self.projection.elements);
                    self.gl.uniformMatrix4fv(self.colorProg.uVMatrix, false, self.currentCamera.transform.elements);
                    self.gl.drawArrays(self.gl.TRIANGLE_STRIP, 0, buffer.num);
                    self.gl.disableVertexAttribArray(self.colorProg.aVertPos);
                    self.gl.disableVertexAttribArray(self.colorProg.aVertColor);
                    buffer.num = 0;
                    buffer.offset = 0;
                }
            }

            // draw sprites in their buffers
            for(var prop in self.sprites) {
                if(!self.sprites.hasOwnProperty(prop)) continue;
                var spriteBuffers = self.sprites[prop];

                if(!$.isEmptyObject(spriteBuffers)) {
                    for(var prop2 in spriteBuffers) {
                        if(!spriteBuffers.hasOwnProperty(prop2)) continue;
                        var spriteBuffer = spriteBuffers[prop2];
                        var texData = self.textures[prop2];

                        self.gl.useProgram(self.textureProg);
                        self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawBuffer);
                        self.gl.bufferSubData(self.gl.ARRAY_BUFFER, 0, new Float32Array(spriteBuffer.buffer));
                        self.gl.activeTexture(self.gl.TEXTURE0);
                        self.gl.bindTexture(self.gl.TEXTURE_2D, texData.texture);
                        self.gl.uniform1i(self.textureProg.uSampler, 0);
                        self.gl.enableVertexAttribArray(self.textureProg.aVertPos);
                        self.gl.enableVertexAttribArray(self.textureProg.aTexCoord);
                        self.gl.vertexAttribPointer(self.textureProg.aVertPos, 3, self.gl.FLOAT, false, 20, 0);
                        self.gl.vertexAttribPointer(self.textureProg.aTexCoord, 2, self.gl.FLOAT, false, 20, 12);
                        self.gl.uniformMatrix4fv(self.textureProg.uPMatrix, false, self.projection.elements);
                        self.gl.uniformMatrix4fv(self.textureProg.uVMatrix, false, self.currentCamera.transform.elements);
                        self.gl.drawArrays(self.gl.TRIANGLE_STRIP, 0, spriteBuffer.num);
                        self.gl.disableVertexAttribArray(self.textureProg.aVertPos);
                        self.gl.disableVertexAttribArray(self.textureProg.aTexCoord);
                        spriteBuffer.num = 0;
                        spriteBuffer.offset = 0;
                    }
                }
            }

            // draw lines in buffer
            for(var prop in self.lines) {
                if(!self.lines.hasOwnProperty(prop)) continue;
                var buffer = self.lines[prop];

                if(buffer.num > 0) {
                    self.gl.useProgram(self.colorProg);
                    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawBuffer);
                    self.gl.bufferSubData(self.gl.ARRAY_BUFFER, 0, new Float32Array(buffer.buffer));
                    self.gl.enableVertexAttribArray(self.colorProg.aVertPos);
                    self.gl.enableVertexAttribArray(self.colorProg.aVertColor);
                    self.gl.vertexAttribPointer(self.colorProg.aVertPos, 3, self.gl.FLOAT, false, 28, 0);
                    self.gl.vertexAttribPointer(self.colorProg.aVertColor, 4, self.gl.FLOAT, false, 28, 12);
                    self.gl.uniformMatrix4fv(self.colorProg.uPMatrix, false, self.projection.elements);
                    self.gl.uniformMatrix4fv(self.colorProg.uVMatrix, false, self.currentCamera.transform.elements);
                    //self.gl.lineWidth(20);
                    self.gl.drawArrays(self.gl.LINES, 0, buffer.num);
                    self.gl.disableVertexAttribArray(self.colorProg.aVertPos);
                    self.gl.disableVertexAttribArray(self.colorProg.aVertColor);
                    buffer.num = 0;
                    buffer.offset = 0;
                }
            }

            for(var prop in self.circles) {
                if(!self.circles.hasOwnProperty(prop)) continue;
                var buffer = self.circles[prop];

                if(buffer.num > 0) {
                    self.gl.useProgram(self.colorProg);
                    self.gl.bindBuffer(self.gl.ARRAY_BUFFER, self.drawBuffer);
                    self.gl.bufferSubData(self.gl.ARRAY_BUFFER, 0, new Float32Array(buffer.buffer));  // sorry :(
                    self.gl.bindBuffer(self.gl.ELEMENT_ARRAY_BUFFER, self.indexBuffer);
                    self.gl.bufferSubData(self.gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(buffer.indexBuffer));
                    self.gl.uniformMatrix4fv(self.colorProg.uPMatrix, false, self.projection.elements);
                    self.gl.uniformMatrix4fv(self.colorProg.uVMatrix, false, self.currentCamera.transform.elements);
                    self.gl.enableVertexAttribArray(self.colorProg.aVertPos);
                    self.gl.enableVertexAttribArray(self.colorProg.aVertColor);
                    self.gl.vertexAttribPointer(self.colorProg.aVertPos, 3, self.gl.FLOAT, false, 28, 0);
                    self.gl.vertexAttribPointer(self.colorProg.aVertColor, 4, self.gl.FLOAT, false, 28, 12);
                    self.gl.drawElements(self.gl.TRIANGLES, buffer.indexBuffer.length, self.gl.UNSIGNED_SHORT, 0);
                    buffer.num = 0;
                    buffer.offset = 0;
                    buffer.indexBuffer = [];
                }

            }
        };

        constructor.prototype.drawRect = function(rect) {
            if(rect.visible === false) return;
            if(this.rects[this.projection.elements] === undefined) {
                this.rects[this.projection.elements] = new this.Buffer(7);
            }
            var buffer = this.rects[this.projection.elements].buffer;
            var offset = this.rects[this.projection.elements].offset;

            var addPoint = function(point) {
                buffer[offset] = point.x;
                buffer[offset + 1] = point.y;
                buffer[offset + 2] = point.z;

                offset += 3;
            };

            var addColor = function(color) {
                buffer[offset] = color.r;
                buffer[offset + 1] = color.g;
                buffer[offset + 2] = color.b;
                buffer[offset + 3] = color.a;

                offset += 4;
            };

            var wmatrix = new Matrix4x4();
            wmatrix.scale(rect.width, rect.height, 1);
            wmatrix.translate(-rect.centerx * rect.width, -rect.centery * rect.height, 0);
            wmatrix.rotate(rect.rotation);
            wmatrix.translate(rect.centerx * rect.width + rect.pos.x, rect.centery * rect.height + rect.pos.y, 0);

            var p1 = wmatrix.mul(0, 0, rect.pos.z);
            var p2 = wmatrix.mul(0, 1, rect.pos.z);
            var p3 = wmatrix.mul(1, 1, rect.pos.z);
            var p4 = wmatrix.mul(1, 0, rect.pos.z);

            addPoint(p1);
            addColor(rect.color);

            // vert one
            addPoint(p1);
            addColor(rect.color);

            // vert six
            addPoint(p4);
            addColor(rect.color);

            // vert two
            addPoint(p2);
            addColor(rect.color);

            // vert three
            addPoint(p3);
            addColor(rect.color);

            addPoint(p3);
            addColor(rect.color);

            this.rects[this.projection.elements].offset = offset;
            this.rects[this.projection.elements].num += 6;
        };

        constructor.prototype.drawSprite = function(sprite) {
            if(sprite.visible === false) return;
            if(this.textures[sprite.texture] === undefined) {
                console.warn("specified texture does not exist.");
                return;
            }

            if(this.sprites[this.projection.elements] === undefined) {
                this.sprites[this.projection.elements] = {};
            }
            var sameProjectionGroup = this.sprites[this.projection.elements];

            if(sameProjectionGroup[sprite.texture] === undefined) {
                sameProjectionGroup[sprite.texture] = new this.Buffer(5);
            }

            var bufferObject = sameProjectionGroup[sprite.texture];
            var buffer = bufferObject.buffer;
            var offset = bufferObject.offset;

            var addPoint = function(point) {
                buffer[offset] = point.x;
                buffer[offset + 1] = point.y;
                buffer[offset + 2] = point.z;

                offset += 3;
            };

            var addTexCoords = function(u, v) {
                buffer[offset] = u;
                buffer[offset + 1] = v;

                offset += 2;
            };

            var wmatrix = new Matrix4x4();
            wmatrix.scale(sprite.width, sprite.height, 1);
            wmatrix.translate(-sprite.centerx * sprite.width, -sprite.centery * sprite.height, 0);
            wmatrix.rotate(sprite.rotation);
            wmatrix.translate((sprite.centerx * sprite.width) + sprite.pos.x, (sprite.centery * sprite.height) + sprite.pos.y, 0);

            var p1 = wmatrix.mul(0, 0, sprite.pos.z);
            var p2 = wmatrix.mul(0, 1, sprite.pos.z);
            var p3 = wmatrix.mul(1, 1, sprite.pos.z);
            var p4 = wmatrix.mul(1, 0, sprite.pos.z);

            var u1, v1, u2, v2;

            // determine the texture coordinates
            if(this.textures[sprite.texture].spriteSheet === null) {
                // if this is just a normal sprite
                u1 = sprite.u1 + sprite.tileOffsetX;
                v1 = sprite.v1 + sprite.tileOffsetY;
                u2 = (sprite.width / sprite.tileWidth) + sprite.tileOffsetX ;
                v2 = (sprite.height / sprite.tileHeight) + sprite.tileOffsetY;
            } else {
                // if this is an animated sprite
                var spriteSheet = this.textures[sprite.texture].spriteSheet;
                var useg = 1/spriteSheet.width;
                var vseg = 1/spriteSheet.height;
                var row = parseInt(sprite.frame / spriteSheet.width);
                var column = sprite.frame % spriteSheet.width;
                u1 = column * useg;
                v1 = row * vseg;
                u2 = u1 + useg;
                v2 = v1 + vseg;
            }

            // vert one
            addPoint(p1);
            addTexCoords(u1, v2);

            // vert six
            addPoint(p4);
            addTexCoords(u2, v2);

            // vert two
            addPoint(p2);
            addTexCoords(u1, v1);

            // vert three
            addPoint(p3);
            addTexCoords(u2, v1);

            addPoint(p3);
            addTexCoords(u2, v1);

            bufferObject.offset = offset;
            bufferObject.num += 5;
        };

        constructor.prototype.drawLine = function(line) {
            if(line.visible === false) return;
            if(this.lines[this.projection.elements] === undefined) {
                this.lines[this.projection.elements] = new this.Buffer(7);
            }

            var buffer = this.lines[this.projection.elements].buffer;
            var offset = this.lines[this.projection.elements].offset;

            var addPoint = function(point) {
                buffer[offset] = point.x;
                buffer[offset + 1] = point.y;
                buffer[offset + 2] = point.z;

                offset += 3;
            };

            var addColor = function(color) {
                buffer[offset] = color.r;
                buffer[offset + 1] = color.g;
                buffer[offset + 2] = color.b;
                buffer[offset + 3] = color.a;

                offset += 4;
            };

            // vert one
            addPoint(line.p1);
            addColor(line.color);

            // vert two
            addPoint(line.p2);
            addColor(line.color);

            this.lines[this.projection.elements].offset = offset;
            this.lines[this.projection.elements].num += 2;
        };

        constructor.prototype.drawText = function(text) {
            if(text.visible === false) return;
            this.textCanvasCtx.font = text.size + "px " + text.font;
            var pt = this.projection.mul(text.pos.x, text.pos.y, 0);
            var maxWidth = this.projection.mul(text.maxWidth, 0, 0).x;
            var ux = (pt.x + 1)/2;
            var uy = -(pt.y - 1)/2;
            maxWidth = (maxWidth + 1)/2;
            ux = parseInt(ux * this.textCanvas.width);
            uy = parseInt(uy * this.textCanvas.height);
            maxWidth = parseInt(maxWidth * this.textCanvas.width);
            this.textCanvasCtx.fillStyle = text.color.toCss();
            this.textCanvasCtx.textAlign = text.alignment;
            this.textCanvasCtx.textBaseline = text.baseline;
            this.textCanvasCtx.fillText(text.value, ux, uy, maxWidth);
        };

        constructor.prototype.drawCircle = function(circle) {
            if(circle.visible === false) return;
            if(this.circles[this.projection.elements] === undefined) {
                this.circles[this.projection.elements] = new this.Buffer(7);
            }

            var vbo = this.circles[this.projection.elements];
            var buffer = vbo.buffer;
            var offset = vbo.offset;

            var addPoint = function(point) {
                buffer[offset] = point.x;
                buffer[offset + 1] = point.y;
                buffer[offset + 2] = point.z;

                offset += 3;
            };

            var addColor = function(color) {
                buffer[offset] = color.r;
                buffer[offset + 1] = color.g;
                buffer[offset + 2] = color.b;
                buffer[offset + 3] = color.a;

                offset += 4;
            };

            var wmatrix = new Matrix4x4();
            wmatrix.rotate(circle.rotation);
            wmatrix.translate(circle.center.x, circle.center.y, circle.center.z);

            var firstIndex = vbo.num;

            addPoint(new Point(circle.center.x, circle.center.y, circle.center.z));
            addColor(circle.color);
            vbo.num++;

            var rad = 0;
            var x = circle.radius * Math.cos(rad);
            var y = -circle.radius * Math.sin(rad);
            var p = wmatrix.mul(x, y, circle.center.z);
            addPoint(p);
            addColor(circle.color);
            vbo.num++;

            for(var i = 1; i <= circle.resolution ; i++) {
                vbo.indexBuffer.push(firstIndex);
                rad = circle.percentage * i * (1/circle.resolution) * (2 * Math.PI);
                x = circle.radius * Math.cos(rad);
                y = -circle.radius * Math.sin(rad);
                p = wmatrix.mul(x, y, circle.center.z);
                addPoint(p);
                addColor(circle.color);
                vbo.indexBuffer.push(vbo.num - 1);
                vbo.indexBuffer.push(vbo.num);
                vbo.num++;
            }

            vbo.offset = offset;
        };

        return constructor;
    })();

    var init = function(canvas, worldWidth, worldHeight) {
        var context = new WebGLContext(canvas, worldWidth, worldHeight, function() {
            WebVis.renderer.context = context;
        });
    };

    WebVis.renderer = {
        context: null,
        batchSize: 1000,
        Point : Point,
        Matrix4x4 : Matrix4x4,
        Line: Line,
        Color: Color,
        Sprite: Sprite,
        Rect: Rect,
        Path: Path,
        Text: Text,
        Circle: Circle,
        Camera: Camera,
        init : init
    };

});
