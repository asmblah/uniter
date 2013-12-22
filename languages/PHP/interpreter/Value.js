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
    './Error'
], function (
    util,
    NullReference,
    PHPError
) {
    'use strict';

    function Value(factory, type, value) {
        this.factory = factory;
        this.type = type;
        this.value = value;
    }

    util.extend(Value.prototype, {
        concat: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createString(leftValue.coerceToString().getNative() + rightValue.coerceToString().getNative());
        },

        getElementByKey: function (key, scopeChain) {
            return new NullReference(this.factory, {
                onSet: function () {
                    scopeChain.raiseError(PHPError.E_WARNING, 'Cannot use a scalar value as an array');
                }
            });
        },

        getNative: function () {
            return this.value;
        },

        getType: function () {
            return this.type;
        },

        isIdenticalTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.type === leftValue.type && rightValue.value === leftValue.value);
        }
    });

    return Value;
});
