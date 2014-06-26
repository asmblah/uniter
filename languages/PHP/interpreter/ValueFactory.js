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
    ArrayValue,
    BooleanValue,
    FloatValue,
    IntegerValue,
    NullValue,
    ObjectValue,
    StringValue,
    Value
) {
    'use strict';

    function ValueFactory(callStack) {
        this.nextObjectID = 1;
        this.callStack = callStack;
        this.globalNamespace = null;
    }

    util.extend(ValueFactory.prototype, {
        coerce: function (value) {
            if (value instanceof Value) {
                return value;
            }

            return this.createFromNative(value);
        },
        createArray: function (value) {
            var factory = this;

            return new ArrayValue(factory, factory.callStack, value);
        },
        createBoolean: function (value) {
            var factory = this;

            return new BooleanValue(factory, factory.callStack, value);
        },
        createFloat: function (value) {
            var factory = this;

            return new FloatValue(factory, factory.callStack, value);
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

            return factory.createObject(nativeValue, factory.globalNamespace.getClass('stdClass'));
        },
        createInteger: function (value) {
            var factory = this;

            return new IntegerValue(factory, factory.callStack, value);
        },
        createNull: function () {
            var factory = this;

            return new NullValue(factory, factory.callStack);
        },
        createObject: function (value, classObject) {
            var factory = this;

            // Object ID tracking is incomplete: ID should be freed when all references are lost
            return new ObjectValue(factory, factory.callStack, value, classObject, factory.nextObjectID++);
        },
        createString: function (value) {
            var factory = this;

            return new StringValue(factory, factory.callStack, value);
        },
        isValue: function (object) {
            return object instanceof Value;
        },
        setGlobalNamespace: function (globalNamespace) {
            this.globalNamespace = globalNamespace;
        }
    });

    return ValueFactory;
});
