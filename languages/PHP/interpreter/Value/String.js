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
     *
     */

    return function (internals, Value) {
        var sandboxGlobal = internals.sandboxGlobal,
            valueFactory = internals.valueFactory,
            String = sandboxGlobal.String;

        util.extend(String.prototype, Value.prototype, {
            call: function (args, namespaceScope) {
                return namespaceScope.getFunction(this.valueOf()).apply(null, args);
            },

            callStaticMethod: function (nameValue, args, namespaceScope) {
                var value = this,
                    classObject = namespaceScope.getClass(value.valueOf());

                return classObject.callStaticMethod(nameValue.valueOf(), args);
            },

            coerceToBoolean: function () {
                var nativeValue = this.valueOf();

                return valueFactory.createBoolean(nativeValue !== '' && nativeValue !== '0');
            },

            coerceToFloat: function () {
                var nativeValue = this.valueOf();

                return valueFactory.createFloat(/^(\d|-\d)/.test(nativeValue) ? parseFloat(nativeValue) : 0);
            },

            coerceToKey: function () {
                return this;
            },

            coerceToString: function () {
                return this;
            },

            getLength: function () {
                return this.length;
            },

            getStaticPropertyByName: function (nameValue, namespaceScope) {
                var classObject = namespaceScope.getClass(this.valueOf());

                return classObject.getStaticPropertyByName(nameValue.valueOf());
            },

            getType: function () {
                return 'string';
            },

            isEqualTo: function (rightValue) {
                return rightValue.isEqualToString(this);
            },

            isEqualToNull: function () {
                return valueFactory.createBoolean(this.valueOf() === '');
            },

            isEqualToObject: function () {
                return valueFactory.createBoolean(false);
            },

            isEqualToString: function (rightValue) {
                return valueFactory.createBoolean(this.valueOf() === rightValue.valueOf());
            }
        });

        return String;
    };
});
