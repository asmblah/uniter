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

    describe('PHP Parser grammar function call expression integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each([
            {
                // Simple function call test
                code: 'now();',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_FUNCTION_CALL',
                            func: 'now',
                            args: []
                        }
                    }]
                }
            }, {
                // Function call as term in expression with arguments including an expression
                code: '$a = doSomething(1, 4 + 2, "test");',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: '$a'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_FUNCTION_CALL',
                                    func: 'doSomething',
                                    args: [{
                                        name: 'N_INTEGER',
                                        number: '1'
                                    }, {
                                        name: 'N_EXPRESSION',
                                        left: {
                                            name: 'N_INTEGER',
                                            number: '4'
                                        },
                                        right: [{
                                            operator: '+',
                                            operand: {
                                                name: 'N_INTEGER',
                                                number: '2'
                                            }
                                        }]
                                    }, {
                                        name: 'N_STRING_LITERAL',
                                        string: 'test'
                                    }]
                                }
                            }]
                        }
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
