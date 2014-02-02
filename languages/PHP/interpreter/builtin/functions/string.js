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
            'strlen': function (stringReference) {
                var isReference = (stringReference instanceof Variable),
                    stringValue = isReference ? stringReference.getValue() : stringReference;

                if (stringValue.getType() === 'array' || stringValue.getType() === 'object') {
                    callStack.raiseError(PHPError.E_WARNING, 'strlen() expects parameter 1 to be string, ' + stringValue.getType() + ' given');
                    return valueFactory.createNull();
                }

                return valueFactory.createInteger(stringValue.getLength());
            }
        };
    };
});
