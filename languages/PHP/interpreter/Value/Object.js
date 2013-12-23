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
    './Array',
    '../Error'
], function (
    util,
    ArrayValue,
    PHPError
) {
    'use strict';

    function ObjectValue(factory, object, className, id) {
        ArrayValue.call(this, factory, object, 'object');

        this.className = className;
        this.id = id;
        this.object = object;
    }

    util.inherit(ObjectValue).from(ArrayValue);

    util.extend(ObjectValue.prototype, {
        callMethod: function (name, args, scopeChain) {
            var object = this.object;

            name = name.getNative();

            if (util.isFunction(object[name])) {
                return object[name].apply(object, [scopeChain].concat(args));
            }
        },

        coerceToKey: function (scopeChain) {
            scopeChain.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        getClassName: function () {
            return this.className;
        },

        getID: function () {
            return this.id;
        },

        getNative: function () {
            return this.object;
        },

        referToElement: function (key) {
            return 'property: ' + this.className + '::$' + key;
        }
    });

    return ObjectValue;
});
