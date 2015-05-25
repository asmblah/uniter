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

    describe('PHP Engine object method bridge integration', function () {
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
                'plain object from JavaScript with instance method': {
                    code: util.heredoc(function () {/*<<<EOS
<?php
    return $tools->addThisDotMyvalueTo(16);
EOS
*/;}), // jshint ignore:line
                    expose: {
                        'tools': {
                            addThisDotMyvalueTo: function (number) {
                                return number + this.myValue;
                            },
                            myValue: 5
                        }
                    },
                    expectedResult: 21,
                    expectedResultType: 'integer',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'plain object from JavaScript with prototype method': {
                    code: util.heredoc(function () {/*<<<EOS
<?php
    return $tools->getValue();
EOS
*/;}), // jshint ignore:line
                    expose: {
                        'tools': Object.create({
                            getValue: function () {
                                return 'me';
                            }
                        })
                    },
                    expectedResult: 'me',
                    expectedResultType: 'string',
                    expectedStderr: '',
                    expectedStdout: ''
                },
                'calling PHP closure from JS': {
                    code: util.heredoc(function () {/*<<<EOS
<?php
$tools->setAdder(function ($thisObj, $num1, $num2) {
    return $thisObj->start + $num1 + $num2;
});
return $tools->getValue(4, 2);
EOS
*/;}), // jshint ignore:line
                    expose: function () {
                        var adder;

                        return {
                            'tools': {
                                getValue: function (num1, num2) {
                                    return adder.call({start: 10}, num1, num2);
                                },
                                setAdder: function (newAdder) {
                                    adder = newAdder;
                                }
                            }
                        };
                    },
                    expectedResult: 16,
                    expectedResultType: 'integer',
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
});
