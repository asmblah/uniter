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

    describe('PHP Parser grammar constant expression integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'assignment of constant to variable': {
                code: '$name = MY_NAME;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'name'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_STRING',
                                    string: 'MY_NAME'
                                }
                            }]
                        }
                    }]
                }
            },
            '"self" should be a valid constant name': {
                code: '$string = self;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'string'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_STRING',
                                    string: 'self'
                                }
                            }]
                        }
                    }]
                }
            },
            'prefixed constant path in global namespace': {
                code: '$string = \\MY_NAME;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'string'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_STRING',
                                    string: '\\MY_NAME'
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
