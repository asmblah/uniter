/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define */
define([
    'js/util',
    './Error/Fatal'
], function (
    util,
    PHPFatalError
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function Namespace(name) {
        this.classes = {};
        this.functions = {};
        this.name = name;
    }

    util.extend(Namespace.prototype, {
        defineClass: function (name, definition) {
            var namespace = this;

            function Class() {
                var instance = this;

                util.each(definition.properties, function (value, name) {
                    instance[name] = value;
                });
            }

            util.each(definition.methods, function (method, name) {
                Class.prototype[name] = method;
            });

            namespace.classes[name.toLowerCase()] = {
                name: name,
                Class: Class
            };
        },

        defineFunction: function (name, func) {
            this.functions[name] = func;
        },

        getClass: function (name) {
            var lowerName = name.toLowerCase(),
                namespace = this;

            if (!hasOwn.call(namespace.classes, lowerName)) {
                throw new PHPFatalError(PHPFatalError.CLASS_NOT_FOUND, {name: name});
            }

            return namespace.classes[lowerName];
        },

        getFunction: function (name) {
            var namespace = this;

            if (!hasOwn.call(namespace.functions, name)) {
                throw new PHPFatalError(PHPFatalError.CALL_TO_UNDEFINED_FUNCTION, {name: name});
            }

            return namespace.functions[name];
        }
    });

    return Namespace;
});
