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

    describe('PHP Parser grammar __LINE__ magic constant expression integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'simple echo of current line using correct case': {
                code: 'echo __LINE__;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_MAGIC_CONSTANT',
                            constant: '__LINE__',
                            offset: {
                                line: 1,
                                offset: 11
                            }
                        }
                    }]
                }
            },
            'simple echo of current line using weird case': {
                code: 'echo __LinE__;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_ECHO_STATEMENT',
                        expression: {
                            name: 'N_MAGIC_CONSTANT',
                            constant: '__LINE__',
                            offset: {
                                line: 1,
                                offset: 11
                            }
                        }
                    }]
                }
            },
            'assignment of current line to variable using correct case': {
                code: '$line = __LINE__;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'line'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_MAGIC_CONSTANT',
                                    constant: '__LINE__',
                                    offset: {
                                        line: 1,
                                        offset: 14
                                    }
                                }
                            }]
                        }
                    }]
                }
            },
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
