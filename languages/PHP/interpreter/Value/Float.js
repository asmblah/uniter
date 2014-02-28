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

    return function (internals, Value) {
        var valueFactory = internals.valueFactory;

        function Float(nativeValue) {
            this.nativeValue = nativeValue;
        }

        util.extend(Float.prototype, Value.prototype, {
            coerceToBoolean: function () {
                return valueFactory.createBoolean(!!this.nativeValue);
            },

            coerceToInteger: function () {
                /*jshint bitwise: false */
                return valueFactory.createInteger(this.nativeValue >> 0);
            },

            coerceToKey: function () {
                return this.coerceToInteger();
            },

            coerceToString: function () {
                return valueFactory.createString(this.nativeValue + '');
            },

            getType: function () {
                return 'float';
            },

            isEqualTo: function (rightValue) {
                return rightValue.isEqualToFloat(this);
            },

            isEqualToFloat: function (rightValue) {
                return valueFactory.createBoolean(rightValue.nativeValue === this.nativeValue);
            },

            isEqualToInteger: function (rightValue) {
                return valueFactory.createBoolean(rightValue.coerceToFloat().valueOf() === this.nativeValue);
            },

            isEqualToNull: function () {
                return valueFactory.createBoolean(this.nativeValue === 0);
            },

            isEqualToObject: function (objectValue) {
                return objectValue.isEqualToFloat(this);
            },

            isEqualToString: function (stringValue) {
                return valueFactory.createBoolean(this.nativeValue === stringValue.coerceToFloat().valueOf());
            },

            onesComplement: function () {
                /*jshint bitwise: false */
                return valueFactory.createInteger(~this.nativeValue);
            },

            shiftLeftBy: function (rightValue) {
                return this.coerceToInteger().shiftLeftBy(rightValue);
            },

            shiftRightBy: function (rightValue) {
                return this.coerceToInteger().shiftRightBy(rightValue);
            },

            toNegative: function () {
                return valueFactory.createFloat(-this.valueOf());
            },

            valueOf: function () {
                return this.nativeValue;
            }
        });

        return Float;
    };
});
