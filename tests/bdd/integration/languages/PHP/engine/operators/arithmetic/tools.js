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
    '../../tools',
    'js/util'
], function (
    engineTools,
    util
) {
    'use strict';

    var DATA_TYPES = ['array', 'boolean', 'float', 'integer', 'null', 'object', 'string'],
        hasOwn = {}.hasOwnProperty;

    return {
        check: function (getData, scenario) {
            var left = scenario.left,
                operator = scenario.operator;

            util.each(DATA_TYPES, function (leftOperandType) {
                util.each(DATA_TYPES, function (rightOperandType) {
                    var leftOperandData = left[leftOperandType],
                        rightOperandDatas = leftOperandData.right[rightOperandType];

                    util.each(rightOperandDatas, function (rightOperandData) {
                        var effectiveLeftOperandType = leftOperandType,
                            effectiveRightOperandType = rightOperandType,
                            expectedDump = rightOperandData.expectedDump,
                            leftOperand = rightOperandData.left,
                            rightOperand = rightOperandData.right,
                            setup = rightOperandData.setup || '',
                            usesDump = hasOwn.call(rightOperandData, 'expectedDump');

                        util.from(0).to(1, function (index) {
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
});
