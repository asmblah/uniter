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

    var DATA_TYPES = ['array', 'boolean', 'float', 'integer'/*, 'null', 'object', 'string'*/];

    describe('PHP Engine echo statement integration', function () {
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
            'echo statement "echo <expr>;': {
                operand: {
                    'array': [{
                        operand: 'array()',
                        expectedStdout: 'Array'
                    }, {
                        operand: 'array(1, 2)',
                        // Note that elements are ignored: always coerced to the string "Array"
                        expectedStdout: 'Array'
                    }],
                    'boolean': [{
                        operand: 'true',
                        expectedStdout: '1'
                    }, {
                        operand: 'false',
                        expectedStdout: ''
                    }],
                    'float': [{
                        operand: '1.0',
                        // Note that decimal part of float is dropped from string
                        expectedStdout: '1'
                    }, {
                        operand: '1.2',
                        expectedStdout: '1.2'
                    }, {
                        operand: '2.8888',
                        expectedStdout: '2.8888'
                    }],
                    'integer': [{
                        operand: '0',
                        expectedStdout: '0'
                    }, {
                        operand: '6',
                        expectedStdout: '6'
                    }]
                }
            }
        }, function (data, statementDescription) {
            describe('for the ' + statementDescription, function () {
                util.each(DATA_TYPES, function (operandType) {
                    var operandDatas = data.operand[operandType];

                    util.each(operandDatas, function (operandData) {
                        var operand = operandData.operand;

                        describe('for echo ' + operandType + '(' + operand + ');', function () {
                            check({
                                code: '<?php echo ' + operand + ';',
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
