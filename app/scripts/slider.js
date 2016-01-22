(function($) {
    // declaration of the object managing a slider
    var slider = function() {
        var obj = function($elem) {
            this.leftBound = 0;
            this.rightBound = 0;
            this.currentValue = 0;
            this.pressed = false;
            this.bar = $(document.createElement('div'));
            this.button = $(document.createElement('div'));
            this.buttonWidth = 20;

            // initialize event handlers
            $elem.mousedown(this.press);
            $(document).mousemove(this.move($elem));
            $(document).mouseup(this.unpress(this));

            // create elements and appearance
            $elem.addClass('webvis-slider');
            this.bar.addClass('webvis-slider-bar');
            this.button.addClass('webvis-slider-button');
            var self = this;
            $(window).resize(function() {
                self.bar.width($elem.width());
            });
            self.bar.width($elem.width());
            $elem.append(this.bar);
            $elem.append(this.button);
        };

        obj.prototype.setLeft = function(left) {
            if(this.rightBound < left) {
                this.rightBound = left;
            }
            this.leftBound = left;
        };

        obj.prototype.setRight = function(right){
            if(this.left > right) {
                return;
            }
            this.rightBound = right;
        };

        obj.prototype.press = function(e) {
            var $elem = $(this);
            var self = $elem.data('data');
            var width = self.rightBound - self.leftBound;
            var percentage = e.offsetX/ $elem.width();

            self.button.css('left', e.offsetX);
            self.currentValue = (percentage * width) + self.leftBound;
            self.pressed = true;
        };

        obj.prototype.move = function($elem) {
            return function(e) {
                var self = $elem.data('data');
                if(self.pressed) {
                    var width = self.rightBound - self.leftBound;
                    var percentage = e.offsetX / $elem.width();
                    if(percentage > 1) percentage = 1;
                    if(percentage < 0) percentage = 0;
                    self.currentValue = (percentage * width) + self.leftBound;
                    console.log("offset: " + e.offsetX);
                    self.button.css('left', e.offsetX);
                    console.log(self.currentValue);
                };
            }
        }

        obj.prototype.unpress = function(self) {
            return function(e) {
                self.pressed = false;
            }
        }

        return obj;
    }();


    $.fn.slider = function(func, var1) {
        if(func === undefined) {
            this.data('data', new slider(this));
            return;
        }

        var obj = this.data('data');
        switch(func) {
            case "setLeft": {
                if(var1 !== undefined) {
                    obj.setLeft(var1);
                } else {
                    console.error("var1 is undefined.");
                }
            }
            case "setRight": {
                if(var1 !== undefined) {
                    obj.setRight(var1);
                } else {
                    console.error("var1 is undefined.");
                }
            }
        }
    }

})(jQuery);