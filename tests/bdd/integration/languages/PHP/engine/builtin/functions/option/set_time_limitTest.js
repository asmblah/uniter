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
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    describe('PHP Engine set_time_limit() builtin function integration', function () {
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
            'when given a limit of 1 second followed by a while loop that stops exactly at the timeout': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    set_time_limit(1);

    while (true) {
        if ($info->getMilliseconds() === 1000) {
            return 'done';
        }
    }

EOS
*/;}), // jshint ignore:line
                exposeCurrentMilliseconds: true,
                timerCycles: [
                    0,
                    0,
                    100,
                    200,
                    1000
                ],
                expectedResult: 'done',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'when given a limit of 1 second followed by an infinite while loop that reaches 1ms after the timeout': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    set_time_limit(1);

    while (true) {}

EOS
*/;}), // jshint ignore:line
                timerCycles: [
                    0,
                    0,
                    100,
                    200,
                    1000,
                    1001
                ],
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Maximum execution time of 1 second exceeded$/
                },
                expectedStderr: 'PHP Fatal error: Maximum execution time of 1 second exceeded',
                expectedStdout: ''
            },
            'when given a limit of 1 second followed by a do...while loop that stops exactly at the timeout': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    set_time_limit(1);

    do {
        if ($info->getMilliseconds() === 1000) {
            return 'done';
        }
    } while (true);

EOS
*/;}), // jshint ignore:line
                exposeCurrentMilliseconds: true,
                timerCycles: [
                    0,
                    0,
                    100,
                    200,
                    1000
                ],
                expectedResult: 'done',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'when given a limit of 1 second followed by an infinite do...while loop that reaches 1ms after the timeout': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    set_time_limit(1);

    do {} while (true);

EOS
*/;}), // jshint ignore:line
                timerCycles: [
                    0,
                    0,
                    100,
                    200,
                    1000,
                    1001
                ],
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Maximum execution time of 1 second exceeded$/
                },
                expectedStderr: 'PHP Fatal error: Maximum execution time of 1 second exceeded',
                expectedStdout: ''
            },
            'when given a limit of 1 second followed by a for loop that stops exactly at the timeout': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    set_time_limit(1);

    for (;;) {
        if ($info->getMilliseconds() === 1000) {
            return 'done';
        }
    }

EOS
*/;}), // jshint ignore:line
                exposeCurrentMilliseconds: true,
                timerCycles: [
                    0,
                    0,
                    100,
                    200,
                    1000
                ],
                expectedResult: 'done',
                expectedResultType: 'string',
                expectedStderr: '',
                expectedStdout: ''
            },
            'when given a limit of 1 second followed by an infinite for loop that reaches 1ms after the timeout': {
                code: util.heredoc(function () {/*<<<EOS
<?php
    set_time_limit(1);

    for (;;) {}

EOS
*/;}), // jshint ignore:line
                timerCycles: [
                    0,
                    0,
                    100,
                    200,
                    1000,
                    1001
                ],
                expectedException: {
                    instanceOf: PHPFatalError,
                    match: /^PHP Fatal error: Maximum execution time of 1 second exceeded$/
                },
                expectedStderr: 'PHP Fatal error: Maximum execution time of 1 second exceeded',
                expectedStdout: ''
            }
        }, function (scenario, description) {
            describe(description, function () {
                var currentCycle,
                    expose;

                if (scenario.exposeCurrentMilliseconds) {
                    expose = {
                        info: {
                            getMilliseconds: function () {
                                return scenario.timerCycles[currentCycle];
                            }
                        }
                    };
                }

                beforeEach(function () {
                    currentCycle = 0;
                    sinon.stub(engine.getEnvironment().getTimer(), 'getMilliseconds', function () {
                        return scenario.timerCycles[currentCycle++];
                    });
                });

                check({
                    code: scenario.code,
                    expose: expose,
                    expectedStderr: scenario.expectedStderr || '',
                    expectedStdout: scenario.expectedStdout
                });
            });
        });
    });
});
