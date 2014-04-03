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

    function IntegerValue(factory, callStack, value) {
        Value.call(this, factory, callStack, 'integer', value);
    }

    util.inherit(IntegerValue).from(Value);

    util.extend(IntegerValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToInteger(this);
        },

        addToBoolean: function (booleanValue) {
            var value = this;

            return value.factory.createInteger(value.value + booleanValue.value);
        },

        addToInteger: function (rightValue) {
            var value = this;

            return value.factory.createInteger(value.value + rightValue.value);
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(!!value.value);
        },

        coerceToFloat: function () {
            var value = this;

            return value.factory.createFloat(value.value);
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

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToInteger(this);
        },

        isEqualToInteger: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.value === leftValue.value);
        },

        isEqualToNull: function () {
            var leftValue = this;

            return leftValue.factory.createBoolean(leftValue.value === 0);
        },

        isEqualToObject: function (objectValue) {
            return objectValue.isEqualToInteger(this);
        },

        isEqualToString: function (stringValue) {
            var integerValue = this;

            return integerValue.factory.createBoolean(integerValue.getNative() === parseFloat(stringValue.getNative()));
        },

        isLessThan: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createBoolean(leftValue.getNative() < rightValue.getNative());
        },

        multiply: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory,
                rightType = rightValue.getType();

            // Coerce to float and return a float if either operand is a float
            if (rightType === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().getNative() + rightValue.coerceToFloat().getNative());
            }

            return factory.createInteger(leftValue.getNative() * rightValue.getNative());
        },

        onesComplement: function () {
            /*jshint bitwise: false */
            return this.factory.createInteger(~this.value);
        },

        shiftLeftBy: function (rightValue) {
            /*jshint bitwise: false */
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createInteger(leftValue.getNative() << rightValue.coerceToInteger().getNative());
        },

        shiftRightBy: function (rightValue) {
            /*jshint bitwise: false */
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createInteger(leftValue.getNative() >> rightValue.coerceToInteger().getNative());
        },

        subtract: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            rightValue = rightValue.coerceToNumber();

            // Coerce to float and return a float if either operand is a float
            if (rightValue.getType() === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().getNative() - rightValue.coerceToFloat().getNative());
            }

            return factory.createInteger(leftValue.getNative() - rightValue.getNative());
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
