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
    './functions/array',
    './functions/constant',
    './functions/spl',
    './classes/stdClass',
    './functions/string',
    './functions/variableHandling',
    './classes/Exception'
], function (
    arrayFunctions,
    constantFunctions,
    splFunctions,
    stdClass,
    stringFunctions,
    variableHandlingFunctions,
    Exception
) {
    'use strict';

    return {
        classes: {
            'stdClass': stdClass,
            'Exception': Exception
        },
        functionGroups: [
            arrayFunctions,
            constantFunctions,
            splFunctions,
            stringFunctions,
            variableHandlingFunctions
        ]
    };
});
