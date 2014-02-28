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
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    util,
    ElementReference,
    KeyValuePair,
    NullReference,
    PHPError,
    PHPFatalError
) {
    'use strict';

    /*
     *
     */

    var hasOwn = {}.hasOwnProperty;

    return function (internals, Value) {
        var callStack = internals.callStack,
            valueFactory = internals.valueFactory;

        function ObjectValue(nativeObject, className, id) {
            var elements = [],
                keysToElements = [],
                value = this;

            util.each(nativeObject, function (element, key) {
                if (element instanceof KeyValuePair) {
                    key = element.getKey();
                    element = element.getValue();
                } else {
                    if (util.isNumber(key)) {
                        key = valueFactory.createInteger(keysToElements.length);
                    } else {
                        key = valueFactory.createFromNative(key);
                    }

                    element = valueFactory.coerce(element);
                }

                element = new ElementReference(valueFactory, callStack, value, key, element);

                elements.push(element);
                keysToElements[key.valueOf()] = element;
            });

            value.className = className;
            value.elements = elements;
            value.id = id;
            value.keysToElements = keysToElements;
            value.nativeObject = nativeObject;
            value.pointer = 0;
        }

        util.extend(ObjectValue.prototype, Value.prototype, {
            call: function (args) {
                return this.callMethod('__invoke', args);
            },

            callMethod: function (name, args) {
                var defined = true,
                    value = this,
                    object = value.nativeObject,
                    otherObject;

                // Allow methods inherited via the prototype chain up to but not including Object.prototype
                if (!hasOwn.call(object, name)) {
                    otherObject = object;

                    do {
                        otherObject = Object.getPrototypeOf(otherObject);
                        if (!otherObject || otherObject === Object.prototype) {
                            defined = false;
                            break;
                        }
                    } while (!hasOwn.call(otherObject, name));
                }

                if (!defined || !util.isFunction(object[name])) {
                    throw new PHPFatalError(PHPFatalError.UNDEFINED_METHOD, {className: value.className, methodName: name});
                }

                return valueFactory.coerce(object[name].apply(value, args));
            },

            callStaticMethod: function (nameValue, args, namespaceScope) {
                var value = this,
                    classObject = namespaceScope.getClass(value.className);

                return classObject.callStaticMethod(nameValue.valueOf(), args);
            },

            coerceToBoolean: function () {
                return valueFactory.createBoolean(true);
            },

            getClassName: function () {
                return this.className;
            },

            getElementByIndex: function (index) {
                var value = this;

                return value.elements[index] || (function () {
                    callStack.raiseError(PHPError.E_NOTICE, 'Undefined ' + value.referToElement(index));

                    return new NullReference(valueFactory);
                }());
            },

            getElementByKey: function (key) {
                var element,
                    keyValue,
                    value = this;

                key = key.coerceToKey(callStack);

                if (!key) {
                    // Could not be coerced to a key: error will already have been handled, just return NULL
                    return new NullReference(valueFactory);
                }

                keyValue = key.valueOf();

                if (!hasOwn.call(value.keysToElements, keyValue)) {
                    element = new ElementReference(valueFactory, callStack, value, key, null);

                    value.elements.push(element);
                    value.keysToElements[keyValue] = element;
                }

                return value.keysToElements[keyValue];
            },

            getID: function () {
                return this.id;
            },

            getKeyByIndex: function (index) {
                var value = this,
                    element = value.elements[index];

                return element ? element.key : null;
            },

            getLength: function () {
                return this.elements.length;
            },

            getPropertyNames: function () {
                var keys = [];

                util.each(this.elements, function (element) {
                    keys.push(element.getKey());
                });

                return keys;
            },

            getStaticPropertyByName: function (nameValue, namespaceScope) {
                var value = this,
                    classObject = namespaceScope.getClass(value.className);

                return classObject.getStaticPropertyByName(nameValue.valueOf());
            },

            getType: function () {
                return 'object';
            },

            isEqualTo: function (rightValue) {
                return rightValue.isEqualToObject(this);
            },

            isEqualToArray: function () {
                return valueFactory.createBoolean(false);
            },

            isEqualToFloat: function (floatValue) {
                return valueFactory.createBoolean(floatValue.valueOf() === 1);
            },

            isEqualToInteger: function (integerValue) {
                return valueFactory.createBoolean(integerValue.valueOf() === 1);
            },

            isEqualToNull: function () {
                return valueFactory.createBoolean(false);
            },

            isEqualToObject: function (rightValue) {
                var equal = true,
                    leftValue = this;

                if (rightValue.elements.length !== leftValue.elements.length || rightValue.className !== leftValue.className) {
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

            isEqualToString: function () {
                return valueFactory.createBoolean(false);
            },

            referToElement: function (key) {
                return 'property: ' + this.className + '::$' + key;
            },

            reset: function () {
                var value = this;

                value.pointer = 0;

                return value;
            },

            valueOf: function () {
                return this.elements;
            }
        });

        return ObjectValue;
    };
});
