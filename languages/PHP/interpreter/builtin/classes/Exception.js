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
    'phpcommon',
    'js/util'
], function (
    phpCommon,
    util
) {
    'use strict';

    var PHPError = phpCommon.PHPError;

    return function () {
        function Exception() {

        }

        util.inherit(Exception).from(PHPError);

        util.extend(Exception.prototype, {

        });

        return Exception;
    };
});
