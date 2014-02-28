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
    'js/util'
], function (
    util
) {
    'use strict';

    /*
     * Null has no prototype, so we have to represent it with a custom class.
     */

    return function (internals, Value) {
        var valueFactory = internals.valueFactory;

        function Null() {}

        util.extend(Null.prototype, Value.prototype, {
            coerceToBoolean: function () {
                return valueFactory.createBoolean(false);
            },

            coerceToString: function () {
                return valueFactory.createString('');
            },

            getType: function () {
                return 'null';
            },

            isEqualTo: function (rightValue) {
                return rightValue.isEqualToNull(this);
            },

            isEqualToFloat: function (floatValue) {
                return floatValue.isEqualToNull();
            },

            isEqualToNull: function () {
                return valueFactory.createBoolean(true);
            },

            isEqualToObject: function (objectValue) {
                return objectValue.isEqualToNull();
            },

            isEqualToString: function (stringValue) {
                return stringValue.isEqualToNull();
            },

            isSet: function () {
                return false;
            },

            valueOf: function () {
                return null;
            }
        });

        return Null;
    };
});
