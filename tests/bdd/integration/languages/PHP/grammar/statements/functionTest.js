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

    describe('PHP Parser grammar function definition statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each([
            {
                // Simple empty function definition with no args or statements
                code: 'function gogo() {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FUNCTION_STATEMENT',
                        func: 'gogo',
                        args: [],
                        statements: []
                    }]
                }
            }, {
                // Simple empty function definition with one arg but no statements
                code: 'function doNothing($a) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FUNCTION_STATEMENT',
                        func: 'doNothing',
                        args: [{
                            name: 'N_VARIABLE',
                            variable: '$a'
                        }],
                        statements: []
                    }]
                }
            }, {
                // Function definition with two args and two statements
                code: 'function add($number1, $number2) { $result = $number1 + $number2; return $result; }',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FUNCTION_STATEMENT',
                        func: 'add',
                        args: [{
                            name: 'N_VARIABLE',
                            variable: '$number1'
                        }, {
                            name: 'N_VARIABLE',
                            variable: '$number2'
                        }],
                        statements: [{
                            name: 'N_ASSIGNMENT_STATEMENT',
                            target: {
                                name: 'N_VARIABLE',
                                variable: '$result'
                            },
                            expression: {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_VARIABLE',
                                    variable: '$number1'
                                },
                                right: [{
                                    operator: '+',
                                    operand: {
                                        name: 'N_VARIABLE',
                                        variable: '$number2'
                                    }
                                }]
                            }
                        }, {
                            name: 'N_RETURN_STATEMENT',
                            expression: {
                                name: 'N_VARIABLE',
                                variable: '$result'
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
