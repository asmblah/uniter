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

    function ObjectPropertyReference(objectValue, object, key) {
        this.key = key;
        this.object = object;
        this.objectValue = objectValue;
    }

    util.extend(ObjectPropertyReference.prototype, {
        get: function () {
            var reference = this;

            return reference.object[reference.key];
        },

        set: function (value) {
            var reference = this;

            reference.object[reference.key] = value;
        }
    });

    return ObjectPropertyReference;
});
