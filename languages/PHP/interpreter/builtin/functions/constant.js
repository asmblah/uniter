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
        var globalNamespace = internals.globalNamespace;

        return {
            'define': function (nameReference, value) {
                var isReference = (nameReference instanceof Variable),
                    nameValue = isReference ? nameReference.getValue() : nameReference;

                globalNamespace.defineConstant(nameValue.getNative(), value);
            }
        };
    };
});
