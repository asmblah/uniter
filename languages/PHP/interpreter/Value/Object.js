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
    'phpcommon',
    'js/util',
    '../KeyValuePair',
    '../Reference/Null',
    '../Error/Fatal',
    '../Reference/Property',
    '../Value'
], function (
    phpCommon,
    util,
    KeyValuePair,
    NullReference,
    PHPFatalError,
    PropertyReference,
    Value
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty,
        PHPError = phpCommon.PHPError;

    function ObjectValue(factory, callStack, object, classObject, id) {
        Value.call(this, factory, callStack, 'object', object);

        this.classObject = classObject;
        this.id = id;
        this.properties = {};
    }

    util.inherit(ObjectValue).from(Value);

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
                func,
                value = this,
                object = value.value,
                otherObject,
                thisObject = value,
                thisVariable;

            // Call functions directly when invoking the magic method
            if (name === '__invoke' && util.isFunction(object)) {
                func = object;
            } else {
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

                func = object[name];
            }

            if (!defined || !util.isFunction(func)) {
                throw new PHPFatalError(
                    PHPFatalError.UNDEFINED_METHOD,
                    {
                        className: value.classObject.getName(),
                        methodName: name
                    }
                );
            }

            // Unwrap thisObj and argument Value objects when calling out
            // to a native JS object method
            if (value.classObject.getName() === 'JSObject') {
                thisObject = object;
                util.each(args, function (arg, index) {
                    args[index] = arg.unwrapForJS();
                });
            // Use the current object as $this for PHP closures by default
            } else if (value.classObject.getName() === 'Closure') {
                // Store the current PHP thisObj to set for the closure
                thisVariable = object.scopeWhenCreated.getVariable('this');
                thisObject = thisVariable.isDefined() ?
                    thisVariable.getValue() :
                    null;
            }

            return value.factory.coerce(func.apply(thisObject, args));
        },

        callStaticMethod: function (nameValue, args) {
            return this.classObject.callStaticMethod(nameValue.getNative(), args);
        },

        clone: function () {
            throw new Error('Unimplemented');
        },

        coerceToArray: function () {
            var elements = [],
                value = this,
                factory = value.factory;

            util.each(value.value, function (propertyValue, propertyName) {
                elements.push(
                    new KeyValuePair(
                        factory.coerce(propertyName),
                        factory.coerce(propertyValue)
                    )
                );
            });

            return value.factory.createArray(elements);
        },

        coerceToBoolean: function () {
            return this.factory.createBoolean(true);
        },

        coerceToKey: function () {
            this.callStack.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        coerceToString: function () {
            return this.callMethod('__toString');
        },

        getClassName: function () {
            return this.classObject.getName();
        },

        getConstantByName: function (name) {
            return this.classObject.getConstantByName(name);
        },

        getElementByIndex: function (index) {
            var value = this,
                names = value.getInstancePropertyNames();

            if (!hasOwn.call(names, index)) {
                value.callStack.raiseError(
                    PHPError.E_NOTICE,
                    'Undefined ' + value.referToElement(index)
                );

                return new NullReference(value.factory);
            }

            return value.getInstancePropertyByName(names[index]);
        },

        getForAssignment: function () {
            return this;
        },

        getID: function () {
            return this.id;
        },

        getInstancePropertyByName: function (nameValue) {
            var nameKey = nameValue.coerceToKey(),
                name = nameKey.getNative(),
                value = this;

            if (value.classObject.hasStaticPropertyByName(name)) {
                value.callStack.raiseError(PHPError.E_STRICT, 'Accessing static property ' + value.classObject.getName() + '::$' + name + ' as non static');
            }

            if (!hasOwn.call(value.properties, name)) {
                value.properties[name] = new PropertyReference(
                    value.factory,
                    value.callStack,
                    value,
                    nameKey
                );
            }

            return value.properties[name];
        },

        getInstancePropertyNames: function () {
            var nameHash = {},
                names = [],
                value = this;

            util.each(value.value, function (value, name) {
                nameHash[name] = true;
            });

            util.each(value.properties, function (value, name) {
                nameHash[name] = true;
            });

            util.each(nameHash, function (t, name) {
                names.push(value.factory.coerce(name));
            });

            return names;
        },

        getKeyByIndex: function (index) {
            var value = this,
                keys = value.getInstancePropertyNames();

            return keys[index] || null;
        },

        getLength: function () {
            return this.getInstancePropertyNames().length;
        },

        getNative: function () {
            return this.value;
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

            if (
                rightValue.getLength() !== leftValue.getLength() ||
                rightValue.getClassName() !== leftValue.getClassName()
            ) {
                return factory.createBoolean(false);
            }

            util.each(rightValue.value, function (element, nativeKey) {
                if (
                    !hasOwn.call(leftValue.value, nativeKey) ||
                    factory.coerce(element).isNotEqualTo(
                        leftValue.value[nativeKey].getValue()
                    ).getNative()
                ) {
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
        },

        reset: function () {
            var value = this;

            value.pointer = 0;

            return value;
        },

        setPointer: function (pointer) {
            this.pointer = pointer;
        },

        unwrapForJS: function () {
            var value = this;

            if (value.classObject.getName() === 'Closure') {
                // When calling a PHP closure from JS, preserve thisObj
                // by passing it in (wrapped) as the first argument
                return function () {
                    // Wrap thisObj in *Value object
                    var thisObj = value.factory.coerce(this),
                        args = [];

                    // Wrap all native JS values in *Value objects
                    util.each(arguments, function (arg) {
                        args.push(value.factory.coerce(arg));
                    });

                    return value.value.apply(thisObj, args);
                };
            }

            return value.getNative();
        }
    });

    return ObjectValue;
});
