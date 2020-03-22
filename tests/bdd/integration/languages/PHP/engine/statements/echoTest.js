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
    phpTools = require('../../tools'),
    DATA_TYPES = ['array', 'boolean', 'float', 'int', 'null'/*, 'object'*/, 'string'];

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

    _.each({
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
                'int': [{
                    operand: '0',
                    expectedStdout: '0'
                }, {
                    operand: '6',
                    expectedStdout: '6'
                }],
                'null': [{
                    operand: 'null',
                    expectedStdout: ''
                }],
                'string': [{
                    operand: '"hello"',
                    expectedStdout: 'hello'
                }, {
                    operand: '"world"',
                    expectedStdout: 'world'
                }]
            }
        }
    }, function (data, statementDescription) {
        describe('for the ' + statementDescription, function () {
            _.each(DATA_TYPES, function (operandType) {
                var operandDatas = data.operand[operandType];

                _.each(operandDatas, function (operandData) {
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
