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

    describe('PHP Engine for loop statement integration', function () {
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
            'for loop that does not even iterate once': {
                code: util.heredoc(function (/*<<<EOS
<?php
    for ($i = 4; $i < 4; $i++) {
        echo $i;
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: ''
            },
            'for loop that iterates twice': {
                code: util.heredoc(function (/*<<<EOS
<?php
    for ($i = 0; $i < 2; $i++) {
        echo $i . ',';
    }
EOS
*/) {}),
                expectedResult: null,
                expectedStderr: '',
                expectedStdout: '0,1,'
            }
        }, function (scenario, description) {
            describe(description, function () {
                check(scenario);
            });
        });
    });
});
