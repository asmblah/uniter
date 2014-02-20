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

    function ParseException(message, text, furthestMatch, furthestMatchOffset, furthestIgnoreMatch, furthestIgnoreMatchOffset) {
        Exception.call(this, message);

        this.furthestIgnoreMatch = furthestIgnoreMatch;
        this.furthestIgnoreMatchOffset = furthestIgnoreMatchOffset;
        this.furthestMatch = furthestMatch;
        this.furthestMatchOffset = furthestMatchOffset;
        this.text = text;
    }

    util.inherit(ParseException).from(Exception);

    util.extend(ParseException.prototype, {
        getFurthestMatch: function () {
            return this.furthestMatch;
        },

        getLineNumber: function () {
            var exception = this;

            return util.getLineNumber(exception.text, exception.furthestMatchOffset);
        },

        getText: function () {
            return this.text;
        },

        unexpectedEndOfInput: function () {
            return Math.max(this.furthestMatchOffset, this.furthestIgnoreMatchOffset) === this.text.length - 1;
        }
    });

    return ParseException;
});
