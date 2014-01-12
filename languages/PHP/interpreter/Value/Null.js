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

    function NullValue(factory, scopeChain) {
        Value.call(this, factory, scopeChain, 'null', null);
    }

    util.inherit(NullValue).from(Value);

    util.extend(NullValue.prototype, {
        coerceToKey: function () {
            return this.factory.createString('');
        },

        coerceToString: function () {
            return this.factory.createString('');
        },

        isSet: function () {
            return false;
        }
    });

    return NullValue;
});
