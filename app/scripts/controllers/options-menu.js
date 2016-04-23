WebVis.ready(function() {
    var $Options = $(WebVis.pages["Options"])
    .css({
        "overflow-y" : "auto"
    });

    var options = {
        "arena-url" : {
            "type" : "text",
            "label" : "Arena URL:",
            "value" : "arena.megaminerai.com"
        },
        "arena-mode" : {
            "type" : "checkbox",
            "label" : "Arena Mode",
            "value" : "checked"
        }
    };

    var controllers = {};

    var TextOption = function(label, value) {
        this.$elem = $(WebVis.delegates["text-option"]).clone();
        this.$elem.find('.text-option-label').text(label);
        var $value = this.$elem.find('.text-option-value');
        $value.val(value);
        $Options.append(this.$elem);

        this.getValue = function() {
            return $value.val();
        };

    };

    var CheckboxOption = function(label, value) {
        var self = this;
        this.$elem = $(WebVis.delegates["checkbox-option"]).clone();
        this.$elem.find('.checkbox-option-label').text(label);
        var $value = this.$elem.find('.checkbox-option-value');
        $value.text(value);
        $Options.append(this.$elem);
        this.onclicked = function() {};

        this.getValue = function() {
            return $value.is(':checked');
        }

        this.setOnClick = function(callback) {
            this.onclicked = callback;
        };

        $value.click(function() {
            self.onclicked();
        });
    }

    var foreach = function(obj, callback) {
        for(var prop in obj) {
            if(!obj.hasOwnProperty(prop)) continue;
            callback(prop, obj[prop]);
        }
    };

    foreach(options, function(prop, value) {
        if(value.type === "text") {
            controllers[prop] = new TextOption(value.label, value.value);
        } else if(value.type === "checkbox") {
            controllers[prop] = new CheckboxOption(value.label, value.value);
        }
    });

    var getOptionValue = function(key) {
        var controller = controllers[key];
        return controllers[key].getValue();
    };

    var optionOnClick = function(key, callback) {
        var controller = controllers[key];
        controllers[key].setOnClick(callback);
    }

    WebVis.options = {
        getOptionValue: getOptionValue,
        optionOnClick : optionOnClick
    };

});