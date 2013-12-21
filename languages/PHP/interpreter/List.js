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

    function List(elements) {
        this.elements = elements;
    }

    util.extend(List.prototype, {
        setValue: function (value) {
            var listElements = this.elements;

            if (value.getType() !== 'array') {
                throw new Error('Unsupported');
            }

            util.each(listElements, function (reference, index) {
                reference.setValue(value.getElementByIndex(index).getValue());
            });

            return value;
        }
    });

    return List;
});
