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
    '../Value'
], function (
    util,
    Value
) {
    'use strict';

    function NullValue(factory, callStack) {
        Value.call(this, factory, callStack, 'null', null);
    }

    util.inherit(NullValue).from(Value);

    util.extend(NullValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToNull();
        },

        addToBoolean: function (booleanValue) {
            return booleanValue.coerceToInteger();
        },

        coerceToArray: function () {
            // Null just casts to an empty array
            return this.factory.createArray();
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(false);
        },

        coerceToKey: function () {
            return this.factory.createString('');
        },

        coerceToString: function () {
            return this.factory.createString('');
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToNull(this);
        },

        isEqualToFloat: function (floatValue) {
            return floatValue.isEqualToNull();
        },

        isEqualToNull: function () {
            return this.factory.createBoolean(true);
        },

        isEqualToObject: function (objectValue) {
            return objectValue.isEqualToNull();
        },

        isEqualToString: function (stringValue) {
            return stringValue.isEqualToNull();
        },

        isSet: function () {
            return false;
        }
    });

    return NullValue;
});
