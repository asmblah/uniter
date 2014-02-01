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

    describe('PHP Parser grammar for loop statement integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'empty for loop with no body statements (infinite loop)': {
                code: 'for (;;) {}',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOR_STATEMENT',
                        initializer: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: []
                        },
                        condition: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: []
                        },
                        update: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: []
                        },
                        body: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: []
                        }
                    }]
                }
            },
            'for loop with empty components and one body statement not wrapped in braces': {
                code: 'for (;;) echo 1;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOR_STATEMENT',
                        initializer: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: []
                        },
                        condition: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: []
                        },
                        update: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: []
                        },
                        body: {
                            name: 'N_ECHO_STATEMENT',
                            expression: {
                                name: 'N_INTEGER',
                                number: '1'
                            }
                        }
                    }]
                }
            },
            'for loop iterating 3 times': {
                code: 'for ($i = 0; $i < 2; $i++) { echo $i; }',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_FOR_STATEMENT',
                        initializer: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: [{
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_VARIABLE',
                                    variable: 'i'
                                },
                                right: [{
                                    operator: '=',
                                    operand: {
                                        name: 'N_INTEGER',
                                        number: '0'
                                    }
                                }]
                            }]
                        },
                        condition: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: [{
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_VARIABLE',
                                    variable: 'i'
                                },
                                right: [{
                                    operator: '<',
                                    operand: {
                                        name: 'N_INTEGER',
                                        number: '2'
                                    }
                                }]
                            }]
                        },
                        update: {
                            name: 'N_COMMA_EXPRESSION',
                            expressions: [{
                                name: 'N_UNARY_EXPRESSION',
                                operator: '++',
                                operand: {
                                    name: 'N_VARIABLE',
                                    variable: 'i'
                                },
                                prefix: false
                            }]
                        },
                        body: {
                            name: 'N_COMPOUND_STATEMENT',
                            statements: [{
                                name: 'N_ECHO_STATEMENT',
                                expression: {
                                    name: 'N_VARIABLE',
                                    variable: 'i'
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
