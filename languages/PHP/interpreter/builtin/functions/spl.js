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
        var classAutoloader = internals.classAutoloader;

        return {
            'spl_autoload_register': function (callableReference) {
                var isReference = (callableReference instanceof Variable),
                    callableValue = isReference ? callableReference.getValue() : callableReference;

                classAutoloader.appendAutoloadCallable(callableValue);
            }
        };
    };
});
