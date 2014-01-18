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

    describe('PHP Parser grammar while statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'simple while true with no body statements': {
                code: 'while (true) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_WHILE_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        statements: []
                    }]
                }
            },
            'simple while true with one body statement': {
                code: 'while (true) { echo 4; }',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_WHILE_STATEMENT',
                        condition: {
                            name: 'N_BOOLEAN',
                            bool: 'true'
                        },
                        statements: [{
                            name: 'N_ECHO_STATEMENT',
                            expression: {
                                name: 'N_INTEGER',
                                number: '4'
                            }
                        }]
                    }]
                }
            },
            'while with assignment in condition': {
                code: 'while ($line = readLine()) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_WHILE_STATEMENT',
                        condition: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'line'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_FUNCTION_CALL',
                                    func: {
                                        name: 'N_STRING',
                                        string: 'readLine'
                                    },
                                    args: []
                                }
                            }]
                        },
                        statements: []
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
