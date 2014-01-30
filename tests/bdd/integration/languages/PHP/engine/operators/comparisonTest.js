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

    var DATA_TYPES = ['array', 'boolean', 'float'/*, 'integer', 'null', 'object', 'string'*/];

    describe('PHP Engine comparison operators integration', function () {
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
            'equality operator "$val1 == $val2"': {
                operator: '==',
                left: {
                    'array': {
                        right: {
                            'array': [{
                                left: 'array()',
                                right: 'array()',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1)',
                                right: 'array(1)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2)',
                                right: 'array(1 => 2)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2, 2 => 3)',
                                right: 'array(2 => 3, 1 => 2)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1)',
                                right: 'array(2)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 1)',
                                right: 'array(1 => 2)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2)',
                                right: 'array(2 => 2)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2, 3 => 4)',
                                right: 'array(1 => 2)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }],
                            'boolean': [{
                                left: 'array()',
                                right: 'false',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(0)',
                                right: 'false',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }],
                            'float': [{
                                left: 'array()',
                                right: '1.0',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(5)',
                                right: '5',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array("a" => 7)',
                                right: '7',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }]
                        }
                    },
                    'boolean': {
                        right: {
                            'array': [{
                                left: 'true',
                                right: 'array()',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'false',
                                right: 'array()',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }],
                            'boolean': [{
                                left: 'true',
                                right: 'true',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'true',
                                right: 'false',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }],
                            'float': [{
                                left: 'true',
                                right: '0.0',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'true',
                                right: '2.1',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'false',
                                right: '0.0',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'false',
                                right: '0.1',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }]
                        }
                    },
                    'float': {
                        right: {
                            'array': [{
                                left: '0.0',
                                right: 'array()',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: '0.0',
                                right: 'array(0.0)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }],
                            'boolean': [{
                                left: '0.0',
                                right: 'false',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: '0.1',
                                right: 'false',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: '1.0',
                                right: 'true',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: '1.1',
                                right: 'true',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }],
                            'float': [{
                                left: '0.0',
                                right: '0.0',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: '1.1',
                                right: '1.1',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: '0.1',
                                right: '0.0',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                // Negative and positive zero are equal
                                left: '-0.0',
                                right: '0.0',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }]
                        }
                    }
                }
            },
            'inequality operator "$val1 != $val2"': {
                operator: '!=',
                left: {
                    'array': {
                        right: {
                            'array': [{
                                left: 'array()',
                                right: 'array()',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1)',
                                right: 'array(1)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2)',
                                right: 'array(1 => 2)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2, 2 => 3)',
                                right: 'array(2 => 3, 1 => 2)',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1)',
                                right: 'array(2)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 1)',
                                right: 'array(1 => 2)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2)',
                                right: 'array(2 => 2)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(1 => 2, 3 => 4)',
                                right: 'array(1 => 2)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }],
                            'boolean': [{
                                left: 'array()',
                                right: 'false',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(0)',
                                right: 'false',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }],
                            'float': [{
                                left: 'array()',
                                right: '1.0',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array(5)',
                                right: '5',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'array("a" => 7)',
                                right: '7',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }]
                        }
                    },
                    'boolean': {
                        right: {
                            'array': [{
                                left: 'true',
                                right: 'array()',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'false',
                                right: 'array()',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }],
                            'boolean': [{
                                left: 'true',
                                right: 'true',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'true',
                                right: 'false',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }],
                            'float': [{
                                left: 'true',
                                right: '0.0',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'true',
                                right: '2.1',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'false',
                                right: '0.0',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: 'false',
                                right: '0.1',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }]
                        }
                    },
                    'float': {
                        right: {
                            'array': [{
                                left: '0.0',
                                right: 'array()',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: '0.0',
                                right: 'array(0.0)',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }],
                            'boolean': [{
                                left: '0.0',
                                right: 'false',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: '0.1',
                                right: 'false',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                left: '1.0',
                                right: 'true',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: '1.1',
                                right: 'true',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }],
                            'float': [{
                                left: '0.0',
                                right: '0.0',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: '1.1',
                                right: '1.1',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }, {
                                left: '0.1',
                                right: '0.0',
                                expectedResult: true,
                                expectedResultType: 'boolean'
                            }, {
                                // Negative and positive zero are equal
                                left: '-0.0',
                                right: '0.0',
                                expectedResult: false,
                                expectedResultType: 'boolean'
                            }]
                        }
                    }
                }
            }
        }, function (data, operatorDescription) {
            describe('for the ' + operatorDescription, function () {
                util.each(DATA_TYPES, function (leftOperandType) {
                    util.each(DATA_TYPES, function (rightOperandType) {
                        var leftOperandData = data.left[leftOperandType],
                            rightOperandDatas = leftOperandData.right[rightOperandType];

                        util.each(rightOperandDatas, function (rightOperandData) {
                            var leftOperand = rightOperandData.left,
                                rightOperand = rightOperandData.right;

                            describe('for ' + leftOperandType + '(' + leftOperand + ') ' + data.operator + ' ' + rightOperandType + '(' + rightOperand + ')', function () {
                                var expression = leftOperand + ' '  + data.operator + ' ' + rightOperand;

                                check({
                                    code: '<?php return ' + expression + ';',
                                    expectedResult: rightOperandData.expectedResult,
                                    expectedResultType: rightOperandData.expectedResultType,
                                    expectedStderr: rightOperandData.expectedStderr || '',
                                    expectedStdout: rightOperandData.expectedStdout || ''
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
