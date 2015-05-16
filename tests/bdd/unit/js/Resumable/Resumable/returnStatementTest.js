/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global define, describe, setTimeout */
define([
    './tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('Resumable return statement', function () {
        util.each({
            'return of IIFE return value': {
                code: util.heredoc(function () {/*<<<EOS
exports.result = (function () {
    return (function () {
        return tools.giveMe(21);
    }());
}());
EOS
*/;}), // jshint ignore:line
                expose: function (state) {
                    return {
                        tools: {
                            giveMe: function (what) {
                                var pause = state.resumable.createPause();

                                setTimeout(function () {
                                    pause.resume(what);
                                });

                                pause.now();
                            }
                        }
                    };
                },
                expectedExports: {
                    result: 21
                }
            }
        }, tools.check);
    });
});
