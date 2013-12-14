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

    function ArrayElementReference(arrayValue, array, key) {
        this.array = array;
        this.arrayValue = arrayValue;
        this.key = key;
    }

    util.extend(ArrayElementReference.prototype, {
        get: function () {
            var reference = this;

            return reference.array[reference.key];
        },

        set: function (value) {
            var reference = this;

            reference.array[reference.key] = value;
            reference.arrayValue.setPointer(reference.key);
        }
    });

    return ArrayElementReference;
});
