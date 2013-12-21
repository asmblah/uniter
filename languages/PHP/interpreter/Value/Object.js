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

    function ObjectValue(factory, value, className, id) {
        ArrayValue.call(this, factory, value, 'object');

        this.className = className;
        this.id = id;
    }

    util.inherit(ObjectValue).from(ArrayValue);

    util.extend(ObjectValue.prototype, {
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
            return this.value;
        },

        referToElement: function (key) {
            return 'property: ' + this.className + '::$' + key;
        }
    });

    return ObjectValue;
});
