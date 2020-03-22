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
    DATA_TYPES = ['array', 'boolean', 'float', 'int', 'null', 'object', 'string'],
    engineTools = require('../../tools'),
    hasOwn = {}.hasOwnProperty;

module.exports = {
    check: function (getData, scenario) {
        var left = scenario.left,
            operator = scenario.operator;

        _.each(DATA_TYPES, function (leftOperandType) {
            _.each(DATA_TYPES, function (rightOperandType) {
                var leftOperandData = left[leftOperandType],
                    rightOperandDatas = leftOperandData.right[rightOperandType];

                _.each(rightOperandDatas, function (rightOperandData) {
                    var effectiveLeftOperandType = leftOperandType,
                        effectiveRightOperandType = rightOperandType,
                        expectedDump = rightOperandData.expectedDump,
                        leftOperand = rightOperandData.left,
                        rightOperand = rightOperandData.right,
                        setup = rightOperandData.setup || '',
                        usesDump = hasOwn.call(rightOperandData, 'expectedDump');

                    _.each([0, 1], function (index) {
                        var scratch;

                        // Test the reverse operation as well, if needed
                        if (index === 1) {
                            // Left and right operands are the same, no point testing the reverse
                            if (rightOperand === leftOperand) {
                                return;
                            }

                            if (usesDump && !hasOwn.call(rightOperandData, 'expectedInverseDump')) {
                                throw new Error('Must provide inverse result/dump when operands differ');
                            }

                            scratch = leftOperand;
                            leftOperand = rightOperand;
                            rightOperand = scratch;

                            scratch = effectiveLeftOperandType;
                            effectiveLeftOperandType = effectiveRightOperandType;
                            effectiveRightOperandType = scratch;

                            if (usesDump) {
                                expectedDump = rightOperandData.expectedInverseDump;
                            }
                        }

                        describe('for ' + effectiveLeftOperandType + '(' + leftOperand + ') ' + operator + ' ' + effectiveRightOperandType + '(' + rightOperand + ')', function () {
                            var expression = leftOperand + ' ' + operator + ' ' + rightOperand,
                                expectedResult = rightOperandData.expectedResult;

                            if (usesDump) {
                                engineTools.check(getData, {
                                    code: '<?php ' + setup + 'var_dump(' + expression + ');',
                                    expectedStderr: rightOperandData.expectedStderr || '',
                                    expectedStdout: expectedDump
                                });
                            } else {
                                engineTools.check(getData, {
                                    code: '<?php ' + setup + 'return ' + expression + ';',
                                    expectedException: rightOperandData.expectedException,
                                    expectedResult: expectedResult,
                                    expectedResultDeep: rightOperandData.expectedResultDeep,
                                    expectedResultType: rightOperandData.expectedResultType,
                                    expectedStderr: rightOperandData.expectedStderr || '',
                                    expectedStdout: rightOperandData.expectedStdout || ''
                                });
                            }
                        });
                    });
                });
            });
        });
    }
};
