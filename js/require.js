/**
 * Created by sagar.ja on 27/07/17.
 */
(function () {
    "use strict";
    var resolvedModules = {},
        dependencyMap = {};

    // ### IsArray
    // Validates the passed in object is of type array
    /**
     * @param {*} item
     * @returns {boolean}
     */
    function isArray(item) {
        return Object.prototype.toString.call(item) === '[object Array]';
    }

    // ### IsStringSet
    // Validates the value of a string type
    /**
     * @param {string|undefined} str
     * @returns {boolean}
     */
    function isStringSet(str) {
        return str !== undefined && str !== "" && str !== null;
    }

    // ### IsFunction
    // Validates the type of reference is a function
    /**
     * @param {Function} reference
     * @returns {boolean}
     */
    function isFunction(reference) {
        return typeof reference === "function";
    }

    // ### Define
    // Defines a module and registers its dependencies
    /**
     *
     * @param {String} name
     * @param {Array|Function} deps
     * @param {Function} definition
     * @returns {boolean}
     */
    function define(name, deps, definition) {
        if (isFunction(deps)) {
            definition = deps;
            deps = [];
        }
        if (!isStringSet(name) || !isArray(deps) || !isFunction(definition)) {
            return false;
        }
        dependencyMap[name] = {
            deps: deps,
            callback: definition
        };
    }

    // ### Require
    // Loads registered module
    /**
     *
     * @param {Array} deps
     * @param {Function} callback
     */
    function require(deps, callback) {
        var callbackArguments = [],
            dependency;
        for (var iterator in deps) {
            if (deps.hasOwnProperty(iterator)) {
                dependency = deps[iterator];
                if (typeof dependency === "object" || typeof dependency === "undefined") {
                    callbackArguments.push(dependency);
                    continue;
                }
                if (resolvedModules[dependency] !== undefined) {
                    callbackArguments.push(resolvedModules[dependency]);
                } else {
                    resolvedModules[dependency] = require(dependencyMap[dependency].deps, dependencyMap[dependency].callback);
                    callbackArguments.push(resolvedModules[dependency]);
                }
            }
        }
        if (!isFunction(callback)) {
            return callbackArguments;
        }
        return callback.apply(this, callbackArguments);
    }

    window._require = require;
    window._define = define;
})();

