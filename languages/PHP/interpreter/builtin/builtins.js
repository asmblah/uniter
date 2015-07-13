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
    './constants/filesystem',
    './functions/filesystem',
    './functions/functionHandling',
    './functions/spl',
    './classes/stdClass',
    './functions/string',
    './functions/time',
    './functions/variableHandling',
    './classes/Closure',
    './classes/Exception',
    './classes/JSObject'
], function (
    arrayFunctions,
    constantFunctions,
    filesystemConstants,
    filesystemFunctions,
    functionHandlingFunctions,
    splFunctions,
    stdClass,
    stringFunctions,
    timeFunctions,
    variableHandlingFunctions,
    Closure,
    Exception,
    JSObject
) {
    'use strict';

    return {
        classes: {
            'stdClass': stdClass,
            'Closure': Closure,
            'Exception': Exception,
            'JSObject': JSObject
        },
        constantGroups: [
            filesystemConstants
        ],
        functionGroups: [
            arrayFunctions,
            constantFunctions,
            filesystemFunctions,
            functionHandlingFunctions,
            splFunctions,
            stringFunctions,
            timeFunctions,
            variableHandlingFunctions
        ]
    };
});
