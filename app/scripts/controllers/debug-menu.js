WebVis.ready(function() {
    var mainList;
    var $debug = $(WebVis.pages["Debug"])
    .css({
        "overflow-y": "scroll",
        "height": "100%"
    });

    var ElemController = function(name, data) {
        var self = this;
        this.visible = false;
        this.$elem = $(WebVis.delegates["tree-elem"]).clone();
        this.name = name;
        this.$elem.children().not(".debug-tree").find('.debug-tree-elem-name').text(name);
        this.$elem.data('controller', this);
        this.subelems = {};
        this.$subtreeIcon = self.$elem.children().not(".debug-tree").find(".debug-tree-subtree");
        this.$value = self.$elem.children().not(".debug-tree").find(".debug-tree-elem-value");
        this.$subtree = self.$elem.children(".debug-tree:first");

        if(name === "id") {
            this.$value.parent().addClass('debug-tree-clickable');
            this.$value.parent().click(function() {
                var $gameObjects;
                mainList.getSubtree().each(function(i, elem) {
                    var controller = $(elem).data('controller');
                    var name = controller.getName();
                    if(name === "gameObject") {
                        $gameObjects = controller;
                        $gameObjects.openSubtree();
                        return false;
                    }
                });

                $gameObjects.getSubtree().each(function(i, elem) {
                    var controller = $(elem).data('controller');
                    var n = controller.getName();
                    if(n === value) {
                        controller.openSubtree();
                        console.log($(elem).offset);
                        return false;
                    }
                });
            });
        }

        this.getSubtree = function() {
            return self.$subtree;
        };

        this.detach = function() {
            this.$elem.remove();
        }

        var updateSubtree = function() {
            for(var prop in self.value) {
                if(!self.value.hasOwnProperty(prop)) return

                if(self.subelems[prop] !== undefined) {
                    self.subelems[prop].setValue(self.value[prop]);
                } else {
                    var newelem = new ElemController(prop, self.value[prop]);
                    self.$subtree.append(newelem.$elem);
                    self.subelems[prop] = newelem;
                }
            }

            for(var prop in self.subelems) {
                if(!self.subelems.hasOwnProperty(prop)) return;

                if(self.value === null) {
                    self.subelems[prop].detach();
                    delete self.subelems[prop];
                }

                if(!self.value.hasOwnProperty(self.subelems[prop].name)) {
                    self.subelems[prop].detach();
                    delete self.subelems[prop];
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
                self.$subtreeIcon.css("display", "inline");
                if(self.visible) {
                    updateSubtree();
                }
            } else {
                textValue = value;
            }
            self.$value.text(textValue);
        };

        this.closeSubtree = function() {
            self.$subtree.css("display", "none");
            self.visible = false;
            self.$subtreeIcon
            .removeClass("glyphicon-triangle-bottom")
            .addClass("glyphicon-triangle-right");
        };

        this.openSubtree = function() {
            self.$subtree.css("display", "block");
            self.visible = true;
            self.$subtreeIcon
            .removeClass("glyphicon-triangle-right")
            .addClass("glyphicon-triangle-bottom");
            updateSubtree();
        }

        this.toggleSubTree = function() {
            if(self.visible) {
                this.closeSubtree();
            } else {
                this.openSubtree();
            }
        };

        this.$subtreeIcon.click(function() {
            self.toggleSubTree();
        });

        this.setValue(data);
    };

    mainList = new ElemController("main", "");

    var setDebugData = function(data) {
        mainList.setValue(data);
        $debug.append(mainList.$elem);
        WebVis.fillWidth();
    };

    WebVis.setDebugData = setDebugData;
});
