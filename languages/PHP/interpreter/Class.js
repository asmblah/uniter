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
    './Error',
    './Error/Fatal',
    './Reference/StaticProperty'
], function (
    util,
    PHPError,
    PHPFatalError,
    StaticPropertyReference
) {
    'use strict';

    var IS_STATIC = 'isStatic',
        VALUE = 'value',
        VISIBILITY = 'visibility',
        hasOwn = {}.hasOwnProperty;

    function Class(valueFactory, callStack, name, constructorName, InternalClass, staticPropertiesData) {
        var classObject = this,
            staticProperties = {};

        this.callStack = callStack;
        this.constructorName = constructorName;
        this.InternalClass = InternalClass;
        this.name = name;
        this.staticProperties = staticProperties;
        this.valueFactory = valueFactory;

        util.each(staticPropertiesData, function (data, name) {
            staticProperties[name] = new StaticPropertyReference(classObject, name, data[VISIBILITY], data[VALUE]);
        });
    }

    util.extend(Class.prototype, {
        callStaticMethod: function (name, args) {
            var classObject = this,
                defined = true,
                method,
                prototype = classObject.InternalClass.prototype,
                otherPrototype;

            // Allow methods inherited via the prototype chain up to but not including Object.prototype
            if (!hasOwn.call(prototype, name)) {
                otherPrototype = prototype;

                do {
                    otherPrototype = Object.getPrototypeOf(otherPrototype);
                    if (!otherPrototype || otherPrototype === Object.prototype) {
                        defined = false;
                        break;
                    }
                } while (!hasOwn.call(otherPrototype, name));
            }

            method = prototype[name];

            if (!defined || !util.isFunction(method)) {
                throw new PHPFatalError(PHPFatalError.CALL_TO_UNDEFINED_METHOD, {
                    className: classObject.name,
                    methodName: name
                });
            }

            if (!method[IS_STATIC]) {
                classObject.callStack.raiseError(PHPError.E_STRICT, 'Non-static method ' + method.data.classObject.name + '::' + name + '() should not be called statically');
            }

            return classObject.valueFactory.coerce(method.apply(null, args));
        },

        getInternalClass: function () {
            return this.InternalClass;
        },

        getName: function () {
            return this.name;
        },

        getStaticPropertyByName: function (name) {
            var classObject = this,
                currentClass,
                staticProperty;

            if (!hasOwn.call(classObject.staticProperties, name)) {
                throw new PHPFatalError(PHPFatalError.UNDECLARED_STATIC_PROPERTY, {
                    className: classObject.name,
                    propertyName: name
                });
            }

            staticProperty = classObject.staticProperties[name];

            // Property has public visibility; may be read from anywhere
            if (staticProperty.getVisibility() === 'public') {
                return staticProperty;
            }

            // Property is private; may only be read from methods of this class and not derivatives
            if (staticProperty.getVisibility() === 'private') {
                currentClass = classObject.callStack.getCurrent().getScope().getCurrentClass();

                if (!currentClass || currentClass.name !== classObject.name) {
                    throw new PHPFatalError(PHPFatalError.CANNOT_ACCESS_PRIVATE_PROPERTY, {
                        className: classObject.name,
                        propertyName: name
                    });
                }
            }

            return staticProperty;
        },

        instantiate: function (args) {
            var classObject = this,
                nativeObject = new classObject.InternalClass(),
                objectValue = classObject.valueFactory.createObject(nativeObject, classObject.getName());

            if (classObject.constructorName) {
                objectValue.callMethod(classObject.constructorName, args);
            }

            return objectValue;
        }
    });

    return Class;
});
