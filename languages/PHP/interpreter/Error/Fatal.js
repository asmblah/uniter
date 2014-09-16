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
    '../Error',
], function (
    util,
    PHPError
) {
    'use strict';

    var MESSAGE_PREFIXES = {
            1: 'Unsupported operand types',
            2: 'Call to undefined function ${name}()',
            3: 'Class \'${name}\' not found',
            4: 'Call to undefined method ${className}::${methodName}()',
            5: '\'goto\' into loop or switch statement is disallowed',
            6: '${name}() must take exactly 1 argument',
            7: 'Class name must be a valid object or a string',
            8: 'Access to undeclared static property: ${className}::$${propertyName}',
            9: 'Call to undefined method ${className}::${methodName}()',
            10: 'Cannot access self:: when no class scope is active',
            11: 'Undefined constant \'${name}\'',
            12: 'Uncaught exception \'${name}\'',
            13: 'Cannot access ${visibility} property ${className}::$${propertyName}',
            14: 'Function name must be a string',
            15: 'Undefined class constant \'${name}\''
        };

    function PHPFatalError(code, variables) {
        PHPError.call(this, PHPError.E_FATAL, util.stringTemplate(MESSAGE_PREFIXES[code], variables));
    }

    util.inherit(PHPFatalError).from(PHPError);

    util.extend(PHPFatalError, {
        UNSUPPORTED_OPERAND_TYPES: 1,
        CALL_TO_UNDEFINED_FUNCTION: 2,
        CLASS_NOT_FOUND: 3,
        UNDEFINED_METHOD: 4,
        GOTO_DISALLOWED: 5,
        EXPECT_EXACTLY_1_ARG: 6,
        CLASS_NAME_NOT_VALID: 7,
        UNDECLARED_STATIC_PROPERTY: 8,
        CALL_TO_UNDEFINED_METHOD: 9,
        SELF_WHEN_NO_ACTIVE_CLASS: 10,
        UNDEFINED_CONSTANT: 11,
        UNCAUGHT_EXCEPTION: 12,
        CANNOT_ACCESS_PROPERTY: 13,
        FUNCTION_NAME_MUST_BE_STRING: 14,
        UNDEFINED_CLASS_CONSTANT: 15
    });

    return PHPFatalError;
});
