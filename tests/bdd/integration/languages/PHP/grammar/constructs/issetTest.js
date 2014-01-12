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

    describe('PHP Parser grammar isset(...) construct integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'with one variable': {
                code: '$is_set = isset($a_var);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'is_set'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_ISSET',
                                    variables: [{
                                        name: 'N_VARIABLE',
                                        variable: 'a_var'
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'with two variables': {
                code: '$are_both_set = isset($first, $second);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'are_both_set'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_ISSET',
                                    variables: [{
                                        name: 'N_VARIABLE',
                                        variable: 'first'
                                    }, {
                                        name: 'N_VARIABLE',
                                        variable: 'second'
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'with array index': {
                code: '$is_set = isset($an_array[8]);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'is_set'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_ISSET',
                                    variables: [{
                                        name: 'N_ARRAY_INDEX',
                                        array: {
                                            name: 'N_VARIABLE',
                                            variable: 'an_array'
                                        },
                                        indices: [{
                                            index: {
                                                name: 'N_INTEGER',
                                                number: '8'
                                            }
                                        }]
                                    }]
                                }
                            }]
                        }
                    }]
                }
            },
            'with object property': {
                code: '$is_set = isset($an_object->prop);',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'is_set'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_ISSET',
                                    variables: [{
                                        name: 'N_OBJECT_PROPERTY',
                                        object: {
                                            name: 'N_VARIABLE',
                                            variable: 'an_object'
                                        },
                                        properties: [{
                                            property: {
                                                name: 'N_STRING',
                                                string: 'prop'
                                            }
                                        }]
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
