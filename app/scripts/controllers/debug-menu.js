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
            //this.$elem.hide();
        }

        var updateSubtree = function() {
            for(var prop in self.value) {
                if(!self.value.hasOwnProperty(prop)) continue;

                if(self.subelems[prop] !== undefined) {
                    self.subelems[prop].setValue(self.value[prop]);
                    /*
                    if(!self.subelems[prop].$elem.is(":visible")) {
                        self.subelems[prop].$elem.show();
                    }
                    */
                } else {
                    var newelem = new ElemController(prop, self.value[prop]);
                    self.$subtree.append(newelem.$elem);
                    self.subelems[prop] = newelem;
                }
            }

            for(var prop in self.subelems) {
                if(!self.subelems.hasOwnProperty(prop)) continue;

                if(self.value === null) {
                    self.subelems[prop].detach();
                }

                if(!self.value.hasOwnProperty(self.subelems[prop].name)) {
                    self.subelems[prop].detach();
                }
            }

        }

        this.getName = function(name) {
            return self.name;
        }

        this.setValue = function(value) {
            var oldvalue = self.value;
            self.value = value;
            var textValue;

            if(typeof value === "object") {
                if($.isArray(value)) {
                    textValue = "<array>";
                } else {
                    textValue = "<object>"
                }
                if(self.$subtreeIcon.css("display") === "") {
                    self.$subtreeIcon.show();
                }
                /*
                if(!self.$subtreeIcon.is(":visible")) {
                    self.$subtreeIcon.show();
                }
                */
                if(self.visible) {
                    updateSubtree();
                }
            } else {
                textValue = value;
            }
            if(oldvalue !== self.value) {
                self.$value.text(textValue);
            }
        };

        this.closeSubtree = function() {
            self.$subtree.hide();
            self.visible = false;
            self.$subtreeIcon
            .removeClass("glyphicon-triangle-bottom")
            .addClass("glyphicon-triangle-right");
        };

        this.openSubtree = function() {
            self.$subtree.show();
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
    };

    WebVis.setDebugData = setDebugData;
});
