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
    './Reference/Null',
    './Error',
    './Error/Fatal'
], function (
    util,
    NullReference,
    PHPError,
    PHPFatalError
) {
    'use strict';

    function Value(factory, callStack, type, value) {
        this.factory = factory;
        this.callStack = callStack;
        this.type = type;
        this.value = value;
    }

    util.extend(Value.prototype, {
        concat: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createString(leftValue.coerceToString().getNative() + rightValue.coerceToString().getNative());
        },

        getElementByKey: function () {
            var callStack = this.callStack;

            return new NullReference(this.factory, {
                onSet: function () {
                    callStack.raiseError(PHPError.E_WARNING, 'Cannot use a scalar value as an array');
                }
            });
        },

        getForAssignment: function () {
            return this;
        },

        getLength: function () {
            return this.coerceToString().getLength();
        },

        getNative: function () {
            return this.value;
        },

        getStaticPropertyByName: function () {
            throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
        },

        getType: function () {
            return this.type;
        },

        isEqualTo: function (rightValue) {
            /*jshint eqeqeq:false */
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.value == leftValue.value);
        },

        isEqualToArray: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToFloat: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToInteger: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToNull: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isEqualToObject: function (rightValue) {
            return this.isEqualTo(rightValue);
        },

        isIdenticalTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.type === leftValue.type && rightValue.value === leftValue.value);
        },

        isIdenticalToArray: function (rightValue) {
            return this.isIdenticalTo(rightValue);
        },

        isIdenticalToObject: function (rightValue) {
            return this.isIdenticalTo(rightValue);
        },

        isNotEqualTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(!leftValue.isEqualTo(rightValue).getNative());
        },

        isNotIdenticalTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(!leftValue.isIdenticalTo(rightValue).getNative());
        },

        isSet: function () {
            // All values except NULL are classed as 'set'
            return true;
        }
    });

    return Value;
});
