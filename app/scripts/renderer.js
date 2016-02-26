(function() {
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

            var z = (this.get(2, 3) * xt) +
                    (this.get(2, 3) * yt) +
                    (this.get(2, 3) * zt) +
                    this.get(2, 3);

            return {
              x: x,
              y: y,
              z: z
            };
        };

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
            this.set(1, 1, -2/(t - b));
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
        };

        return constructor;
    })();

    var Sprite = function() {
        this.visible = true;
        this.texture = null;
        this.frame = 0;
        this.pos = new Point(0, 0, 0);
        this.anchor = new Point(0, 0, 0);
        this.width = 0.0;
        this.height = 0.0;
        this.u1 = 0.0;
        this.v1 = 0.0;
        this.u2 = 0.0;
        this.v2 = 0.0;
        this.tiling = false;
        this.tileWidth = 0.0;
        this.tileHeight = 0.0;
        this.tileOffsetX = 0.0;
        this.tileOffsetY = 0.0;
        this.color = new Color(1.0, 1.0, 1.0, 1.0);
    };

    var Rect = function() {
        this.visible = true;
        this.pos = new Point(0, 0, 0);
        this.width = 0.0;
        this.height = 0.0;
        this.rotation = 0.0;
        this.offsetx = 0.0;
        this.offsety = 0.0;
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
        this.text = "";
        this.alignment = "left";
        this.pos = new Point(0, 0, 0);
        this.width = 0.0;
        this.size = 0;
        this.color = new Color(0, 0, 0, 0);
    };

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
        constructor.prototype.resizeWorld = function(worldWidth, worldHeight) {
            throw "Function not implemented.";
        };

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

        constructor.prototype._getTexture = function(filename) {
            throw "Function not implemented.";
        };

        constructor.prototype._getSheetData = function(filename) {
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

        constructor.prototype.drawTexture = function(tex) {
            throw "Function not implemented.";
        };

        constructor.prototype.drawLine = function(line) {
            throw "Function not implemented.";
        };

        constructor.prototype.drawText = function(text) {
            throw "Function not implemented.";
        };

        return constructor;
    })();

    var WebGLContext = (function() {
        var constructor = function(canvas, worldWidth, worldHeight, readyAction) {
            var self = this;

            // create members
            this.canvas = null;
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

            // hard coded orthograph
            this.projection = new Matrix4x4();
            this.projection.ortho(0, worldWidth, 0, worldHeight)


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

            // initialize the shared buffer
            // TODO: get rid of this
            this.drawBuffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.drawBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, 100000, this.gl.DYNAMIC_DRAW);

            this.Buffer = function(stride) {
                this.stride = stride;
                this.num = 0;
                this.buffer = [];
            };

            // initialize the buffer holders
            this.rects = new this.Buffer(42);

            // BTW, these are not the 2D texture buffers, it's the list of
            // WebVis.renderer.Texture objects to be rendered next turn.
            this.textures = new this.Buffer(30);

            // TODO: line and text buffers
            this.lineBuffers = {};
            this.textBuffers = {};

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
                    self.gl.enableVertexAttribArray(prog.aVertPos);
                    prog.aVertColor = self.gl.getAttribLocation(prog, "aVertColor");
                    self.gl.enableVertexAttribArray(prog.aVertColor);

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
                    self.gl.enableVertexAttribArray(prog.aVertPos);
                    prog.aTexCoord = self.gl.getAttribLocation(prog, "aTexCoord");
                    self.gl.enableVertexAttribArray(prog.aTexCoord);

                    // uniforms
                    prog.uPMatrix = self.gl.getUniformLocation(prog, "uPMatrix");
                    prog.uVmatrix = self.gl.getUniformLocation(prog, "uVMatrix");
                    prog.uSampler = self.gl.getUniformLocation(prog, "uSampler");
                    prog.uTint = self.gl.getUniformLocation(prog, "uTint");
                })
            ).then(function() {
                readyAction();
            });
        };

        // attach the prototype basecontext prototype
        constructor.prototype = BaseContext;

        constructor.prototype.resizeWorld = function(worldWidth, worldHeight) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
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

            var loadImage = function(url, onload) {
                var load = function(deferred) {
                    // create a basic document image to populate
                    var image = new Image();

                    var unbindEvents = function() {
                        image.onload = null;
                        image.onerror = null;
                        image.onabort = null;
                    };
                    var loaded = function(image) {
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
                };
                return $.Deferred(load).promise();
            };

            var getTextures = function(data) {
                if(data.resources.length === 0) {
                    this._texturesLoaded = true;
                }
                var deferreds = [];

                // for each texture in the resource list
                for(var i = 0; i < data.resources.length; i++) {
                    // load the texture
                    var url = "/plugins/" + pluginName + "/images/" + resource.image;
                    self.textures[i] = {
                        texture: null,
                        spriteSheet: null
                    };
                    var dat = self.textures[i];

                    // callback to handle initializing the texture
                    var initTexture = function(data) {
                        return function(image) {
                            var tex = data.texture;
                            text = self.gl.createTexture();
                            self.gl.bindTexture(self.gl.TEXTURE_2D, tex);
                            self.gl.texImage2D(self.gl.TEXTURE_2D, 0, self.gl.RGBA, self.gl.UNSIGNED_BYTE, tex);
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
                            data.sriteSheet = sheet;
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

                    // when everything is done, tell that all textures are loaded.
                    $.when.apply($, deferreds)
                    .then( function() {
                        self.texturesLoaded = true;
                        callback();
                    });
                }
            };

            // start the load of the textures
            $.ajax({
                dataType : "json",
                url : u,
                data : null
            });
        };

        constructor.prototype.isTexturesLoaded = function() {
            return this.texturesLoaded;
        };

        constructor.prototype._getTexture = function(filename) {
            return this.textures[filename];
        };

        constructor.prototype._getSheetData = function(filename) {
            return this.textures[filename];
        };

        constructor.prototype.setClearColor = function(color) {
            this.gl.clearColor(color.r, color.g, color.b, color.a);
        };

        constructor.prototype.begin = function() {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.rects.num = 0;
        };

        constructor.prototype.end = function() {
            // draw rectangles in buffer
            if(this.rects.num > 0) {
                this.gl.useProgram(this.colorProg);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.drawBuffer);
                this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(this.rects.buffer));
                this.gl.vertexAttribPointer(this.colorProg.aVertPos, 3, this.gl.FLOAT, false, 28, 0);

                this.gl.vertexAttribPointer(this.colorProg.aVertColor, 4, this.gl.FLOAT, false, 28, 12);
                this.gl.uniformMatrix4fv(this.colorProg.uPMatrix, false, this.projection.elements);
                this.gl.uniformMatrix4fv(this.colorProg.uVMatrix, false, this.currentCamera.transform.elements);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, this.rects.num * 6);
            }
        };

        constructor.prototype.drawRect = function(rect) {
            var buffer = this.rects.buffer;
            var offset = this.rects.num * this.rects.stride;

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
            wmatrix.translate(-rect.centerx * rect.width, -rect.centery * rect.height);
            wmatrix.rotate(rect.rotation);
            wmatrix.translate(rect.centerx * rect.width + rect.pos.x, rect.centery * rect.height + rect.pos.y, 0);

            var p1 = wmatrix.mul(0, 0, 0);
            var p2 = wmatrix.mul(0, 1, 0);
            var p3 = wmatrix.mul(1, 1, 0);
            var p4 = wmatrix.mul(1, 0, 0);

            // vert one
            addPoint(p1);
            addColor(rect.color);

            // vert two
            addPoint(p2);
            addColor(rect.color);

            // vert three
            addPoint(p3);
            addColor(rect.color);

            // vert four
            addPoint(p1);
            addColor(rect.color);

            // vert five
            addPoint(p3);
            addColor(rect.color);

            // vert six
            addPoint(p4);
            addColor(rect.color);

            this.rects.num++;
        };

        constructor.prototype.drawTexture = function(tex) {
            // stub
        };

        constructor.prototype.drawLine = function(line) {
            // stub
        };

        constructor.prototype.drawText = function(text) {
            // stub
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
        Text: Text ,
        Camera: Camera,
        init : init
    };

})();
