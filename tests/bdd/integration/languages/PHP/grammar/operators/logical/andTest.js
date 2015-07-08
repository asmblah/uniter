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
    '../../../tools',
    'js/util'
], function (
    tools,
    util
) {
    'use strict';

    describe('PHP Parser grammar logical And "<value> && <value>" operator integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'assigning And of variable values to another variable': {
                code: '$result = $value1 && $value2;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'result'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_VARIABLE',
                                        variable: 'value1'
                                    },
                                    right: [{
                                        operator: '&&',
                                        operand: {
                                            name: 'N_VARIABLE',
                                            variable: 'value2'
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'assigning condition with assignment inside operand to variable': {
                code: '$result = (first_func() && $pos = second_func());',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'result'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_EXPRESSION',
                                    left: {
                                        name: 'N_FUNCTION_CALL',
                                        func: {
                                            name: 'N_STRING',
                                            string: 'first_func'
                                        },
                                        args: []
                                    },
                                    right: [{
                                        operator: '&&',
                                        operand: {
                                            name: 'N_EXPRESSION',
                                            left: {
                                                name: 'N_VARIABLE',
                                                variable: 'pos'
                                            },
                                            right: [{
                                                operator: '=',
                                                operand: {
                                                    name: 'N_FUNCTION_CALL',
                                                    func: {
                                                        name: 'N_STRING',
                                                        string: 'second_func'
                                                    },
                                                    args: []
                                                }
                                            }]
                                        }
                                    }]
                                }
                            }]
                        }
                    }]
                }
            }
        }, function (scenario, description) {
            describe(description, function () {
                var code = '<?php ' + scenario.code;

                // Pretty-print the code strings so any non-printable characters are readable
                describe('when the code is ' + JSON.stringify(code) + ' ?>', function () {
                    it('should return the expected AST', function () {
                        expect(parser.parse(code)).to.deep.equal(scenario.expectedAST);
                    });
                });
            });
        });
    });
});
