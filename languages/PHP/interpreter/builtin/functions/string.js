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
    'languages/PHP/interpreter/Error'
], function (
    PHPError
) {
    'use strict';

    return function (internals) {
        var callStack = internals.callStack,
            valueFactory = internals.valueFactory;

        return {
            'strlen': function (string) {
                string = string.toValue();

                if (string.getType() === 'array' || string.getType() === 'object') {
                    callStack.raiseError(PHPError.E_WARNING, 'strlen() expects parameter 1 to be string, ' + string.getType() + ' given');
                    return valueFactory.createNull();
                }

                return valueFactory.createInteger(string.getLength());
            }
        };
    };
});
