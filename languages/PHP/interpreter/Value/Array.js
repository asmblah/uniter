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
    '../Error',
    '../Error/Fatal',
    '../Value'
], function (
    util,
    PHPError,
    PHPFatalError,
    Value
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function ArrayValue(factory, value) {
        Value.call(this, factory, 'array', value);
    }

    util.inherit(ArrayValue).from(Value);

    util.extend(ArrayValue.prototype, {
        coerceToInteger: function () {
            var value = this;

            return value.factory.createInteger(value.value.length === 0 ? 0 : 1);
        },

        coerceToKey: function (scopeChain) {
            scopeChain.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        coerceToNumber: function () {
            return this.coerceToInteger();
        },

        coerceToString: function () {
            return this.factory.createString('Array');
        },

        get: function () {
            var result = [];

            util.each(this.value, function (value) {
                result.push(value.get());
            });

            return result;
        },

        getElement: function (key, scopeChain) {
            var keyValue,
                value = this;

            key = key.coerceToKey(scopeChain);

            if (!key) {
                // Could not be coerced to a key: error will already have been handled, just return NULL
                return value.factory.createNull();
            }

            keyValue = key.get();

            if (!hasOwn.call(value.value, keyValue)) {
                scopeChain.raiseError(PHPError.E_NOTICE, 'Undefined offset: ' + keyValue);
                return value.factory.createNull();
            }

            return value.value[keyValue];
        },

        onesComplement: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        shiftLeftBy: function (rightValue) {
            return this.coerceToInteger().shiftLeftBy(rightValue);
        },

        shiftRightBy: function (rightValue) {
            return this.coerceToInteger().shiftRightBy(rightValue);
        }
    });

    return ArrayValue;
});
