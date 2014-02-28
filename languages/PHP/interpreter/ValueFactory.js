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
    './Value/Array',
    './Value/Boolean',
    './Value/Float',
    './Value/Integer',
    './Value/Null',
    './Value/Object',
    './Value/String',
    './Value'
], function (
    util,
    arrayValueClassFactory,
    booleanValueClassFactory,
    floatValueClassFactory,
    integerValueClassFactory,
    nullValueClassFactory,
    objectValueClassFactory,
    stringValueClassFactory,
    valueClassFactory
) {
    'use strict';

    function ValueFactory(callStack, sandboxGlobal) {
        var internals = {
                callStack: callStack,
                sandboxGlobal: sandboxGlobal,
                valueFactory: this
            },
            Value = valueClassFactory(internals);

        this.nextObjectID = 1;

        this.Array = arrayValueClassFactory(internals, Value);
        this.Boolean = booleanValueClassFactory(internals, Value);
        this.Float = floatValueClassFactory(internals, Value);
        this.Integer = integerValueClassFactory(internals, Value);
        this.Null = nullValueClassFactory(internals, Value);
        this.Object = objectValueClassFactory(internals, Value);
        this.String = stringValueClassFactory(internals, Value);
    }

    util.extend(ValueFactory.prototype, {
        coerce: function (value) {
            var factory = this;

            if (factory.isValue(value)) {
                return value;
            }

            return factory.createFromNative(value);
        },

        createArray: function (array) {
            var Array = this.Array;

            if (!(array instanceof Array)) {
                array = Array.prototype.slice.call(array);
            }

            array.init();

            return array;
        },

        createBoolean: function (nativeBoolean) {
            /*jshint -W053 */
            return new this.Boolean(nativeBoolean);
        },

        createFloat: function (nativeNumber) {
            return new this.Float(nativeNumber);
        },

        createFromNative: function (nativeValue) {
            var factory = this;

            if (util.isString(nativeValue)) {
                return factory.createString(nativeValue);
            }

            if (util.isNumber(nativeValue)) {
                return factory.createInteger(nativeValue);
            }

            if (util.isBoolean(nativeValue)) {
                return factory.createBoolean(nativeValue);
            }

            if (util.isArray(nativeValue)) {
                return factory.createArray(nativeValue);
            }

            return factory.createObject(nativeValue, 'Object');
        },

        createInteger: function (nativeNumber) {
            return new this.Integer(nativeNumber);
        },

        createNull: function () {
            return new this.Null();
        },

        createObject: function (nativeObject, className) {
            var factory = this,
                // Object ID tracking is incomplete: ID should be freed when all references are lost
                object = new factory.Object(nativeObject, className, factory.nextObjectID++);

            return object;
        },

        createString: function (nativeString) {
            return new this.String(nativeString);
        },

        isValue: function (value) {
            var factory = this;

            return (
                value instanceof factory.Array ||
                value instanceof factory.Boolean ||
                value instanceof factory.Float ||
                value instanceof factory.Integer ||
                value instanceof factory.Null ||
                value instanceof factory.Object ||
                value instanceof factory.String
            );
        }
    });

    return ValueFactory;
});
