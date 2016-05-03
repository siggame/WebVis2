// The contents of this file are responsible for creating and managing the
// Options tab of the webvis.

WebVis.ready(function() {
    // imports
    var foreach = WebVis.util.foreach;
    var Class = WebVis.util.Class;

    var $Options = $(WebVis.pages["Options"])
    .css({
        "overflow-y" : "auto"
    });

    // To add options to the visualizer, you add more entries to this object
    // you essentially give a new property some unused id, and then create an
    // object of the form
    // {
    //    "type": "one of the existing types of options"
    //    "label": "The text to display next to the option on the options menu"
    //    "value": "The initial value (this depends on the type)"
    // }
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

    // There will be a controller for each of the options
    var controllers = {};

    // All options will inherit from this class
    var BaseOption = Class({
        init: function(label, value) {},
        getValue: function() {
            throw "Function not implemented.";
        },
        setOnClick: function() {
            throw "Function not implemented.";
        }
    });

    // Text option is a text box with a label to it's left.
    var TextOption = Class(BaseOption, {
        init: function(label, value) {
            this.$elem = $(WebVis.delegates["text-option"]).clone();
            this.$elem.find('.text-option-label').text(label);
            this.$value = this.$elem.find('.text-option-value');
            this.$value.val(value);
            $Options.append(this.$elem);
        },

        getValue: function() {
            return this.$value.val();
        }
    });

    // checkbox is a single true/false checkbox with a label to it's left
    var CheckboxOption = Class(BaseOption, {
        init: function(label, value) {
            var self = this;
            this.$elem = $(WebVis.delegates["checkbox-option"]).clone();
            this.$elem.find('.checkbox-option-label').text(label);
            this.$value = this.$elem.find('.checkbox-option-value');
            this.$value.text(value);
            $Options.append(this.$elem);
            this.onclicked = function() {};

            this.$value.click(function() {
                self.onclicked();
            });
        },

        getValue: function() {
            return this.$value.is(':checked');
        },

        setOnClick: function(callback) {
            this.onclicked = callback;
        }
    });

    // this iterates over the list of options above and creates
    // controllers for each depending on the type specified
    foreach(options, function(prop, value) {
        if(value.type === "text") {
            controllers[prop] = new TextOption(value.label, value.value);
        } else if(value.type === "checkbox") {
            controllers[prop] = new CheckboxOption(value.label, value.value);
        }
    });

    // this function is exposed to the rest of the webvis so that
    // the state of the option can be queried
    var getOptionValue = function(key) {
        var controller = controllers[key];
        return controllers[key].getValue();
    };

    // This function is exposed to the rest of the webvis
    // you can pass a callback and the name of the option using this function
    // to be called when the option is clicked.
    // TODO: For now only the checkbox has this implemented
    var optionOnClick = function(key, callback) {
        var controller = controllers[key];
        controllers[key].setOnClick(callback);
    }

    WebVis.options = {
        getOptionValue: getOptionValue,
        optionOnClick : optionOnClick
    };
});