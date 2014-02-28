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

    /*
     * We can only use JavaScript Number objects to represent either integers or floats;
     * as integers seem to be more common, we use Number for integers
     * and a custom Float class for floats.
     */

    return function (internals, Value) {
        var sandboxGlobal = internals.sandboxGlobal,
            valueFactory = internals.valueFactory,
            Number = sandboxGlobal.Number;

        util.extend(Number.prototype, Value.prototype, {
            add: function (rightValue) {
                var leftValue = this;

                rightValue = rightValue.coerceToNumber();

                // Coerce to float and return a float if either operand is a float
                if (rightValue.getType() === 'float') {
                    return valueFactory.createFloat(leftValue.coerceToFloat().valueOf() + rightValue.valueOf());
                }

                return valueFactory.createInteger(leftValue.valueOf() + rightValue.valueOf());
            },

            coerceToBoolean: function () {
                return valueFactory.createBoolean(!!this.valueOf());
            },

            coerceToFloat: function () {
                return valueFactory.createFloat(this.valueOf());
            },

            coerceToInteger: function () {
                return this;
            },

            coerceToKey: function () {
                return this;
            },

            coerceToNumber: function () {
                return this;
            },

            coerceToString: function () {
                return valueFactory.createString(this.toString());
            },

            decrement: function () {
                return valueFactory.createInteger(this.valueOf() - 1);
            },

            getType: function () {
                return 'integer';
            },

            increment: function () {
                return valueFactory.createInteger(this.valueOf() + 1);
            },

            isEqualTo: function (rightValue) {
                return rightValue.isEqualToInteger(this);
            },

            isEqualToInteger: function (rightValue) {
                return valueFactory.createBoolean(rightValue.valueOf() === this.valueOf());
            },

            isEqualToNull: function () {
                return valueFactory.createBoolean(this.valueOf() === 0);
            },

            isEqualToObject: function (objectValue) {
                return objectValue.isEqualToInteger(this);
            },

            isEqualToString: function (stringValue) {
                return valueFactory.createBoolean(this.valueOf() === parseFloat(stringValue.valueOf()));
            },

            isLessThan: function (rightValue) {
                return valueFactory.createBoolean(this.valueOf() < rightValue.valueOf());
            },

            multiply: function (rightValue) {
                var leftValue = this,
                    rightType = rightValue.getType();

                // Coerce to float and return a float if either operand is a float
                if (rightType === 'float') {
                    return valueFactory.createFloat(leftValue.coerceToFloat().valueOf() + rightValue.coerceToFloat().valueOf());
                }

                return valueFactory.createInteger(leftValue.valueOf() * rightValue.valueOf());
            },

            onesComplement: function () {
                /*jshint bitwise: false */
                return valueFactory.createInteger(~this.valueOf());
            },

            shiftLeftBy: function (rightValue) {
                /*jshint bitwise: false */
                var leftValue = this;

                return valueFactory.createInteger(leftValue.valueOf() << rightValue.coerceToInteger().valueOf());
            },

            shiftRightBy: function (rightValue) {
                /*jshint bitwise: false */
                var leftValue = this;

                return valueFactory.createInteger(leftValue.valueOf() >> rightValue.coerceToInteger().valueOf());
            },

            subtract: function (rightValue) {
                var leftValue = this;

                rightValue = rightValue.coerceToNumber();

                // Coerce to float and return a float if either operand is a float
                if (rightValue.getType() === 'float') {
                    return valueFactory.createFloat(leftValue.coerceToFloat().valueOf() - rightValue.coerceToFloat().valueOf());
                }

                return valueFactory.createInteger(leftValue.valueOf() - rightValue.valueOf());
            },

            toNegative: function () {
                return valueFactory.createInteger(-this.valueOf());
            }
        });

        return Number;
    };
});
