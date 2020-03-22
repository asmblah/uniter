/*
 * Uniter - JavaScript PHP interpreter
 * Copyright 2013 Dan Phillimore (asmblah)
 * http://asmblah.github.com/uniter/
 *
 * Released under the MIT license
 * https://github.com/asmblah/uniter/raw/master/MIT-LICENSE.txt
 */

/*global before */
'use strict';

var _ = require('microdash'),
    engineTools = require('../../tools'),
    phpTools = require('../../../tools'),
    DATA_TYPES = ['array', 'boolean', 'float', 'int', 'null', 'object', 'string'];

describe('PHP Engine loose equality/inequality comparison operators integration', function () {
    /*jshint latedef: false */
    function check(scenario) {
        engineTools.check(function () {
            return {
                engine: engine
            };
        }, scenario);
    }

    var engine = phpTools.createEngine(),
        left = {
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
                        right: '5.0',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'array("a" => 7)',
                        right: '7.0',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'int': [{
                        left: 'array()',
                        right: '1',
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
                    }],
                    'null': [{
                        left: 'array()',
                        right: 'null',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'array(0)',
                        right: 'null',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'object': [{
                        left: 'array()',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'string': [{
                        left: 'array()',
                        right: '""',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        // Casting array to string results in "Array", but they are not equal
                        left: 'array()',
                        right: '"Array"',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }]
                }
            },
            'boolean': {
                right: {
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
                    }],
                    'int': [{
                        left: 'true',
                        right: '0',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'true',
                        right: '2',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'false',
                        right: '0',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'false',
                        right: '3',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'null': [{
                        left: 'true',
                        right: 'null',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'false',
                        right: 'null',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }],
                    'object': [{
                        left: 'true',
                        right: 'new stdClass',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'false',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'string': [{
                        left: 'true',
                        right: '""',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'false',
                        right: '""',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'true',
                        right: '"world"',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'false',
                        right: '"world"',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }]
                }
            },
            'float': {
                right: {
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
                    }],
                    'int': [{
                        left: '0.0',
                        right: '0',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1.0',
                        right: '1',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '0.1',
                        right: '0',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        // Negative and positive zero are equal
                        left: '-0.0',
                        right: '0',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }],
                    'null': [{
                        left: '0.0',
                        right: 'null',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1.0',
                        right: 'null',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '0.1',
                        right: 'null',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '-0.0',
                        right: 'null',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }],
                    'object': [{
                        left: '0.0',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '0.1',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1.0',
                        right: 'new stdClass',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1.1',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'string': [{
                        left: '0.0',
                        right: '""',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '0.0',
                        right: '"0.1"',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1.2',
                        right: '"1.2"',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1.0',
                        right: '"1"',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }]
                }
            },
            'int': {
                right: {
                    'int': [{
                        left: '0',
                        right: '0',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1',
                        right: '1',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1',
                        right: '0',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        // Negative and positive zero are equal
                        left: '-0',
                        right: '0',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }],
                    'null': [{
                        left: '0',
                        right: 'null',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1',
                        right: 'null',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        // Negative and positive zero are equal
                        left: '-0',
                        right: 'null',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }],
                    'object': [{
                        left: '0',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1',
                        right: 'new stdClass',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '2',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'string': [{
                        left: '1',
                        right: '"1.0"',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '1',
                        right: '"1.2"',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }]
                }
            },
            'null': {
                right: {
                    'null': [{
                        left: 'null',
                        right: 'null',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }],
                    'object': [{
                        left: 'null',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }],
                    'string': [{
                        left: 'null',
                        right: '""',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: 'null',
                        right: '"null"',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }]
                }
            },
            'object': {
                right: {
                    'object': [{
                        left: 'new stdClass',
                        right: 'new stdClass',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '(function () { $o = new stdClass; $o->prop = 1; return $o; }())',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '(function () { return new FunTest; }())',
                        right: 'new stdClass',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        setup: '$object = new stdClass;',
                        left: '$object',
                        right: '$object',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }],
                    'string': [{
                        left: 'new stdClass',
                        right: '""',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }]
                }
            },
            'string': {
                right: {
                    'string': [{
                        left: '"hello"',
                        right: '"hello"',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }, {
                        left: '"hello"',
                        right: '"world"',
                        expectedResult: false,
                        expectedResultType: 'boolean'
                    }, {
                        left: '""',
                        right: '""',
                        expectedResult: true,
                        expectedResultType: 'boolean'
                    }]
                }
            }
        };

    before(function () {
        // Define a class used by one of the scenarios below
        return engine.execute('<?php class FunTest {}');
    });

    _.each({
        'equality operator "$val1 == $val2"': {
            operator: '==',
            invertExpectedResult: false
        },
        'inequality operator "$val1 != $val2"': {
            operator: '!=',
            invertExpectedResult: true
        }
    }, function (scenario, operatorDescription) {
        describe('for the ' + operatorDescription, function () {
            _.each(DATA_TYPES, function (leftOperandType) {
                _.each(DATA_TYPES, function (rightOperandType) {
                    var leftOperandData = left[leftOperandType],
                        rightOperandDatas = leftOperandData.right[rightOperandType];

                    _.each(rightOperandDatas, function (rightOperandData) {
                        var effectiveLeftOperandType = leftOperandType,
                            effectiveRightOperandType = rightOperandType,
                            leftOperand = rightOperandData.left,
                            rightOperand = rightOperandData.right,
                            setup = rightOperandData.setup || '';

                        _.each([0, 1], function (index) {
                            var scratch;

                            // Test the reverse comparison as well, if needed
                            if (index === 1) {
                                // Left and right operands are the same, no point testing the reverse
                                if (rightOperand === leftOperand) {
                                    return;
                                }

                                scratch = leftOperand;
                                leftOperand = rightOperand;
                                rightOperand = scratch;

                                scratch = effectiveLeftOperandType;
                                effectiveLeftOperandType = effectiveRightOperandType;
                                effectiveRightOperandType = scratch;
                            }

                            describe('for ' + effectiveLeftOperandType + '(' + leftOperand + ') ' + scenario.operator + ' ' + effectiveRightOperandType + '(' + rightOperand + ')', function () {
                                var expression = leftOperand + ' ' + scenario.operator + ' ' + rightOperand,
                                    expectedResult = rightOperandData.expectedResult;

                                if (scenario.invertExpectedResult) {
                                    expectedResult = !expectedResult;
                                }

                                check({
                                    code: '<?php ' + setup + 'return ' + expression + ';',
                                    expectedResult: expectedResult,
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
