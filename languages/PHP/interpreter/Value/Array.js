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

    function ArrayValue(factory, scopeChain, orderedElements, type) {
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

            element = new ElementReference(factory, scopeChain, value, key, element);

            elements.push(element);
            keysToElements[key.getNative()] = element;
        });

        Value.call(this, factory, scopeChain, type || 'array', elements);

        this.keysToElements = keysToElements;
        this.pointer = 0;
    }

    util.inherit(ArrayValue).from(Value);

    util.extend(ArrayValue.prototype, {
        clone: function () {
            var arrayValue = this,
                orderedElements = [];

            util.each(arrayValue.value, function (element) {
                if (element.isDefined()) {
                    orderedElements.push(new KeyValuePair(element.getKey(), element.getValue()));
                }
            });

            return new ArrayValue(arrayValue.factory, arrayValue.scopeChain, orderedElements, arrayValue.type);
        },

        coerceToBoolean: function () {
            var value = this;

            return value.factory.createBoolean(value.value.length > 0);
        },

        coerceToInteger: function () {
            var value = this;

            return value.factory.createInteger(value.value.length === 0 ? 0 : 1);
        },

        coerceToKey: function () {
            this.scopeChain.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        coerceToNumber: function () {
            return this.coerceToInteger();
        },

        coerceToString: function () {
            return this.factory.createString('Array');
        },

        getForAssignment: function () {
            return this.clone();
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

        getElementByKey: function (key) {
            var element,
                keyValue,
                value = this;

            key = key.coerceToKey(value.scopeChain);

            if (!key) {
                // Could not be coerced to a key: error will already have been handled, just return NULL
                return new NullReference(value.factory);
            }

            keyValue = key.getNative();

            if (!hasOwn.call(value.keysToElements, keyValue)) {
                element = new ElementReference(value.factory, value.scopeChain, value, key, null);

                value.value.push(element);
                value.keysToElements[keyValue] = element;
            }

            return value.keysToElements[keyValue];
        },

        getElementByIndex: function (index) {
            var value = this;

            return value.value[index] || (function () {
                value.scopeChain.raiseError(PHPError.E_NOTICE, 'Undefined ' + value.referToElement(index));

                return new NullReference(value.factory);
            }());
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

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToArray(this);
        },

        isEqualToNull: function () {
            var value = this;

            return value.factory.createBoolean(value.value.length === 0);
        },

        isEqualToArray: function (rightValue) {
            var equal = true,
                leftValue = this,
                factory = leftValue.factory;

            if (rightValue.value.length !== leftValue.value.length) {
                return factory.createBoolean(false);
            }

            util.each(rightValue.keysToElements, function (element, nativeKey) {
                if (!hasOwn.call(leftValue.keysToElements, nativeKey) || element.getValue().isNotEqualTo(leftValue.keysToElements[nativeKey].getValue()).getNative()) {
                    equal = false;
                    return false;
                }
            }, {keys: true});

            return factory.createBoolean(equal);
        },

        isEqualToBoolean: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.getNative() === (leftValue.value.length > 0));
        },

        isEqualToFloat: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToInteger: function () {
            return this.factory.createBoolean(false);
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
