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
    'languages/PHP/interpreter/Error/Fatal'
], function (
    util,
    PHPFatalError
) {
    'use strict';

    return function (internals, Value) {
        var sandboxGlobal = internals.sandboxGlobal,
            valueFactory = internals.valueFactory,
            Boolean = sandboxGlobal.Boolean;

        util.extend(Boolean.prototype, Value.prototype, {
            coerceToBoolean: function () {
                return this;
            },

            coerceToInteger: function () {
                return valueFactory.createInteger(this.valueOf() ? 1 : 0);
            },

            coerceToKey: function () {
                return this.coerceToInteger();
            },

            coerceToString: function () {
                return valueFactory.createString(this.valueOf() ? '1' : '');
            },

            getType: function () {
                return 'boolean';
            },

            isEqualTo: function (rightValue) {
                return valueFactory.createBoolean(this.valueOf() === rightValue.coerceToBoolean().valueOf());
            },

            isEqualToObject: function () {
                return this;
            },

            isEqualToString: function (stringValue) {
                return valueFactory.createBoolean(stringValue.coerceToBoolean().valueOf() === this.valueOf());
            },

            onesComplement: function () {
                throw new PHPFatalError(PHPFatalError.UNSUPPORTED_OPERAND_TYPES);
            },

            shiftLeftBy: function (rightValue) {
                return this.coerceToInteger().shiftLeftBy(rightValue);
            },

            shiftRightBy: function (rightValue) {
                return this.coerceToInteger().shiftRightBy(rightValue);
            }
        });

        return Boolean;
    };
});
