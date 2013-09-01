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

    function ObjectValue(factory, value) {
        Value.call(this, factory, 'object', value);
    }

    util.inherit(ObjectValue).from(Value);

    util.extend(ObjectValue.prototype, {

    });

    return ObjectValue;
});
