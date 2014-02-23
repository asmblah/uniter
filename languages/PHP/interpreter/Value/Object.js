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
    '../Error',
    '../Error/Fatal'
], function (
    util,
    ArrayValue,
    PHPError,
    PHPFatalError
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function ObjectValue(factory, callStack, object, className, id) {
        ArrayValue.call(this, factory, callStack, object, 'object');

        this.className = className;
        this.id = id;
        this.object = object;
    }

    util.inherit(ObjectValue).from(ArrayValue);

    util.extend(ObjectValue.prototype, {
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
                throw new PHPFatalError(PHPFatalError.UNDEFINED_METHOD, {className: value.className, methodName: name});
            }

            return value.factory.coerce(object[name].apply(value, args));
        },

        callStaticMethod: function (nameValue, args, namespaceScope) {
            var value = this,
                classObject = namespaceScope.getClass(value.className);

            return classObject.callStaticMethod(nameValue.getNative(), args);
        },

        clone: function () {
            throw new Error('Unimplemented');
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(true);
        },

        coerceToKey: function () {
            this.callStack.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        getClassName: function () {
            return this.className;
        },

        getForAssignment: function () {
            return this;
        },

        getID: function () {
            return this.id;
        },

        getNative: function () {
            return this.object;
        },

        getStaticPropertyByName: function (nameValue, namespaceScope) {
            var value = this,
                classObject = namespaceScope.getClass(value.className);

            return classObject.getStaticPropertyByName(nameValue.getNative());
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

            if (rightValue.value.length !== leftValue.value.length || rightValue.className !== leftValue.className) {
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
            return 'property: ' + this.className + '::$' + key;
        }
    });

    return ObjectValue;
});
