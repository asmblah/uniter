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

    function NullReference(valueFactory, options) {
        options = options || {};

        this.onSet = options.onSet;
        this.valueFactory = valueFactory;
    }

    util.extend(NullReference.prototype, {
        getValue: function () {
            return this.valueFactory.createNull();
        },

        setValue: function () {
            var reference = this;

            if (reference.onSet) {
                reference.onSet();
            }
        }
    });

    return NullReference;
});
