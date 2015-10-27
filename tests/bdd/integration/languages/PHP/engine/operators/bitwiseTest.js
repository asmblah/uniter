/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    engineTools = require('../tools'),
    phpCommon = require('phpcommon'),
    phpTools = require('../../tools'),
    DATA_TYPES = ['array', 'boolean', 'float', 'integer'/*, 'null', 'object', 'string'*/],
    PHPFatalError = phpCommon.PHPFatalError;

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
        _.each({
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
                _.each(DATA_TYPES, function (operandType) {
                    var operandDatas = data.operand[operandType];

                    _.each(operandDatas, function (operandData) {
                        var operand = operandData.operand;

                        describe('for ' + operator + operandType + '(' + operand + ')', function () {
                            var expression = operator + operand;

                            check({
                                code: '<?php return ' + expression + ';',
                                expectedResult: operandData.expectedResult,
                                expectedResultType: 'integer',
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

    describe('binary operators', function () {
        _.each({
            'bitwise left shift operator "<val> << <val>"': {
                operator: '<<',
                left: {
                    'array': {
                        right: {
                            'array': [{
                                left: 'array()',
                                right: 'array()',
                                expectedResult: 0
                            }],
                            'boolean': [{
                                left: 'array()',
                                right: 'false',
                                expectedResult: 0
                            }, {
                                left: 'array(2)',
                                right: 'false',
                                expectedResult: 1
                            }, {
                                left: 'array()',
                                right: 'true',
                                expectedResult: 0
                            }, {
                                left: 'array(2)',
                                right: 'true',
                                expectedResult: 2
                            }],
                            'float': [{
                                left: 'array()',
                                right: '2.0',
                                expectedResult: 0
                            }, {
                                left: 'array(1)',
                                right: '4.2',
                                expectedResult: 16
                            }, {
                                left: 'array(1)',
                                right: '5.8',
                                expectedResult: 32
                            }],
                            'integer': [{
                                left: 'array()',
                                right: '4',
                                expectedResult: 0
                            }, {
                                left: 'array(1)',
                                right: '4',
                                expectedResult: 16
                            }]
                        }
                    },
                    'boolean': {
                        right: {
                            'array': [{
                                left: 'true',
                                right: 'array()',
                                expectedResult: 1
                            }, {
                                left: 'false',
                                right: 'array()',
                                expectedResult: 0
                            }],
                            'boolean': [{
                                left: 'true',
                                right: 'true',
                                expectedResult: 2
                            }, {
                                left: 'true',
                                right: 'false',
                                expectedResult: 1
                            }],
                            'float': [{
                                left: 'true',
                                right: '3.2',
                                expectedResult: 8
                            }, {
                                left: 'false',
                                right: '3.2',
                                expectedResult: 0
                            }],
                            'integer': [{
                                left: 'true',
                                right: '3',
                                expectedResult: 8
                            }, {
                                left: 'false',
                                right: '2',
                                expectedResult: 0
                            }]
                        }
                    },
                    'float': {
                        right: {
                            'array': [{
                                left: '3.2',
                                right: 'array()',
                                expectedResult: 3
                            }, {
                                left: '2.7',
                                right: 'array(7)',
                                expectedResult: 4
                            }],
                            'boolean': [{
                                left: '1.2',
                                right: 'true',
                                expectedResult: 2
                            }, {
                                left: '3.7',
                                right: 'false',
                                expectedResult: 3
                            }],
                            'float': [{
                                left: '0.0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '1.2',
                                right: '4.5',
                                expectedResult: 16
                            }],
                            'integer': [{
                                left: '3.1',
                                right: '2',
                                expectedResult: 12
                            }]
                        }
                    },
                    'integer': {
                        right: {
                            'array': [{
                                left: '2',
                                right: 'array()',
                                expectedResult: 2
                            }, {
                                left: '2',
                                right: 'array(3)',
                                // Even though the array contains int(3), the array is coerced to int(1)
                                expectedResult: 4
                            }],
                            'boolean': [{
                                left: '5',
                                right: 'true',
                                expectedResult: 10
                            }, {
                                left: '4',
                                right: 'false',
                                expectedResult: 4
                            }],
                            'float': [{
                                left: '0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '4',
                                right: '3.7',
                                expectedResult: 32
                            }],
                            'integer': [{
                                left: '0',
                                right: '0',
                                expectedResult: 0
                            }]
                        }
                    }
                }
            },
            'bitwise right shift operator "<val> >> <val>"': {
                operator: '>>',
                left: {
                    'array': {
                        right: {
                            'array': [{
                                left: 'array()',
                                right: 'array()',
                                expectedResult: 0
                            }],
                            'boolean': [{
                                left: 'array()',
                                right: 'false',
                                expectedResult: 0
                            }, {
                                left: 'array(2)',
                                right: 'false',
                                expectedResult: 1
                            }, {
                                left: 'array()',
                                right: 'true',
                                expectedResult: 0
                            }, {
                                left: 'array(2)',
                                right: 'true',
                                expectedResult: 0
                            }],
                            'float': [{
                                left: 'array(1)',
                                right: '0.0',
                                expectedResult: 1
                            }, {
                                left: 'array()',
                                right: '2.0',
                                expectedResult: 0
                            }, {
                                left: 'array(1)',
                                right: '4.2',
                                expectedResult: 0
                            }],
                            'integer': [{
                                left: 'array()',
                                right: '4',
                                expectedResult: 0
                            }, {
                                left: 'array(1)',
                                right: '0',
                                expectedResult: 1
                            }, {
                                left: 'array(1)',
                                right: '1',
                                expectedResult: 0
                            }]
                        }
                    },
                    'boolean': {
                        right: {
                            'array': [{
                                left: 'true',
                                right: 'array()',
                                expectedResult: 1
                            }, {
                                left: 'false',
                                right: 'array()',
                                expectedResult: 0
                            }],
                            'boolean': [{
                                left: 'true',
                                right: 'true',
                                expectedResult: 0
                            }, {
                                left: 'true',
                                right: 'false',
                                expectedResult: 1
                            }],
                            'float': [{
                                left: 'true',
                                right: '3.2',
                                expectedResult: 0
                            }, {
                                left: 'false',
                                right: '3.2',
                                expectedResult: 0
                            }],
                            'integer': [{
                                left: 'true',
                                right: '3',
                                expectedResult: 0
                            }, {
                                left: 'false',
                                right: '2',
                                expectedResult: 0
                            }]
                        }
                    },
                    'float': {
                        right: {
                            'array': [{
                                left: '3.2',
                                right: 'array()',
                                expectedResult: 3
                            }, {
                                left: '2.7',
                                right: 'array(7)',
                                expectedResult: 1
                            }],
                            'boolean': [{
                                left: '1.2',
                                right: 'true',
                                expectedResult: 0
                            }, {
                                left: '3.7',
                                right: 'false',
                                expectedResult: 3
                            }],
                            'float': [{
                                left: '0.0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '1.2',
                                right: '4.5',
                                expectedResult: 0
                            }],
                            'integer': [{
                                left: '3.1',
                                right: '1',
                                expectedResult: 1
                            }]
                        }
                    },
                    'integer': {
                        right: {
                            'array': [{
                                left: '2',
                                right: 'array()',
                                expectedResult: 2
                            }, {
                                left: '2',
                                right: 'array(3)',
                                // Even though the array contains int(3), the array is coerced to int(1)
                                expectedResult: 1
                            }],
                            'boolean': [{
                                left: '5',
                                right: 'true',
                                expectedResult: 2
                            }, {
                                left: '4',
                                right: 'false',
                                expectedResult: 4
                            }],
                            'float': [{
                                left: '0',
                                right: '0.0',
                                expectedResult: 0
                            }, {
                                left: '4',
                                right: '1.2',
                                expectedResult: 2
                            }],
                            'integer': [{
                                left: '0',
                                right: '0',
                                expectedResult: 0
                            }, {
                                left: '10',
                                right: '2',
                                expectedResult: 2
                            }]
                        }
                    }
                }
            }
        }, function (data, operatorDescription) {
            var operator = data.operator;

            describe('for the ' + operatorDescription, function () {
                _.each(DATA_TYPES, function (leftOperandType) {
                    _.each(DATA_TYPES, function (rightOperandType) {
                        var leftOperandData = data.left[leftOperandType],
                            rightOperandDatas = leftOperandData.right[rightOperandType];

                        _.each(rightOperandDatas, function (rightOperandData) {
                            var leftOperand = rightOperandData.left,
                                rightOperand = rightOperandData.right;

                            describe('for ' + leftOperandType + '(' + leftOperand + ') ' + operator + ' ' + rightOperandType + '(' + rightOperand + ')', function () {
                                var expression = leftOperand + operator + rightOperand;

                                check({
                                    code: '<?php return ' + expression + ';',
                                    expectedResult: rightOperandData.expectedResult,
                                    expectedResultType: 'integer',
                                    expectedStderr: '',
                                    expectedStdout: ''
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
