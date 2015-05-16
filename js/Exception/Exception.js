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
    'js/util'
], function (
    util
) {
    'use strict';

    function Exception(message) {
        this.message = message;
    }

    util.inherit(Exception).from(Error);

    util.extend(Exception.prototype, {
        type: 'Exception',

        getMessage: function () {
            return this.message;
        }
    });

    return Exception;
});
