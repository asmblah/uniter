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
    '../Value'
], function (
    util,
    Value
) {
    'use strict';

    function ArrayValue(factory, value) {
        Value.call(this, factory, 'array', value);
    }

    util.inherit(ArrayValue).from(Value);

    util.extend(ArrayValue.prototype, {
        coerceToString: function () {
            return this.factory.createString('Array');
        },

        get: function () {
            var result = [];

            util.each(this.value, function (value) {
                result.push(value.get());
            });

            return result;
        },

        getElement: function (index) {
            return this.value[index.get()];
        }
    });

    return ArrayValue;
});
