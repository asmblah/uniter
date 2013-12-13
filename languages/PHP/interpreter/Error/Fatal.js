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
            2: 'Call to undefined function ${name}()'
        };

    function PHPFatalError(code, variables) {
        PHPError.call(this, PHPError.E_FATAL, util.stringTemplate(MESSAGE_PREFIXES[code], variables));
    }

    util.inherit(PHPFatalError).from(PHPError);

    util.extend(PHPFatalError, {
        UNSUPPORTED_OPERAND_TYPES: 1,
        CALL_TO_UNDEFINED_FUNCTION: 2
    });

    return PHPFatalError;
});
