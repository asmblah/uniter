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
            1: 'syntax error, unexpected ${what} in ${file} on line ${line}'
        };

    function PHPParseError(code, variables) {
        PHPError.call(this, PHPError.E_PARSE, util.stringTemplate(MESSAGE_PREFIXES[code], variables));
    }

    util.inherit(PHPParseError).from(PHPError);

    util.extend(PHPParseError, {
        SYNTAX_UNEXPECTED: 1
    });

    return PHPParseError;
});
