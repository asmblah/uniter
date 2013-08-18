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
    'js/util',
    'js/Interpreter'
], function (
    util,
    Interpreter
) {
    'use strict';

    describe('Interpreter', function () {
        describe('interpret()', function () {
            describe('when using interpreter spec #1', function () {
                var interpreter,
                    interpreterSpec;

                beforeEach(function () {
                    interpreterSpec = {
                        nodes: {
                            'EXPRESSION': function (node, interpret) {
                                var expression = node.left;

                                if (!util.isString(expression)) {
                                    expression = interpret(expression);
                                }

                                util.each(node.right, function (operation) {
                                    expression += ' ' + interpret(operation);
                                });

                                return '(' + expression + ')';
                            },
                            'OPERATION': function (node) {
                                return node.operator + ' ' + node.operand;
                            },
                            'PROGRAM': function (node, interpret) {
                                /*jshint evil:true */
                                var body = '';

                                util.each(node.statements, function (statement) {
                                    body += interpret(statement);
                                });

                                return new Function(body)();
                            },
                            'RETURN': function (node, interpret) {
                                var expression = node.expression;

                                if (expression && !util.isString(expression)) {
                                    expression = interpret(expression);
                                }

                                return 'return' + (expression ? ' ' + expression : '') + ';';
                            }
                        }
                    };

                    interpreter = new Interpreter(interpreterSpec);
                });

                util.each([
                    {
                        originalCode: 'return 128;',
                        ast: {
                            name: 'PROGRAM',
                            statements: [
                                {
                                    name: 'RETURN',
                                    expression: '128'
                                }
                            ]
                        },
                        expectedResult: 128
                    },
                    {
                        originalCode: 'return 2 + 3 - 4;',
                        ast: {
                            name: 'PROGRAM',
                            statements: [
                                {
                                    name: 'RETURN',
                                    expression: {
                                        name: 'EXPRESSION',
                                        left: '2',
                                        right: [{
                                            name: 'OPERATION',
                                            operator: '+',
                                            operand: '3'
                                        }, {
                                            name: 'OPERATION',
                                            operator: '-',
                                            operand: '4'
                                        }]
                                    }
                                }
                            ]
                        },
                        expectedResult: 1
                    },
                    {
                        originalCode: 'return (6 + 4) / 2;',
                        ast: {
                            name: 'PROGRAM',
                            statements: [
                                {
                                    name: 'RETURN',
                                    expression: {
                                        name: 'EXPRESSION',
                                        left: {
                                            name: 'EXPRESSION',
                                            left: '6',
                                            right: [{
                                                name: 'OPERATION',
                                                operator: '+',
                                                operand: '4'
                                            }]
                                        },
                                        right: [{
                                            name: 'OPERATION',
                                            operator: '/',
                                            operand: '2'
                                        }]
                                    }
                                }
                            ]
                        },
                        expectedResult: 5
                    }
                ], function (scenario) {
                    it('should return the correct result when the original code was "' + scenario.originalCode + '"', function () {
                        expect(interpreter.interpret(scenario.ast)).to.equal(scenario.expectedResult);
                    });
                });
            });
        });
    });
});
