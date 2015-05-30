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
        addToArray: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        addToFloat: function (floatValue) {
            var leftValue = this;

            // Coerce to float and return a float if either operand is a float
            return leftValue.factory.createFloat(leftValue.coerceToFloat().getNative() + floatValue.getNative());
        },

        addToNull: function () {
            return this;
        },

        addToString: function (stringValue) {
            return stringValue.coerceToNumber().add(this.coerceToNumber());
        },

        callMethod: function (name) {
            throw new PHPFatalError(PHPFatalError.NON_OBJECT_METHOD_CALL, {
                name: name
            });
        },

        callStaticMethod: function () {
            throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
        },

        coerceToArray: function () {
            var value = this;

            return value.factory.createArray([value]);
        },

        coerceToFloat: function () {
            var value = this;

            return value.factory.createFloat(Number(value.value));
        },

        concat: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createString(leftValue.coerceToString().getNative() + rightValue.coerceToString().getNative());
        },

        getConstantByName: function () {
            throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
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

        getInstancePropertyByName: function () {
            throw new Error('Unimplemented');
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

        getValue: function () {
            return this;
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
        },

        logicalAnd: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(
                leftValue.coerceToBoolean().getNative() &&
                rightValue.coerceToBoolean().getNative()
            );
        },

        logicalNot: function () {
            var value = this;

            return value.factory.createBoolean(!value.coerceToBoolean().getNative());
        },

        subtractFromNull: function () {
            throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
        },

        toValue: function () {
            return this;
        },

        unwrapForJS: function () {
            return this.getNative();
        }
    });

    return Value;
});
