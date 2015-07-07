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
    'languages/PHP/interpreter/Error',
    'languages/PHP/interpreter/Variable'
], function (
    util,
    PHPError,
    Variable
) {
    'use strict';

    var IMPLODE = 'implode';

    return function (internals) {
        var callStack = internals.callStack,
            methods,
            valueFactory = internals.valueFactory;

        methods = {
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
            'implode': function (glueReference, piecesReference) {
                var glueValue = glueReference.getValue(),
                    piecesValue = piecesReference.getValue(),
                    tmp,
                    values;

                // For backwards-compatibility, PHP supports receiving args in either order
                if (glueValue.getType() === 'array') {
                    tmp = glueValue;
                    glueValue = piecesValue;
                    piecesValue = tmp;
                }

                values = piecesValue.getValues();

                util.each(values, function (value, key) {
                    values[key] = value.coerceToString().getNative();
                });

                return valueFactory.createString(values.join(glueValue.getNative()));
            },
            'join': function (glueReference, piecesReference) {
                return methods[IMPLODE](glueReference, piecesReference);
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

        return methods;
    };
});
