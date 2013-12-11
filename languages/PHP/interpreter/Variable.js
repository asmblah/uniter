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
    './Reference/Variable'
], function (
    util,
    VariableReference
) {
    'use strict';

    function Variable(valueFactory) {
        this.reference = null;
        this.value = valueFactory.createNull();
    }

    util.extend(Variable.prototype, {
        get: function () {
            var variable = this;

            return variable.value ? variable.value : variable.reference.get();
        },

        getReference: function () {
            return new VariableReference(this);
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
            var variable = this;

            if (variable.value) {
                variable.value = value;
            } else {
                variable.reference.set(value);
            }

            return value;
        },

        setReference: function (reference) {
            var variable = this;

            variable.reference = reference;
            variable.value = null;
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
