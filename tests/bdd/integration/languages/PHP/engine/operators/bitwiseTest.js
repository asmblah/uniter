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
    'js/util',
    'languages/PHP/interpreter/Error/Fatal'
], function (
    engineTools,
    phpTools,
    util,
    PHPFatalError
) {
    'use strict';

    var DATA_TYPES = ['array', 'boolean', 'float', 'integer'/*, 'null', 'object', 'string'*/];

    describe('PHP Engine bitwise operators integration', function () {
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

        describe('unary operators', function () {
            util.each({
                'one\'s complement (bitwise negation) operator "~<val>"': {
                    operator: '~',
                    operand: {
                        'array': [{
                            operand: 'array()',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }],
                        'boolean': [{
                            operand: 'true',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }, {
                            operand: 'false',
                            expectedException: {
                                instanceOf: PHPFatalError,
                                match: /^PHP Fatal error: Unsupported operand types$/
                            },
                            expectedStderr: 'PHP Fatal error: Unsupported operand types'
                        }],
                        'float': [{
                            operand: '0.0',
                            expectedResult: -1
                        }, {
                            operand: '0.8',
                            expectedResult: -1
                        }, {
                            operand: '1.0',
                            expectedResult: -2
                        }, {
                            operand: '4.4',
                            expectedResult: -5
                        }],
                        'integer': [{
                            operand: '0',
                            expectedResult: -1
                        }, {
                            operand: '1',
                            expectedResult: -2
                        }, {
                            operand: '4',
                            expectedResult: -5
                        }]
                    }
                }
            }, function (data, operatorDescription) {
                var operator = data.operator;

                describe('for the ' + operatorDescription, function () {
                    util.each(DATA_TYPES, function (operandType) {
                        var operandDatas = data.operand[operandType];

                        util.each(operandDatas, function (operandData) {
                            var operand = operandData.operand;

                            describe('for ' + operator + operandType + '(' + operand + ')', function () {
                                var expression = operator + operand;

                                check({
                                    code: '<?php return ' + expression + ';',
                                    expectedResult: operandData.expectedResult,
                                    expectedException: operandData.expectedException,
                                    expectedStderr: operandData.expectedStderr || '',
                                    expectedStdout: operandData.expectedStdout || ''
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
