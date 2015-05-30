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
    '../../tools',
    '../../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine addition assignment "+=" operator integration', function () {
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
            'adding 4 to a variable': {
                code: '<?php $num = 2; $num += 4; return $num;',
                expectedResult: 6,
                expectedResultType: 'integer',
                expectedStderr: '',
                expectedStdout: ''
            },
            'attempting to add 5 to undefined variable': {
                code: '<?php $num += 5; var_dump($num); print "Done";',
                expectedResult: null,
                expectedStderr: util.heredoc(function () {/*<<<EOS
PHP Notice: Undefined variable: num

EOS
*/;}), // jshint ignore:line
                // Note that the 'Done' echo following the dump must be executed, this is only a notice
                expectedStdout: util.heredoc(function () {/*<<<EOS
int(5)
Done
EOS
*/;}) // jshint ignore:line
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
