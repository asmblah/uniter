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
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Variable'
], function (
    PHPError,
    Variable
) {
    'use strict';

    return function (internals) {
        var callStack = internals.callStack,
            valueFactory = internals.valueFactory;

        return {
            'array_push': function (arrayReference) {
                var isReference = (arrayReference instanceof Variable),
                    arrayValue = isReference ? arrayReference.getValue() : arrayReference,
                    i,
                    reference,
                    value;

                for (i = 1; i < arguments.length; i++) {
                    reference = arguments[i];
                    value = (reference instanceof Variable) ? reference.getValue() : reference;
                    arrayValue.push(value);
                }

                return valueFactory.createInteger(arrayValue.getLength());
            },
            'current': function (arrayReference) {
                var isReference = (arrayReference instanceof Variable),
                    arrayValue = isReference ? arrayReference.getValue() : arrayReference;

                if (arrayValue.getPointer() >= arrayValue.getLength()) {
                    return valueFactory.createBoolean(false);
                }

                return arrayValue.getCurrentElement().getValue();
            },
            'next': function (arrayReference) {
                var isReference = (arrayReference instanceof Variable),
                    arrayValue = isReference ? arrayReference.getValue() : arrayReference;

                if (arrayValue.getType() !== 'array') {
                    callStack.raiseError(PHPError.E_WARNING, 'next() expects parameter 1 to be array, ' + arrayValue.getType() + ' given');
                    return valueFactory.createNull();
                }

                arrayValue.setPointer(arrayValue.getPointer() + 1);

                if (arrayValue.getPointer() >= arrayValue.getLength()) {
                    return valueFactory.createBoolean(false);
                }

                return arrayValue.getCurrentElement().getValue();
            }
        };
    };
});
