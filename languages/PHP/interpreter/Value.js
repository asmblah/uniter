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

    function Value(factory, scopeChain, type, value) {
        this.factory = factory;
        this.scopeChain = scopeChain;
        this.type = type;
        this.value = value;
    }

    util.extend(Value.prototype, {
        concat: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createString(leftValue.coerceToString().getNative() + rightValue.coerceToString().getNative());
        },

        getElementByKey: function () {
            var scopeChain = this.scopeChain;

            return new NullReference(this.factory, {
                onSet: function () {
                    scopeChain.raiseError(PHPError.E_WARNING, 'Cannot use a scalar value as an array');
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

        getType: function () {
            return this.type;
        },

        isIdenticalTo: function (rightValue) {
            var leftValue = this;

            return leftValue.factory.createBoolean(rightValue.type === leftValue.type && rightValue.value === leftValue.value);
        },

        isSet: function () {
            // All values except NULL are classed as 'set'
            return true;
        }
    });

    return Value;
});
