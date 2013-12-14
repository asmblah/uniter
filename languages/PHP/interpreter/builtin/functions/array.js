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
    'languages/PHP/interpreter/Variable'
], function (
    Variable
) {
    'use strict';

    return function (internals) {
        var valueFactory = internals.valueFactory;

        return {
            'current': function (arrayReference) {
                var isReference = (arrayReference instanceof Variable),
                    arrayValue = isReference ? arrayReference.get() : arrayReference;

                if (arrayValue.getPointer() >= arrayValue.getLength()) {
                    return valueFactory.createBoolean(false);
                }

                return arrayValue.getCurrentElement();
            },
            'next': function (arrayReference) {
                var isReference = (arrayReference instanceof Variable),
                    arrayValue = isReference ? arrayReference.get() : arrayReference;

                arrayValue.setPointer(arrayValue.getPointer() + 1);

                if (arrayValue.getPointer() >= arrayValue.getLength()) {
                    return valueFactory.createBoolean(false);
                }

                return arrayValue.getCurrentElement();
            }
        };
    };
});
