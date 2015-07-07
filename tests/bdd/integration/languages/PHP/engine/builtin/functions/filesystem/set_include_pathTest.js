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
    '../../../tools',
    '../../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine set_include_path() builtin function integration', function () {
        var engine;

        function check(scenario) {
            engineTools.check(function () {
                return {
                    engine: engine
                };
            }, scenario);
        }

        beforeEach(function () {
            engine = phpTools.createEngine();
        });

        util.each({
            'updates the include path': {
                code: util.heredoc(function () {/*<<<EOS
<?php
set_include_path('my/first/path:my/second/path');

return get_include_path();
EOS
*/;}), // jshint ignore:line
                expectedResult: 'my/first/path:my/second/path',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'returns the previous include path': {
                code: util.heredoc(function () {/*<<<EOS
<?php
set_include_path('my/first/path');
return set_include_path('my/second/path');
EOS
*/;}), // jshint ignore:line
                expectedResult: 'my/first/path',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
