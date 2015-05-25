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
    '../Error'
], function (
    util,
    PHPError
) {
    'use strict';

    var hasOwn = {}.hasOwnProperty;

    function PropertyReference(valueFactory, callStack, objectValue, key) {
        this.objectValue = objectValue;
        this.key = key;
        this.reference = null;
        this.callStack = callStack;
        this.valueFactory = valueFactory;
    }

    util.extend(PropertyReference.prototype, {
        clone: function () {
            var property = this;

            return new PropertyReference(
                property.valueFactory,
                property.callStack,
                property.objectValue,
                property.key
            );
        },

        getKey: function () {
            return this.key;
        },

        getValue: function () {
            var property = this,
                nativeObject = property.objectValue.getNative(),
                nativeKey = property.key.getNative();

            // Special value of native null (vs. NullValue) represents undefined
            if (!property.isDefined()) {
                property.callStack.raiseError(
                    PHPError.E_NOTICE,
                    'Undefined ' + property.objectValue.referToElement(
                        nativeKey
                    )
                );

                return property.valueFactory.createNull();
            }

            return property.reference ?
                property.reference.getValue() :
                property.valueFactory.coerce(
                    nativeObject[nativeKey]
                );
        },

        isDefined: function () {
            var defined = true,
                otherObject,
                property = this,
                nativeObject = property.objectValue.getNative(),
                nativeKey = property.key.getNative();

            if (property.reference) {
                return true;
            }

            // Allow properties inherited via the prototype chain up to but not including Object.prototype
            if (!hasOwn.call(nativeObject, nativeKey)) {
                otherObject = nativeObject;

                do {
                    otherObject = Object.getPrototypeOf(otherObject);
                    if (!otherObject || otherObject === Object.prototype) {
                        defined = false;
                        break;
                    }
                } while (!hasOwn.call(otherObject, nativeKey));
            }

            return defined;
        },

        isReference: function () {
            return !!this.reference;
        },

        setReference: function (reference) {
            var property = this;

            property.reference = reference;
        },

        setValue: function (value) {
            var property = this,
                nativeObject = property.objectValue.getNative(),
                nativeKey = property.key.getNative(),
                isFirstProperty = (property.objectValue.getLength() === 0);

            if (property.reference) {
                property.reference.setValue(value);
            } else {
                nativeObject[nativeKey] = value.getForAssignment();
            }

            if (isFirstProperty) {
                property.objectValue.setPointer(
                    property.objectValue.getKeys().indexOf(
                        property.key.getNative().toString()
                    )
                );
            }
        }
    });

    return PropertyReference;
});
