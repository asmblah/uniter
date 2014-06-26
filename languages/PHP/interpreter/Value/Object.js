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
    './Array',
    '../KeyValuePair',
    '../Error',
    '../Error/Fatal'
], function (
    util,
    ArrayValue,
    KeyValuePair,
    PHPError,
    PHPFatalError
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function ObjectValue(factory, callStack, object, classObject, id) {
        ArrayValue.call(this, factory, callStack, object, 'object');

        this.classObject = classObject;
        this.id = id;
        this.object = object;
    }

    util.inherit(ObjectValue).from(ArrayValue);

    util.extend(ObjectValue.prototype, {
        add: function (rightValue) {
            return rightValue.addToObject(this);
        },

        addToArray: function () {
            var value = this;

            value.callStack.raiseError(PHPError.E_NOTICE, 'Object of class ' + value.classObject.getName() + ' could not be converted to int');

            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToBoolean: function (booleanValue) {
            var value = this;

            value.callStack.raiseError(PHPError.E_NOTICE, 'Object of class ' + value.classObject.getName() + ' could not be converted to int');

            return value.factory.createInteger((booleanValue.value ? 1 : 0) + 1);
        },

        addToFloat: function (floatValue) {
            var value = this;

            value.callStack.raiseError(PHPError.E_NOTICE, 'Object of class ' + value.classObject.getName() + ' could not be converted to int');

            return value.factory.createFloat(floatValue.value + 1);
        },

        call: function (args) {
            return this.callMethod('__invoke', args);
        },

        callMethod: function (name, args) {
            var defined = true,
                value = this,
                object = value.object,
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
                throw new PHPFatalError(PHPFatalError.UNDEFINED_METHOD, {className: value.classObject.getName(), methodName: name});
            }

            return value.factory.coerce(object[name].apply(value, args));
        },

        callStaticMethod: function (nameValue, args) {
            return this.classObject.callStaticMethod(nameValue.getNative(), args);
        },

        clone: function () {
            throw new Error('Unimplemented');
        },

        coerceToArray: function () {
            var elements = [],
                value = this;

            util.each(value.getKeys(), function (key) {
                elements.push(new KeyValuePair(key, value.getElementByKey(key).getValue()));
            });

            return value.factory.createArray(elements);
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(true);
        },

        coerceToKey: function () {
            this.callStack.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        getClassName: function () {
            return this.classObject.getName();
        },

        getForAssignment: function () {
            return this;
        },

        getID: function () {
            return this.id;
        },

        getInstancePropertyByName: function (nameValue) {
            var name = nameValue.getNative(),
                value = this;

            if (value.classObject.hasStaticPropertyByName(name)) {
                value.callStack.raiseError(PHPError.E_STRICT, 'Accessing static property ' + value.classObject.getName() + '::$' + name + ' as non static');
            }

            return value.getElementByKey(nameValue);
        },

        getNative: function () {
            return this.object;
        },

        getStaticPropertyByName: function (nameValue) {
            return this.classObject.getStaticPropertyByName(nameValue.getNative());
        },

        isEqualTo: function (rightValue) {
            return rightValue.isEqualToObject(this);
        },

        isEqualToArray: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToFloat: function (floatValue) {
            return this.factory.createBoolean(floatValue.getNative() === 1);
        },

        isEqualToInteger: function (integerValue) {
            return this.factory.createBoolean(integerValue.getNative() === 1);
        },

        isEqualToNull: function () {
            return this.factory.createBoolean(false);
        },

        isEqualToObject: function (rightValue) {
            var equal = true,
                leftValue = this,
                factory = leftValue.factory;

            if (rightValue.value.length !== leftValue.value.length || rightValue.getClassName() !== leftValue.getClassName()) {
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

        isEqualToString: function () {
            return this.factory.createBoolean(false);
        },

        isIdenticalTo: function (rightValue) {
            return rightValue.isIdenticalToObject(this);
        },

        isIdenticalToArray: function () {
            return this.factory.createBoolean(false);
        },

        isIdenticalToObject: function (rightValue) {
            var leftValue = this,
                factory = leftValue.factory;

            return factory.createBoolean(rightValue.value === leftValue.value);
        },

        referToElement: function (key) {
            return 'property: ' + this.getClassName() + '::$' + key;
        }
    });

    return ObjectValue;
});
