/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe */
define([
    './tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('Resumable function call', function () {
        util.each({
            'with "or" expression inside argument when left is falsy': {
                code: util.heredoc(function (/*<<<EOS
function returnIt(value) {
    return value;
}

exports.result = returnIt(0 || 4);
EOS
*/) {}),
                expectedExports: {
                    result: 4
                }
            },
            'with "or" expression inside argument when left is truthy': {
                code: util.heredoc(function (/*<<<EOS
function returnIt(value) {
    return value;
}

exports.result = returnIt(3 || 4);
EOS
*/) {}),
                expectedExports: {
                    result: 3
                }
            }
        }, tools.check);
    });
});
