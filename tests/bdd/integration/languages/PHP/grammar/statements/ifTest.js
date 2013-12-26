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
    tools,
    util
) {
    'use strict';

    describe('PHP Parser grammar if statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each([
            {
                // Simple if with no consequent body statements
                code: 'if (true) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatements: []
                    }]
                }
            }, {
                // Simple if with no consequent or alternate body statements
                code: 'if (true) {} else {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        consequentStatements: [],
                        alternateStatements: []
                    }]
                }
            }, {
                // If with more complex expression and one consequent body statement
                code: 'if ($accountNumber === 2) { $cheques = 7; }',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_IF_STATEMENT',
                        condition: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'accountNumber'
                            },
                            right: [{
                                operator: '===',
                                operand: {
                                    name: 'N_INTEGER',
                                    number: '2'
                                }
                            }]
                        },
                        consequentStatements: [{
                            name: 'N_EXPRESSION_STATEMENT',
                            expression: {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_VARIABLE',
                                    variable: 'cheques'
                                },
                                right: [{
                                    operator: '=',
                                    operand: {
                                        name: 'N_INTEGER',
                                        number: '7'
                                    }
                                }]
                            }
                        }]
                    }]
                }
            }
        ], function (scenario) {
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
