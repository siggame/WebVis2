WebVis.ready(function() {
    var $debug = $(WebVis.pages["Debug"])
    .css({
        "overflow-y": "scroll",
        "height": "100%"});

    var ElemController = function(name, data) {
        var self = this;
        this.visible = false;
        this.$elem = $(WebVis.delegates["tree-elem"]).clone();
        this.name = name;
        this.$elem.children().not(".debug-tree").find('.debug-tree-elem-name').text(name);
        this.$elem.data('controller', this);
        this.subelems = {};

        var updateSubtree = function() {
            var subtree = self.$elem.children(".debug-tree:first");

            for(var prop in self.value) {
                if(!self.value.hasOwnProperty(prop)) return

                var subtree = self.$elem.children(".debug-tree:first");
                if(self.subelems[prop] !== undefined) {
                    self.subelems[prop].setValue(self.value[prop]);
                } else {
                    var newelem = new ElemController(prop, self.value[prop]);
                    subtree.append(newelem.$elem);
                    self.subelems[prop] = newelem;
                }
            }
        }

        this.getName = function(name) {
            return self.name;
        }

        this.setValue = function(value) {
            self.value = value;
            var textValue;

            if(typeof value === "object") {
                if($.isArray(value)) {
                    textValue = "<array>";
                } else {
                    textValue = "<object>"
                }
                self.$elem.children().not(".debug-tree").find(".debug-tree-subtree").css("display", "inline");
                if(self.visible) {
                    updateSubtree();
                }
            } else {
                console.log(self.name, value);
                textValue = value;
            }
            self.$elem.children().not(".debug-tree").find(".debug-tree-elem-value").text(textValue);
        };

        this.toggleSubTree = function() {
            var subtree = self.$elem.children(".debug-tree:first");

            if(self.visible) {
                subtree.css("display", "none");
                self.visible = false;
                self.$elem.children().not(".debug-tree").find(".debug-tree-subtree")
                .removeClass("glyphicon-triangle-bottom")
                .addClass("glyphicon-triangle-right");

            } else {
                subtree.css("display", "block");
                self.visible = true;
                self.$elem.children().not(".debug-tree").find(".debug-tree-subtree")
                .removeClass("glyphicon-triangle-right")
                .addClass("glyphicon-triangle-bottom");
            }
            updateSubtree();
        };

        this.$elem.children().not(".debug-tree").find(".debug-tree-subtree").click(function() {
            self.toggleSubTree();
            WebVis.fillWidth();
        });

        this.setValue(data);
    };

    mainList = new ElemController("", "");

    var setDebugData = function(data) {
        mainList.setValue(data);
        mainList.toggleSubTree();
        $debug.append(mainList.$elem);
        WebVis.fillWidth();
    };

    WebVis.setDebugData = setDebugData;

    /*
    var $subObjectIcon = $(document.createElement('span'))
    .addClass('glyphicon glyphicon-triangle-right');

    var TreeLevel;
    var Elem;

    Elem = function(name, value) {
        var self = this;
        this.visible = false;
        this.$elem = $(document.createElement('li'));
        this.$icon = $subObjectIcon.clone()
        this.$table = $(document.createElement('table'))
        .addClass('fill-width');
        this.$iconContainer = $(document.createElement('div'))
        .addClass('subtree-icon');
        this.$row = $(document.createElement('tr'));
        this.$name = $(document.createElement('td'));
        this.$nameText = $(document.createElement('div'))
        .text(name);
        this.$value = $(document.createElement('td'));
        this.$valueText = $(document.createElement('div'))
        .text(value);

        if($.isArray(value)) {
            this.$valueText.text("<array>");
        } else if(typeof value === "object"){
            this.sub = new TreeLevel(value);
            this.$valueText.text("<object>");
        } else {
            this.$valueText.text(value);
        }

        this.$iconContainer.append(this.$icon);
        this.$name.append(this.$nameText);
        this.$value.append(this.$valueText);
        this.$row.append(this.$name);
        this.$row.append(this.$value);
        this.$table.append(this.$row);
        this.$elem.append(this.$iconContainer);
        this.$elem.append(this.$table);

        this.$icon.click(function() {
            self.toggleVisible();
        });

        this.setName = function(name) {
            this.$name.text(name);
        };

        this.setValue = function(value) {
            this.$value.text(value);
        };

        this.toggleVisible = function() {
            if(this.visible) {
                this.$elem.css('display', 'none');
                this.visible = false;
            } else  {
                this.$elem.css('display', 'block');
                this.visible = true;
            }
        };
    };

    TreeLevel = function(obj) {
        this.$elem = $(document.createElement('ul'));
        this.elems = {};

        for(var prop in obj) {
            if(!obj.hasOwnProperty(prop)) return;
            console.log(prop);
            var value = obj[prop];

            var elem = new Elem(prop, value);
            this.elems[prop] = elem;

            this.$elem.append(elem.$elem);
        }
    };

    var tree = null;

    var updateDebugData = function(data, tree) {
        for(var prop in data) {
            if(!data.hasOwnProperty(prop)) return;
            var obj = data[prop];

            if(tree.elems[prop] !== undefined) {
                if(typeof obj !== "object") {
                    tree.elems[prop].setValue(obj)
                } else {
                    updateDebugData(obj, tree.elems[prop]);
                }
            } else {
                var data = new Elem(prop, obj);
                tree.elems[prop] = obj;
            }
        }

        for(var prop in tree.elems) {
            if(!tree.elems.hasOwnProperty(prop)) return;

            if(data[prop] === undefined) {
                delete tree.elems[prop];
            }
        }
    };

    var setDebugData = function(data) {
        console.log("blah");
        if(tree === null) {
            tree = new TreeLevel(data);
            $debug.append(tree.$elem);
        } else {
            updateDebugData(data, tree);
        }
        console.log("blah blah");
        WebVis.fillWidth();
    };
    */

    WebVis.setDebugData = setDebugData;
});
