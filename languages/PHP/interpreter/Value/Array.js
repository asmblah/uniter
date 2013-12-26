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
    '../Reference/Element',
    '../KeyValuePair',
    '../Reference/Null',
    '../Error',
    '../Error/Fatal',
    '../Value'
], function (
    util,
    ElementReference,
    KeyValuePair,
    NullReference,
    PHPError,
    PHPFatalError,
    Value
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function ArrayValue(factory, orderedElements, type) {
        var elements = [],
            keysToElements = [],
            value = this;

        util.each(orderedElements, function (element, key) {
            if (element instanceof KeyValuePair) {
                key = element.getKey();
                element = element.getValue();
            } else {
                if (util.isNumber(key)) {
                    key = factory.createInteger(keysToElements.length);
                } else {
                    key = factory.createFromNative(key);
                }

                element = factory.coerce(element);
            }

            element = new ElementReference(factory, value, key, element);

            elements.push(element);
            keysToElements[key.getNative()] = element;
        });

        Value.call(this, factory, type || 'array', elements);

        this.keysToElements = keysToElements;
        this.pointer = 0;
    }

    util.inherit(ArrayValue).from(Value);

    util.extend(ArrayValue.prototype, {
        clone: function () {
            var arrayValue,
                orderedElements,
                value = this;

            util.each(value.value, function (element, index) {
                orderedElements[index] = element.clone();
            });

            arrayValue = value.factory.createArray(orderedElements);
            arrayValue.pointer = value.pointer;

            return arrayValue;
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(value.value.length > 0);
        },

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

        getKeys: function () {
            var keys = [];

            util.each(this.value, function (element) {
                keys.push(element.getKey());
            });

            return keys;
        },

        getNative: function () {
            var result = [];

            util.each(this.value, function (element) {
                result[element.getKey().getNative()] = element.getValue().getNative();
            });

            return result;
        },

        getCurrentElement: function () {
            var value = this;

            return value.value[value.pointer] || value.factory.createNull();
        },

        getElementByKey: function (key, scopeChain) {
            var element,
                keyValue,
                value = this;

            key = key.coerceToKey(scopeChain);

            if (!key) {
                // Could not be coerced to a key: error will already have been handled, just return NULL
                return new NullReference(value.factory);
            }

            keyValue = key.getNative();

            if (!hasOwn.call(value.keysToElements, keyValue)) {
                element = new ElementReference(value.factory, value, key, null);

                value.value.push(element);
                value.keysToElements[keyValue] = element;
            }

            return value.keysToElements[keyValue];
        },

        getElementByIndex: function (index) {
            return this.value[index] || (function () { throw new Error('Test me!'); }());
        },

        getKeyByIndex: function (index) {
            var value = this,
                element = value.value[index];

            return element ? element.key : null;
        },

        getLength: function () {
            return this.value.length;
        },

        getPointer: function () {
            return this.pointer;
        },

        next: function () {
            this.pointer++;
        },

        onesComplement: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        referToElement: function (key) {
            return 'offset: ' + key;
        },

        reset: function () {
            var value = this;

            value.pointer = 0;

            return value;
        },

        setPointer: function (pointer) {
            this.pointer = pointer;
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
