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

    describe('PHP Parser grammar new operator integration', function () {
        var parser;

        beforeEach(function () {
            parser = tools.createParser();
        });

        util.each({
            'creating instance of class with name specified statically and no argument brackets': {
                code: '$object = new Worker;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'object'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_NEW_EXPRESSION',
                                    operator: 'new',
                                    className: {
                                        name: 'N_STRING',
                                        string: 'Worker'
                                    }
                                }
                            }]
                        }
                    }]
                }
            },
            'creating instance of class with name specified statically and with argument brackets': {
                code: '$object = new Worker();',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'object'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_NEW_EXPRESSION',
                                    operator: 'new',
                                    className: {
                                        name: 'N_STRING',
                                        string: 'Worker'
                                    },
                                    args: []
                                }
                            }]
                        }
                    }]
                }
            },
            'referring to class in global namespace from sub-namespace': {
                code: 'namespace Fun; $object = new \\stdClass;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_NAMESPACE_STATEMENT',
                        namespace: 'Fun',
                        statements: [{
                            name: 'N_EXPRESSION_STATEMENT',
                            expression: {
                                name: 'N_EXPRESSION',
                                left: {
                                    name: 'N_VARIABLE',
                                    variable: 'object'
                                },
                                right: [{
                                    operator: '=',
                                    operand: {
                                        name: 'N_NEW_EXPRESSION',
                                        operator: 'new',
                                        className: {
                                            name: 'N_STRING',
                                            string: '\\stdClass'
                                        }
                                    }
                                }]
                            }
                        }]
                    }]
                }
            },
            'creating class from variable': {
                code: '$object = new $className;',
                expectedAST: {
                    name: 'N_PROGRAM',
                    statements: [{
                        name: 'N_EXPRESSION_STATEMENT',
                        expression: {
                            name: 'N_EXPRESSION',
                            left: {
                                name: 'N_VARIABLE',
                                variable: 'object'
                            },
                            right: [{
                                operator: '=',
                                operand: {
                                    name: 'N_NEW_EXPRESSION',
                                    operator: 'new',
                                    className: {
                                        name: 'N_VARIABLE',
                                        variable: 'className'
                                    }
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
