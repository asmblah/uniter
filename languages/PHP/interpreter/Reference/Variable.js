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

    function VariableReference(variable) {
        this.variable = variable;
    }

    util.extend(VariableReference.prototype, {
        getValue: function () {
            return this.variable.getValue();
        },

        setValue: function (value) {
            this.variable.setValue(value);
        }
    });

    return VariableReference;
});
