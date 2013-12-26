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

    describe('PHP Engine array bridge integration', function () {
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
                'array with one scalar element': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    return $names[0];
EOS
*/) {}),
                    expose: {
                        '$names': ['Fred']
                    },
                    expectedResult: 'Fred',
                    expectedResultType: 'string',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'array with one plain object property': {
                    code: util.heredoc(function (/*<<<EOS
<?php
    return $orders[0]->amount;
EOS
*/) {}),
                    expose: {
                        '$orders': [{
                            'amount': 28
                        }]
                    },
                    expectedResult: 28,
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
