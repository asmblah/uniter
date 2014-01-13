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
    'js/Exception'
], function (
    util,
    Exception
) {
    'use strict';

    function ParseException(message, text, match) {
        Exception.call(this, message);

        this.match = match;
        this.text = text;
    }

    util.inherit(ParseException).from(Exception);

    util.extend(ParseException.prototype, {

    });

    return ParseException;
});
