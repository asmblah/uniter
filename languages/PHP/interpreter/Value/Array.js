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
    '../Reference/Null',
    '../KeyValuePair',
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    util,
    ElementReference,
    NullReference,
    KeyValuePair,
    PHPError,
    PHPFatalError
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    return function (internals, Value) {
        var callStack = internals.callStack,
            sandboxGlobal = internals.sandboxGlobal,
            valueFactory = internals.valueFactory,
            Array = sandboxGlobal.Array;

        util.extend(Array.prototype, Value.prototype, {
            clone: function () {
                var orderedElements = [];

                util.each(this, function (element) {
                    if (element && element.isDefined()) {
                        orderedElements.push(new KeyValuePair(element.getKey(), element.getValue()));
                    }
                });

                return valueFactory.createArray(orderedElements);
            },

            coerceToBoolean: function () {
                return valueFactory.createBoolean(this.length > 0);
            },

            coerceToInteger: function () {
                return valueFactory.createInteger(this.length === 0 ? 0 : 1);
            },

            coerceToKey: function () {
                callStack.raiseError(PHPError.E_WARNING, 'Illegal offset type');
            },

            coerceToString: function () {
                return valueFactory.createString('Array');
            },

            getCurrentElement: function () {
                var value = this;

                return value[value.pointer] || valueFactory.createNull();
            },

            getElementByIndex: function (index) {
                var value = this;

                return value[index] || (function () {
                    callStack.raiseError(PHPError.E_NOTICE, 'Undefined ' + value.referToElement(index));

                    return new NullReference(valueFactory);
                }());
            },

            getElementByKey: function (key) {
                var element,
                    keyValue,
                    value = this;

                key = key.coerceToKey(value.callStack);

                if (!key) {
                    // Could not be coerced to a key: error will already have been handled, just return NULL
                    return new NullReference(valueFactory);
                }

                keyValue = key.valueOf();

                if (!hasOwn.call(value.keysToElements, keyValue)) {
                    element = new ElementReference(valueFactory, callStack, value, key, null);

                    value.push(element);
                    value.keysToElements[keyValue] = element;
                }

                return value.keysToElements[keyValue];
            },

            getForAssignment: function () {
                return this.clone();
            },

            getKeyByIndex: function (index) {
                var element = this[index];

                return element ? element.key : null;
            },

            getKeys: function () {
                var keys = [];

                util.each(this, function (element) {
                    if (element) {
                        keys.push(element.getKey());
                    }
                });

                return keys;
            },

            getLength: function () {
                return this.getKeys().length;
            },

            getPointer: function () {
                return this.pointer;
            },

            getType: function () {
                return 'array';
            },

            init: function () {
                var keysToElements = [],
                    value = this,
                    orderedElements = value.slice();

                value.length = 0;

                util.each(orderedElements, function (element, sourceKey) {
                    var key;

                    if (element instanceof KeyValuePair) {
                        key = element.getKey();
                        element = element.getValue();
                    } else {
                        if (util.isNumber(sourceKey)) {
                            key = valueFactory.createInteger(keysToElements.length);
                        } else {
                            key = valueFactory.createFromNative(sourceKey);
                        }

                        element = valueFactory.coerce(element);
                    }

                    element = new ElementReference(valueFactory, callStack, value, key, element);

                    value.push(element);
                    keysToElements[key.valueOf()] = element;
                });

                value.keysToElements = keysToElements;
                value.pointer = 0;
            },

            isEqualTo: function (rightValue) {
                return rightValue.isEqualToArray(this);
            },

            isEqualToNull: function () {
                return valueFactory.createBoolean(this.length === 0);
            },

            isEqualToArray: function (rightValue) {
                var equal = true,
                    leftValue = this;

                if (rightValue.length !== leftValue.length) {
                    return valueFactory.createBoolean(false);
                }

                util.each(rightValue.keysToElements, function (element, nativeKey) {
                    if (!hasOwn.call(leftValue.keysToElements, nativeKey) || element.getValue().isNotEqualTo(leftValue.keysToElements[nativeKey].getValue()).valueOf()) {
                        equal = false;
                        return false;
                    }
                }, {keys: true});

                return valueFactory.createBoolean(equal);
            },

            isEqualToBoolean: function (rightValue) {
                return valueFactory.createBoolean(rightValue.valueOf() === (this.length > 0));
            },

            isEqualToFloat: function () {
                return valueFactory.createBoolean(false);
            },

            isEqualToInteger: function () {
                return valueFactory.createBoolean(false);
            },

            isEqualToObject: function () {
                return valueFactory.createBoolean(false);
            },

            isEqualToString: function () {
                return valueFactory.createBoolean(false);
            },

            isIdenticalTo: function (rightValue) {
                return rightValue.isIdenticalToArray(this);
            },

            isIdenticalToArray: function (rightValue) {
                var identical = true,
                    leftValue = this;

                if (rightValue.length !== leftValue.length) {
                    return valueFactory.createBoolean(false);
                }

                util.each(rightValue, function (element, index) {
                    if (
                        leftValue[index].getKey().isNotIdenticalTo(element.getKey()).valueOf() ||
                        leftValue[index].getValue().isNotIdenticalTo(element.getValue()).valueOf()
                    ) {
                        identical = false;
                        return false;
                    }
                });

                return valueFactory.createBoolean(identical);
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
            },

            valueOf: function () {
                var result = [];

                util.each(this, function (element) {
                    result[element.getKey().valueOf()] = element.getValue().valueOf();
                });

                return result;
            }
        });

        return Array;
    };
});
