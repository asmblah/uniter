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
    './Value/String'
], function (
    util,
    ArrayValue,
    BooleanValue,
    FloatValue,
    IntegerValue,
    NullValue,
    ObjectValue,
    StringValue
) {
    'use strict';

    function ValueFactory() {
        this.nextObjectID = 1;
    }

    util.extend(ValueFactory.prototype, {
        createArray: function (value) {
            return new ArrayValue(this, value);
        },
        createBoolean: function (value) {
            return new BooleanValue(this, value);
        },
        createFloat: function (value) {
            return new FloatValue(this, value);
        },
        createFromNative: function (nativeValue) {
            var factory = this;

            if (util.isNumber(nativeValue)) {
                return factory.createInteger(nativeValue);
            }

            return factory.createString(nativeValue);
        },
        createInteger: function (value) {
            return new IntegerValue(this, value);
        },
        createNull: function () {
            return new NullValue(this);
        },
        createObject: function (value, className) {
            var factory = this;

            // Object ID tracking is incomplete: ID should be freed when all references are lost
            return new ObjectValue(factory, value, className, factory.nextObjectID++);
        },
        createString: function (value) {
            return new StringValue(this, value);
        }
    });

    return ValueFactory;
});
