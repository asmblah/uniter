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
    'js/Exception',
], function (
    util,
    Exception
) {
    'use strict';

    function PHPError(level, message) {
        Exception.call(this, 'PHP ' + level + ': ' + message);
    }

    util.inherit(PHPError).from(Exception);

    util.extend(PHPError, {
        E_ERROR: 'Error',
        E_FATAL: 'Fatal error',
        E_NOTICE: 'Notice',
        E_PARSE: 'Parse error',
        E_WARNING: 'Warning'
    });

    return PHPError;
});
