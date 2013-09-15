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

    function IntegerValue(factory, value) {
        Value.call(this, factory, 'integer', value);
    }

    util.inherit(IntegerValue).from(Value);

    util.extend(IntegerValue.prototype, {
        add: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            rightValue = rightValue.coerceToNumber();

            // Coerce to float and return a float if either operand is a float
            if (rightValue.getType() === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().get() + rightValue.get());
            }

            return factory.createInteger(leftValue.get() + rightValue.get());
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(!!value.value);
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
            var value = this;

            return value.factory.createString(value.value.toString());
        },

        decrement: function () {
            var value = this;

            return value.factory.createInteger(value.value - 1);
        },

        getElement: function () {
            // Array access on integers always returns null, no notice or warning is raised
            return this.factory.createNull();
        },

        increment: function () {
            var value = this;

            return value.factory.createInteger(value.value + 1);
        },

        multiply: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory,
                rightType = rightValue.getType();

            // Coerce to float and return a float if either operand is a float
            if (rightType === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().get() + rightValue.coerceToFloat().get());
            }

            return factory.createInteger(leftValue.get() * rightValue.get());
        },

        onesComplement: function () {
            /*jshint bitwise: false */
            return this.factory.createInteger(~this.value);
        },

        shiftLeftBy: function (rightValue) {
            /*jshint bitwise: false */
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createInteger(leftValue.get() << rightValue.coerceToInteger().get());
        },

        shiftRightBy: function (rightValue) {
            /*jshint bitwise: false */
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createInteger(leftValue.get() >> rightValue.coerceToInteger().get());
        },

        subtract: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            rightValue = rightValue.coerceToNumber();

            // Coerce to float and return a float if either operand is a float
            if (rightValue.getType() === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().get() - rightValue.coerceToFloat().get());
            }

            return factory.createInteger(leftValue.get() - rightValue.get());
        },

        toNegative: function () {
            var value = this;

            return value.factory.createInteger(-value.value);
        },

        toPositive: function () {
            var value = this;

            return value.factory.createInteger(+value.value);
        }
    });

    return IntegerValue;
});
