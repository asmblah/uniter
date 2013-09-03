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

    function PHPError(message) {
        Exception.call(this, message);
    }

    util.inherit(PHPError).from(Exception);

    return PHPError;
});
