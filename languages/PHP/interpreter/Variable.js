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

    function Variable(valueFactory) {
        this.value = valueFactory.createNull();
    }

    util.extend(Variable.prototype, {
        get: function () {
            return this.value;
        },

        postDecrement: function () {
            var variable = this,
                decrementedValue = variable.value.decrement(),
                result = variable.value;

            if (decrementedValue) {
                variable.value = decrementedValue;
            }

            return result;
        },

        preDecrement: function () {
            var variable = this,
                decrementedValue = variable.value.decrement();

            if (decrementedValue) {
                variable.value = decrementedValue;
            }

            return variable.value;
        },

        postIncrement: function () {
            var variable = this,
                incrementedValue = variable.value.increment(),
                result = variable.value;

            if (incrementedValue) {
                variable.value = incrementedValue;
            }

            return result;
        },

        preIncrement: function () {
            var variable = this,
                incrementedValue = variable.value.increment();

            if (incrementedValue) {
                variable.value = incrementedValue;
            }

            return variable.value;
        },

        set: function (value) {
            this.value = value;
        },

        toArray: function () {
            return this.value.toArray();
        },

        toBoolean: function () {
            return this.value.toBoolean();
        },

        toFloat: function () {
            return this.value.toFloat();
        },

        toInteger: function () {
            return this.value.toInteger();
        }
    });

    return Variable;
});
