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

    return function (internals) {
        var callStack = internals.callStack,
            valueFactory = internals.valueFactory;

        // NB: Constructor is not used
        function Value() {}

        util.extend(Value.prototype, {
            callStaticMethod: function () {
                throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
            },

            concatenate: function (rightValue) {
                return valueFactory.createString(this.coerceToString() + rightValue.coerceToString());
            },

            getElementByKey: function () {
                return new NullReference(valueFactory, {
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

            getStaticPropertyByName: function () {
                throw new PHPFatalError(PHPFatalError.CLASS_NAME_NOT_VALID);
            },

            isEqualTo: function (rightValue) {
                /*jshint eqeqeq:false */
                return valueFactory.createBoolean(rightValue.valueOf() == this.valueOf());
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

                return valueFactory.createBoolean(rightValue.getType() === leftValue.getType() && rightValue.valueOf() === leftValue.valueOf());
            },

            isIdenticalToArray: function (rightValue) {
                return this.isIdenticalTo(rightValue);
            },

            isIdenticalToObject: function (rightValue) {
                return this.isIdenticalTo(rightValue);
            },

            isNotEqualTo: function (rightValue) {
                return valueFactory.createBoolean(!this.isEqualTo(rightValue).valueOf());
            },

            isNotIdenticalTo: function (rightValue) {
                return valueFactory.createBoolean(!this.isIdenticalTo(rightValue).valueOf());
            },

            isSet: function () {
                // All values except NULL are classed as 'set'
                return true;
            },

            toValue: function () {
                return this;
            }
        });

        return Value;
    };
});
