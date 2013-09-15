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

    function StringValue(factory, value) {
        Value.call(this, factory, 'string', value);
    }

    util.inherit(StringValue).from(Value);

    util.extend(StringValue.prototype, {
        add: function (rightValue) {
            return rightValue.coerceToNumber().add(this.coerceToNumber());
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(this.value !== '' && this.value !== '0');
        },

        coerceToFloat: function () {
            var value = this;

            return value.factory.createFloat(/^(\d|-\d)/.test(value.value) ? parseFloat(value.value) : 0);
        },

        coerceToInteger: function () {
            var value = this;

            return value.factory.createInteger(/^(\d|-\d)/.test(value.value) ? parseInt(value.value, 10) : 0);
        },

        coerceToNumber: function () {
            var value = this,
                isInteger = !/^[.eE]+$/.test(value.value);

            if (isInteger) {
                return value.coerceToInteger();
            } else {
                return value.coerceToFloat();
            }
        },

        coerceToString: function () {
            return this;
        },

        concat: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createString(leftValue.coerceToString().get() + rightValue.coerceToString().get());
        },

        onesComplement: function () {
            return this.factory.createString('?');
        }
    });

    return StringValue;
});
