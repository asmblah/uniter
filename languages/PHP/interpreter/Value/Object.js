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
    '../Error',
    '../Value'
], function (
    util,
    PHPError,
    Value
) {
    'use strict';

    function ObjectValue(factory, value, className) {
        Value.call(this, factory, 'object', value);

        this.className = className;
    }

    util.inherit(ObjectValue).from(Value);

    util.extend(ObjectValue.prototype, {
        coerceToKey: function (scopeChain) {
            scopeChain.raiseError(PHPError.E_WARNING, 'Illegal offset type');
        },

        getClassName: function () {
            return this.className;
        }
    });

    return ObjectValue;
});
