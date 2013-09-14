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

    describe('PHP Engine array access/dereference ($array[...]) operator integration', function () {
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
            'array access/dereference operator "<val>[<val>]"': {
                left: {
                    'array': {
                        right: {
                            'array': [{
                                left: 'array()',
                                right: 'array()',
                                expectedResult: null,
                                expectedResultType: 'null',
                                expectedStderr: 'PHP Warning: Illegal offset type'
                            }],
                            'boolean': [{
                                left: 'array()',
                                right: 'false',
                                expectedResult: null,
                                expectedResultType: 'null',
                                expectedStderr: 'PHP Notice: Undefined offset: 0'
                            }, {
                                left: 'array(2)',
                                right: 'false',
                                expectedResult: 2,
                                expectedResultType: 'integer'
                            }, {
                                left: 'array()',
                                right: 'true',
                                expectedResult: null,
                                expectedResultType: 'null',
                                expectedStderr: 'PHP Notice: Undefined offset: 1'
                            }, {
                                left: 'array(2)',
                                right: 'true',
                                expectedResult: null,
                                expectedResultType: 'null',
                                expectedStderr: 'PHP Notice: Undefined offset: 1'
                            }],
                            'float': [{
                                left: 'array()',
                                right: '2.0',
                                expectedResult: null,
                                expectedResultType: 'null',
                                expectedStderr: 'PHP Notice: Undefined offset: 2'
                            }, {
                                left: 'array(1)',
                                right: '4.2',
                                expectedResult: null,
                                expectedResultType: 'null',
                                expectedStderr: 'PHP Notice: Undefined offset: 4'
                            }, {
                                left: 'array(1)',
                                right: '5.8',
                                expectedResult: null,
                                expectedResultType: 'null',
                                // Note that float is coerced to 5, not 6 as it is truncated
                                expectedStderr: 'PHP Notice: Undefined offset: 5'
                            }],
                            'integer': [{
                                left: 'array()',
                                right: '4',
                                expectedResult: null,
                                expectedResultType: 'null',
                                expectedStderr: 'PHP Notice: Undefined offset: 4'
                            }, {
                                left: 'array(1)',
                                right: '0',
                                expectedResult: 1,
                                expectedResultType: 'integer'
                            }]
                        }
                    },
                    'boolean': {
                        right: {
                            'array': [{
                                left: 'true',
                                right: 'array()',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: 'false',
                                right: 'array()',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'boolean': [{
                                left: 'true',
                                right: 'true',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: 'true',
                                right: 'false',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'float': [{
                                left: 'true',
                                right: '3.2',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: 'false',
                                right: '3.2',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'integer': [{
                                left: 'true',
                                right: '3',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: 'false',
                                right: '2',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }]
                        }
                    },
                    'float': {
                        right: {
                            'array': [{
                                left: '3.2',
                                right: 'array()',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: '2.7',
                                right: 'array(7)',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'boolean': [{
                                left: '1.2',
                                right: 'true',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: '3.7',
                                right: 'false',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'float': [{
                                left: '0.0',
                                right: '0.0',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: '1.2',
                                right: '4.5',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'integer': [{
                                left: '3.1',
                                right: '2',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }]
                        }
                    },
                    'integer': {
                        right: {
                            'array': [{
                                left: '2',
                                right: 'array()',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: '2',
                                right: 'array(3)',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'boolean': [{
                                left: '5',
                                right: 'true',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: '4',
                                right: 'false',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'float': [{
                                left: '0',
                                right: '0.0',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }, {
                                left: '4',
                                right: '3.7',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
                            }],
                            'integer': [{
                                left: '0',
                                right: '0',
                                // Note that no warning or notice is displayed
                                expectedResult: null,
                                expectedResultType: 'null'
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

                            describe('for ' + leftOperandType + '(' + leftOperand + ')[' + rightOperandType + '(' + rightOperand + ')]', function () {
                                var expression = leftOperand + '[' + rightOperand + ']';

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
