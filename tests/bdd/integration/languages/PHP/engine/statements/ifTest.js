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
    '../tools',
    '../../tools',
    'js/util'
], function (
    engineTools,
    phpTools,
    util
) {
    'use strict';

    describe('PHP Engine if statement integration', function () {
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
            'simple if statement with true condition that echoes a result': {
                code: '<?php if (true) { echo "hello"; } else { echo "goodbye"; }',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'hello'
            },
            'simple if statement with false condition that echoes a result': {
                code: '<?php if (false) { echo "hello"; } else { echo "goodbye"; }',
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: 'goodbye'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
