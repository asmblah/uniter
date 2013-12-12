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
        set: function (value) {
            var arrayElements,
                list = this,
                listElements = list.elements,
                index,
                length;

            if (value.getType() !== 'array') {
                throw new Error('Unsupported');
            }

            arrayElements = value.get();

            for (index = 0, length = listElements.length; index < length; index++) {
                listElements[index].set(arrayElements[index]);
            }

            return value;
        }
    });

    return List;
});
