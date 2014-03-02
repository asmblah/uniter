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
    'languages/PHP/interpreter/Error'
], function (
    util,
    PHPError
) {
    'use strict';

    return function () {
        function Exception() {

        }

        util.inherit(Exception).from(PHPError);

        util.extend(Exception.prototype, {

        });

        return Exception;
    };
});
