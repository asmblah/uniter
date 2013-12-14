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

    function KeyValuePair(key, value) {
        this.key = key;
        this.value = value;
    }

    util.extend(KeyValuePair.prototype, {
        getKey: function () {
            return this.key;
        },
        getValue: function () {
            return this.value;
        }
    });

    return KeyValuePair;
});
