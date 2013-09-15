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
    'js/util'
], function (
    util
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function Namespace(name) {
        this.functions = {};
        this.name = name;
    }

    util.extend(Namespace.prototype, {
        defineFunction: function (name, func) {
            this.functions[name] = func;
        },

        getFunction: function (name) {
            var namespace = this;

            return hasOwn.call(namespace.functions, name) ? namespace.functions[name] : null;
        }
    });

    return Namespace;
});
