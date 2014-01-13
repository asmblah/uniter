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
    'languages/PHP/interpreter/Error/Parse'
], function (
    util,
    PHPParseError
) {
    'use strict';

    function ErrorHandler(stderr) {
        this.stderr = stderr;
    }

    util.extend(ErrorHandler.prototype, {
        handle: function () {
            var error = new PHPParseError(PHPParseError.SYNTAX_UNEXPECTED_END);

            this.stderr.write(error.message);

            throw error;
        }
    });

    return ErrorHandler;
});
