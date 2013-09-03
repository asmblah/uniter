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

    function FloatValue(factory, value) {
        Value.call(this, factory, 'float', value);
    }

    util.inherit(FloatValue).from(Value);

    util.extend(FloatValue.prototype, {
        add: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory,
                rightType = rightValue.getType();

            // Coerce to float and return a float if either operand is a float
            if (rightType === 'float') {
                return factory.createFloat(leftValue.coerceToFloat().get() + rightValue.coerceToFloat().get());
            }

            return factory.createInteger(leftValue.get() + rightValue.get());
        },

        coerceToFloat: function () {
            return this;
        },

        coerceToNumber: function () {
            return this;
        },

        coerceToString: function () {
            var value = this;

            return value.factory.createString(value.value);
        },

        onesComplement: function () {
            /*jshint bitwise: false */
            return this.factory.createInteger(~this.value);
        }
    });

    return FloatValue;
});
