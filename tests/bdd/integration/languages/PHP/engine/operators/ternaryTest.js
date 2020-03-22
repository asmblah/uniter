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
    DATA_TYPES = ['array', 'boolean', 'float', 'int'/*, 'null', 'object', 'string'*/];

describe('PHP Engine ternary expression integration', function () {
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

    it('should not call function terms of the alternate expression when condition is truthy');

    it('should not call function terms of the consequent expression when condition is falsy');

    _.each({
        'ternary expression "<condition> ? <consequent> : <alternate>': {
            operand: {
                'array': [{
                    condition: 'array()',
                    // Empty arrays are falsy
                    expectedResult: 'alternate'
                }, {
                    condition: 'array(1, 2)',
                    // Populated arrays are truthy
                    expectedResult: 'consequent'
                }],
                'boolean': [{
                    condition: 'true',
                    expectedResult: 'consequent'
                }, {
                    condition: 'false',
                    expectedResult: 'alternate'
                }],
                'float': [{
                    condition: '0.0',
                    // Positive zero is falsy
                    expectedResult: 'alternate'
                }, {
                    condition: '-0.0',
                    // Negative zero is falsy
                    expectedResult: 'alternate'
                }, {
                    condition: '1.2',
                    // Non-zero positive numbers are truthy
                    expectedResult: 'consequent'
                }, {
                    condition: '-3.4',
                    // Non-zero negative numbers are truthy
                    expectedResult: 'consequent'
                }],
                'int': [{
                    condition: '0',
                    // Positive zero is falsy
                    expectedResult: 'alternate'
                }, {
                    condition: '-0',
                    // Negative zero is falsy
                    expectedResult: 'alternate'
                }, {
                    condition: '4',
                    // Non-zero positive numbers are truthy
                    expectedResult: 'consequent'
                }, {
                    condition: '-1',
                    // Non-zero negative numbers are truthy
                    expectedResult: 'consequent'
                }]
            }
        }
    }, function (data, statementDescription) {
        describe('for the ' + statementDescription, function () {
            _.each(DATA_TYPES, function (operandType) {
                var operandDatas = data.operand[operandType];

                _.each(operandDatas, function (operandData) {
                    var operand = operandData.condition,
                        code = '<?php return ' + operand + ' ? "consequent" : "alternate";';

                    describe('for ' + code, function () {
                        check({
                            code: code,
                            expectedException: operandData.expectedException,
                            expectedResult: operandData.expectedResult,
                            expectedStderr: operandData.expectedStderr || '',
                            expectedStdout: operandData.expectedStdout || ''
                        });
                    });
                });
            });
        });
    });
});
