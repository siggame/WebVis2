WebVis.ready(function() {

    var defined = function(name, value) {
        if(typeof value === "undefined") {
            console.error("\""+name+"\" is not defined");
            return false;
        }
        return true;
    }

    var assert = function(booleanValue, callback) {
        if(!booleanValue) {
            if(callback !== undefined) {
                callback();
            }
            throw "Regression Test Fail!";
        }
    };

    //---------------------------------------------------
    // parse the uri and check for load url
    //---------------------------------------------------
    var getUrlParams = function() {
        var params = {};
        var query = decodeURIComponent(window.location.href).split("?")[1];
        if(query !== undefined) {
            var pairs = query.split("&");
            for(var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                if(pair.length < 2) return;
                if(params[pair[0]] !== undefined) {
                    if(typeof(params[pair[0]]) === 'string') {
                        var arr = [params[pair[0]], pair[1]];
                        params[pair[0]] = arr;
                    } else {
                        params[pair[0]].push(pair[1]);
                    }
                } else {
                    params[pair[0]] = pair[1];
                }
            }
        }
        return params
    };

    var Class = function(/*parentClass1, parentClass2, ..., parentClassN, newClassPrototype*/) {
        var prototype = arguments[arguments.length - 1];

        if(prototype === undefined || Class.isClass(prototype)) {
            prototype = {};
        }

        var parentClasses = [];
        for(var i = 0; i < arguments.length; i++) {
            var parentClass = arguments[i];
            if(Class.isClass(parentClass)) {
                parentClasses.push(parentClass);
            }
        }

        var newClass = function() {
            this.__proto__.init.apply(this, arguments); // arguments of the newClass function, not of this Class() function
        };

        // copy all the functions from the parent class(es) to the new class's prototype, if two parents share the same function the first parent listed will be the one that the new child class's method defaults to
        for(var i = 0; i < parentClasses.length; i++) {
            var parentClass = parentClasses[i];
            for(var property in parentClass.prototype) {
                if(!prototype.hasOwnProperty(property)) {
                    prototype[property] = parentClass.prototype[property];
                }
            }
        }

        prototype.init = prototype.init || function() {};
        prototype._isClass = true;
        prototype._class = newClass;
        prototype._parentClasses = parentClasses;
        newClass.prototype = prototype;

        for(var property in prototype) { // also assign the properties of the prototype to this class so we can call super methods via SuperClass.SuperFunction.call(this, ...);
            newClass[property] = prototype[property];
        }

        // this creates an instance of newClass, but does NOT call the init() fuction. it is expected you plan to call this later
        // simply put, creates an object with the prototype set to this newClass
        newClass.uninitialized = function() {
            return Object.create(prototype);
        };

        newClass.isInstance = function(obj) {
            return Class.isInstance(obj, newClass);
        };

        return newClass;
    }

    /**
     * Tests if the passed in variable is a class built with the above Class method
     *
     * @param {*} klass - can be any type, but to return true it will need to be a class created with the above Class method
     * @returns {boolean} represents if the passed in variable is a class constructor made with the Class method
     */
    Class.isClass = function(klass) {
        return (typeof(klass) === 'function' && klass._isClass);
    };

    /**
     * checks if a passed in variable is an instance of a Class (or that class's parent Classes)
     *
     * @param {Object} obj - object to check if it is an instance of isClass
     * @param {function} [isClass] - constructor made with Class method to check if the passed in object is an instance of, or an instance of one of it's parent classes. If not passed in then just checks if obj is a class made instance
     * @returns {boolean} true if the obj is an instance of Class, false otherwise
     */
    Class.isInstance = function(obj, isClass) {
        if(obj === null || typeof(obj) !== "object" || !obj._isClass) {
            return false;
        }

        if(isClass === undefined && obj._isClass) {
            return true;
        }

        var classes = [ obj._class ];
        while(classes.length > 0) {
            var theClass = classes.pop();

            if(theClass === isClass) {
                return true;
            }

            for(var i = 0; i < theClass._parentClasses.length; i++) {
                classes.push(theClass._parentClasses[i]);
            }
        }

        return false;
    };

    WebVis.util = {
        defined: defined,
        assert: assert,
        getUrlParams: getUrlParams,
        Class : Class
    };

});
