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

    describe('PHP Engine plain object bridge integration', function () {
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
                'plain object with one scalar string property': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    return $me->name;
EOS
*/) {}),
                    expose: {
                        'me': {
                            name: 'Dan'
                        }
                    },
                    expectedResult: 'Dan',
                    expectedResultType: 'string',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'plain object with one scalar integer property': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    return $me->age;
EOS
*/) {}),
                    expose: {
                        'me': {
                            age: 23
                        }
                    },
                    expectedResult: 23,
                    expectedResultType: 'integer',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'plain object with one array property': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    return $order->payments[0];
EOS
*/) {}),
                    expose: {
                        'order': {
                            'payments': [10, 20]
                        }
                    },
                    expectedResult: 10,
                    expectedResultType: 'integer',
                    expectedStderr: '',
                    expectedStdout: ''
                }
            }, function (scenario) {
                check(scenario);
            });
        });
    });
});
