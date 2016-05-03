// The contents of this file are responsible for creating and managing the
// contents of the debug table in the webvis.

WebVis.ready(function() {
    // imports
    var Class = WebVis.util.Class;

    var mainList;
    var $debug = $(WebVis.pages["Debug"])
    .css({
        "overflow-y": "auto",
        "height": "100%"
    });

    var ElemController = Class({
        init: function(name, data) {
            var self = this;
            this.visible = false;
            this.$elem = $(WebVis.delegates["tree-elem"]).clone();
            this.name = name;
            this.value = null;
            this.$elem.data('controller', this);
            this.subelems = {};
            this.$subtreeIcon = self.$elem.children().not(".debug-tree").find(".debug-tree-subtree");
            this.$name = self.$elem.children().not(".debug-tree").find('.debug-tree-elem-name');
            this.$value = self.$elem.children().not(".debug-tree").find(".debug-tree-elem-value");
            this.$subtree = self.$elem.children(".debug-tree:first");

            this.$name.text(name);

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

            this.$subtreeIcon.click(function() {
                self.toggleSubTree();
            });

            this.setValue(data);
        },

        getSubtree: function() {
            return this.$subtree;
        },

        detach: function() {
            this.$elem.addClass("debug-tree-elem-hidden");
        },

        updateSubtree: function() {
            var self = this;
            for(var prop in self.value) {
                if(!self.value.hasOwnProperty(prop)) continue;
                if(prop === "&LEN") continue;

                if(self.subelems[prop] !== undefined) {
                    self.subelems[prop].setValue(self.value[prop]);
                    self.subelems[prop].$elem.removeClass("debug-tree-elem-hidden");
                } else {
                    var newelem = new ElemController(prop, self.value[prop]);
                    self.$subtree.append(newelem.$elem);
                    self.subelems[prop] = newelem;
                }
            }

            if(self.value === null) {
                self.subelems[prop].detach();
            }

            for(var prop in self.subelems) {
                if(!self.subelems.hasOwnProperty(prop)) continue;

                if(self.subelems[prop].value === "&RM") {
                    self.subelems[prop].detach();
                }

                if(!self.value.hasOwnProperty(self.subelems[prop].name)) {
                    self.subelems[prop].detach();
                }
            }
        },

        getName: function(name) {
            return this.name;
        },

        setName: function(name) {
            this.$name.text(name);
            this.name = name;
        },

        setValue: function(value) {
            var self = this;
            var oldvalue = self.value;
            self.value = value;
            var textValue = null;

            if(typeof value === "object") {
                for(var prop in self.value) {
                    if(prop === "&LEN") {
                        textValue = "<array>";
                        break;
                    }
                }
                if(textValue === null) {
                    textValue = "<object>";
                }
                if(!self.$subtreeIcon.hasClass("debug-tree-subtree-visible")) {
                    self.$subtreeIcon.addClass("debug-tree-subtree-visible");
                }
                if(self.visible) {
                    updateSubtree();
                }
            } else {
                if(self.$subtreeIcon.hasClass("debug-tree-subtree-visible")) {
                    self.$subtreeIcon.removeClass("debug-tree-subtree-visible");
                }
                textValue = value;
            }

            if(($.isPlainObject(self.value) && $.isPlainObject(oldvalue)) || oldvalue !== self.value) {
                self.$value.text(textValue);
            }
        },

        closeSubtree: function() {
            var self = this;
            self.$subtree.removeClass("debug-tree-subtree-visible");
            self.visible = false;
            self.$subtreeIcon
            .removeClass("glyphicon-triangle-bottom")
            .addClass("glyphicon-triangle-right");
        },

        openSubtree: function() {
            var self = this;
            self.$subtree.addClass("debug-tree-subtree-visible");
            self.visible = true;
            self.$subtreeIcon
            .removeClass("glyphicon-triangle-right")
            .addClass("glyphicon-triangle-bottom");
            this.updateSubtree();
        },

        toggleSubTree: function() {
            if(this.visible) {
                this.closeSubtree();
            } else {
                this.openSubtree();
            }
        }
    });

    mainList = new ElemController("", "");

    var setDebugData = function(data) {
        mainList.setValue(data);
        mainList.setName("main");
        mainList.openSubtree();
    };
    $debug.append(mainList.$elem);
    $("#tab-bind-point").append($debug);

    WebVis.setDebugData = setDebugData;
});
