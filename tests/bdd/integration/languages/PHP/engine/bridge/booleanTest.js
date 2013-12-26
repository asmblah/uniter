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

    describe('PHP Engine boolean bridge integration', function () {
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

        describe('exposing as global PHP variables', function () {
            util.each({
                'true': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    return $theBoolean;
EOS
*/) {}),
                    expose: {
                        'theBoolean': true
                    },
                    expectedResult: true,
                    expectedResultType: 'boolean',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'false': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    return $theBoolean;
EOS
*/) {}),
                    expose: {
                        'theBoolean': false
                    },
                    expectedResult: false,
                    expectedResultType: 'boolean',
                    expectedStderr: '',
                    expectedStdout: ''
                }
            }, function (scenario) {
                check(scenario);
            });
        });
    });
});
